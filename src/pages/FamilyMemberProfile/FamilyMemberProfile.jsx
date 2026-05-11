"use client"
import { useState, useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { API_BASE_URL } from '../../config'
import LoadingSpinner from "../../components/Default/LoadingSpinner"
import ErrorHandler from "../../components/Default/ErrorHandler"
import WeightChart from "../../components/Weight_Statistic/WeightChart"
import {
  User, Mail, Cake, Users, Target, Ruler, Utensils,
  ArrowLeft, Scale, Lightbulb
} from "lucide-react"
import "./FamilyMemberProfile.css"

export default function FamilyMemberProfile() {
  const { userId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { familyId, memberEmail } = location.state || {}

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("meals")

  const translateValue = (value, category) => {
    if (!value) return "—"
    const translations = {
      gender: { male: "Мужской", female: "Женский" },
      aim: { loss: "Снижение веса", maintain: "Поддержание веса", gain: "Набор веса" },
      activity_level: {
        sedentary: "Сидячий образ жизни",
        light: "Легкая активность",
        moderate: "Умеренная активность",
        active: "Высокая активность",
        very_active: "Очень высокая активность",
      },
    }
    return translations[category]?.[value] || value
  }

  useEffect(() => {
    if (!familyId || !userId) {
      setError("Недостаточно данных для загрузки профиля")
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/families/${familyId}/members/${userId}/profile`,
          { credentials: "include" }
        )
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || "Ошибка загрузки профиля")
        }
        const data = await res.json()
        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [familyId, userId])

  if (loading) return <LoadingSpinner />

  const user = profile?.user
  const meals = profile?.meals || []
  const weightHistory = profile?.weight_history || []
  const recommendations = profile?.recommendations || []

  // Сортируем приёмы пищи по дате (от старых к новым)
  const sortedMeals = [...meals].reverse()

  return (
    <div className="profile-page">
      <motion.div
        className="profile-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {error && <ErrorHandler error={error} onClose={() => setError(null)} />}

        <div className="profile-header-fixed">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} /> Назад к семье
          </button>
        </div>

        <div className="main-content">
          <div className="container_add mx-auto py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Левая колонка – основная информация */}
              <div className="profile-content lg:col-span-1">
                <div className="profile-header">
                  <h2 className="text-xl font-bold">Информация об участнике</h2>
                </div>
                <div className="profile-body">
                  <div className="info-items">
                    <div className="info-item">
                      <User size={20} className="info-icon" />
                      <div>
                        <p className="info-label">Имя</p>
                        <p className="info-value">{user?.firstname || user?.login || "—"}</p>
                      </div>
                    </div>

                    {user?.email && (
                      <div className="info-item">
                        <Mail size={20} className="info-icon" />
                        <div>
                          <p className="info-label">Email</p>
                          <p className="info-value">{user.email}</p>
                        </div>
                      </div>
                    )}

                    {user?.age && (
                      <div className="info-item">
                        <Cake size={20} className="info-icon" />
                        <div>
                          <p className="info-label">Возраст</p>
                          <p className="info-value">{user.age} лет</p>
                        </div>
                      </div>
                    )}

                    {user?.gender && (
                      <div className="info-item">
                        <Users size={20} className="info-icon" />
                        <div>
                          <p className="info-label">Пол</p>
                          <p className="info-value">{translateValue(user.gender, "gender")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Правая колонка – детали и история */}
              <div className="profile-content lg:col-span-2">
                <div className="profile-header">
                  <h2 className="text-xl font-bold">Профиль участника</h2>
                </div>
                <div className="profile-body">
                  <div className="profile-sections">
                    <div className="profile-section">
                      <h3 className="section-title">
                        <Ruler size={18} className="section-icon" />
                        Физические параметры
                      </h3>
                      <div className="section-grid">
                        <div className="section-item">
                          <p className="section-label">Рост</p>
                          <p className="section-value">{user?.height ? `${user.height} см` : "—"}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Вес</p>
                          <p className="section-value">{user?.weight ? `${user.weight} кг` : "—"}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Рекомендуемые калории</p>
                          <p className="section-value">
                            {user?.recommended_calories ? `${user.recommended_calories} ккал/день` : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h3 className="section-title">
                        <Target size={18} className="section-icon" />
                        Цели и активность
                      </h3>
                      <div className="section-grid">
                        <div className="section-item">
                          <p className="section-label">Цель</p>
                          <p className="section-value">{translateValue(user?.aim, "aim")}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Уровень активности</p>
                          <p className="section-value">{translateValue(user?.activity_level, "activity_level")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <div className="section-tabs">
                        <button className={`tab ${activeTab === "meals" ? "active" : ""}`} onClick={() => setActiveTab("meals")}>
                          <Utensils size={16} /> Приёмы пищи
                        </button>
                        <button className={`tab ${activeTab === "weight" ? "active" : ""}`} onClick={() => setActiveTab("weight")}>
                          <Scale size={16} /> Вес
                        </button>
                        <button className={`tab ${activeTab === "recommendations" ? "active" : ""}`} onClick={() => setActiveTab("recommendations")}>
                          <Lightbulb size={16} /> Рекомендации
                        </button>
                      </div>

                      <div className="section-tab-content">
                        {activeTab === "meals" && (
                          <div className="meals-container">
                            {sortedMeals.length === 0 ? (
                              <p className="empty-text">Нет данных за 30 дней</p>
                            ) : (
                              sortedMeals.map(meal => (
                                <div key={meal.id} className="meal-item">
                                  <div className="meal-header">
                                    <div className="meal-title">
                                      <h3>{meal.name}</h3>
                                      <span className="meal-time">
                                        {new Date(meal.created_at).toLocaleString('ru-RU', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    <div className="meal-summary">
                                      <span className="kcal">{Math.round(meal.calories)} ккал</span>
                                      <span className="macros">
                                        Б {meal.proteins.toFixed(1)} · Ж {meal.fats.toFixed(1)} · У {meal.carbohydrates.toFixed(1)}
                                      </span>
                                    </div>
                                  </div>

                                  {meal.products.length > 0 && (
                                    <div className="nutrition-table">
                                      <div className="nutrition-table-header">
                                        <span>Продукт</span>
                                        <span>Вес, г</span>
                                        <span>Ккал</span>
                                        <span>Б</span>
                                        <span>Ж</span>
                                        <span>У</span>
                                      </div>
                                      {meal.products.map(product => (
                                        <div key={product.id} className="table-row">
                                          <span>{product.name}</span>
                                          <span>{product.weight}</span>
                                          <span>{Math.round(product.calories)}</span>
                                          <span>{product.proteins.toFixed(1)}</span>
                                          <span>{product.fats.toFixed(1)}</span>
                                          <span>{product.carbohydrates.toFixed(1)}</span>
                                        </div>
                                      ))}
                                      <div className="table-footer">
                                        <span>Итого</span>
                                        <span>{meal.weight} г</span>
                                        <span>{Math.round(meal.calories)}</span>
                                        <span>{meal.proteins.toFixed(1)}</span>
                                        <span>{meal.fats.toFixed(1)}</span>
                                        <span>{meal.carbohydrates.toFixed(1)}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {activeTab === "weight" && (
                          <div className="weight-section">
                            {weightHistory.length === 0 ? (
                              <p className="empty-text">Нет записей за 30 дней</p>
                            ) : (
                              <div className="chart-container">
                                <WeightChart weightHistory={weightHistory} />
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === "recommendations" && (
                          <div className="recommendations-list">
                            {recommendations.length === 0 ? (
                              <p className="empty-text">Нет рекомендаций</p>
                            ) : (
                              recommendations.map(rec => (
                                <div key={rec.id} className={`rec-item ${rec.is_completed ? "completed" : ""}`}>
                                  <div className="rec-message">{rec.message}</div>
                                  <div className="rec-meta">
                                    <span>{rec.date}</span>
                                    <span>{rec.is_completed ? "✅ Выполнена" : "⏳ Ожидает"}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}