"use client"
import { useState, useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { API_BASE_URL } from '../../config'
import LoadingSpinner from "../../components/Default/LoadingSpinner"
import ErrorHandler from "../../components/Default/ErrorHandler"
import { User, Mail, Cake, Users, Target, Ruler, Utensils, ArrowLeft } from "lucide-react"
import "./FamilyMemberProfile.css"

export default function FamilyMemberProfile() {
  const { userId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { familyId, memberEmail } = location.state || {}

  const [userData, setUserData] = useState(null)
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Перевод значений на русский
  const translateValue = (value, category) => {
    if (!value) return "—"
    const translations = {
      gender: {
        male: "Мужской",
        female: "Женский",
        other: "Другой",
      },
      aim: {
        loss: "Снижение веса",
        maintain: "Поддержание веса",
        gain: "Набор веса",
      },
      activity_level: {
        sedentary: "Сидячий образ жизни",
        light: "Легкая активность",
        moderate: "Умеренная активность",
        active: "Высокая активность",
        very_active: "Очень высокая активность",
      },
    }
    return translations[category] && translations[category][value] ? translations[category][value] : value
  }

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        // Получаем данные пользователя по email (если есть) или по userId (если есть эндпоинт)
        // Используем email, переданный из state, или делаем запрос на поиск
        let userResponse
        if (memberEmail) {
          userResponse = await fetch(`${API_BASE_URL}/users/find/${memberEmail}`, {
            credentials: "include",
          })
        } else {
          // Если нет email, пробуем получить по userId (предполагаем, что есть эндпоинт /users/{userId})
          userResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
            credentials: "include",
          })
        }

        if (!userResponse.ok) throw new Error("Не удалось загрузить данные пользователя")
        const user = await userResponse.json()
        setUserData(user)

        // TODO: Запрос на получение приёмов пищи пользователя (пока заглушка)
        // Когда появится эндпоинт /users/{userId}/meals, заменим
        // const mealsResponse = await fetch(`${API_BASE_URL}/users/${userId}/meals`, { credentials: "include" })
        // if (mealsResponse.ok) setMeals(await mealsResponse.json())
        
        // Временно заполняем тестовыми данными
        setMeals([
          { id: 1, name: "Завтрак", calories: 450, date: "2024-03-09" },
          { id: 2, name: "Обед", calories: 780, date: "2024-03-09" },
          { id: 3, name: "Ужин", calories: 620, date: "2024-03-08" },
        ])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (userId || memberEmail) {
      fetchMemberData()
    } else {
      setError("Не указан идентификатор пользователя")
      setLoading(false)
    }
  }, [userId, memberEmail])

  if (loading) return <LoadingSpinner />

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
              {/* Левая колонка - основная информация */}
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
                        <p className="info-value">{userData?.firstname || userData?.login || "—"}</p>
                      </div>
                    </div>

                    {userData?.email && (
                      <div className="info-item">
                        <Mail size={20} className="info-icon" />
                        <div>
                          <p className="info-label">Email</p>
                          <p className="info-value">{userData.email}</p>
                        </div>
                      </div>
                    )}

                    {userData?.age && (
                      <div className="info-item">
                        <Cake size={20} className="info-icon" />
                        <div>
                          <p className="info-label">Возраст</p>
                          <p className="info-value">{userData.age} лет</p>
                        </div>
                      </div>
                    )}

                    {userData?.gender && (
                      <div className="info-item">
                        <Users size={20} className="info-icon" />
                        <div>
                          <p className="info-label">Пол</p>
                          <p className="info-value">{translateValue(userData.gender, "gender")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Правая колонка - подробности и приёмы пищи */}
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
                          <p className="section-value">{userData?.height ? `${userData.height} см` : "—"}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Вес</p>
                          <p className="section-value">{userData?.weight ? `${userData.weight} кг` : "—"}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Рекомендуемые калории</p>
                          <p className="section-value">
                            {userData?.recommended_calories ? `${userData.recommended_calories} ккал/день` : "—"}
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
                          <p className="section-value">{translateValue(userData?.aim, "aim")}</p>
                        </div>
                        <div className="section-item">
                          <p className="section-label">Уровень активности</p>
                          <p className="section-value">{translateValue(userData?.activity_level, "activity_level")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="profile-section">
                      <h3 className="section-title">
                        <Utensils size={18} className="section-icon" />
                        Последние приёмы пищи
                      </h3>
                      <div className="meals-list">
                        {meals.length > 0 ? (
                          meals.map(meal => (
                            <div key={meal.id} className="meal-item">
                              <div>
                                <strong>{meal.name}</strong>
                                <span className="meal-date">{meal.date}</span>
                              </div>
                              <span className="meal-calories">{meal.calories} ккал</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">Нет данных о приёмах пищи</p>
                        )}
                      </div>
                      {/* Кнопка для просмотра всех приёмов пищи (когда будет эндпоинт) */}
                      <button className="view-all-btn" onClick={() => alert("Функция в разработке")}>
                        Посмотреть все записи
                      </button>
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