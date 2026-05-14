"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import ru from "date-fns/locale/ru";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../../components/Default/Header";
import Menu from "../../components/Default/Menu";
import MealModal from "../../components/Personal_Meals/MealModal";
import EditMealModal from "../../components/Personal_Meals/EditMealModal";
import MealItem from "../../components/Personal_Meals/MealItem";
import ErrorHandler from "../../components/Default/ErrorHandler";
import LoadingSpinner from "../../components/Default/LoadingSpinner";
import ErrorWithRetry from "../../components/Default/ErrorWithRetry";
import { API_BASE_URL } from '../../config';
import "./PersonalMeals.css";

// Компонент для сводки за день
const DailySummary = ({ meals }) => {
  const totals = meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories;
      acc.proteins += meal.proteins;
      acc.fats += meal.fats;
      acc.carbohydrates += meal.carbohydrates;
      return acc;
    },
    { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 }
  );

  return (
    <div className="daily-summary">
      <div className="summary-card">
        <span className="summary-label">Всего за день</span>
        <span className="summary-value">{Math.round(totals.calories)} ккал</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Белки</span>
        <span className="summary-value">{totals.proteins.toFixed(1)} г</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Жиры</span>
        <span className="summary-value">{totals.fats.toFixed(1)} г</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Углеводы</span>
        <span className="summary-value">{totals.carbohydrates.toFixed(1)} г</span>
      </div>
    </div>
  );
};

