"use client";
import React, { useState } from "react";
import "./MealModal.css";
import { API_BASE_URL } from '../../config';
import LoadingSpinner from "../Default/LoadingSpinner";
import ErrorHandler from "../Default/ErrorHandler";

const EditMealModal = ({ isOpen, onClose, meal, onUpdate, onDelete }) => {
  const [name, setName] = useState(meal?.name || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(
    meal?.products?.map(p => ({
      id: p.id,
      name: p.name,
      weight: p.weight,
      calories: p.calories,
      proteins: p.proteins,
      fats: p.fats,
      carbohydrates: p.carbohydrates
    })) || []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Требуется авторизация. Пожалуйста, войдите снова.");
      }

      const response = await fetch(
        `${API_BASE_URL}/product/search?query=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Сервер не отвечает. Попробуйте позже.");
      }
      
      const data = await response.json();
      setSearchResults(data);
      setError(null);
    } catch (error) {
      console.error("Ошибка поиска:", error);
      setError(
        error.message === "Failed to fetch" 
          ? "Не удалось найти продукты. Проверьте интернет-соединение."
          : error.message
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addProduct = (product) => {
    if (selectedProducts.some(p => p.id === product.id)) return;
    setSelectedProducts([...selectedProducts, { ...product, weight: 100 }]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const updateProductWeight = (id, weight) => {
    const newWeight = Math.max(1, Number(weight));
    setSelectedProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, weight: newWeight } : product
      )
    );
  };

  const removeProduct = (id) => {
    setSelectedProducts(prev => prev.filter(product => product.id !== id));
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      setError("Укажите название приёма пищи");
      return;
    }

    if (selectedProducts.length === 0) {
      setError("Добавьте хотя бы один продукт");
      return;
    }

    const totals = selectedProducts.reduce(
      (acc, product) => ({
        calories: acc.calories + (product.calories * product.weight) / 100,
        proteins: acc.proteins + (product.proteins * product.weight) / 100,
        fats: acc.fats + (product.fats * product.weight) / 100,
        carbohydrates: acc.carbohydrates + (product.carbohydrates * product.weight) / 100,
        weight: acc.weight + product.weight
      }),
      { calories: 0, proteins: 0, fats: 0, carbohydrates: 0, weight: 0 }
    );

    const mealData = {
      name,
      ...totals,
      products: selectedProducts.map(product => ({
        product_id: product.id,
        product_weight: product.weight
      }))
    };

    try {
      setIsSaving(true);
      setError(null);
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
      }

      const response = await fetch(`${API_BASE_URL}/meal/${meal.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mealData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || 
          "Не удалось обновить данные. Попробуйте позже."
        );
      }
      
      const updatedMeal = await response.json();
      onUpdate(updatedMeal);
      onClose();
    } catch (error) {
      console.error("Ошибка обновления:", error);
      setError(
        error.message === "Failed to fetch"
          ? "Не удалось соединиться с сервером. Проверьте интернет."
          : error.message
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить этот приём пищи?")) return;

    try {
      setIsDeleting(true);
      setError(null);
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Требуется авторизация для удаления.");
      }

      await onDelete(meal.id);
      onClose();
    } catch (error) {
      console.error("Ошибка удаления:", error);
      setError(
        error.message === "Failed to fetch"
          ? "Не удалось удалить приём пищи. Нет соединения с сервером."
          : error.message
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="meal-modal-overlay">
      <div className="meal-modal-container">
        <div className="meal-modal-header">
          <h2>Редактировать приём пищи</h2>
          <button className="meal-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="meal-modal-error">
            <ErrorHandler error={error} onClose={() => setError(null)} />
          </div>
        )}

        <div className="meal-modal-form-group">
          <label>Название:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Завтрак, Обед"
          />
        </div>

        <div className="meal-modal-form-group">
          <label>Поиск продуктов:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchProducts(e.target.value);
            }}
            placeholder="Введите название продукта"
          />
          {isSearching ? (
            <div className="meal-modal-loading">
              <LoadingSpinner small />
            </div>
          ) : searchResults.length > 0 ? (
            <ul className="search-results">
              {searchResults.map((product) => (
                <li key={product.id} onClick={() => addProduct(product)}>
                  {product.name} ({product.calories} ккал/100г)
                </li>
              ))}
            </ul>
          ) : searchQuery && !isSearching ? (
            <p className="empty-state">Продукты не найдены</p>
          ) : null}
        </div>

        <div className="selected-products">
          <div className="selected-products-header">
            <span>Продукт</span>
            <span>Вес (г)</span>
            <span>Ккал</span>
            <span></span>
          </div>

          {selectedProducts.length > 0 ? (
            selectedProducts.map((product) => (
              <div key={product.id} className="selected-product">
                <span className="selected-product-name" title={product.name}>
                  {product.name}
                </span>
                <input
                  type="number"
                  value={product.weight}
                  onChange={(e) => updateProductWeight(product.id, e.target.value)}
                  min="1"
                />
                <span className="selected-product-unit">
                  {Math.round((product.calories * product.weight) / 100)}
                </span>
                <button onClick={() => removeProduct(product.id)} title="Удалить">
                  ×
                </button>
              </div>
            ))
          ) : (
            <p className="empty-state">Нет выбранных продуктов</p>
          )}
        </div>

        <div className="meal-modal-footer">
          <button 
            className="delete-button" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <LoadingSpinner small white /> : "Удалить приём пищи"}
          </button>
          <div className="action-buttons">
            <button onClick={onClose}>Отмена</button>
            <button onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? <LoadingSpinner small white /> : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMealModal;