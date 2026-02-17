import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Shield, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [captcha, setCaptcha] = useState(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
    return result
  })
  const [captchaInput, setCaptchaInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
    setCaptcha(result)
    setCaptchaInput('')
    return result
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (captchaInput.toUpperCase() !== captcha) {
      setError('Invalid captcha. Please try again.')
      generateCaptcha()
      return
    }
    if (!username || !password) {
      setError('Please enter username and password.')
      return
    }
    setLoading(true)
    try {
      const data = await api.login(username, password)
      login(data)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed. Check credentials.')
      generateCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 mb-4">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Police FIR Portal</h1>
            <p className="text-slate-500 mt-1">Secure access for authorized users</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Police ID / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition"
                placeholder="admin / officer1 / citizen1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition pr-10"
                  placeholder="admin123 / officer123 / citizen123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Captcha</label>
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 bg-slate-100 rounded-lg font-mono text-lg tracking-widest text-slate-700 text-center select-none">
                  {captcha}
                </div>
                <button
                  type="button"
                  onClick={() => generateCaptcha()}
                  className="px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg font-medium"
                >
                  Refresh
                </button>
              </div>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none uppercase"
                placeholder="Enter captcha"
                maxLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
            )}

            <a href="#" className="block text-sm text-amber-600 hover:text-amber-700">Forgot Password?</a>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-slate-500 text-sm mt-4">© 2025 Police FIR Management Portal</p>
      </div>
    </div>
  )
}
