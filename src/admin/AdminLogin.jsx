// src/admin/AdminLogin.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './AdminLogin.css'

const SECRET_PASSWORD = 'sam3dadmin'

export default function AdminLogin({ onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise((r) => setTimeout(r, 600)) // brief UX delay

    if (password === SECRET_PASSWORD) {
      // Store session flag
      sessionStorage.setItem('sam_admin', 'true')
      onClose()
      navigate('/admin')
    } else {
      setError('Incorrect password.')
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <motion.div
      className="admin-login-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="admin-login-modal glass"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="admin-login-modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="admin-login-modal__icon">⬡</div>
        <h2 className="admin-login-modal__title display">Admin</h2>
        <p className="admin-login-modal__sub mono">Restricted access</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="admin-login-input"
            autoFocus
            autoComplete="current-password"
          />
          {error && <p className="admin-login-error mono">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary admin-login-btn"
            disabled={loading || !password}
          >
            {loading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}
