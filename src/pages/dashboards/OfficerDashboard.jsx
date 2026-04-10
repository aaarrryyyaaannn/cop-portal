import { useEffect, useState } from 'react'
import { FileText, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

const notifications = [
  { text: 'Court date: FIR #2024-142 - Feb 25, 2025', urgent: true },
  { text: 'Investigation deadline in 3 days', urgent: false },
]

export default function OfficerDashboard() {
  const [firs, setFirs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getFirs()
        setFirs(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load FIRs:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const assigned = firs.filter((f) => f.status === 'investigation' || f.status === 'assigned')

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Officer Dashboard</h1>
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Quick Actions</h2>
            <Link
              to="/file-fir"
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium"
            >
              <FileText className="w-4 h-4" /> File New FIR
            </Link>
          </div>
          <p className="text-slate-500 text-sm">Quickly file a new First Information Report</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Notifications</h2>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${n.urgent ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}
              >
                <Bell className={`w-5 h-5 flex-shrink-0 ${n.urgent ? 'text-red-500' : 'text-slate-500'}`} />
                <span className="text-sm text-slate-700">{n.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Assigned FIRs</h2>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-500 text-sm border-b border-slate-200">
                  <th className="pb-3 font-medium">FIR Number</th>
                  <th className="pb-3 font-medium">Crime Type</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {(assigned.length ? assigned : firs.slice(0, 5)).map((fir) => (
                  <tr key={fir._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 font-medium">{fir.firNumber}</td>
                    <td className="py-3">{fir.incident?.crimeType || '-'}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${fir.status === 'investigation' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {fir.status === 'investigation' ? 'In Progress' : fir.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link
                        to="/track-fir"
                        className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {firs.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-slate-500 text-center">No FIRs assigned</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
