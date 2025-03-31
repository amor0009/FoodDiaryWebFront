import React from "react";
import { motion } from "framer-motion";
import "./MainWindowMessage.css";

export default function MainWindowMessage({ scrollToCalculator }) {
  return (
    <motion.div
      className="main-message"
      initial={{ opacity: 0, y: 50 }}  
      animate={{ opacity: 1, y: 0 }}   
      transition={{ duration: 1, ease: "easeOut" }} 
    >
      <h1>Отслеживайте питание легко с Food Diary</h1>
      <p>Мы поможем вам рассчитать нужное количество калорий для поддержания здорового питания.</p>
      <button className="try-btn" onClick={scrollToCalculator}>Попробовать</button>
    </motion.div>
  );
}
