// utils/auth.js
export const checkAuth = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return false; // Пользователь не авторизован
    }
    return true; // Пользователь авторизован
  };