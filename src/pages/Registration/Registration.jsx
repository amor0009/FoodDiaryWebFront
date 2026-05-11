import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Registration.css";
import LoadingSpinner from "../../components/Default/LoadingSpinner";
import ErrorHandler from "../../components/Default/ErrorHandler";
import { API_BASE_URL } from '../../config';

export default function Registration() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1-email, 2-code, 3-final
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const closeErrorHandler = () => setError("");

  // Шаг 1 — отправка email
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Пожалуйста, введите email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Пожалуйста, введите корректный email.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/register/start`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Ошибка отправки кода");
      }

      setStep(2);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Ошибка сети. Проверьте подключение к интернету." : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Шаг 2 — проверка кода
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Введите код подтверждения");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/register/check?code=${encodeURIComponent(code)}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Неверный код");
      }

      setStep(3);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Ошибка сети. Проверьте подключение к интернету." : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Шаг 3 — финальная регистрация
  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !passwordConfirm) {
      setError("Заполните оба поля пароля");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов");
      return;
    }

    const payload = {
      email,
      password,
      password_confirm: passwordConfirm,
      code,
      firstname: firstname || null,
      lastname: lastname || null,
    };

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/register/final`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Ошибка регистрации");
      }

      navigate("/login");
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Ошибка сети. Проверьте подключение к интернету." : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="registration-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {isLoading && <LoadingSpinner />}
      {error && <ErrorHandler error={error} onClose={closeErrorHandler} />}

      <motion.h1
        className="registration-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Регистрация
      </motion.h1>

      <motion.div
        className="registration-form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        {step === 1 && (
          <form onSubmit={handleSendCode} className="step-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <button type="submit" className="registration-btn" disabled={isLoading}>
              Отправить код
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="step-form">
            <p className="step-hint">Код отправлен на {email}</p>
            <input
              type="text"
              placeholder="Код подтверждения"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-field"
              required
            />
            <button type="submit" className="registration-btn" disabled={isLoading}>
              Подтвердить код
            </button>
            <button type="button" className="secondary-btn" onClick={() => setStep(1)}>
              Назад
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalRegister} className="step-form">
            <input
              type="password"
              placeholder="Пароль (мин. 6 символов)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Подтверждение пароля"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Имя (необязательно)"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Фамилия (необязательно)"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="registration-btn" disabled={isLoading}>
              Зарегистрироваться
            </button>
            <button type="button" className="secondary-btn" onClick={() => setStep(2)}>
              Назад
            </button>
          </form>
        )}
      </motion.div>

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