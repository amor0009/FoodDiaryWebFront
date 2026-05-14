"use client"
import { useState, useEffect, useRef } from "react"
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
  UserCog,
  Edit,
  AlertTriangle
} from "lucide-react"

// ---------- Кастомный селект ----------
const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options?.find(opt => opt.value === value)
  const displayText = selectedOption ? selectedOption.label : (placeholder || "Выберите")

  return (
    <div className="custom-select" ref={containerRef}>
      <div
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayText}</span>
        <span className="arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div className="custom-options">
          {options.map((opt) => (
            <div
              key={opt.value}
              className="custom-option"
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Family() {
  const navigate = useNavigate()
  const [families, setFamilies] = useState([])
  const [selectedFamily, setSelectedFamily] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [currentUserRole, setCurrentUserRole] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)

  const [showCreateFamily, setShowCreateFamily] = useState(false)
  const [newFamilyName, setNewFamilyName] = useState("")
  const [newFamilyDesc, setNewFamilyDesc] = useState("")

  const [showEditFamilyModal, setShowEditFamilyModal] = useState(false)
  const [editFamilyName, setEditFamilyName] = useState("")
  const [editFamilyDesc, setEditFamilyDesc] = useState("")
  const [isUpdatingFamily, setIsUpdatingFamily] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeletingFamily, setIsDeletingFamily] = useState(false)

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")

  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [productSearchResults, setProductSearchResults] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isSearchingProduct, setIsSearchingProduct] = useState(false)
  const [productSearchTimeout, setProductSearchTimeout] = useState(null)

  const [activeTab, setActiveTab] = useState("members")

  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [products, setProducts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const [myInvitations, setMyInvitations] = useState([])

  const statusLabels = {
    pending: "Ожидает",
    accepted: "Принято",
    declined: "Отклонено",
    expired: "Просрочено",
  }
  const roleLabels = {
    owner: "Владелец",
    admin: "Администратор",
    member: "Участник",
  }

  const showToast = (title, description) => {
    setSuccess({ title, description })
    setTimeout(() => setSuccess(null), 3000)
  }

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, { credentials: "include" })
      if (!res.ok) throw new Error("Не удалось загрузить пользователя")
      const data = await res.json()
      setCurrentUserId(data.id)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchFamilies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/families/`, { credentials: "include" })
      if (!res.ok) throw new Error("Не удалось загрузить семьи")
      const data = await res.json()
      setFamilies(data)
      if (data.length > 0 && !selectedFamily) setSelectedFamily(data[0])
    } catch (err) {
      setError(err.message)
    }
  }

  const fetchFamilyData = async () => {
    if (!selectedFamily) return
    try {
      const [membersRes, invsRes, prodsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/families/${selectedFamily.id}/members`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/families/${selectedFamily.id}/invitations`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/families/${selectedFamily.id}/products`, { credentials: "include" }),
      ])
      if (membersRes.ok) {
        const membersData = await membersRes.json()
        setMembers(membersData)
        const currentMember = membersData.find(m => m.user_id === currentUserId)
        setCurrentUserRole(currentMember ? currentMember.role : null)
      }
      if (invsRes.ok) setInvitations(await invsRes.json())
      if (prodsRes.ok) setProducts(await prodsRes.json())
    } catch (err) {
      console.error("Ошибка загрузки данных семьи:", err)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/families/notifications?limit=20`, { credentials: "include" })
      if (res.ok) setNotifications(await res.json())
      const countRes = await fetch(`${API_BASE_URL}/families/notifications/unread-count`, { credentials: "include" })
      if (countRes.ok) {
        const { count } = await countRes.json()
        setUnreadCount(count)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMyInvitations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/families/invitations/my`, { credentials: "include" })
      if (res.ok) setMyInvitations(await res.json())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchCurrentUser()
      await fetchFamilies()
      await fetchNotifications()
      await fetchMyInvitations()
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (selectedFamily && currentUserId) fetchFamilyData()
  }, [selectedFamily, currentUserId])

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

  const handleUpdateFamily = async (e) => {
    e.preventDefault()
    if (!selectedFamily) return
    setIsUpdatingFamily(true)
    try {
      const res = await fetch(`${API_BASE_URL}/families/${selectedFamily.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editFamilyName, description: editFamilyDesc }),
      })
      if (!res.ok) throw new Error("Ошибка обновления семьи")
      const updatedFamily = await res.json()
      setFamilies(families.map(f => f.id === updatedFamily.id ? updatedFamily : f))
      setSelectedFamily(updatedFamily)
      setShowEditFamilyModal(false)
      showToast("Данные семьи обновлены")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUpdatingFamily(false)
    }
  }

  const handleDeleteFamily = async () => {
    if (!selectedFamily) return
    setIsDeletingFamily(true)
    try {
      const res = await fetch(`${API_BASE_URL}/families/${selectedFamily.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Ошибка удаления семьи")
      const newFamilies = families.filter(f => f.id !== selectedFamily.id)
      setFamilies(newFamilies)
      setSelectedFamily(newFamilies.length > 0 ? newFamilies[0] : null)
      setShowDeleteConfirm(false)
      showToast("Семья удалена")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDeletingFamily(false)
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
    setMembers(members.map(m => m.user_id === userId ? { ...m, role: newRole } : m))
    try {
      const res = await fetch(`${API_BASE_URL}/families/${selectedFamily.id}/members/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        setMembers(members.map(m => m.user_id === userId ? { ...m, role: member.role } : m))
        let errorDetail = "Ошибка изменения роли"
        try {
          const errData = await res.json()
          errorDetail = errData.detail || errorDetail
        } catch {}
        throw new Error(errorDetail)
      }
      showToast("Роль обновлена")
    } catch (err) {
      if (err.message !== "Failed to fetch") {
        setMembers(members.map(m => m.user_id === userId ? { ...m, role: member.role } : m))
        setError(err.message)
      }
      console.warn("Изменение роли выполнено, но ответ не получен:", err)
    }
  }

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setProductSearchResults([])
      return
    }
    setIsSearchingProduct(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/search?query=${encodeURIComponent(query)}`,
        { credentials: "include" }
      )
      if (!response.ok) throw new Error("Ошибка поиска продуктов")
      const data = await response.json()
      setProductSearchResults(data)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setIsSearchingProduct(false)
    }
  }

  const handleProductSearchChange = (e) => {
    const value = e.target.value
    setProductSearchQuery(value)
    if (productSearchTimeout) clearTimeout(productSearchTimeout)
    const timeout = setTimeout(() => searchProducts(value), 300)
    setProductSearchTimeout(timeout)
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!selectedFamily || !selectedProduct) return
    try {
      const res = await fetch(`${API_BASE_URL}/families/${selectedFamily.id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id: selectedProduct.id }),
      })
      if (!res.ok) throw new Error("Ошибка добавления продукта")
      const newProduct = await res.json()
      setProducts([...products, newProduct])
      setShowAddProductModal(false)
      setProductSearchQuery("")
      setSelectedProduct(null)
      setProductSearchResults([])
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

  const openEditFamilyModal = () => {
    if (selectedFamily) {
      setEditFamilyName(selectedFamily.name)
      setEditFamilyDesc(selectedFamily.description || "")
      setShowEditFamilyModal(true)
    }
  }

  if (loading) return <LoadingSpinner />

  const isOwner = currentUserRole === "owner"
  const isAdmin = currentUserRole === "admin" || isOwner
  const canManageFamily = isOwner

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
          <h1><Home size={28} /> Семья</h1>
          <button className="back-button" onClick={() => navigate(-1)}>← Назад</button>
        </div>

        <div className="family-content">
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
                      <button className="btn accept" onClick={() => handleInvitationResponse(inv.token, true)}>
                        <Check size={14} /> Принять
                      </button>
                      <button className="btn decline" onClick={() => handleInvitationResponse(inv.token, false)}>
                        <X size={14} /> Отклонить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedFamily ? (
            <div className="family-details">
              <div className="family-details-header">
                <div>
                  <h2>{selectedFamily.name}</h2>
                  {selectedFamily.description && <p className="family-desc">{selectedFamily.description}</p>}
                </div>
                <div className="family-actions">
                  {canManageFamily && (
                    <>
                      <button className="action-btn edit-family-btn" onClick={openEditFamilyModal}>
                        <Edit size={18} /> Редактировать
                      </button>
                      <button className="action-btn delete-family-btn" onClick={() => setShowDeleteConfirm(true)}>
                        <Trash2 size={18} /> Удалить
                      </button>
                    </>
                  )}
                  {isAdmin && (
                    <button className="action-btn" onClick={() => setShowInviteModal(true)}>
                      <UserPlus size={18} /> Пригласить
                    </button>
                  )}
                  <button className="action-btn" onClick={() => setShowAddProductModal(true)}>
                    <Package size={18} /> Продукт
                  </button>
                </div>
              </div>

              <div className="family-tabs">
                <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
                  Участники <span className="tab-count">{members.length}</span>
                </button>
                {isAdmin && (
                  <button className={`tab ${activeTab === 'invitations' ? 'active' : ''}`} onClick={() => setActiveTab('invitations')}>
                    Приглашения <span className="tab-count">{invitations.length}</span>
                  </button>
                )}
                <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                  Продукты <span className="tab-count">{products.length}</span>
                </button>
                <button className={`tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                  Уведомления {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'members' && (
                  <div className="members-list">
                    {members.map(member => (
                      <div key={member.id} className="member-card">
                        <div className="member-info">
                          <span className="member-name">{member.user_email}</span>
                          <span className="member-role">
                            {member.role === 'owner' && <UserCog size={14} />}
                            {member.role === 'admin' && <UserCog size={14} />}
                            {member.role === 'member' && <Users size={14} />}
                            {roleLabels[member.role] || member.role}
                          </span>
                        </div>
                        <div className="member-actions" onClick={e => e.stopPropagation()}>
                          {member.user_id !== currentUserId && (
                            <button
                              className="icon-btn view-profile"
                              onClick={() => navigate(`/family/member/${member.user_id}`, {
                                state: { familyId: selectedFamily.id, memberEmail: member.user_email }
                              })}
                            >
                              <Eye size={14} /> Профиль
                            </button>
                          )}
                          {isAdmin && member.user_id !== currentUserId && member.role !== 'owner' && (
                            <>
                              <CustomSelect
                                value={member.role}
                                options={[
                                  { value: "member", label: "Участник" },
                                  { value: "admin", label: "Администратор" }
                                ]}
                                onChange={(newRole) => handleChangeRole(member.user_id, newRole)}
                              />
                              <button className="icon-btn delete" onClick={() => handleRemoveMember(member.user_id)}>
                                <Trash2 size={14} /> Удалить
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'invitations' && isAdmin && (
                  <div className="invitations-list">
                    {invitations.map(inv => (
                      <div key={inv.id} className="invitation-item">
                        <div className="invitation-info">
                          <strong>{inv.email}</strong>
                          <span className="invitation-role">{roleLabels[inv.role] || inv.role}</span>
                        </div>
                        <div className="invitation-status">{statusLabels[inv.status] || inv.status}</div>
                        {inv.status === 'pending' && (
                          <button className="btn cancel-invite" onClick={() => handleCancelInvitation(inv.id)}>
                            <X size={16} /> Отменить
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="products-list">
                    {products.map(product => (
                      <div key={product.id} className="product-card">
                        <div className="product-info">
                          <strong>{product.product_name}</strong>
                          <span>{product.product_weight} г • {product.product_calories} ккал</span>
                        </div>
                        {product.can_delete && (
                          <button className="btn remove-product" onClick={() => handleRemoveProduct(product.id)}>
                            <Trash2 size={16} /> Удалить
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

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

        {/* Модальные окна */}
        <AnimatePresence>
          {showCreateFamily && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="modal">
                <h2>Создать семью</h2>
                <form onSubmit={handleCreateFamily}>
                  <input type="text" placeholder="Название семьи" value={newFamilyName} onChange={(e) => setNewFamilyName(e.target.value)} required />
                  <textarea placeholder="Описание (необязательно)" value={newFamilyDesc} onChange={(e) => setNewFamilyDesc(e.target.value)} />
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowCreateFamily(false)}>Отмена</button>
                    <button type="submit" className="primary">Создать</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {showEditFamilyModal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="modal modal-edit">
                <h2><Edit size={20} style={{ marginRight: '8px', color: '#7c3aed' }} /> Редактировать семью</h2>
                <form onSubmit={handleUpdateFamily}>
                  <div className="form-group"><label>Название семьи</label><input type="text" value={editFamilyName} onChange={(e) => setEditFamilyName(e.target.value)} required /></div>
                  <div className="form-group"><label>Описание</label><textarea value={editFamilyDesc} onChange={(e) => setEditFamilyDesc(e.target.value)} rows={3} /></div>
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowEditFamilyModal(false)}>Отмена</button>
                    <button type="submit" className="primary" disabled={isUpdatingFamily}>{isUpdatingFamily ? "Сохранение..." : "Сохранить"}</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {showDeleteConfirm && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="modal modal-delete">
                <h2 style={{ color: '#dc2626' }}><AlertTriangle size={20} style={{ marginRight: '8px' }} /> Удалить семью?</h2>
                <p>Вы уверены, что хотите удалить семью <strong>"{selectedFamily?.name}"</strong>? Это действие необратимо.</p>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowDeleteConfirm(false)}>Отмена</button>
                  <button type="button" className="danger" onClick={handleDeleteFamily} disabled={isDeletingFamily}>{isDeletingFamily ? "Удаление..." : "Да, удалить"}</button>
                </div>
              </div>
            </motion.div>
          )}

          {showInviteModal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="modal modal-invite">
                <h2><UserPlus size={20} style={{ marginRight: '8px', color: '#7c3aed' }} /> Пригласить в семью</h2>
                <form onSubmit={handleInvite}>
                  <div className="form-group"><label>Email</label><input type="email" placeholder="user@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required /></div>
                  <div className="form-group">
                    <label>Роль</label>
                    <CustomSelect
                      value={inviteRole}
                      options={[
                        { value: "member", label: "Участник" },
                        { value: "admin", label: "Администратор" }
                      ]}
                      onChange={setInviteRole}
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowInviteModal(false)}>Отмена</button>
                    <button type="submit" className="primary">Отправить</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {showAddProductModal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="modal modal-product">
                <h2><Package size={20} style={{ marginRight: '8px', color: '#7c3aed' }} /> Добавить продукт</h2>
                <form onSubmit={handleAddProduct}>
                  <div className="form-group"><label>Поиск продукта</label><input type="text" placeholder="Введите название продукта" value={productSearchQuery} onChange={handleProductSearchChange} /></div>
                  <div className="search-results-container">
                    {isSearchingProduct && <div className="search-loading-text">Поиск...</div>}
                    {productSearchResults.length > 0 && (
                      <ul className="search-results">
                        {productSearchResults.map(product => (
                          <li key={product.id} onClick={() => setSelectedProduct(product)}>{product.name} ({product.calories} ккал/100г)</li>
                        ))}
                      </ul>
                    )}
                    {selectedProduct && <div className="selected-product-info">Выбран: <strong>{selectedProduct.name}</strong></div>}
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowAddProductModal(false)}>Отмена</button>
                    <button type="submit" className="primary" disabled={!selectedProduct}>Добавить</button>
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