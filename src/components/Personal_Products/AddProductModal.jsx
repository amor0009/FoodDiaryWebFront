import React, { useState } from "react";
import { motion } from "framer-motion";
import ErrorHandler from "../Default/ErrorHandler";
import LoadingSpinner from "../Default/LoadingSpinner";
import { API_BASE_URL } from '../../config';
import "./AddProductModal.css";

export default function AddProductModal({ isOpen, onClose, product, onSave }) {
  const [name, setName] = useState(product ? product.name : "");
  const [calories, setCalories] = useState(product ? product.calories : "");
  const [proteins, setProteins] = useState(product ? product.proteins : "");
  const [fats, setFats] = useState(product ? product.fats : "");
  const [carbohydrates, setCarbohydrates] = useState(product ? product.carbohydrates : "");
  const [weight, setWeight] = useState(product ? product.weight : "");
  const [description, setDescription] = useState(product ? product.description : "");
  const [picture, setPicture] = useState(product ? product.picture : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация данных
    if (!name.trim()) {
      setError("Укажите название продукта");
      return;
    }

    if (!calories || !proteins || !fats || !carbohydrates || !weight) {
      setError("Заполните все числовые поля");
      return;
    }

    const productData = {
      name,
      calories: parseFloat(calories),
      proteins: parseFloat(proteins),
      fats: parseFloat(fats),
      carbohydrates: parseFloat(carbohydrates),
      weight: parseFloat(weight),
      description,
      picture,
    };

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Требуется авторизация. Пожалуйста, войдите снова.");
      }

      const response = await fetch(`${API_BASE_URL}/product/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || 
          "Сервер вернул ошибку. Попробуйте позже или обратитесь в поддержку."
        );
      }

      const responseData = await response.json();

      onSave({
        ...productData,
        id: responseData.id,
      });

      onClose();
    } catch (error) {
      console.error("Ошибка при сохранении продукта:", error);
      setError(
        error.message === "Failed to fetch"
          ? "Не удалось соединиться с сервером. Проверьте интернет-соединение."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="personal-product-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="personal-product-modal-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="personal-product-modal-header">
          <h2>{product ? "Редактировать продукт" : "Добавить продукт"}</h2>
          <button 
            onClick={onClose} 
            className="personal-product-modal-close"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="personal-product-modal-error">
            <ErrorHandler error={error} onClose={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="personal-product-modal-body">
          {loading && (
            <div className="personal-product-modal-loading-overlay">
              <LoadingSpinner />
            </div>
          )}

          <div className="personal-product-modal-form-group">
            <label>Название *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="nutrition-fields">
            <div className="personal-product-modal-form-group">
              <label>Калории (ккал) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="personal-product-modal-form-group">
              <label>Белки (г) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={proteins}
                onChange={(e) => setProteins(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="personal-product-modal-form-group">
              <label>Жиры (г) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="personal-product-modal-form-group">
              <label>Углеводы (г) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={carbohydrates}
                onChange={(e) => setCarbohydrates(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="personal-product-modal-form-group">
            <label>Вес (г) *</label>
            <input
              type="number"
              step="1"
              min="1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="personal-product-modal-form-group">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="personal-product-modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="cancel-button"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="submit-button"
            >
              {loading ? <LoadingSpinner small white /> : "Сохранить"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}