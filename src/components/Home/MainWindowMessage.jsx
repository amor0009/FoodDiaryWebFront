import React from "react";
import { motion } from "framer-motion";
import "./MainWindowMessage.css";

export default function MainWindowMessage({ scrollToCalculator }) {
  return (
    <motion.div
      className="main-message"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    >
      <h1>Отслеживайте питание легко с Food Diary</h1>
      <p>Рассчитайте вашу идеальную норму калорий и достигайте целей без стресса.</p>
      <button className="try-btn" onClick={scrollToCalculator}>Попробовать бесплатно</button>
    </motion.div>
  );
}