"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WeightChart from '../../components/Weight_Statistic/WeightChart';
import Menu from "../../components/Default/Menu";
import Header from "../../components/Default/Header";
import ErrorHandler from "../../components/Default/ErrorHandler";
import ErrorWithRetry from "../../components/Default/ErrorWithRetry"; // Импортируем компонент для повторной попытки
import { checkAuth } from "../../utils/auth";
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

  // Toast функция
  const showToast = (title, description, variant = "default") => {
    console.log(`${variant}: ${title} - ${description}`);
  };

  // Отмена редактирования
  const cancelEditing = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  // Обработка изменений ввода
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const processedValue = ["age", "height"].includes(name) ? parseInt(value, 10) : parseFloat(value);
    setEditedData({ ...editedData, [name]: isNaN(processedValue) ? null : processedValue });
  };

  // Сохранение изменений профиля
  const saveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("access_token");
      const dataToSend = {
        firstname: editedData.firstname,
        lastname: editedData.lastname,
        age: editedData.age,
        height: editedData.height,
        weight: editedData.weight,
        gender: editedData.gender,
        aim: editedData.aim,
        activity_level: editedData.activity_level,
        recommended_calories: editedData.recommended_calories,
      };
  
      // Удаляем пустые значения
      Object.keys(dataToSend).forEach((key) => {
        if (dataToSend[key] === null || dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });
  
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось обновить профиль");
      }
  
      const data = await response.json();
      setUserData(data.user);
      setEditedData(data.user);
      setIsEditing(false);
      setMenuVisible(false);
      showToast("Профиль обновлен", "Ваши данные успешно сохранены");
    } catch (error) {
      // Обработка сетевых ошибок
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

  // Загрузка данных профиля
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Требуется авторизация");
        setLoading(false);
        return;
      }
  
      const [userResponse, weightResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/user_weight/history/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
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
      // Обработка сетевых ошибок
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

  // Загрузка фото профиля
  const fetchProfilePicture = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/user/profile-picture`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        throw new Error("Не удалось загрузить фото профиля");
      }
  
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      if (profilePicture) URL.revokeObjectURL(profilePicture);
      setProfilePicture(imageUrl);
    } catch (error) {
      // Обработка сетевых ошибок
      if (error.name === "TypeError" || error.message.includes("Failed to fetch")) {
        setError("Ошибка сети: не удалось подключиться к серверу");
      } else {
        setError(error.message);
      }
    }
  };

  // Выход из системы
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("access_token");
      showToast("Выход выполнен", "Вы успешно вышли из системы");
      window.location.href = "/login";
    } catch (error) {
      // Обработка сетевых ошибок
      if (error.name === "TypeError" || error.message.includes("Failed to fetch")) {
        setError("Ошибка сети: не удалось подключиться к серверу");
      } else {
        setError("Ошибка при выходе");
      }
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  };

  // Получение полного имени
  const getFullName = (user) => {
    if (!user) return "";
    return [user.firstname, user.lastname].filter(Boolean).join(" ") || user.login;
  };

  // Перевод значений на русский
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
    if (!checkAuth()) {
      setError("Неавторизованный доступ");
      setLoading(false);
      return;
    }

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

  // Если есть ошибка и нет данных, отображаем ErrorWithRetry
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
    return <LoadingSpinner />
  }

  return (
    <motion.div className="profile-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Отображение локальных ошибок */}
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
        <div className="weight-container_add weight-mx-auto weight-py-8 weight-px-4">
          <div className="weight-grid weight-grid-cols-1 lg:grid-cols-6 weight-gap-6">
            <div className="weight-content lg:col-span-2">
              <div className="weight-header">
                <h2 className="weight-text-xl weight-font-bold">Статистика веса</h2>
              </div>
              <div className="weight-body">
                <div className="weight-section">
                  <h3 className="weight-section-title">
                    <Ruler size={18} className="weight-section-icon" />
                    Актуальные данные
                  </h3>
                  <div className="weight-section-grid">
                    <div className="weight-section-item">
                      <p className="weight-section-label">Текущий вес</p>
                      <p className="weight-section-value">{userData.weight ? `${userData.weight} кг` : "—"}</p>
                    </div>
                    <button onClick={() => setIsEditing(true)} className="update-weight-button weight-section-item">
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
                      <p className="weight-section-value">{translateValue(userData.aim, "aim")}</p>
                    </div>
                    <div className="weight-section-item">
                      <p className="weight-section-label">Уровень активности</p>
                      <p className="weight-section-value">{translateValue(userData.activity_level, "activity_level")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="weight-content lg:col-span-4">
              <div className="weight-header">
                <h2 className="weight-text-xl weight-font-bold">График веса</h2>
              </div>
              <div className="weight-body">
                <div className="weight-section">
                  <h3 className="weight-section-title">
                    <Weight size={18} className="weight-section-icon" />
                    Хронология изменений
                  </h3>
                  <div className="weight-section-grid">
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
          <motion.div className="weight-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="weight-modal-container"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="weight-modal-header">
                <h2>
                  <Edit size={20} className="weight-modal-icon" />
                  Редактирование веса
                </h2>
                <button className="weight-modal-close" onClick={cancelEditing}>
                  ✕
                </button>
              </div>
              <div className="weight-modal-body">
                <div className="weight-form-group">
                  <label htmlFor="weight">Вес (кг)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    step="0.1"
                    value={editedData.weight || ""}
                    onChange={handleInputChange}
                    placeholder="Введите вес"
                  />
                </div>
              </div>
              <div className="weight-modal-footer">
                <button className="weight-cancel-button" onClick={cancelEditing}>
                  Отмена
                </button>
                <button className="weight-save-button" onClick={saveProfile} disabled={saving}>
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}