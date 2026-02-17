import { createContext, useContext, useState, useEffect } from 'react'
import { api, getToken } from '../lib/api'
import { getStoredUser, setStoredUser, clearStoredUser } from '../lib/db'

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
          await setStoredUser(user, token)
        } else {
          const stored = await getStoredUser()
          if (stored?.user) setUser(normalizeUser(stored.user))
        }
      } catch {
        const stored = await getStoredUser()
        if (stored?.user) setUser(normalizeUser(stored.user))
        else {
          api.logout()
          clearStoredUser()
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (userData) => {
    const u = normalizeUser(userData.user)
    setUser(u)
    await setStoredUser(userData.user, userData.token)
  }

  const logout = () => {
    setUser(null)
    api.logout()
    clearStoredUser()
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
