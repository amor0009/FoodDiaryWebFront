"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from '../../config'
import LoadingSpinner from "../../components/Default/LoadingSpinner"
import ErrorHandler from "../../components/Default/ErrorHandler"
import "./Settings.css"

export default function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Password change
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Email change
  const [newEmail, setNewEmail] = useState("")
  const [emailCode, setEmailCode] = useState("")
  const [emailStep, setEmailStep] = useState(1) // 1: enter email, 2: enter code
  const [emailLoading, setEmailLoading] = useState(false)

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Toast helper
  const showToast = (title, description, variant = "default") => {
    setSuccess({ title, description })
    setTimeout(() => setSuccess(null), 3000)
  }

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Не удалось загрузить данные пользователя")
        const data = await res.json()
        setUser(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }
    setPasswordLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          password_confirm: confirmPassword,
        }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Ошибка при смене пароля")
      }
      showToast("Успех", "Пароль успешно изменён")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  // Start email change
  const handleStartEmailChange = async (e) => {
    e.preventDefault()
    setEmailLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/email?email=${encodeURIComponent(newEmail)}`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Ошибка при отправке кода")
      }
      setEmailStep(2)
      showToast("Код отправлен", `Проверьте почту ${newEmail}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setEmailLoading(false)
    }
  }

  // Finalize email change
  const handleFinalEmailChange = async (e) => {
    e.preventDefault()
    setEmailLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/email/final`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: newEmail,
          code: emailCode,
        }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Ошибка при подтверждении email")
      }
      const updatedUser = await res.json()
      setUser(updatedUser)
      showToast("Успех", "Email успешно изменён")
      setEmailStep(1)
      setNewEmail("")
      setEmailCode("")
    } catch (err) {
      setError(err.message)
    } finally {
      setEmailLoading(false)
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || "Ошибка при удалении аккаунта")
      }
      // Logout and redirect
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" })
      window.location.href = "/login"
    } catch (err) {
      setError(err.message)
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="settings-page">
      <motion.div
        className="settings-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {error && <ErrorHandler error={error} onClose={() => setError(null)} />}
        {success && (
          <div className="success-toast">
            <strong>{success.title}</strong>
            <p>{success.description}</p>
          </div>
        )}

        <div className="settings-header">
          <h1>Настройки аккаунта</h1>
          <button className="back-button" onClick={() => navigate(-1)}>← Назад</button>
        </div>

        <div className="settings-grid">
          {/* Смена пароля */}
          <div className="settings-card">
            <h2>Смена пароля</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Старый пароль</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Новый пароль</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Подтвердите новый пароль</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="settings-button" disabled={passwordLoading}>
                {passwordLoading ? "Сохранение..." : "Изменить пароль"}
              </button>
            </form>
          </div>

          {/* Смена email */}
          <div className="settings-card">
            <h2>Смена email</h2>
            {emailStep === 1 ? (
              <form onSubmit={handleStartEmailChange}>
                <div className="form-group">
                  <label>Новый email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="settings-button" disabled={emailLoading}>
                  {emailLoading ? "Отправка..." : "Отправить код"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleFinalEmailChange}>
                <div className="form-group">
                  <label>Код подтверждения</label>
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="settings-button" disabled={emailLoading}>
                  {emailLoading ? "Подтверждение..." : "Подтвердить email"}
                </button>
                <button
                  type="button"
                  className="settings-button secondary"
                  onClick={() => setEmailStep(1)}
                >
                  Назад
                </button>
              </form>
            )}
          </div>

          {/* Опасная зона */}
          <div className="settings-card danger">
            <h2>Опасная зона</h2>
            <p>Удаление аккаунта приведёт к безвозвратной потере всех данных.</p>
            {!showDeleteConfirm ? (
              <button className="danger-button" onClick={() => setShowDeleteConfirm(true)}>
                Удалить аккаунт
              </button>
            ) : (
              <div className="confirm-delete">
                <p>Вы уверены? Это действие необратимо.</p>
                <div className="confirm-actions">
                  <button className="danger-button" onClick={handleDeleteAccount} disabled={deleteLoading}>
                    {deleteLoading ? "Удаление..." : "Да, удалить"}
                  </button>
                  <button className="settings-button secondary" onClick={() => setShowDeleteConfirm(false)}>
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}