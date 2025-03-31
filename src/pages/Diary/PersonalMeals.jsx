"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/Default/Header";
import Menu from "../../components/Default/Menu";
import MealModal from "../../components/Personal_Meals/MealModal";
import EditMealModal from "../../components/Personal_Meals/EditMealModal";
import MealItem from "../../components/Personal_Meals/MealItem";
import ErrorHandler from "../../components/Default/ErrorHandler";
import LoadingSpinner from "../../components/Default/LoadingSpinner";
import ErrorWithRetry from "../../components/Default/ErrorWithRetry";
import { checkAuth } from "../../utils/auth";
import { API_BASE_URL } from '../../config';
import "./PersonalMeals.css";

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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const isCurrentDate = selectedDate === new Date().toISOString().split('T')[0];

  // Простая реализация toast
  const toast = {
    toast: ({ title, description, variant }) => {
      console.log(`${variant || "default"}: ${title} - ${description}`);
    },
  };

  useEffect(() => {
    if (!checkAuth()) {
      setError("Неавторизованный доступ. Пожалуйста, войдите в систему.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          fetchUserProfile(),
          fetchMeals(selectedDate)
        ]);
      } catch (error) {
        handleFetchError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleFetchError = (error) => {
    // Обработка ошибки "Failed to fetch"
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
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Токен авторизации отсутствует");

      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось загрузить данные пользователя");
      }

      const data = await response.json();
      setUserData(data);

      if (data.has_profile_picture) {
        await fetchProfilePicture();
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/user/profile-picture`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        if (profilePicture) URL.revokeObjectURL(profilePicture);
        setProfilePicture(imageUrl);
      }
    } catch (error) {
      console.error("Ошибка при получении фото профиля:", error);
    }
  };

  const fetchMeals = async (date) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/meal/user_meals_with_products/info/${date}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось загрузить приёмы пищи");
      }
  
      const data = await response.json();
      const sortedMeals = [...data].sort((a, b) => a.id - b.id);
      setMeals(sortedMeals);
    } catch (error) {
      throw error;
    }
  };

  const handleSaveMeal = async (savedMeal) => {
    try {
      setLoading(true);
      await fetchMeals(selectedDate);
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMeal = async (updatedMeal) => {
    try {
      setLoading(true);
      await fetchMeals(selectedDate);
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const openEditModal = (meal) => {
    setSelectedMeal(meal);
    setIsEditModalOpen(true);
  };

  const closeAddModal = async () => {
    setIsAddModalOpen(false);
    try {
      setLoading(true);
      await fetchMeals(selectedDate);
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  };

  const closeEditModal = async () => {
    setIsEditModalOpen(false);
    setSelectedMeal(null);
    try {
      setLoading(true);
      await fetchMeals(selectedDate);
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mealId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/meal/${mealId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось удалить приём пищи");
      }
    
      await fetchMeals(selectedDate);
      toast.toast({
        title: "Успешно",
        description: "Приём пищи успешно удалён",
      });
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("access_token");
      toast.toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из аккаунта",
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  };

  const getFullName = (user) => {
    if (!user) return "";
    return [user.firstname, user.lastname].filter(Boolean).join(" ") || user.login;
  };

  const translateValue = (value, category) => {
    if (!value) return "—"

    const translations = {
      gender: {
        male: "Мужской",
        female: "Женский",
        other: "Другой",
      },
      aim: {
        loss: "Снижение веса",
        maintain: "Поддержание веса",
        gain: "Набор веса",
      },
      activity_level: {
        sedentary: "Сидячий образ жизни",
        light: "Легкая активность",
        moderate: "Умеренная активность",
        active: "Высокая активность",
        very_active: "Очень высокая активность",
      },
    }

    return translations[category] && translations[category][value] ? translations[category][value] : value
  }

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
              fetchMeals(selectedDate)
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
            <label htmlFor="date">Выберите дату: </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min={new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]}
            />
          </div>
          <button
            onClick={openAddModal}
            className="personal-meals-add-meal-button"
            disabled={!isCurrentDate}
            title={!isCurrentDate ? "Добавление приёма пищи доступно только для текущей даты" : ""}
          >
            Добавить приём пищи
          </button>
        </div>

        {error && <ErrorHandler error={error} onClose={() => setError(null)} />}

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
              Нет данных о приёмах пищи за выбранную дату
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <MealModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          onSave={handleSaveMeal}
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