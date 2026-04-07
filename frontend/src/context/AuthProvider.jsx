import { useCallback, useEffect, useMemo, useState } from 'react'
import { setAuthToken } from '../services/api'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'crowdfunding_auth'

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { token: null, user: null }
    }
    const parsed = JSON.parse(raw)
    if (parsed?.token && parsed?.user) {
      return { token: parsed.token, user: parsed.user }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return { token: null, user: null }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth)

  useEffect(() => {
    setAuthToken(auth.token)
  }, [auth.token])

  const login = useCallback((newToken, newUser) => {
    const next = { token: newToken, user: newUser }
    setAuth(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const logout = useCallback(() => {
    setAuth({ token: null, user: null })
    localStorage.removeItem(STORAGE_KEY)
    setAuthToken(null)
  }, [])

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      role: auth.user?.role ?? null,
      isAuthenticated: Boolean(auth.token && auth.user),
      login,
      logout,
    }),
    [auth.token, auth.user, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
