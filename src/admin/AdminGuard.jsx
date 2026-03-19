// src/admin/AdminGuard.jsx
// Protects the /admin route — redirects if not authenticated
import { Navigate } from 'react-router-dom'

export default function AdminGuard({ children }) {
  const isAdmin = sessionStorage.getItem('sam_admin') === 'true'
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
