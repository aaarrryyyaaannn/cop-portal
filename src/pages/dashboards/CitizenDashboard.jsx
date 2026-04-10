import { useEffect, useState } from 'react'
import { FileText, Search, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

export default function CitizenDashboard() {
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Citizen Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/file-fir"
          className="flex items-center gap-4 p-6 bg-white rounded-xl border border-slate-200 hover:border-amber-500/50 hover:shadow-md transition"
        >
          <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
            <FileText className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">File New FIR</h3>
            <p className="text-slate-500 text-sm">Report an incident and file a First Information Report</p>
          </div>
        </Link>
        <Link
          to="/track-fir"
          className="flex items-center gap-4 p-6 bg-white rounded-xl border border-slate-200 hover:border-amber-500/50 hover:shadow-md transition"
        >
          <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
            <Search className="w-7 h-7 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Track FIR Status</h3>
            <p className="text-slate-500 text-sm">Check the status of your filed complaints</p>
          </div>
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">My FIRs</h2>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            {firs.map((fir) => (
              <div
                key={fir._id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50/50"
              >
                <div>
                  <p className="font-medium text-slate-900">{fir.firNumber}</p>
                  <p className="text-sm text-slate-500">Filed on {fir.createdAt ? new Date(fir.createdAt).toLocaleDateString() : '-'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${fir.status === 'investigation' || fir.status === 'assigned' ? 'bg-amber-100 text-amber-800' :
                      fir.status === 'closed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                    {fir.status === 'investigation' ? 'In Progress' : fir.status?.charAt(0)?.toUpperCase() + fir.status?.slice(1) || 'Filed'}
                  </span>
                  <Link
                    to="/track-fir"
                    className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    <Phone className="w-4 h-4" /> Contact Officer
                  </Link>
                </div>
              </div>
            ))}
            {firs.length === 0 && (
              <p className="text-slate-500 py-8 text-center">No FIRs filed yet. <Link to="/file-fir" className="text-amber-600 font-medium">File your first FIR</Link></p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
