import React from "react";
import { motion } from "framer-motion";
import "./ProblemsSolutions.css";

export default function ProblemSolution() {
  return (
    <section className="problems-solutions">
      <h2 className="section-title-problems-and-solutions">Проблемы и решения</h2>
      <div className="problem-solution-container">
        {/* Левая колонка - Проблемы */}
        <motion.div
          className="problems"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }} // Анимация запускается, когда компонент виден на 20%
        >
          <h3>С какими проблемами Вы сталкиваетесь:</h3>
          <div className="problem">
            <span className="icon-problems-solutions">❌</span> Трудно считать калории вручную
          </div>
          <div className="problem">
            <span className="icon-problems-solutions">❌</span> Запутались в таблицах и приложениях
          </div>
          <div className="problem">
            <span className="icon-problems-solutions">❌</span> Нет времени на ведение дневника питания
          </div>
        </motion.div>

        {/* Правая колонка - Решения */}
        <motion.div
          className="solutions"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }} // Запуск, когда компонент виден на 20%
        >
          <h3>Что позволяет наше приложение:</h3>
          <div className="solution">
            <span className="icon-problems-solutions">✅</span> Всё рассчитывается за Вас
          </div>
          <div className="solution">
            <span className="icon-problems-solutions">✅</span> Добавляйте любимые блюда
          </div>
          <div className="solution">
            <span className="icon-problems-solutions">✅</span> Получайте подробные отчёты о весе и рационе
          </div>
        </motion.div>
      </div>
    </section>
  );
}
