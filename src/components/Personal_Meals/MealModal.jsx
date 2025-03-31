"use client";
import React, { useState, useEffect } from "react";
import "./MealModal.css";
import { API_BASE_URL } from '../../config';
import LoadingSpinner from "../Default/LoadingSpinner";
import ErrorHandler from "../Default/ErrorHandler";

const MealModal = ({ isOpen, onClose, meal, onSave }) => {
  const [name, setName] = useState(meal?.name || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(meal?.products || []);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (meal?.products) {
      setSelectedProducts(meal.products);
    }
  }, [meal]);

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
          ? "Не удалось подключиться к серверу. Проверьте интернет-соединение."
          : error.message
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addProduct = (product) => {
    if (selectedProducts.some((p) => p.id === product.id)) return;
    setSelectedProducts([...selectedProducts, { ...product, weight: 100 }]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const updateProductWeight = (id, weight) => {
    const newWeight = Math.max(1, Number(weight));
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, weight: newWeight } : product
      )
    );
  };

  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const handleSave = async () => {
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
        carbohydrates:
          acc.carbohydrates + (product.carbohydrates * product.weight) / 100,
        weight: acc.weight + product.weight,
      }),
      { calories: 0, proteins: 0, fats: 0, carbohydrates: 0, weight: 0 }
    );

    const mealData = {
      name,
      ...totals,
      products: selectedProducts.map((product) => ({
        product_id: product.id,
        product_weight: product.weight,
      })),
    };

    try {
      setIsSaving(true);
      setError(null);
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
      }

      const url = meal?.id 
        ? `${API_BASE_URL}/meal/update/${meal.id}`
        : `${API_BASE_URL}/meal/add`;
      const method = meal?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || 
          "Сервер вернул ошибку. Попробуйте позже или обратитесь в поддержку."
        );
      }
      
      const savedMeal = await response.json();
      onSave(savedMeal);
      onClose();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      setError(
        error.message === "Failed to fetch"
          ? "Не удалось сохранить данные. Проверьте подключение к интернету."
          : error.message
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="meal-modal-overlay">
      <div className="meal-modal-container">
        <div className="meal-modal-header">
          <h2>{meal ? "Редактировать приём пищи" : "Добавить приём пищи"}</h2>
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
          <label>Название приёма пищи *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Завтрак, Обед"
          />
        </div>

        <div className="meal-modal-form-group">
          <label>Поиск продуктов</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              searchProducts(value);
            }}
            placeholder="Начните вводить название продукта"
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
                <button
                  onClick={() => removeProduct(product.id)}
                  title="Удалить"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <p className="empty-state">Нет выбранных продуктов</p>
          )}
        </div>

        <div className="meal-modal-footer">
          <button onClick={onClose}>Отмена</button>
          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <LoadingSpinner small white /> : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealModal;