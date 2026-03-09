"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import ErrorHandler from "../Default/ErrorHandler";
import LoadingSpinner from "../Default/LoadingSpinner";
import { API_BASE_URL } from '../../config';
import "./AddProductModal.css";

export default function AddProductModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [proteins, setProteins] = useState("");
  const [fats, setFats] = useState("");
  const [carbohydrates, setCarbohydrates] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [picture, setPicture] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);
  const [loading, setLoading] = useState(false);
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
    formData.append("description", description);

    if (pictureFile) {
      formData.append("picture", pictureFile);
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка при сохранении продукта");
      }

      const savedProduct = await response.json();
      onSave(savedProduct);
      onClose();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      setError(
        error.message === "Failed to fetch"
          ? "Не удалось подключиться к серверу. Проверьте интернет."
          : error.message
      );
    } finally {
      setLoading(false);
      if (picture) URL.revokeObjectURL(picture);
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
          <h2>Добавить продукт</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
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
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="modal-form-group">
            <label>Описание (необязательно)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
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
                disabled={loading}
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
                  <span>Предпросмотр: </span>
                  <img src={picture} alt="Preview" className="photo-preview" />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? <LoadingSpinner small white /> : "Сохранить"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}