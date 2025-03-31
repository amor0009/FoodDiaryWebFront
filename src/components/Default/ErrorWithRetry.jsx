import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const ErrorWithRetry = ({ error, onRetry }) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = "/"; // Простое перенаправление на главную
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen profile-container">
      {isRetrying ? (
        <LoadingSpinner />
      ) : (
        <>
          <p className="text-white text-lg">Произошла ошибка: {error}</p>
          <div className="flex flex-col gap-4 mt-4">
            <button
              onClick={handleRetry}
              className="custom-button"
              disabled={isRetrying}
            >
              Попробовать снова
            </button>
            <button
              onClick={handleGoHome}
              className="custom-button"
            >
              На главную
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ErrorWithRetry;