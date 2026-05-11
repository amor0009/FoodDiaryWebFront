import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";
import ErrorHandler from "../Default/ErrorHandler";
import { API_BASE_URL } from '../../config';
import "./CaloriesForm.css";

export default function CaloriesForm() {
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [aim, setAim] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // Состояния для каждого дропдауна
  const [genderOpen, setGenderOpen] = useState(false);
  const [aimOpen, setAimOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);

  // Рефы для отслеживания кликов вне
  const genderRef = useRef(null);
  const aimRef = useRef(null);
  const activityRef = useRef(null);

  // Закрытие дропдаунов при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderRef.current && !genderRef.current.contains(event.target)) {
        setGenderOpen(false);
      }
      if (aimRef.current && !aimRef.current.contains(event.target)) {
        setAimOpen(false);
      }
      if (activityRef.current && !activityRef.current.contains(event.target)) {
        setActivityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const weightNum = parseFloat(weight);
    const ageNum = parseInt(age, 10);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || isNaN(ageNum) || isNaN(heightNum)) {
      setError("Пожалуйста, введите корректные числовые значения.");
      return;
    }
    if (weightNum <= 0 || ageNum <= 0 || heightNum <= 0) {
      setError("Вес, возраст и рост должны быть положительными числами.");
      return;
    }
    if (!gender || !aim || !activityLevel) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    const userData = {
      weight: weightNum,
      age: ageNum,
      height: heightNum,
      gender,
      aim,
      activity_level: activityLevel,
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/calculate-nutrients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setShowResult(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка при расчёте данных.");
      }
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError("Ошибка сети. Проверьте подключение к интернету.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const closeErrorHandler = () => setError(null);

  // Анимация
  const formAnimation = isDesktop
    ? {
        x: showResult ? -140 : 0,
        opacity: showResult ? 0.6 : 1,
        scale: showResult ? 0.97 : 1,
      }
    : { opacity: 1, scale: 1 };

  const resultAnimation = {
    initial: { opacity: 0, x: 40, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    transition: { type: "spring", damping: 25, stiffness: 120 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.3, ease: "easeOut" }
    })
  };

  // Ключи с бэка: proteins, fats
  const nutrientItems = result && [
    { icon: "🔥", label: "Калории", value: result.calories, unit: "ккал" },
    { icon: "🥩", label: "Белки", value: result.proteins, unit: "г" },
    { icon: "🧈", label: "Жиры", value: result.fats, unit: "г" },
    { icon: "🍚", label: "Углеводы", value: result.carbohydrates, unit: "г" }
  ];

  // Вспомогательные функции для отображения выбранного значения
  const getGenderLabel = () => {
    if (!gender) return "Пол";
    return gender === "male" ? "Мужчина" : "Женщина";
  };

  const getAimLabel = () => {
    if (!aim) return "Цель";
    const map = {
      loss: "Похудение",
      maintain: "Поддержание",
      gain: "Набор массы",
    };
    return map[aim];
  };

  const getActivityLabel = () => {
    if (!activityLevel) return "Уровень активности";
    const map = {
      sedentary: "Малоподвижный",
      light: "Лёгкий",
      moderate: "Умеренный",
      active: "Активный",
      very_active: "Очень активный",
    };
    return map[activityLevel];
  };

  return (
    <section className="calculate-nutrients-section">
      <h2 className="calculate-nutrients-title">Рассчитайте вашу норму КБЖУ</h2>
      {error && <ErrorHandler error={error} onClose={closeErrorHandler} />}

      <div className="form-result-container">
        <motion.div
          className="form-container"
          animate={formAnimation}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <form onSubmit={handleSubmit} className="form">
            <input
              type="number"
              placeholder="Вес (кг)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input"
              required
            />
            <input
              type="number"
              placeholder="Возраст"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input"
              required
            />
            <input
              type="number"
              placeholder="Рост (см)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="input"
              required
            />

            {/* Кастомный выбор пола */}
            <div className="custom-select" ref={genderRef}>
              <div
                className="custom-select-trigger"
                onClick={() => setGenderOpen(!genderOpen)}
              >
                <span>{getGenderLabel()}</span>
                <span className="arrow">{genderOpen ? "▲" : "▼"}</span>
              </div>
              {genderOpen && (
                <div className="custom-options">
                  <div
                    className="custom-option"
                    onClick={() => {
                      setGender("male");
                      setGenderOpen(false);
                    }}
                  >
                    Мужчина
                  </div>
                  <div
                    className="custom-option"
                    onClick={() => {
                      setGender("female");
                      setGenderOpen(false);
                    }}
                  >
                    Женщина
                  </div>
                </div>
              )}
            </div>

            {/* Кастомный выбор цели */}
            <div className="custom-select" ref={aimRef}>
              <div
                className="custom-select-trigger"
                onClick={() => setAimOpen(!aimOpen)}
              >
                <span>{getAimLabel()}</span>
                <span className="arrow">{aimOpen ? "▲" : "▼"}</span>
              </div>
              {aimOpen && (
                <div className="custom-options">
                  <div
                    className="custom-option"
                    onClick={() => {
                      setAim("loss");
                      setAimOpen(false);
                    }}
                  >
                    Похудение
                  </div>
                  <div
                    className="custom-option"
                    onClick={() => {
                      setAim("maintain");
                      setAimOpen(false);
                    }}
                  >
                    Поддержание
                  </div>
                  <div
                    className="custom-option"
                    onClick={() => {
                      setAim("gain");
                      setAimOpen(false);
                    }}
                  >
                    Набор массы
                  </div>
                </div>
              )}
            </div>

            {/* Кастомный выбор уровня активности */}
            <div className="custom-select" ref={activityRef}>
              <div
                className="custom-select-trigger"
                onClick={() => setActivityOpen(!activityOpen)}
              >
                <span>{getActivityLabel()}</span>
                <span className="arrow">{activityOpen ? "▲" : "▼"}</span>
              </div>
              {activityOpen && (
                <div className="custom-options">
                  <div
                    className="custom-option"
                    onClick={() => {
                      setActivityLevel("sedentary");
                      setActivityOpen(false);
                    }}
                  >
                    Малоподвижный
                  </div>
                  <div
                    className="custom-option"
                    onClick={() => {
                      setActivityLevel("light");
                      setActivityOpen(false);
                    }}
                  >
                    Лёгкий
                  </div>
                  <div
                    className="custom-option"
                    onClick={() => {
                      setActivityLevel("moderate");
                      setActivityOpen(false);
                    }}
                  >
                    Умеренный
                  </div>
                  <div
                    className="custom-option"
                    onClick={() => {
                      setActivityLevel("active");
                      setActivityOpen(false);
                    }}
                  >
                    Активный
                  </div>
                  <div
                    className="custom-option"
                    onClick={() => {
                      setActivityLevel("very_active");
                      setActivityOpen(false);
                    }}
                  >
                    Очень активный
                  </div>
                </div>
              )}
            </div>

            <motion.button
              type="submit"
              className="submit-btn"
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Рассчитать
            </motion.button>
          </form>
        </motion.div>

        {result && (
          <motion.div
            className="result-container"
            initial={resultAnimation.initial}
            animate={resultAnimation.animate}
            transition={resultAnimation.transition}
          >
            <h3>Ваши результаты</h3>
            <div className="result-items">
              {nutrientItems.map((item, idx) => (
                <motion.p
                  key={item.label}
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  className="result-row"
                >
                  <span>
                    {item.icon} {item.label}:
                  </span>
                  <strong>
                    {item.value} {item.unit}
                  </strong>
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {loading && <LoadingSpinner />}
    </section>
  );
}