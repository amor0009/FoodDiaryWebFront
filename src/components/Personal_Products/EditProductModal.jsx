import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2 } from "lucide-react";
import ErrorHandler from "../Default/ErrorHandler";
import LoadingSpinner from "../Default/LoadingSpinner";
import { API_BASE_URL } from '../../config';
import "./EditProductModal.css";

export default function EditProductModal({ isOpen, onClose, product, onSave, onDelete }) {
  const [name, setName] = useState(product?.name || "");
  const [calories, setCalories] = useState(product?.calories || "");
  const [proteins, setProteins] = useState(product?.proteins || "");
  const [fats, setFats] = useState(product?.fats || "");
  const [carbohydrates, setCarbohydrates] = useState(product?.carbohydrates || "");
  const [weight, setWeight] = useState(product?.weight || "");
  const [description, setDescription] = useState(product?.description || "");
  const [picture, setPicture] = useState(product?.picture || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка типа файла
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Поддерживаются только изображения (JPEG, PNG, GIF)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingPhoto(true);
      setError(null);
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Требуется авторизация. Пожалуйста, войдите снова.");
      }

      const response = await fetch(
        `${API_BASE_URL}/product/upload-product-picture/${product.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось загрузить изображение");
      }

      const data = await response.json();
      setPicture(data.file_url);
    } catch (error) {
      console.error("Ошибка загрузки изображения:", error);
      setError(
        error.message === "Failed to fetch"
          ? "Не удалось загрузить изображение. Проверьте интернет-соединение."
          : error.message
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const triggerFileInput = () => {
    document.getElementById("product-picture-upload").click();
  };

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
      id: product.id,
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

      const response = await fetch(`${API_BASE_URL}/product/update/${product.id}`, {
        method: "PUT",
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

      onSave({
        ...product,
        ...productData,
      });

      onClose();
    } catch (error) {
      console.error("Ошибка при сохранении продукта:", error);
      setError(
        error.message === "Failed to fetch"
          ? "Не удалось сохранить изменения. Проверьте подключение к интернету."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm(`Вы уверены, что хотите удалить продукт "${name}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Требуется авторизация. Пожалуйста, войдите снова.");
      }

      const response = await fetch(`${API_BASE_URL}/product/delete/${product.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось удалить продукт");
      }

      // Проверяем, что продукт действительно удален
      const checkResponse = await fetch(`${API_BASE_URL}/product/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (checkResponse.ok) {
        const products = await checkResponse.json();
        const productStillExists = products.some(p => p.id === product.id);
        if (productStillExists) {
          throw new Error("Продукт не был удален. Попробуйте снова.");
        }
      }

      // Вызываем onDelete только после успешного удаления
      await onDelete(product.id);
      onClose();
    } catch (error) {
      console.error("Ошибка при удалении продукта:", error);
      setError(
        error.message === "Failed to fetch"
          ? "Не удалось удалить продукт. Проверьте подключение к интернету."
          : error.message
      );
    } finally {
      setDeleting(false);
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
          <h2>Редактировать продукт</h2>
          <button 
            onClick={onClose} 
            className="personal-product-modal-close"
            disabled={loading || deleting}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="personal-product-modal-error">
            <ErrorHandler error={error} onClose={() => setError(null)} />
          </div>
        )}

        {(loading || deleting) && (
          <div className="personal-product-modal-loading-overlay">
            <LoadingSpinner />
            <p>{deleting ? "Удаление..." : "Сохранение..."}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="personal-product-modal-body">
          <div className="personal-product-modal-form-group">
            <label>Название *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading || deleting}
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
                disabled={loading || deleting}
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
                disabled={loading || deleting}
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
                disabled={loading || deleting}
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
                disabled={loading || deleting}
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
              disabled={loading || deleting}
            />
          </div>

          <div className="personal-product-modal-form-group">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading || deleting}
            />
          </div>

          <div className="personal-product-modal-form-group">
            <label>Изображение продукта</label>
            <div className="photo-upload-container">
              <button
                type="button"
                className={`photo-upload-button ${uploadingPhoto ? 'uploading' : ''}`}
                onClick={triggerFileInput}
                disabled={uploadingPhoto || loading || deleting}
              >
                <Upload size={16} className="upload-icon" />
                <span>
                  {uploadingPhoto ? "Загрузка..." : "Загрузить изображение"}
                </span>
              </button>
              <input
                type="file"
                id="product-picture-upload"
                style={{ display: "none" }}
                onChange={handleFileUpload}
                accept="image/*"
              />
              <p className="photo-upload-note">Поддерживаются форматы JPEG, PNG, GIF</p>
              {picture && (
                <div className="current-photo-info">
                  <span>Текущее изображение: </span>
                  <a 
                    href={picture} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Посмотреть
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="personal-product-modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading || deleting}
              className="cancel-button"
            >
              Отмена
            </button>
            <button 
              type="button" 
              onClick={handleDeleteClick} 
              disabled={loading || deleting}
              className="delete-button"
            >
              {deleting ? <LoadingSpinner small white /> : (
                <>
                  <Trash2 size={16} />
                  <span>Удалить</span>
                </>
              )}
            </button>
            <button 
              type="submit" 
              disabled={loading || deleting}
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