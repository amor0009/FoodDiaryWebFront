"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WeightChart from '../../components/Weight_Statistic/WeightChart';
import Menu from "../../components/Default/Menu";
import Header from "../../components/Default/Header";
import ErrorHandler from "../../components/Default/ErrorHandler";
import ErrorWithRetry from "../../components/Default/ErrorWithRetry";
import LoadingSpinner from "../../components/Default/LoadingSpinner";
import "./WeightStatistic.css";
import { API_BASE_URL } from '../../config';
import { Edit, Target, Ruler, Weight } from "lucide-react";

export default function WeightStatistic() {
  const [userData, setUserData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);

  const showToast = (title, description, variant = "default") => {
    console.log(`${variant}: ${title} - ${description}`);
  };

  const cancelEditing = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const saveWeight = async () => {
    const weightValue = editedData.weight;
    if (!weightValue || isNaN(parseFloat(weightValue)) || parseFloat(weightValue) <= 0) {
      setError("Введите корректный вес");
      return;
    }

    const newWeight = parseFloat(weightValue);

    try {
      setSaving(true);
      setError(null);

      const weightResponse = await fetch(`${API_BASE_URL}/user-weight/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ weight: newWeight }),
      });

      if (!weightResponse.ok) {
        const errorData = await weightResponse.json();
        throw new Error(errorData.detail || "Не удалось сохранить вес");
      }

      const userResponse = await fetch(`${API_BASE_URL}/users/me?_t=${Date.now()}`, {
        credentials: 'include',
      });

      if (!userResponse.ok) {
        throw new Error("Не удалось обновить данные профиля");
      }

      const updatedUserData = await userResponse.json();
      setUserData(updatedUserData);
      setEditedData(updatedUserData);

      const historyResponse = await fetch(`${API_BASE_URL}/user-weight/`, {
        credentials: 'include',
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setWeightHistory(historyData);
      }

      setIsEditing(false);
      showToast("Вес обновлён", "Новая запись добавлена в историю");
    } catch (error) {
      console.error("Ошибка сохранения веса:", error);
      if (error.name === "TypeError" || error.message.includes("Failed to fetch")) {
        setError("Ошибка сети: не удалось подключиться к серверу");
      } else {
        setError(error.message);
      }
      showToast("Ошибка при сохранении", error.message, "destructive");
    } finally {
      setSaving(false);
    }
  };

  const fetchUserProfile = async () => {
    try {  
      const [userResponse, weightResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users/me`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/user-weight/`, { credentials: 'include' }),
      ]);

      if (!userResponse.ok || !weightResponse.ok) {
        const errorData = await userResponse.json().catch(() => null);
        throw new Error(errorData?.detail || "Не удалось получить данные");
      }

      const userData = await userResponse.json();
      const weightData = await weightResponse.json();

      setUserData(userData);
      setEditedData(userData);
      setWeightHistory(weightData);

      if (userData.has_profile_picture) {
        fetchProfilePicture();
      }
    } catch (error) {
      if (error.name === "TypeError" || error.message.includes("Failed to fetch")) {
        setError("Ошибка сети: не удалось подключиться к серверу");
      } else {
        setError(error.message);
      }
      showToast("Ошибка", error.message, "destructive");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile-picture`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Не удалось загрузить фото профиля");

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      if (profilePicture) URL.revokeObjectURL(profilePicture);
      setProfilePicture(imageUrl);
    } catch (error) {
      console.error("Ошибка загрузки фото:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: 'include',
      });
      window.location.href = "/login";
    } catch (error) {
      window.location.href = "/login";
    }
  };

  const getFullName = (user) => {
    if (!user) return "";
    return [user.firstname, user.lastname].filter(Boolean).join(" ") || user.login;
  };

  const translateValue = (value, category) => {
    const translations = {
      gender: { male: "Мужской", female: "Женский", other: "Другой" },
      aim: { loss: "Снижение веса", maintain: "Поддержание веса", gain: "Набор веса" },
      activity_level: {
        sedentary: "Сидячий образ жизни",
        light: "Легкая активность",
        moderate: "Умеренная активность",
        active: "Высокая активность",
        very_active: "Очень высокая активность",
      },
    };
    return translations[category]?.[value] || value || "—";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUserProfile();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error && !userData) {
    return (
      <ErrorWithRetry
        error={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          fetchUserProfile();
        }}
      />
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      className="weight-statistic-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {error && <ErrorHandler error={error} onClose={() => setError(null)} />}

      <Header
        userData={userData}
        profilePicture={profilePicture}
        getFullName={getFullName}
        translateValue={translateValue}
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
      />
      <Menu menuVisible={menuVisible} handleLogout={handleLogout} />

      <div className="weight-main-content">
        <div className="weight-container">
          <div className="weight-grid">
            {/* Левая колонка с данными */}
            <div className="weight-card weight-data-card">
              <div className="weight-card-header">
                <h2>Статистика веса</h2>
              </div>
              <div className="weight-card-body">
                <div className="weight-section">
                  <h3 className="weight-section-title">
                    <Ruler size={18} className="weight-section-icon" />
                    Актуальные данные
                  </h3>
                  <div className="weight-section-grid">
                    <div className="weight-section-item">
                      <p className="weight-section-label">Текущий вес</p>
                      <p className="weight-section-value">
                        {userData.weight ? `${userData.weight} кг` : "—"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditedData(userData);
                        setIsEditing(true);
                      }}
                      className="update-weight-button"
                    >
                      Обновить вес
                    </button>
                  </div>
                </div>

                <div className="weight-section">
                  <h3 className="weight-section-title">
                    <Target size={18} className="weight-section-icon" />
                    Цели и активность
                  </h3>
                  <div className="weight-section-grid">
                    <div className="weight-section-item">
                      <p className="weight-section-label">Цель</p>
                      <p className="weight-section-value">
                        {translateValue(userData.aim, "aim")}
                      </p>
                    </div>
                    <div className="weight-section-item">
                      <p className="weight-section-label">Уровень активности</p>
                      <p className="weight-section-value">
                        {translateValue(userData.activity_level, "activity_level")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка с графиком */}
            <div className="weight-card weight-chart-card">
              <div className="weight-card-header">
                <h2>График веса</h2>
              </div>
              <div className="weight-card-body">
                <div className="weight-section">
                  <h3 className="weight-section-title">
                    <Weight size={18} className="weight-section-icon" />
                    Хронология изменений
                  </h3>
                  <div className="chart-container">
                    <WeightChart weightHistory={weightHistory} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-container"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  <Edit size={20} style={{ marginRight: '8px', color: '#7c3aed' }} />
                  Редактирование веса
                </h2>
                <button className="modal-close" onClick={cancelEditing}>
                  ×
                </button>
              </div>

              {error && (
                <div className="modal-error">
                  <ErrorHandler error={error} onClose={() => setError(null)} />
                </div>
              )}

              <div className="modal-content">
                <div className="modal-form-group">
                  <label htmlFor="weight">Вес (кг)</label>
                  <input
                    type="text"
                    id="weight"
                    name="weight"
                    inputMode="decimal"
                    value={editedData?.weight || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setEditedData({ ...editedData, weight: value === "" ? null : value });
                      }
                    }}
                    onBlur={() => {
                      if (!editedData?.weight || isNaN(parseFloat(editedData.weight))) {
                        setEditedData({ ...editedData, weight: null });
                      }
                    }}
                    placeholder="Введите вес"
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={cancelEditing}>
                  Отмена
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={saveWeight}
                  disabled={saving}
                >
                  {saving ? <LoadingSpinner small white /> : "Сохранить"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}