import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Plus, Shield, UserCheck, UserCog, Trash2, Key } from 'lucide-react'

const roleIcons = { Investigator: UserCheck, Supervisor: Shield, Clerk: UserCog }

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '', role: 'officer', officerRole: 'Clerk' })

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getUsers()
        setUsers(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const u = await api.createUser(form)
      setUsers((prev) => [...prev, u])
      setShowAdd(false)
      setForm({ username: '', email: '', password: '', name: '', role: 'officer', officerRole: 'Clerk' })
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this user?')) return
    try {
      await api.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u._id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleReset = async (id) => {
    const pass = prompt('Enter new password (min 6 chars)')
    if (!pass || pass.length < 6) return
    try {
      await api.resetPassword(id, pass)
      alert('Password reset')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">User Management</h1>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
        >
          <Plus className="w-4 h-4" /> Add Officer
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Add Officer</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="Username"
                className="w-full px-4 py-2 rounded-lg border"
                required
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email"
                className="w-full px-4 py-2 rounded-lg border"
                required
              />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Password (min 6)"
                className="w-full px-4 py-2 rounded-lg border"
                minLength={6}
                required
              />
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full Name"
                className="w-full px-4 py-2 rounded-lg border"
                required
              />
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border"
              >
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
              </select>
              {form.role === 'officer' && (
                <select
                  value={form.officerRole}
                  onChange={(e) => setForm((f) => ({ ...f, officerRole: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border"
                >
                  <option value="Clerk">Clerk</option>
                  <option value="Investigator">Investigator</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg">Add</button>
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-600 text-sm">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const RoleIcon = roleIcons[user.officerRole] || UserCog
                  return (
                    <tr key={user._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <RoleIcon className="w-3.5 h-3.5" /> {user.officerRole || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleReset(user._id)} className="p-2 rounded-lg hover:bg-amber-100 text-amber-600" title="Reset password">
                            <Key className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(user._id)} className="p-2 rounded-lg hover:bg-red-100 text-red-500" title="Remove">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
