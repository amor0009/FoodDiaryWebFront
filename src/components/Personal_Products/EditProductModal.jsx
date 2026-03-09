"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2 } from "lucide-react";
import ErrorHandler from "../Default/ErrorHandler";
import LoadingSpinner from "../Default/LoadingSpinner";
import { API_BASE_URL } from '../../config';
import "./AddProductModal.css";

export default function EditProductModal({ isOpen, onClose, product, onSave, onDelete }) {
  const [name, setName] = useState(product?.name || "");
  const [calories, setCalories] = useState(product?.calories?.toString() || "");
  const [proteins, setProteins] = useState(product?.proteins?.toString() || "");
  const [fats, setFats] = useState(product?.fats?.toString() || "");
  const [carbohydrates, setCarbohydrates] = useState(product?.carbohydrates?.toString() || "");
  const [weight, setWeight] = useState(product?.weight?.toString() || "");
  const [description, setDescription] = useState(product?.description || "");
  const [picture, setPicture] = useState(product?.images?.cover || null);
  const [pictureFile, setPictureFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleWeightChange = (value) => {
    if (value === "") {
      setWeight("");
      return;
    }
    const num = Number(value);
    if (!isNaN(num) && num >= 1) {
      setWeight(value);
    }
  };

  const handleWeightBlur = () => {
    if (weight === "" || Number(weight) < 1) {
      setWeight("1");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Поддерживаются только изображения");
      return;
    }

    setPictureFile(file);
    setPicture(URL.createObjectURL(file));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Укажите название продукта");
      return;
    }

    if (!calories || !proteins || !fats || !carbohydrates || !weight) {
      setError("Заполните все числовые поля");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("calories", parseFloat(calories).toString());
    formData.append("proteins", parseFloat(proteins).toString());
    formData.append("fats", parseFloat(fats).toString());
    formData.append("carbohydrates", parseFloat(carbohydrates).toString());
    formData.append("weight", parseFloat(weight).toString());
    if (description) formData.append("description", description);

    if (pictureFile) {
      formData.append("picture", pictureFile);
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
        method: "PUT",
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка при обновлении продукта");
      }

      const updatedProduct = await response.json();
      onSave(updatedProduct);
      onClose();
    } catch (error) {
      console.error("Ошибка обновления:", error);
      setError(
        error.message === "Failed to fetch"
          ? "Не удалось сохранить изменения. Проверьте интернет."
          : error.message
      );
    } finally {
      setLoading(false);
      if (pictureFile) URL.revokeObjectURL(picture);
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm(`Вы уверены, что хотите удалить продукт "${name}"?`)) return;

    try {
      setDeleting(true);
      setError(null);
      await onDelete(product.id);
      onClose();
    } catch (error) {
      console.error("Ошибка удаления:", error);
      if (error.status === 409) {
        setError("Невозможно удалить продукт, так как он используется в приёмах пищи.");
      } else {
        setError(
          error.message === "Failed to fetch"
            ? "Не удалось удалить продукт. Проверьте интернет."
            : error.message
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Редактировать продукт</h2>
          <button className="modal-close" onClick={onClose} disabled={loading || deleting}>
            ×
          </button>
        </div>

        {error && (
          <div className="modal-error">
            <ErrorHandler error={error} onClose={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="modal-form-group">
            <label>Название продукта *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Яблоко"
              disabled={loading || deleting}
            />
          </div>

          <div className="nutrition-grid">
            <div className="modal-form-group">
              <label>Калории (ккал) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                disabled={loading || deleting}
              />
            </div>
            <div className="modal-form-group">
              <label>Белки (г) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={proteins}
                onChange={(e) => setProteins(e.target.value)}
                disabled={loading || deleting}
              />
            </div>
            <div className="modal-form-group">
              <label>Жиры (г) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                disabled={loading || deleting}
              />
            </div>
            <div className="modal-form-group">
              <label>Углеводы (г) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={carbohydrates}
                onChange={(e) => setCarbohydrates(e.target.value)}
                disabled={loading || deleting}
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label>Вес (г) *</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={weight}
              onChange={(e) => handleWeightChange(e.target.value)}
              onBlur={handleWeightBlur}
              placeholder="Введите вес"
              disabled={loading || deleting}
            />
          </div>

          <div className="modal-form-group">
            <label>Описание (необязательно)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading || deleting}
              placeholder="Краткое описание продукта"
            />
          </div>

          <div className="modal-form-group">
            <label>Изображение продукта</label>
            <div className="photo-upload-container">
              <button
                type="button"
                className="photo-upload-button"
                onClick={triggerFileInput}
                disabled={loading || deleting}
              >
                <Upload size={16} className="upload-icon" />
                <span>{pictureFile ? "Изменить изображение" : "Загрузить изображение"}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*"
              />
              <p className="photo-upload-note">Поддерживаются форматы JPEG, PNG, GIF</p>
              {picture && (
                <div className="current-photo-info">
                  <span>Текущее изображение: </span>
                  <img src={picture} alt="Product" className="photo-preview" />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="delete-button"
              onClick={handleDeleteClick}
              disabled={loading || deleting}
            >
              {deleting ? <LoadingSpinner small white /> : (
                <>
                  <Trash2 size={16} />
                  <span>Удалить</span>
                </>
              )}
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="button" className="cancel-btn" onClick={onClose} disabled={loading || deleting}>
                Отмена
              </button>
              <button type="submit" className="save-btn" disabled={loading || deleting}>
                {loading ? <LoadingSpinner small white /> : "Сохранить"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}