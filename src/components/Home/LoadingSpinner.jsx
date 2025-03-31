// components/LoadingSpinner.jsx
import React from "react";
import "./LoadingSpinner.css"; // Импортируем стили

const LoadingSpinner = () => {
  return (
    <div className="home-loading-spinner-container">
      <div className="home-loading-spinner"></div>
      <span className="home-loading-text">Загрузка...</span>
    </div>
  );
};

export default LoadingSpinner;