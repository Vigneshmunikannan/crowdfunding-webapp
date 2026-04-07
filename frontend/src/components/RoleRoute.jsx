import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

/**
 * Requires an authenticated user whose role is in `allowedRoles`.
 * Can be nested inside ProtectedRoute or used alone (redirects if not signed in).
 */
export function RoleRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
