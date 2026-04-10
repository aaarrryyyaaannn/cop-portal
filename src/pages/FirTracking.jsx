import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { FileText, UserPlus, Search, CheckCircle, Clock, Phone } from 'lucide-react'

const statusSteps = [
  { key: 'filed', label: 'Filed', icon: FileText },
  { key: 'assigned', label: 'Assigned', icon: UserPlus },
  { key: 'investigation', label: 'Investigation', icon: Search },
  { key: 'closed', label: 'Closed', icon: CheckCircle },
]

export default function FirTracking() {
  const { user } = useAuth()
  const [searchId, setSearchId] = useState('')
  const [result, setResult] = useState(null)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    setSearched(true)
    setResult(null)
    setError('')
    setLoading(true)
    try {
      const fir = await api.trackFir(searchId)
      setResult(fir)
    } catch (err) {
      setError(err.message || 'FIR not found')
    } finally {
      setLoading(false)
    }
  }

  const currentIdx = result ? statusSteps.findIndex((s) => s.key === result.status) : -1
  const officer = result?.assignedTo

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Track FIR</h1>

      <form onSubmit={handleSearch} className="mb-8 flex gap-3 max-w-xl">
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Enter FIR Number (e.g. FIR-2025-001)"
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
        />
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center gap-2 disabled:opacity-70">
          <Search className="w-4 h-4" /> Search
        </button>
      </form>

      {loading && <p className="text-slate-500">Searching...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {searched && !loading && result && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">FIR Status</h2>
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <span className="text-slate-600">FIR Number: <strong>{result.firNumber}</strong></span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${result.status === 'closed' ? 'bg-emerald-100 text-emerald-800' :
                  result.status === 'investigation' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                }`}>
                {result.status?.charAt(0)?.toUpperCase() + result.status?.slice(1)}
              </span>
              <span className="text-slate-500 text-sm">Filed on {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : '-'}</span>
            </div>

            <div className="relative pl-8 border-l-2 border-slate-200">
              {statusSteps.map((step, i) => {
                const done = i <= currentIdx
                const Icon = step.icon
                const entry = result.timeline?.find((t) => t.status === step.key)
                return (
                  <div key={step.key} className="relative pb-6 last:pb-0">
                    <div className={`absolute -left-8 w-4 h-4 rounded-full border-2 ${done ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-300'}`} />
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-5 h-5 ${done ? 'text-amber-500' : 'text-slate-400'}`} />
                      <span className={`font-medium ${done ? 'text-slate-900' : 'text-slate-500'}`}>{step.label}</span>
                    </div>
                    {entry && (
                      <p className="text-sm text-slate-500 ml-7">
                        {entry.desc} - {new Date(entry.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {officer && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Assigned Officer</h2>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold">
                  {officer.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{officer.name}</p>
                  <p className="text-sm text-slate-500">{officer.email}</p>
                </div>
                {officer.phone && (
                  <a
                    href={`tel:${officer.phone}`}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-700 rounded-lg hover:bg-amber-500/30 font-medium"
                  >
                    <Phone className="w-4 h-4" /> {officer.phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {searched && !loading && !result && !error && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No FIR found with that number.</p>
        </div>
      )}
    </div>
  )
}
