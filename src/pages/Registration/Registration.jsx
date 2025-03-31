import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Registration.css";
import { Link } from "react-router-dom"; // Импортируем Link для навигации
import LoadingSpinner from "../../components/Default/LoadingSpinner"; // Импортируем LoadingSpinner
import ErrorHandler from "../../components/Default/ErrorHandler"; // Импортируем ErrorHandler
import { API_BASE_URL } from '../../config';

export default function Registration() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Состояние загрузки
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Проверка на русские символы в username
    const russianRegex = /[а-яА-Я]/;
    if (russianRegex.test(username)) {
      setError("Логин не должен содержать русские символы.");
      return;
    }

    if (russianRegex.test(email) ) {
      setError("Адрес электронной почты не должен содержать русские символы.");
      return;
    }

    if (russianRegex.test(password)) {
      setError("Пароль не должен содержать русские символы.");
      return;
    }

    // Проверка на пустые поля
    if (!username || !email || !password) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    // Проверка на валидность email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Пожалуйста, введите корректный email.");
      return;
    }

    // Проверка на русские символы в password
    if (russianRegex.test(password)) {
      setError("Пароль не должен содержать русские символы.");
      return;
    }

    const userData = {
      login: username,
      email: email,
      password: password,
    };

    try {
      setIsLoading(true); // Включаем загрузку
      const response = await fetch(`${API_BASE_URL}/auth/registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Обработка ошибок от сервера
        if (errorData.detail === "User with this email already exists") {
          throw new Error("Пользователь с таким email уже существует.");
        } else if (errorData.detail === "User with this login already exists") {
          throw new Error("Пользователь с таким логином уже существует.");
        } else {
          throw new Error("Ошибка при регистрации. Попробуйте снова.");
        }
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);

      navigate("/login"); // Перенаправление после успешной регистрации
    } catch (err) {
      // Обработка ошибки "Failed to fetch"
      if (err.message === "Failed to fetch") {
        setError("Ошибка сети. Проверьте подключение к интернету.");
      } else {
        setError(err.message); // Устанавливаем сообщение об ошибке
      }
    } finally {
      setIsLoading(false); // Выключаем загрузку
    }
  };

  // Закрытие окна с ошибкой
  const closeErrorHandler = () => {
    setError("");
  };

  return (
    <motion.div
      className="registration-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Отображение спиннера */}
      {isLoading && <LoadingSpinner />}

      {/* Отображение ошибки */}
      {error && <ErrorHandler error={error} onClose={closeErrorHandler} />}

      <motion.h1
        className="registration-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Создайте аккаунт
      </motion.h1>

      <motion.form
        className="registration-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <motion.input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
          required
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        />
        <motion.input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        />
        <motion.input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          required
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        />
        <motion.button
          type="submit"
          className="registration-btn"
          disabled={isLoading} // Блокируем кнопку при загрузке
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          Регистрация
        </motion.button>
      </motion.form>

      {/* Ссылка "Войти" с анимацией */}
      <motion.div
        className="to-login-btn-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.7 }}
      >
        <Link to="/login" className="to-login-btn">
          Войти
        </Link>
      </motion.div>

      {/* Кнопка Home для возврата на главную страницу */}
      <motion.div
        className="home-btn-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.9 }}
      >
        <Link to="/" className="home-btn">
          На главную
        </Link>
      </motion.div>
    </motion.div>
  );
}