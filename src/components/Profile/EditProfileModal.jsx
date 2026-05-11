import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, User, Upload, Ruler, Target } from "lucide-react";
import ErrorHandler from "../../components/Default/ErrorHandler";
import "./EditProfileModal.css";

export default function EditProfileModal({
  isEditing,
  cancelEditing,
  editedData,
  handleInputChange,
  triggerFileInput,
  uploadingPhoto,
  saveProfile,
  saving,
}) {
  const [error, setError] = useState(null);
  // Состояния для кастомных дропдаунов
  const [genderOpen, setGenderOpen] = useState(false);
  const [aimOpen, setAimOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  // Рефы для отслеживания кликов вне
  const genderRef = useRef(null);
  const aimRef = useRef(null);
  const activityRef = useRef(null);

  // Закрытие дропдаунов при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderRef.current && !genderRef.current.contains(event.target)) {
        setGenderOpen(false);
      }
      if (aimRef.current && !aimRef.current.contains(event.target)) {
        setAimOpen(false);
      }
      if (activityRef.current && !activityRef.current.contains(event.target)) {
        setActivityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleError = (error) => {
    if (error.message === "Failed to fetch") {
      setError("Ошибка сети. Проверьте подключение к интернету.");
    } else {
      setError(error.message);
    }
  };

  const validateData = () => {
    if (!editedData.firstname || !editedData.lastname) {
      setError("Пожалуйста, заполните имя и фамилию.");
      return false;
    }
    if (editedData.age && (editedData.age < 0 || editedData.age > 120)) {
      setError("Возраст должен быть от 0 до 120 лет.");
      return false;
    }
    if (editedData.height && (editedData.height < 50 || editedData.height > 250)) {
      setError("Рост должен быть от 50 до 250 см.");
      return false;
    }
    if (editedData.weight && (editedData.weight < 20 || editedData.weight > 300)) {
      setError("Вес должен быть от 20 до 300 кг.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateData()) return;
    try {
      await saveProfile();
    } catch (error) {
      handleError(error);
    }
  };

  // Вспомогательные функции для отображения выбранного значения
  const getGenderLabel = () => {
    if (!editedData.gender) return "Выберите пол";
    return editedData.gender === "male" ? "Мужской" : "Женский";
  };

  const getAimLabel = () => {
    if (!editedData.aim) return "Выберите цель";
    const map = {
      loss: "Снижение веса",
      gain: "Набор веса",
      maintain: "Поддержание веса",
    };
    return map[editedData.aim];
  };

  const getActivityLabel = () => {
    if (!editedData.activity_level) return "Выберите уровень активности";
    const map = {
      sedentary: "Сидячий образ жизни",
      light: "Легкая активность",
      moderate: "Умеренная активность",
      active: "Высокая активность",
      very_active: "Очень высокая активность",
    };
    return map[editedData.activity_level];
  };

  return (
    <AnimatePresence>
      {isEditing && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="modal-container"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="modal-header">
              <h2>
                <Edit size={20} className="modal-icon" />
                Редактирование профиля
              </h2>
              <button className="modal-close" onClick={cancelEditing}>✕</button>
            </div>

            <div className="modal-body">
              <div className="edit-form">
                <div className="form-section">
                  <h3>
                    <User size={16} className="form-icon" /> Личная информация
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstname">Имя</label>
                      <input
                        type="text"
                        id="firstname"
                        name="firstname"
                        value={editedData.firstname || ""}
                        onChange={handleInputChange}
                        placeholder="Введите имя"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastname">Фамилия</label>
                      <input
                        type="text"
                        id="lastname"
                        name="lastname"
                        value={editedData.lastname || ""}
                        onChange={handleInputChange}
                        placeholder="Введите фамилию"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={editedData.email || ""}
                        onChange={handleInputChange}
                        placeholder="Введите email"
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="age">Возраст</label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={editedData.age || ""}
                        onChange={handleInputChange}
                        placeholder="Введите возраст"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="gender">Пол</label>
                      {/* Кастомный селект для пола */}
                      <div className="custom-select-profile" ref={genderRef}>
                        <div
                          className="custom-select-trigger-profile"
                          onClick={() => setGenderOpen(!genderOpen)}
                        >
                          <span>{getGenderLabel()}</span>
                          <span className="arrow-profile">{genderOpen ? "▲" : "▼"}</span>
                        </div>
                        {genderOpen && (
                          <div className="custom-options-profile">
                            <div
                              className="custom-option-profile"
                              onClick={() => {
                                handleInputChange({ target: { name: "gender", value: "male" } });
                                setGenderOpen(false);
                              }}
                            >
                              Мужской
                            </div>
                            <div
                              className="custom-option-profile"
                              onClick={() => {
                                handleInputChange({ target: { name: "gender", value: "female" } });
                                setGenderOpen(false);
                              }}
                            >
                              Женский
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile_picture">Фото профиля</label>
                      <div className="photo-upload-container">
                        <button
                          type="button"
                          className="photo-upload-button"
                          onClick={triggerFileInput}
                          disabled={uploadingPhoto}
                        >
                          <Upload size={16} className="upload-icon" />
                          <span>{uploadingPhoto ? "Загрузка..." : "Загрузить фото"}</span>
                        </button>
                        <p className="photo-upload-note">Поддерживаются форматы JPEG, PNG, GIF</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>
                    <Ruler size={16} className="form-icon" /> Физические параметры
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="height">Рост (см)</label>
                      <input
                        type="number"
                        id="height"
                        name="height"
                        value={editedData.height || ""}
                        onChange={handleInputChange}
                        placeholder="Введите рост"
                      />
                    </div>
                    <div className="form-group">
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
                </div>

                <div className="form-section">
                  <h3>
                    <Target size={16} className="form-icon" /> Цели и активность
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="aim">Цель</label>
                      {/* Кастомный селект для цели */}
                      <div className="custom-select-profile" ref={aimRef}>
                        <div
                          className="custom-select-trigger-profile"
                          onClick={() => setAimOpen(!aimOpen)}
                        >
                          <span>{getAimLabel()}</span>
                          <span className="arrow-profile">{aimOpen ? "▲" : "▼"}</span>
                        </div>
                        {aimOpen && (
                          <div className="custom-options-profile">
                            <div
                              className="custom-option-profile"
                              onClick={() => {
                                handleInputChange({ target: { name: "aim", value: "loss" } });
                                setAimOpen(false);
                              }}
                            >
                              Снижение веса
                            </div>
                            <div
                              className="custom-option-profile"
                              onClick={() => {
                                handleInputChange({ target: { name: "aim", value: "maintain" } });
                                setAimOpen(false);
                              }}
                            >
                              Поддержание веса
                            </div>
                            <div
                              className="custom-option-profile"
                              onClick={() => {
                                handleInputChange({ target: { name: "aim", value: "gain" } });
                                setAimOpen(false);
                              }}
                            >
                              Набор веса
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="activity_level">Уровень активности</label>
                      {/* Кастомный селект для активности */}
                      <div className="custom-select-profile" ref={activityRef}>
                        <div
                          className="custom-select-trigger-profile"
                          onClick={() => setActivityOpen(!activityOpen)}
                        >
                          <span>{getActivityLabel()}</span>
                          <span className="arrow-profile">{activityOpen ? "▲" : "▼"}</span>
                        </div>
                        {activityOpen && (
                          <div className="custom-options-profile">
                            <div
                              className="custom-option-profile"
                              onClick={() => {
                                handleInputChange({ target: { name: "activity_level", value: "sedentary" } });
                                setActivityOpen(false);
                              }}
                            >
                              Сидячий образ жизни
                            </div>
                            <div
                              className="custom-option-profile"
                              onClick={() => {
                                handleInputChange({ target: { name: "activity_level", value: "light" } });
                                setActivityOpen(false);
                              }}
                            >
                              Легкая активность
                            </div>
                            <div
                              className="custom-option-profile"
                              onClick={() => {
                                handleInputChange({ target: { name: "activity_level", value: "moderate" } });
                                setActivityOpen(false);
                              }}
                            >
                              Умеренная активность
                            </div>
                            <div
                              className="custom-option-profile"
                              onClick={() => {
                                handleInputChange({ target: { name: "activity_level", value: "active" } });
                                setActivityOpen(false);
                              }}
                            >
                              Высокая активность
                            </div>
                            <div
                              className="custom-option-profile"
                              onClick={() => {
                                handleInputChange({ target: { name: "activity_level", value: "very_active" } });
                                setActivityOpen(false);
                              }}
                            >
                              Очень высокая активность
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={cancelEditing}>Отмена</button>
              <button className="save-button" onClick={handleSave} disabled={saving}>
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="modal-error-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ErrorHandler error={error} onClose={() => setError(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}