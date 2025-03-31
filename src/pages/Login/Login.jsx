import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Login.css";
import { Link } from "react-router-dom";
import ErrorHandler from "../../components/Default/ErrorHandler"; // Импортируем ErrorHandler
import LoadingSpinner from "../../components/Default/LoadingSpinner"; // Импортируем LoadingSpinner
import { API_BASE_URL } from '../../config';


export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Состояние загрузки
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Сбрасываем ошибку перед отправкой

    // Проверка на пустые поля
    if (!login || !password) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    // Проверка на русские символы в логине
    const russianRegex = /[а-яА-Я]/;
    if (russianRegex.test(login)) {
      setError("Логин не должен содержать русские символы.");
      return;
    }

    if (russianRegex.test(password)) {
      setError("Пароль не должен содержать русские символы.");
      return;
    }

    const userData = new URLSearchParams({
      username: login,
      password: password,
    });

    try {
      setIsLoading(true); // Включаем загрузку
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: userData.toString(),
      });

      // Проверяем статус ответа
      if (!response.ok) {
        // Если статус 401 (Unauthorized), считаем, что это "неверный логин или пароль"
        if (response.status === 401) {
          throw new Error("Неверный логин или пароль.");
        } else {
          // Для других ошибок читаем тело ответа
          const errorData = await response.json();
          throw new Error(errorData.detail || "Ошибка при авторизации. Попробуйте снова.");
        }
      }

      // Читаем тело ответа только один раз
      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);

      navigate("/profile"); // Перенаправление после успешного входа
    } catch (err) {
      // Обработка ошибки "Failed to fetch"
      if (err.message === "Failed to fetch") {
        setError("Ошибка сети. Проверьте подключение к интернету.");
      } else if (err.message.includes("Failed to execute 'json' on 'Response'")) {
        // Если ошибка связана с чтением тела ответа, считаем, что это "неверный логин или пароль"
        setError("Неверный логин или пароль.");
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
      className="login-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Отображение спиннера */}
      {isLoading && <LoadingSpinner />}

      {/* Отображение ошибки */}
      {error && <ErrorHandler error={error} onClose={closeErrorHandler} />}

      <motion.h1
        className="login-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Входите в аккаунт
      </motion.h1>

      <motion.form
        className="login-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <motion.input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="input-field"
          required
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
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
          transition={{ duration: 1, delay: 1.1 }}
        />
        <motion.button
          type="submit"
          className="auth-btn"
          disabled={isLoading} // Блокируем кнопку при загрузке
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          Войти
        </motion.button>
      </motion.form>

      <motion.div
        className="to-registration-btn-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <Link to="/registration" className="to-registration-btn">
          Создать аккаунт
        </Link>
      </motion.div>

      <motion.div
        className="home-btn-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.7 }}
      >
        <Link to="/" className="home-btn">
          На главную
        </Link>
      </motion.div>
    </motion.div>
  );
}