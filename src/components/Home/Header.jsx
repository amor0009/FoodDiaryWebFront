import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate(); // Хук для перехода между страницами

  return (
    <header className="header">
      <motion.div
        className="auth-buttons"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <button className="login-btn" onClick={() => navigate("/login")}>Войти</button>
        <button className="register-btn" onClick={() => navigate("/registration")}>Регистрация</button>
      </motion.div>
    </header>
  );
}
