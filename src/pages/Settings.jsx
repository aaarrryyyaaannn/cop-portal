import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Key, User, Globe } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [lang, setLang] = useState('en')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifySms, setNotifySms] = useState(false)
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [saved, setSaved] = useState(false)

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (newPass !== confirmPass) {
      alert('Passwords do not match')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setOldPass('')
    setNewPass('')
    setConfirmPass('')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" /> Profile
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                defaultValue={user?.name}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email / Contact</label>
              <input
                defaultValue={user?.email}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" /> Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
            >
              {saved ? '✓ Saved' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" /> Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              >
                <option value="en">English</option>
                <option value="mr">Marathi (मराठी)</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-700">Email notifications</span>
              <button
                onClick={() => setNotifyEmail(!notifyEmail)}
                className={`w-12 h-6 rounded-full transition-colors ${notifyEmail ? 'bg-amber-500' : 'bg-slate-300'}`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${notifyEmail ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-700">SMS notifications</span>
              <button
                onClick={() => setNotifySms(!notifySms)}
                className={`w-12 h-6 rounded-full transition-colors ${notifySms ? 'bg-amber-500' : 'bg-slate-300'}`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${notifySms ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
