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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const isCurrentDate = selectedDate.toDateString() === new Date().toDateString();

  // Ограничения: сегодня и один месяц назад от сегодня
  const minDate = new Date();
  minDate.setMonth(minDate.getMonth() - 1);  // изменено с -7 дней на -1 месяц
  const maxDate = new Date();

  // Простая реализация toast
  const toast = {
    toast: ({ title, description, variant }) => {
      console.log(`${variant || "default"}: ${title} - ${description}`);
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
    toast.toast({
      variant: "destructive",
      title: "Ошибка",
      description: error.message,
    });
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
      toast.toast({
        title: "Успешно",
        description: "Приём пищи добавлен",
      });
    } catch (error) {
      handleFetchError(error);
    }
  };

  const handleUpdateMeal = async (updatedMeal) => {
    try {
      setMeals(prev => prev.map(meal => meal.id === updatedMeal.id ? updatedMeal : meal));
      toast.toast({
        title: "Успешно",
        description: "Приём пищи обновлён",
      });
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
      toast.toast({
        title: "Успешно",
        description: "Приём пищи удалён",
      });
    } catch (error) {
      handleFetchError(error);
    }
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
      toast.toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из аккаунта",
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
          <button
            onClick={openAddModal}
            className="personal-meals-add-meal-button"
            disabled={!isCurrentDate}
            title={!isCurrentDate ? "Добавление доступно только для текущей даты" : ""}
          >
            + Добавить
          </button>
        </div>

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
    </motion.div>
  );
}