import React from "react";
import { motion } from "framer-motion";
import "./HowItWorks.css";

export default function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2 className="how-it-works-title">Как работает приложение?</h2>
      <motion.div
        className="how-it-works-container"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, staggerChildren: 0.2 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="how-it-works-item">
          <span className="icon-works">📝</span>
          <h3>Добавьте приём пищи</h3>
          <p>Выберите блюдо и укажите вес — мы сделаем остальное</p>
        </div>
        <div className="how-it-works-item">
          <span className="icon-works">⚡️</span>
          <h3>Мгновенный расчёт КБЖУ</h3>
          <p>Калории, белки, жиры, углеводы — всё за секунду</p>
        </div>
        <div className="how-it-works-item">
          <span className="icon-works">📈</span>
          <h3>Анализируйте прогресс</h3>
          <p>Отслеживайте динамику веса и качества питания</p>
        </div>
      </motion.div>
    </section>
  );
}