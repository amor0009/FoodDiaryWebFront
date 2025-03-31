// components/Default/ErrorHandler.jsx
import React from "react";
import "./ErrorHandler.css"; // Импортируем стили

const ErrorHandler = ({ error, onClose }) => {
  return (
    <div className="error-handler-overlay">
      <div className="error-handler-container">
        <p className="error-handler-message">{error}</p>
        <button onClick={onClose} className="error-handler-close-button">
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default ErrorHandler;