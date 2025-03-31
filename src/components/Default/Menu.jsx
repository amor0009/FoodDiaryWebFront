import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Book, Apple, BarChart, Settings, LogOut } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import "./Menu.css"

export default function Menu({ menuVisible, handleLogout }) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {menuVisible && (
        <motion.div
          className="menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="menu-header">
            <p>Меню</p>
          </div>
          <button  onClick={() => navigate("/profile")} className="menu-button-item">
            <Edit size={18} />
            <span>Мой профиль</span>
          </button>
          <button  onClick={() => navigate("/diary")} className="menu-button-item">
            <Book size={18} />
            <span>Дневник питания</span>
          </button>
          <button  onClick={() => navigate("/my-products")} className="menu-button-item">
            <Apple size={18} />
            <span>Мои продукты</span>
          </button>
          <button onClick={() => navigate("/weight-statistic")} className="menu-button-item">
            <BarChart size={18} />
            <span>Статистика веса</span>
          </button>
          <button  onClick={() => navigate("/settings")} className="menu-button-item">
            <Settings size={18} />
            <span>Настройки</span>
          </button>
          <button onClick={handleLogout} className="menu-button-item logout-button">
            <LogOut size={18} />
            <span>Выйти из системы</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
