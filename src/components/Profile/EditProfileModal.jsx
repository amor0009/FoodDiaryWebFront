import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, User, Upload, Ruler, Target } from "lucide-react";
import ErrorHandler from "../../components/Default/ErrorHandler"; // Импортируем ErrorHandler
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
  const [error, setError] = useState(null); // Локальное состояние для ошибок

  // Функция для обработки ошибок
  const handleError = (error) => {
    if (error.message === "Failed to fetch") {
      setError("Ошибка сети. Проверьте подключение к интернету.");
    } else {
      setError(error.message); // Устанавливаем сообщение об ошибке
    }
  };

  // Валидация данных перед сохранением
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

  // Обработчик сохранения профиля
  const handleSave = async () => {
    if (!validateData()) return; // Проверяем данные перед сохранением

    try {
      await saveProfile(); // Вызываем переданную функцию сохранения
    } catch (error) {
      handleError(error); // Обрабатываем ошибку
    }
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
                      <select id="gender" name="gender" value={editedData.gender || ""} onChange={handleInputChange}>
                        <option value="" disabled>Выберите пол</option>
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                      </select>
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
                      <select id="aim" name="aim" value={editedData.aim || ""} onChange={handleInputChange}>
                        <option value="" disabled>Выберите цель</option>
                        <option value="loss">Снижение веса</option>
                        <option value="gain">Набор веса</option>
                        <option value="maintain">Поддержание веса</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="activity_level">Уровень активности</label>
                      <select id="activity_level" name="activity_level" value={editedData.activity_level || ""} onChange={handleInputChange}>
                        <option value="" disabled>Выберите уровень активности</option>
                        <option value="sedentary">Сидячий образ жизни</option>
                        <option value="light">Легкая активность</option>
                        <option value="moderate">Умеренная активность</option>
                        <option value="active">Высокая активность</option>
                        <option value="very_active">Очень высокая активность</option>
                      </select>
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

          {/* Отображение ошибки поверх модального окна */}
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