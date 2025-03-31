import React from "react";
import { ImageOff } from "lucide-react"; // Импортируем иконку
import "./ProductItem.css";

const ProductItem = ({ product, onEdit }) => {
  return (
    <div className="product-item" onClick={() => onEdit(product)}>
      <div className="product-image">
        {product.picture ? (
          <img src={product.picture} alt={product.name} />
        ) : (
          <div className="image-placeholder">
            <ImageOff size={48} color="#ccc" /> {/* Иконка-заглушка */}
            <p>Нет фото</p>
          </div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>Вес: {product.weight}</p>
        <p>Калории: {product.calories}</p>
        <p>Белки: {product.proteins}</p>
        <p>Жиры: {product.fats}</p>
        <p>Углеводы: {product.carbohydrates}</p>
        <div className="description">
          <p>Описание: {product.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;