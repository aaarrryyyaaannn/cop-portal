import { useEffect, useState } from 'react'
import { FileText, Clock, CheckCircle, Users, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { getCachedFirs } from '../../lib/db'

const recentLogs = [
  { action: 'Officer Sharma assigned to FIR #2024-156', time: '5 min ago' },
  { action: 'New FIR filed - Theft in Sector 5', time: '12 min ago' },
  { action: 'User added: Constable Patel', time: '25 min ago' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, closed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getReports()
        setStats({
          total: data.total || 0,
          pending: data.pending || 0,
          closed: data.closed || 0
        })
      } catch {
        const cached = await getCachedFirs()
        const total = cached.length
        const closed = cached.filter((f) => f.status === 'closed').length
        setStats({ total, pending: total - closed, closed })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total FIRs', value: stats.total, icon: FileText, color: 'bg-blue-500' },
    { label: 'Pending Cases', value: stats.pending, icon: Clock, color: 'bg-amber-500' },
    { label: 'Closed Cases', value: stats.closed, icon: CheckCircle, color: 'bg-emerald-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '...' : value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/users"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-amber-500/50 hover:bg-amber-50/50 transition"
            >
              <Users className="w-8 h-8 text-slate-600" />
              <span className="font-medium">User Management</span>
            </Link>
            <Link
              to="/reports"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-amber-500/50 hover:bg-amber-50/50 transition"
            >
              <BarChart3 className="w-8 h-8 text-slate-600" />
              <span className="font-medium">Analytics</span>
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">System Logs</h2>
          <div className="space-y-3">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <p className="text-slate-700 text-sm">{log.action}</p>
                <span className="text-slate-400 text-xs">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
