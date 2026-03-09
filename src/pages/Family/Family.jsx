"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from '../../config'
import LoadingSpinner from "../../components/Default/LoadingSpinner"
import ErrorHandler from "../../components/Default/ErrorHandler"
import "./Family.css"
import {
  Users,
  Plus,
  UserPlus,
  Package,
  Check,
  X,
  Trash2,
  ChevronRight,
  Eye,
  Home,
  Mail,
  UserCog
} from "lucide-react"

export default function Family() {
  const navigate = useNavigate()
  const [families, setFamilies] = useState([])
  const [selectedFamily, setSelectedFamily] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Modals
  const [showCreateFamily, setShowCreateFamily] = useState(false)
  const [newFamilyName, setNewFamilyName] = useState("")
  const [newFamilyDesc, setNewFamilyDesc] = useState("")

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("MEMBER")

  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [productId, setProductId] = useState("")

  // Tabs
  const [activeTab, setActiveTab] = useState("members")

  // Data for selected family
  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [products, setProducts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // My invitations (global)
  const [myInvitations, setMyInvitations] = useState([])

  const showToast = (title, description) => {
    setSuccess({ title, description })
    setTimeout(() => setSuccess(null), 3000)
  }

  // Fetch user's families
  const fetchFamilies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/families/`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Не удалось загрузить семьи")
      const data = await res.json()
      setFamilies(data)
      if (data.length > 0 && !selectedFamily) {
        setSelectedFamily(data[0])
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // Fetch data for selected family
  const fetchFamilyData = async () => {
    if (!selectedFamily) return
    try {
      const [membersRes, invsRes, prodsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/families/${selectedFamily.id}/members`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/families/${selectedFamily.id}/invitations`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/families/${selectedFamily.id}/products`, { credentials: "include" }),
      ])
      if (membersRes.ok) setMembers(await membersRes.json())
      if (invsRes.ok) setInvitations(await invsRes.json())
      if (prodsRes.ok) setProducts(await prodsRes.json())
    } catch (err) {
      console.error("Ошибка загрузки данных семьи:", err)
    }
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/families/notifications?limit=20`, {
        credentials: "include",
      })
      if (res.ok) setNotifications(await res.json())
      const countRes = await fetch(`${API_BASE_URL}/families/notifications/unread-count`, {
        credentials: "include",
      })
      if (countRes.ok) {
        const { count } = await countRes.json()
        setUnreadCount(count)
      }
    } catch (err) {
      console.error("Ошибка загрузки уведомлений:", err)
    }
  }

  // Fetch my invitations
  const fetchMyInvitations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/families/invitations/my`, {
        credentials: "include",
      })
      if (res.ok) setMyInvitations(await res.json())
    } catch (err) {
      console.error("Ошибка загрузки приглашений:", err)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchFamilies()
      await fetchNotifications()
      await fetchMyInvitations()
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (selectedFamily) {
      fetchFamilyData()
    }
  }, [selectedFamily])

  const handleCreateFamily = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/families/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newFamilyName, description: newFamilyDesc }),
      })
      if (!res.ok) throw new Error("Ошибка создания семьи")
      const newFamily = await res.json()
      setFamilies([...families, newFamily])
      setSelectedFamily(newFamily)
      setShowCreateFamily(false)
      setNewFamilyName("")
      setNewFamilyDesc("")
      showToast("Семья создана")
    } catch (err) {
      setError(err.message)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!selectedFamily) return
    try {
      const res = await fetch(`${API_BASE_URL}/families/${selectedFamily.id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      if (!res.ok) throw new Error("Ошибка приглашения")
      const newInv = await res.json()
      setInvitations([...invitations, newInv])
      setShowInviteModal(false)
      setInviteEmail("")
      showToast("Приглашение отправлено")
    } catch (err) {
      setError(err.message)
    }
  }

  const handleInvitationResponse = async (token, accept) => {
    const endpoint = accept ? "accept" : "decline"
    try {
      const res = await fetch(`${API_BASE_URL}/families/invitations/${token}/${endpoint}`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Ошибка ${accept ? "принятия" : "отклонения"} приглашения`)
      await fetchMyInvitations()
      await fetchFamilies()
      showToast(accept ? "Вы присоединились к семье" : "Приглашение отклонено")
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCancelInvitation = async (invitationId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/families/invitations/${invitationId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Ошибка отмены приглашения")
      setInvitations(invitations.filter(inv => inv.id !== invitationId))
      showToast("Приглашение отменено")
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!selectedFamily) return
    try {
      const res = await fetch(`${API_BASE_URL}/families/${selectedFamily.id}/members/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Ошибка удаления участника")
      setMembers(members.filter(m => m.user_id !== userId))
      showToast("Участник удалён")
    } catch (err) {
      setError(err.message)
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    if (!selectedFamily) return
    try {
      const res = await fetch(`${API_BASE_URL}/families/${selectedFamily.id}/members/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error("Ошибка изменения роли")
      const updated = await res.json()
      setMembers(members.map(m => m.user_id === userId ? updated : m))
      showToast("Роль обновлена")
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!selectedFamily) return
    try {
      const res = await fetch(`${API_BASE_URL}/families/${selectedFamily.id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id: productId }),
      })
      if (!res.ok) throw new Error("Ошибка добавления продукта")
      const newProduct = await res.json()
      setProducts([...products, newProduct])
      setShowAddProductModal(false)
      setProductId("")
      showToast("Продукт добавлен")
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemoveProduct = async (productId) => {
    if (!selectedFamily) return
    try {
      const res = await fetch(`${API_BASE_URL}/families/${selectedFamily.id}/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Ошибка удаления продукта")
      setProducts(products.filter(p => p.id !== productId))
      showToast("Продукт удалён")
    } catch (err) {
      setError(err.message)
    }
  }

  const handleMarkRead = async (notificationId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/families/notifications/${notificationId}/read`, {
        method: "PATCH",
        credentials: "include",
      })
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/families/notifications/mark-all-read`, {
        method: "POST",
        credentials: "include",
      })
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="family-page">
      <motion.div
        className="family-container"
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

        <div className="family-header">
          <h1>
            <Home size={28} /> Семья
          </h1>
          <button className="back-button" onClick={() => navigate(-1)}>← Назад</button>
        </div>

        <div className="family-content">
          {/* Левая панель - список семей */}
          <div className="family-sidebar">
            <button className="create-family-btn" onClick={() => setShowCreateFamily(true)}>
              <Plus size={18} /> Создать семью
            </button>
            <div className="family-list">
              {families.map(family => (
                <div
                  key={family.id}
                  className={`family-item ${selectedFamily?.id === family.id ? 'active' : ''}`}
                  onClick={() => setSelectedFamily(family)}
                >
                  <Users size={20} />
                  <div className="family-item-info">
                    <span className="family-name">{family.name}</span>
                    <span className="family-members">{family.members_count} участников</span>
                  </div>
                  <ChevronRight size={16} className="chevron" />
                </div>
              ))}
            </div>

            {/* Мои приглашения */}
            {myInvitations.length > 0 && (
              <div className="my-invitations">
                <h3>Приглашения</h3>
                {myInvitations.map(inv => (
                  <div key={inv.id} className="invitation-card">
                    <div className="invitation-info">
                      <strong>{inv.family_name}</strong>
                      <span>от {inv.inviter_email}</span>
                    </div>
                    <div className="invitation-actions">
                      <button className="icon-btn accept" onClick={() => handleInvitationResponse(inv.token, true)}>
                        <Check size={16} />
                      </button>
                      <button className="icon-btn decline" onClick={() => handleInvitationResponse(inv.token, false)}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Правая панель - информация о выбранной семье */}
          {selectedFamily ? (
            <div className="family-details">
              <div className="family-details-header">
                <div>
                  <h2>{selectedFamily.name}</h2>
                  {selectedFamily.description && <p className="family-desc">{selectedFamily.description}</p>}
                </div>
                <div className="family-actions">
                  <button className="action-btn" onClick={() => setShowInviteModal(true)}>
                    <UserPlus size={18} /> Пригласить
                  </button>
                  <button className="action-btn" onClick={() => setShowAddProductModal(true)}>
                    <Package size={18} /> Продукт
                  </button>
                </div>
              </div>

              {/* Вкладки */}
              <div className="family-tabs">
                <button
                  className={`tab ${activeTab === 'members' ? 'active' : ''}`}
                  onClick={() => setActiveTab('members')}
                >
                  Участники <span className="tab-count">{members.length}</span>
                </button>
                <button
                  className={`tab ${activeTab === 'invitations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('invitations')}
                >
                  Приглашения <span className="tab-count">{invitations.length}</span>
                </button>
                <button
                  className={`tab ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('products')}
                >
                  Продукты <span className="tab-count">{products.length}</span>
                </button>
                <button
                  className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  Уведомления {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </button>
              </div>

              <div className="tab-content">
                {/* Участники */}
                {activeTab === 'members' && (
                  <div className="members-list">
                    {members.map(member => (
                      <div
                        key={member.id}
                        className="member-card"
                        onClick={() => navigate(`/family/member/${member.user_id}`, {
                          state: { familyId: selectedFamily.id, memberEmail: member.user_email }
                        })}
                      >
                        <div className="member-info">
                          <span className="member-name">{member.user_email}</span>
                          <span className="member-role">
                            {member.role === 'ADMIN' ? <UserCog size={14} /> : <Users size={14} />}
                            {member.role === 'ADMIN' ? 'Администратор' : 'Участник'}
                          </span>
                        </div>
                        <div className="member-actions" onClick={e => e.stopPropagation()}>
                          <button
                            className="icon-btn view-profile"
                            title="Просмотреть профиль"
                            onClick={() => navigate(`/family/member/${member.user_id}`, {
                              state: { familyId: selectedFamily.id, memberEmail: member.user_email }
                            })}
                          >
                            <Eye size={16} />
                          </button>
                          {member.can_manage_family_products && (
                            <>
                              <select
                                value={member.role}
                                onChange={(e) => handleChangeRole(member.user_id, e.target.value)}
                                className="role-select"
                                onClick={e => e.stopPropagation()}
                              >
                                <option value="MEMBER">Участник</option>
                                <option value="ADMIN">Админ</option>
                              </select>
                              <button
                                className="icon-btn delete"
                                onClick={() => handleRemoveMember(member.user_id)}
                                title="Удалить участника"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Приглашения */}
                {activeTab === 'invitations' && (
                  <div className="invitations-list">
                    {invitations.map(inv => (
                      <div key={inv.id} className="invitation-item">
                        <div className="invitation-info">
                          <strong>{inv.email}</strong>
                          <span className="invitation-role">{inv.role}</span>
                        </div>
                        <div className="invitation-status">{inv.status}</div>
                        {inv.status === 'PENDING' && (
                          <button className="icon-btn delete" onClick={() => handleCancelInvitation(inv.id)}>
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Продукты */}
                {activeTab === 'products' && (
                  <div className="products-list">
                    {products.map(product => (
                      <div key={product.id} className="product-card">
                        <div className="product-info">
                          <strong>{product.product_name}</strong>
                          <span>{product.product_weight} г • {product.product_calories} ккал</span>
                        </div>
                        {product.can_delete && (
                          <button className="icon-btn delete" onClick={() => handleRemoveProduct(product.id)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Уведомления */}
                {activeTab === 'notifications' && (
                  <div className="notifications-list">
                    {unreadCount > 0 && (
                      <button className="mark-all-read" onClick={handleMarkAllRead}>
                        ✅ Отметить все как прочитанные
                      </button>
                    )}
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                        onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                      >
                        <div className="notification-title">{notif.title}</div>
                        <div className="notification-message">{notif.message}</div>
                        <div className="notification-meta">
                          {notif.family_name} • {new Date(notif.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-family-selected">
              <p>Выберите семью из списка или создайте новую</p>
            </div>
          )}
        </div>

        {/* Модальные окна (без изменений) */}
        <AnimatePresence>
          {showCreateFamily && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="modal">
                <h2>Создать семью</h2>
                <form onSubmit={handleCreateFamily}>
                  <input
                    type="text"
                    placeholder="Название семьи"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Описание (необязательно)"
                    value={newFamilyDesc}
                    onChange={(e) => setNewFamilyDesc(e.target.value)}
                  />
                  <div className="modal-actions">
                    <button type="submit" className="primary">Создать</button>
                    <button type="button" onClick={() => setShowCreateFamily(false)}>Отмена</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {showInviteModal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="modal">
                <h2>Пригласить в семью</h2>
                <form onSubmit={handleInvite}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                    <option value="MEMBER">Участник</option>
                    <option value="ADMIN">Админ</option>
                  </select>
                  <div className="modal-actions">
                    <button type="submit" className="primary">Отправить</button>
                    <button type="button" onClick={() => setShowInviteModal(false)}>Отмена</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {showAddProductModal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="modal">
                <h2>Добавить продукт</h2>
                <form onSubmit={handleAddProduct}>
                  <input
                    type="text"
                    placeholder="ID продукта"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                  />
                  <div className="modal-actions">
                    <button type="submit" className="primary">Добавить</button>
                    <button type="button" onClick={() => setShowAddProductModal(false)}>Отмена</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}