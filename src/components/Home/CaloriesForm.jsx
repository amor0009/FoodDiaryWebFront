import { useState } from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner"; // Импортируем компонент спиннера
import ErrorHandler from "../Default/ErrorHandler"; // Импортируем компонент для обработки ошибок
import { API_BASE_URL } from '../../config';
import "./CaloriesForm.css";

export default function CaloriesForm() {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [aim, setAim] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false); // Состояние для загрузки
  const [error, setError] = useState(null); // Состояние для ошибок

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка на отрицательные значения
    if (weight <= 0 || age <= 0 || height <= 0) {
      setError("Вес, возраст и рост должны быть положительными числами.");
      return;
    }

    // Проверка на заполнение всех полей
    if (!weight || !age || !height || !gender || !aim || !activityLevel) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    const userData = { weight, age, height, gender, aim, activity_level: activityLevel };

    try {
      setLoading(true); // Начинаем загрузку
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_BASE_URL}/user/calculate_nutrients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setShowResult(true); // Показываем результат с анимацией
      } else {
        // Обработка ошибок от сервера
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка при расчёте данных.");
      }
    } catch (error) {
      // Обработка ошибки "Failed to fetch"
      if (error.message == "Failed to fetch") {
        setError("Ошибка сети. Проверьте подключение к интернету.");
      } else {
        setError(error.message); // Устанавливаем сообщение об ошибке
      }
    } finally {
      setLoading(false); // Загрузка завершена
    }
  };

  // Закрытие окна с ошибкой
  const closeErrorHandler = () => {
    setError(null);
  };

  return (
    <section className="calculate-nutrients-section">
      <h2 className="calculate-nutrients-title">Расчёт рекомендуемых КБЖУ</h2>

      {/* Отображение ошибки */}
      {error && <ErrorHandler error={error} onClose={closeErrorHandler} />}

      <div className="form-result-container">
        {/* Форма - сдвигается влево на одно расстояние от центра */}
        <motion.div
          className="form-container"
          animate={{ x: showResult ? -150 : 0 }} // Форма сдвигается влево
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <form onSubmit={handleSubmit} className="form">
            <input
              type="number"
              placeholder="Введите вес (кг)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Введите возраст"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Введите рост (см)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="input"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="input"
            >
              <option value="" disabled>Пол</option>
              <option value="male">Мужчина</option>
              <option value="female">Женщина</option>
            </select>
            <select
              value={aim}
              onChange={(e) => setAim(e.target.value)}
              className="input"
            >
              <option value="" disabled>Цель</option>
              <option value="loss">Похудение</option>
              <option value="maintain">Поддержание</option>
              <option value="gain">Набор массы</option>
            </select>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="input"
            >
              <option value="" disabled>Уровень активности</option>
              <option value="sedentary">Малоподвижный</option>
              <option value="light">Лёгкий</option>
              <option value="moderate">Умеренный</option>
              <option value="active">Активный</option>
              <option value="very_active">Очень активный</option>
            </select>
            <button type="submit" className="submit-btn">
              Рассчитать
            </button>
          </form>
        </motion.div>

        {/* Результат - появляется вправо на одно расстояние от центра */}
        {result && (
          <motion.div
            className="result-container"
            initial={{ opacity: 0, x: 0 }} // Начало в центре
            animate={{ opacity: 1, x: 110 }} // Результат двигается вправо
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h3>Результаты расчёта:</h3>
            <p>Калории: {result.calories} ккал</p>
            <p>Белки: {result.protein} г</p>
            <p>Жиры: {result.fat} г</p>
            <p>Углеводы: {result.carbohydrates} г</p>
          </motion.div>
        )}
      </div>

      {/* Отображение спиннера */}
      {loading && <LoadingSpinner />}
    </section>
  );
}