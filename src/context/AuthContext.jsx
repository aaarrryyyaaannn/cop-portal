import { createContext, useContext, useState, useEffect } from 'react'
import { api, getToken } from '../lib/api'

const AuthContext = createContext(null)

function normalizeUser(u) {
  if (!u) return null
  return { ...u, id: u.id || u._id }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const token = getToken()
      try {
        if (token) {
          const { user } = await api.getMe()
          setUser(normalizeUser(user))
        }
      } catch {
        api.logout()
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (userData) => {
    const u = normalizeUser(userData.user)
    setUser(u)
  }

  const logout = () => {
    setUser(null)
    api.logout()
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