// Модальное окно для рекомендаций
const RecommendationsModal = ({
  isOpen,
  onClose,
  recommendations,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  loading,
}) => {
  if (!isOpen) return null;
  return (
    <div className="meal-modal-overlay">
      <div className="meal-modal-container" style={{ maxWidth: "600px" }}>
        <div className="meal-modal-header">
          <h2>Мои рекомендации</h2>
          <button className="meal-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="meal-modal-content">
          <div className="rec-filter-row">
            <div className="rec-date-field">
              <label>С даты</label>
              <DatePicker
                selected={startDate}
                onChange={onStartDateChange}
                dateFormat="dd.MM.yyyy"
                locale={ru}
                maxDate={endDate || new Date()}
                placeholderText="Выберите дату"
                className="rec-datepicker"
                calendarClassName="rec-calendar"
              />
            </div>
            <div className="rec-date-field">
              <label>По дату</label>
              <DatePicker
                selected={endDate}
                onChange={onEndDateChange}
                dateFormat="dd.MM.yyyy"
                locale={ru}
                minDate={startDate}
                maxDate={new Date()}
                placeholderText="Выберите дату"
                className="rec-datepicker"
                calendarClassName="rec-calendar"
              />
            </div>
            <button className="save-btn" onClick={onApply} disabled={loading}>
              {loading ? "Загрузка..." : "Применить"}
            </button>
          </div>
          {loading ? (
            <div className="rec-loading-text">Загрузка рекомендаций...</div>
          ) : recommendations.length > 0 ? (
            <div className="recommendations-list">
              {recommendations.map((rec) => (
                <div key={rec.id} className="recommendation-item">
                  <p className="recommendation-message">{rec.message}</p>
                  <span className="recommendation-date">{rec.date}</span>
                  {rec.is_completed && <span className="completed-badge">✅</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Нет рекомендаций за выбранный период</p>
          )}
        </div>
        <div className="meal-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default function PersonalMeals() {
  const [meals, setMeals] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // Для уведомлений
  const [selectedDate, setSelectedDate] = useState(new Date());
  const isCurrentDate = selectedDate.toDateString() === new Date().toDateString();

  // Рекомендации
  const [showRecModal, setShowRecModal] = useState(false);
  const [recData, setRecData] = useState([]);
  const [recStartDate, setRecStartDate] = useState(null);
  const [recEndDate, setRecEndDate] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  const minDate = new Date();
  minDate.setMonth(minDate.getMonth() - 1);
  const maxDate = new Date();

  // Простой toast
  const toast = {
    toast: ({ title, description }) => {
      console.log(`${title} - ${description}`);
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          fetchUserProfile(),
          fetchMeals(formatDate(selectedDate))
        ]);
      } catch (error) {
        handleFetchError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const handleFetchError = (error) => {
    if (error.message === "Failed to fetch") {
      setError("Ошибка сети. Проверьте подключение к интернету.");
    } else {
      setError(error.message || "Произошла неизвестная ошибка");
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось загрузить данные пользователя");
      }

      const data = await response.json();
      setUserData(data);

      if (data.has_avatar) {
        await fetchProfilePicture();
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/avatar`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProfilePicture(data.avatar || null);
      }
    } catch (error) {
      console.error("Ошибка при получении аватара:", error);
    }
  };

  const fetchMeals = async (date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/date/${date}`, {
        method: "GET",
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось загрузить приёмы пищи");
      }

      const data = await response.json();
      const sortedMeals = [...data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setMeals(sortedMeals);
    } catch (error) {
      throw error;
    }
  };

  const handleSaveMeal = async (newMeal) => {
    try {
      setMeals(prev => [...prev, newMeal].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
      toast.toast({ title: "Успешно", description: "Приём пищи добавлен" });
    } catch (error) {
      handleFetchError(error);
    }
  };

  const handleUpdateMeal = async (updatedMeal) => {
    try {
      setMeals(prev => prev.map(meal => meal.id === updatedMeal.id ? updatedMeal : meal));
      toast.toast({ title: "Успешно", description: "Приём пищи обновлён" });
    } catch (error) {
      handleFetchError(error);
    }
  };

  const handleDelete = async (mealId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось удалить приём пищи");
      }

      setMeals(prev => prev.filter(meal => meal.id !== mealId));
      toast.toast({ title: "Успешно", description: "Приём пищи удалён" });
    } catch (error) {
      handleFetchError(error);
    }
  };

  // Генерация рекомендаций – теперь показывает уведомление, а не открывает модальное окно
  const handleGenerateRecommendations = async () => {
    try {
      setRecLoading(true);
      const res = await fetch(`${API_BASE_URL}/recommendations/generate`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Ошибка генерации рекомендаций");
      const data = await res.json();
      if (data.count === 0) {
        setSuccess({ title: "Рекомендации", description: "Приёмы пищи за вчера отсутствуют. Рекомендации не сгенерированы." });
      } else {
        setSuccess({ title: "Рекомендации", description: `Рекомендации успешно сгенерированы (${data.count} шт.)` });
      }
      // Через 3 секунды скрываем уведомление
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      handleFetchError(err);
    } finally {
      setRecLoading(false);
    }
  };

  const fetchRecommendations = async (start, end) => {
    try {
      setRecLoading(true);
      const params = new URLSearchParams();
      if (start) params.append("start_date", formatDate(start));
      if (end) params.append("end_date", formatDate(end));
      const res = await fetch(`${API_BASE_URL}/recommendations/?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Ошибка загрузки рекомендаций");
      const data = await res.json();
      setRecData(data);
    } catch (err) {
      handleFetchError(err);
    } finally {
      setRecLoading(false);
    }
  };

  const openRecModal = () => {
    setShowRecModal(true);
    fetchRecommendations(recStartDate, recEndDate);
  };

  const applyRecFilter = () => {
    fetchRecommendations(recStartDate, recEndDate);
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const openEditModal = (meal) => {
    setSelectedMeal(meal);
    setIsEditModalOpen(true);
  };
  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedMeal(null);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: 'include',
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      window.location.href = "/login";
    }
  };

  const getFullName = (user) => {
    if (!user) return "";
    return [user.firstname, user.lastname].filter(Boolean).join(" ") || user.login;
  };

  const translateValue = (value, category) => {
    if (!value) return "—";
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
    return translations[category]?.[value] ?? value;
  };

  // ТОЛЬКО при первоначальной загрузке показываем глобальный спиннер
  if (loading && !error) {
    return (
      <div className="full-page-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !userData) {
    return (
      <ErrorWithRetry
        error={error}
        onRetry={async () => {
          setError(null);
          setLoading(true);
          try {
            await Promise.all([
              fetchUserProfile(),
              fetchMeals(formatDate(selectedDate))
            ]);
          } catch (error) {
            handleFetchError(error);
          } finally {
            setLoading(false);
          }
        }}
      />
    );
  }

  return (
    <motion.div
      className="personal-meals-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header
        userData={userData}
        profilePicture={profilePicture}
        getFullName={getFullName}
        menuVisible={menuVisible}
        translateValue={translateValue}
        setMenuVisible={setMenuVisible}
      />
      <Menu menuVisible={menuVisible} handleLogout={handleLogout} />

      <div className="personal-meals-content">
        <div className="personal-meals-header">
          <h2>Мои приёмы пищи</h2>
          <div className="date-picker">
            <label htmlFor="date">Дата: </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd.MM.yyyy"
              locale={ru}
              maxDate={maxDate}
              minDate={minDate}
              className="custom-datepicker"
              calendarClassName="custom-calendar"
              popperClassName="custom-popper"
            />
          </div>
          <div className="header-actions">
            <button
              onClick={openAddModal}
              className="personal-meals-add-meal-button"
              disabled={!isCurrentDate}
              title={!isCurrentDate ? "Добавление доступно только для текущей даты" : ""}
            >
              + Добавить
            </button>
            <button
              onClick={handleGenerateRecommendations}
              className="personal-meals-rec-btn"
              disabled={recLoading}
            >
              ✨ Получить рекомендации
            </button>
            <button
              onClick={() => { setRecStartDate(null); setRecEndDate(null); openRecModal(); }}
              className="personal-meals-rec-btn"
            >
              📋 Мои рекомендации
            </button>
          </div>
        </div>

        {/* Уведомление об успехе/предупреждении */}
        {success && (
          <div className="success-toast">
            {success.description}
          </div>
        )}

        {error && <ErrorHandler error={error} onClose={() => setError(null)} />}

        {meals.length > 0 && <DailySummary meals={meals} />}

        <div className="personal-meals-list">
          {meals.length > 0 ? (
            meals.map((meal) => (
              <MealItem
                key={meal.id}
                meal={meal}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="no-meals-message">
              <span className="no-meals-icon">🍽️</span>
              <p>На этот день приёмов пищи нет</p>
              <small>Нажмите «+ Добавить», чтобы внести запись</small>
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <MealModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          onSave={handleSaveMeal}
          selectedDate={formatDate(selectedDate)}
        />
      )}

      {isEditModalOpen && selectedMeal && (
        <EditMealModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          meal={selectedMeal}
          onUpdate={handleUpdateMeal}
          onDelete={handleDelete}
        />
      )}

      <RecommendationsModal
        isOpen={showRecModal}
        onClose={() => setShowRecModal(false)}
        recommendations={recData}
        startDate={recStartDate}
        endDate={recEndDate}
        onStartDateChange={(date) => setRecStartDate(date)}
        onEndDateChange={(date) => setRecEndDate(date)}
        onApply={applyRecFilter}
        loading={recLoading}
      />
    </motion.div>
  );
}