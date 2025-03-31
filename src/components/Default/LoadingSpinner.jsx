// components/LoadingSpinner.jsx
import React from "react";
import "./LoadingSpinner.css"; // Импортируем стили

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <span className="loading-text">Загрузка...</span>
    </div>
  );
};

export default LoadingSpinner;