import { useEffect, useState } from 'react'
import { FileText, Clock, CheckCircle, Users, BarChart3, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, closed: 0 })
  const [firByCrime, setFirByCrime] = useState([])
  const [workforceStats, setWorkforceStats] = useState([])
  const [criminalStats, setCriminalStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [reportData, workforceData, criminalsData] = await Promise.all([
          api.getReports(),
          api.getWorkforce(),
          api.getCriminals()
        ])

        setStats({
          total: reportData?.total || 0,
          pending: reportData?.pending || 0,
          closed: reportData?.closed || 0
        })

        // Format FIR stats
        if (reportData?.byCrime) {
          setFirByCrime(reportData.byCrime.map(c => ({ name: c._id, count: c.count })))
        }

        // Format Workforce Pie Chart stats
        if (workforceData) {
          const wfCounts = { available: 0, on_duty: 0, on_leave: 0 }
          workforceData.forEach(w => { wfCounts[w.dutyStatus || 'available']++ })
          setWorkforceStats([
            { name: 'Available', value: wfCounts.available, color: '#10b981' },
            { name: 'On Duty', value: wfCounts.on_duty, color: '#f59e0b' },
            { name: 'On Leave', value: wfCounts.on_leave, color: '#ef4444' }
          ])
        }

        // Format Criminal Bar Chart stats
        if (criminalsData) {
          const crimCounts = { low: 0, medium: 0, high: 0, critical: 0 }
          criminalsData.forEach(c => { crimCounts[c.riskLevel || 'medium']++ })
          setCriminalStats([
            { name: 'Low', count: crimCounts.low },
            { name: 'Medium', count: crimCounts.medium },
            { name: 'High', count: crimCounts.high },
            { name: 'Critical', count: crimCounts.critical }
          ])
        }

      } catch (err) {
        console.error("Dashboard Load Error:", err)
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/reports" className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition font-medium text-slate-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Full Analytics
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '-' : value}</p>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center`}>
                <Icon className={`w-7 h-7 text-opacity-100 ${color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visualizations Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* FIRs by Crime */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> FIRs by Crime Type
          </h2>
          <div className="flex-1 min-h-[250px]">
            {loading ? <div className="h-full flex items-center justify-center text-slate-400">Loading...</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={firByCrime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Workforce Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Workforce Availability
          </h2>
          <div className="flex-1 min-h-[250px]">
            {loading ? <div className="h-full flex items-center justify-center text-slate-400">Loading...</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={workforceStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {workforceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Criminal Risk Levels */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-500" /> Criminal Risk Distribution
          </h2>
          <div className="flex-1 min-h-[250px]">
            {loading ? <div className="h-full flex items-center justify-center text-slate-400">Loading...</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={criminalStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
