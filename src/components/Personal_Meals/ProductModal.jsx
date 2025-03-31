"use client";
import React, { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { API_BASE_URL } from '../../config';
import LoadingSpinner from "../Default/LoadingSpinner";
import ErrorHandler from "../Default/ErrorHandler";
import "./ProductModal.css";

const ProductModal = ({ product, isOpen, onClose }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !product) return;

    const fetchProductImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (product.has_picture) {
          const token = localStorage.getItem("access_token");
          if (!token) {
            throw new Error("Требуется авторизация для просмотра изображения");
          }

          const response = await fetch(
            `${API_BASE_URL}/product/product-picture/${product.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Не удалось загрузить изображение");
          }

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        }
      } catch (err) {
        console.error("Ошибка загрузки изображения:", err);
        setError(
          err.message === "Failed to fetch"
            ? "Не удалось загрузить изображение. Проверьте подключение к интернету."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  return (
    <div className="product-modal-overlay">
      <div className="product-modal-container">
        <div className="product-modal-header">
          <h2>{product.name}</h2>
          <button className="product-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="product-modal-error">
            <ErrorHandler error={error} onClose={() => setError(null)} />
          </div>
        )}

        <div className="product-modal-content">
          <div className="product-modal-image-container">
            {loading ? (
              <div className="image-loading">
                <LoadingSpinner />
                <p>Загрузка изображения...</p>
              </div>
            ) : error ? (
              <div className="image-error">
                <ImageOff size={64} />
                <p>{error}</p>
              </div>
            ) : imageUrl ? (
              <img 
                src={imageUrl} 
                alt={product.name} 
                className="product-modal-image"
                onError={() => setError("Ошибка отображения изображения")}
              />
            ) : (
              <div className="image-modal-placeholder">
                <ImageOff size={64} />
                <p>Нет изображения</p>
              </div>
            )}
          </div>

          <div className="product-modal-info">
            <div className="product-modal-info-item">
              <span className="product-modal-info-label">Калории</span>
              <span className="product-modal-info-value">{product.calories} ккал/100г</span>
            </div>
            <div className="product-modal-info-item">
              <span className="product-modal-info-label">Белки</span>
              <span className="product-modal-info-value">{product.proteins} г/100г</span>
            </div>
            <div className="product-modal-info-item">
              <span className="product-modal-info-label">Жиры</span>
              <span className="product-modal-info-value">{product.fats} г/100г</span>
            </div>
            <div className="product-modal-info-item">
              <span className="product-modal-info-label">Углеводы</span>
              <span className="product-modal-info-value">{product.carbohydrates} г/100г</span>
            </div>
          </div>

          {product.description && (
            <div className="product-modal-description">
              <div className="product-modal-description-label">Описание</div>
              <div className="product-modal-description-text">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;