import React from "react";
import { motion } from "framer-motion";
import "./HowItWorks.css";

export default function HowItWorks() {
    return (
        <section className="how-it-works">
            <h2 className="how-it-works-title">Как работает наше приложение?</h2>
            <motion.div
                className="how-it-works-container"
                initial={{ opacity: 0, y: 50 }}  // Начальное положение - ниже
                whileInView={{ opacity: 1, y: 0 }}  // Поднимаем и показываем
                transition={{ duration: 1, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }} // Запускаем анимацию, когда компонент виден на 20%
            >
                <div className="how-it-works-item">
                    <span className="icon-works">💬</span>
                    <h3>Добавьте прием пищи</h3>
                    <p>Выберите блюдо и введите его вес</p>
                </div>
                <div className="how-it-works-item">
                    <span className="icon-works">📊</span>
                    <h3>Получите расчет КБЖУ</h3>
                    <p>Приложение мгновенно определит и посчитает калории, белки, жиры и углеводы</p>
                </div>
                <div className="how-it-works-item">
                    <span className="icon-works">📈</span>
                    <h3>Следите за прогрессом</h3>
                    <p>Получайте отчёты и анализируйте свое питание</p>
                </div>
            </motion.div>
        </section>
    );
}
