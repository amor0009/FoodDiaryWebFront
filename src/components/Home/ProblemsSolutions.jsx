import React from "react";
import { motion } from "framer-motion";
import "./ProblemsSolutions.css";

export default function ProblemSolution() {
  return (
    <section className="problems-solutions">
      <h2 className="section-title-problems-and-solutions">Проблемы и решения</h2>
      <div className="problem-solution-container">
        <motion.div
          className="problems"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <h3>С какими проблемами вы сталкиваетесь?</h3>
          <div className="problem"><span className="icon-problems-solutions">❌</span> Трудно считать калории вручную</div>
          <div className="problem"><span className="icon-problems-solutions">❌</span> Запутались в таблицах и приложениях</div>
          <div className="problem"><span className="icon-problems-solutions">❌</span> Нет времени на ведение дневника</div>
        </motion.div>

        <motion.div
          className="solutions"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <h3>Что даёт наше приложение?</h3>
          <div className="solution"><span className="icon-problems-solutions">✅</span> Всё рассчитывается автоматически</div>
          <div className="solution"><span className="icon-problems-solutions">✅</span> Добавляйте любимые блюда за секунды</div>
          <div className="solution"><span className="icon-problems-solutions">✅</span> Подробные отчёты о весе и рационе</div>
        </motion.div>
      </div>
    </section>
  );
}