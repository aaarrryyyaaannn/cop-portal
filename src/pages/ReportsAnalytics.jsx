import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { BarChart3, MapPin, TrendingUp } from 'lucide-react'

export default function ReportsAnalytics() {
  const [stats, setStats] = useState({ total: 0, pending: 0, closed: 0, closedRate: 0, byCrime: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getReports()
        setStats({
          total: data.total || 0,
          pending: data.pending || 0,
          closed: data.closed || 0,
          closedRate: data.closedRate || 0,
          byCrime: data.byCrime || []
        })
      } catch (err) {
        console.error('Failed to load reports:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const crimeTypes = stats.byCrime || []
  const maxCount = Math.max(...crimeTypes.map((c) => c.count), 1)

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Reports & Analytics</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-amber-500" />
            <span className="text-slate-500 font-medium">Total FIRs</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{loading ? '...' : stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            <span className="text-slate-500 font-medium">Closed Rate</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{loading ? '...' : stats.closedRate}%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-8 h-8 text-blue-500" />
            <span className="text-slate-500 font-medium">Pending Cases</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{loading ? '...' : stats.pending}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-slate-900 mb-6">Crime Type Distribution</h2>
        <div className="space-y-4">
          {crimeTypes.map((c) => (
            <div key={c._id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">{c._id}</span>
                <span className="font-medium">{c.count}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(c.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {crimeTypes.length === 0 && !loading && <p className="text-slate-500">No data yet</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Incident Heatmap (Demo)</h2>
        <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
          Map visualization - Integrate Google Maps API for crime hotspots
        </div>
      </div>
    </div>
  )
}
