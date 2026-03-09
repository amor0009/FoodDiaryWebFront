"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/Default/Header";
import Menu from "../../components/Default/Menu";
import AddProductModal from "../../components/Personal_Products/AddProductModal";
import EditProductModal from "../../components/Personal_Products/EditProductModal";
import ProductItem from "../../components/Personal_Products/ProductItem";
import ErrorWithRetry from "../../components/Default/ErrorWithRetry";
import LoadingSpinner from "../../components/Default/LoadingSpinner";
import "./PersonalProducts.css";
import { API_BASE_URL } from '../../config';

export default function PersonalProducts() {
  const [products, setProducts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchUserProfile();
        await fetchProducts();
      } catch (error) {
        handleFetchError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFetchError = (error) => {
    let errorMessage = error.message;
    
    if (error.message === "Failed to fetch") {
      errorMessage = "Ошибка сети. Проверьте подключение к интернету.";
    } else if (error.message.includes("Unauthorized")) {
      errorMessage = "Сессия истекла. Пожалуйста, войдите снова.";
    }

    setError(errorMessage);
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось загрузить данные пользователя");
      }

      const data = await response.json();
      setUserData(data);

      if (data.has_profile_picture) {
        await fetchProfilePicture();
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile-picture`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        if (profilePicture) URL.revokeObjectURL(profilePicture);
        setProfilePicture(imageUrl);
      }
    } catch (error) {
      console.error("Ошибка при загрузке фото профиля:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/personal`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Не удалось загрузить список продуктов");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      throw error;
    }
  };

  const handleSaveProduct = async (savedProduct) => {
    try {
      setLoading(true);
      await fetchProducts();
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.detail || "Не удалось удалить продукт");
        error.status = response.status;
        throw error;
      }

      await fetchProducts();
    } catch (error) {
      throw error; // пробрасываем в модалку
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: 'include',
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      window.location.href = "/login";
    }
  };

  const getFullName = (user) => {
    if (!user) return "";
    return [user.firstname, user.lastname].filter(Boolean).join(" ") || user.login;
  };

  const translateValue = (value, category) => {
    const translations = {
      gender: { male: "Мужской", female: "Женский", other: "Другой" },
      aim: { loss: "Снижение веса", maintain: "Поддержание веса", gain: "Набор веса" },
      activity_level: {
        sedentary: "Сидячий образ жизни",
        light: "Легкая активность",
        moderate: "Умеренная активность",
        active: "Высокая активность",
        very_active: "Очень высокая активность",
      },
    };
    return translations[category]?.[value] || value || "—";
  };

  if (loading && !error) {
    return <LoadingSpinner />;
  }

  if (error && !userData) {
    return (
      <ErrorWithRetry
        error={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          const fetchData = async () => {
            try {
              await fetchUserProfile();
              await fetchProducts();
            } catch (error) {
              handleFetchError(error);
            } finally {
              setLoading(false);
            }
          };
          fetchData();
        }}
      />
    );
  }

  return (
    <motion.div
      className="personal-products-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header
        userData={userData}
        profilePicture={profilePicture}
        getFullName={getFullName}
        translateValue={translateValue}
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
      />
      <Menu menuVisible={menuVisible} handleLogout={handleLogout} />

      <div className="personal-products-content">
        <div className="personal-products-header">
          <h2>Мои продукты</h2>
          <button onClick={openAddModal} className="personal-products-add-product-button">
            Добавить продукт
          </button>
        </div>

        {error && (
          <div className="personal-products-error">
            <ErrorHandler error={error} onClose={() => setError(null)} />
          </div>
        )}

        <div className="personal-products-list">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="no-products-message">
              У вас пока нет добавленных продуктов
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}

      {isEditModalOpen && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProduct}
          onSave={handleSaveProduct}
          onDelete={handleDelete}
        />
      )}
    </motion.div>
  );
}