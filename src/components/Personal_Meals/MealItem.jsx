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
      <div className="meal-item" onClick={() => onEdit(meal)}>
        <div className="meal-header">
          <h3>{meal.name}</h3>
          <div className="meal-total-values"></div>
        </div>

        {error && (
          <div className="meal-item-error">
            <ErrorHandler error={error} onClose={() => setError(null)} />
          </div>
        )}

        <div className="nutrition-table">
          <div className="table-header">
            <span>Продукт</span>
            <span>Вес</span>
            <span>Калории</span>
            <span>Белки</span>
            <span>Жиры</span>
            <span>Углеводы</span>
          </div>

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
              <span>{product.weight} г</span>
              <span>{Math.round(product.calories)}</span>
              <span>{product.proteins.toFixed(1)}</span>
              <span>{product.fats.toFixed(1)}</span>
              <span>{product.carbohydrates.toFixed(1)}</span>
            </div>
          ))}

          <div className="table-footer">
            <span>Итого:</span>
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