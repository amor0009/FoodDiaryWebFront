"use client";
import React, { useState, useEffect } from "react";
import "./MealModal.css";
import { API_BASE_URL } from '../../config';
import LoadingSpinner from "../Default/LoadingSpinner";
import ErrorHandler from "../Default/ErrorHandler";

const MealModal = ({ isOpen, onClose, meal, onSave, selectedDate }) => {
  const [name, setName] = useState(meal?.name || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(meal?.products || []);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    if (meal?.products) {
      setSelectedProducts(meal.products);
    }
  }, [meal]);

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/search?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка при поиске продуктов");
      }

      const data = await response.json();
      setSearchResults(data);
      setHasSearched(true);
      setError(null);
    } catch (error) {
      console.error("Ошибка поиска:", error);
      setError(
        error.message === "Failed to fetch"
          ? "Не удалось подключиться к серверу. Проверьте интернет-соединение."
          : error.message
      );
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setHasSearched(false);

    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      searchProducts(value);
    }, 300);

    setSearchTimeout(timeout);
  };

  const addProduct = (product) => {
    if (selectedProducts.some((p) => p.id === product.id)) return;
    setSelectedProducts([...selectedProducts, { ...product, weight: 100 }]);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const updateProductWeight = (id, weightString) => {
    if (weightString === "") {
      setSelectedProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, weight: "" } : product
        )
      );
      return;
    }
    const weight = Number(weightString);
    if (!isNaN(weight) && weight >= 1) {
      setSelectedProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, weight } : product
        )
      );
    }
  };

  const handleWeightBlur = (id, weight) => {
    if (weight === "" || Number(weight) < 1) {
      setSelectedProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, weight: 1 } : product
        )
      );
    }
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

    const productsToSave = selectedProducts.map(p => ({
      ...p,
      weight: Number(p.weight) || 1
    }));

    const totals = productsToSave.reduce(
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
      products: productsToSave.map((product) => ({
        product_id: product.id,
        product_weight: product.weight,
      })),
    };

    try {
      setIsSaving(true);
      setError(null);

      const url = meal?.id
        ? `${API_BASE_URL}/meals/${meal.id}`
        : `${API_BASE_URL}/meals/`;
      const method = meal?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(mealData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Ошибка при сохранении приёма пищи"
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

        <div className="meal-modal-content">
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
              onChange={handleSearchChange}
              placeholder="Начните вводить название продукта"
            />
            <div className="search-results-container">
              {searchResults.length > 0 ? (
                <ul className="search-results">
                  {searchResults.map((product) => (
                    <li key={product.id} onClick={() => addProduct(product)}>
                      {product.name} ({product.calories} ккал/100г)
                    </li>
                  ))}
                </ul>
              ) : hasSearched && searchQuery ? (
                <p className="empty-state">Продукты не найдены</p>
              ) : null}
            </div>
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
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={product.weight}
                    onChange={(e) => updateProductWeight(product.id, e.target.value)}
                    onBlur={(e) => handleWeightBlur(product.id, e.target.value)}
                    placeholder="Вес"
                  />
                  <span className="selected-product-unit">
                    {Math.round((product.calories * (Number(product.weight) || 0)) / 100)}
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
        </div>

        <div className="meal-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Отмена</button>
          <button className="save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <LoadingSpinner small white /> : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealModal;