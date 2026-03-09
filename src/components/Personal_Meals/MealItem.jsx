"use client";
import React, { useState } from "react";
import "./MealItem.css";
import ProductModal from "./ProductModal";
import LoadingSpinner from "../Default/LoadingSpinner";
import ErrorHandler from "../Default/ErrorHandler";

const MealItem = ({ meal, onEdit, onDelete }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(meal);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Удалить приём пищи "${meal.name}"?`)) return;

    try {
      setIsDeleting(true);
      setError(null);
      await onDelete(meal.id);
    } catch (error) {
      console.error("Ошибка удаления:", error);
      setError(
        error.message === "Failed to fetch"
          ? "Не удалось удалить приём пищи. Проверьте подключение к интернету."
          : error.message || "Произошла ошибка при удалении"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="meal-item">
        <div className="meal-header">
          <div className="meal-title">
            <h3>{meal.name}</h3>
            <span className="meal-time">{meal.time || "—"}</span>
          </div>
          <div className="meal-summary">
            <span className="kcal">{Math.round(meal.calories)} ккал</span>
            <span className="macros">
              Б {meal.proteins.toFixed(1)} · Ж {meal.fats.toFixed(1)} · У {meal.carbohydrates.toFixed(1)}
            </span>
          </div>
          <div className="meal-actions">
            <button
              className="action-button edit"
              onClick={handleEdit}
              disabled={isDeleting}
            >
              Редактировать
            </button>
            <button
              className="action-button delete"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner size="small" /> : "Удалить"}
            </button>
          </div>
        </div>

        {error && (
          <div className="meal-item-error">
            <ErrorHandler error={error} onClose={() => setError(null)} />
          </div>
        )}

        <div className="nutrition-table">
          {/* Заголовки таблицы – отдельный блок с общей линией */}
          <div className="nutrition-table-header">
            <span>Продукт</span>
            <span>Вес, г</span>
            <span>Ккал</span>
            <span>Б</span>
            <span>Ж</span>
            <span>У</span>
          </div>

          {/* Строки продуктов */}
          {meal.products.map((product) => (
            <div
              className="table-row"
              key={product.id}
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(product);
              }}
            >
              <span>{product.name}</span>
              <span>{product.weight}</span>
              <span>{Math.round(product.calories)}</span>
              <span>{product.proteins.toFixed(1)}</span>
              <span>{product.fats.toFixed(1)}</span>
              <span>{product.carbohydrates.toFixed(1)}</span>
            </div>
          ))}

          {/* Итоговая строка */}
          <div className="table-footer">
            <span>Итого</span>
            <span>{meal.weight} г</span>
            <span>{Math.round(meal.calories)}</span>
            <span>{meal.proteins.toFixed(1)}</span>
            <span>{meal.fats.toFixed(1)}</span>
            <span>{meal.carbohydrates.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </>
  );
};

export default MealItem;