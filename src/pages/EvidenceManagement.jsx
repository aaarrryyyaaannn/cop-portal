import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Upload, Image, FileText, Lock, Eye } from 'lucide-react'

export default function EvidenceManagement() {
  const [evidence, setEvidence] = useState([])
  const [firs, setFirs] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [evList, firList] = await Promise.all([api.getEvidence(), api.getFirs().catch(() => [])])
        setEvidence(Array.isArray(evList) ? evList : [])
        setFirs(Array.isArray(firList) ? firList : [])
      } catch (e) {
        setEvidence([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUpload = async (e, firId) => {
    const fid = firId || (firs[0]?._id)
    if (!fid) {
      alert('No FIR selected')
      return
    }
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const ev = await api.uploadEvidence(fid, file)
      setEvidence((prev) => [...prev, ev])
    } catch (err) {
      alert(err.message)
    }
  }

  const filtered = filter === 'all' ? evidence : evidence.filter((e) => e.firId?._id === filter || e.firId === filter)

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Evidence Management</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 max-w-xs"
        >
          <option value="all">All FIRs</option>
          {firs.map((f) => (
            <option key={f._id} value={f._id}>{f.firNumber}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer font-medium w-fit">
          <Upload className="w-4 h-4" /> Upload Evidence
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*,.pdf,.doc,.docx" />
        </label>
      </div>

      <div className="flex items-center gap-2 mb-4 text-slate-600 text-sm">
        <Lock className="w-4 h-4" />
        <span>Secure storage with access logs. Only authorized personnel can view.</span>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition group"
            >
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                {item.type === 'image' ? <Image className="w-12 h-12 text-slate-400" /> : <FileText className="w-12 h-12 text-slate-400" />}
              </div>
              <p className="text-sm font-medium text-slate-800 truncate" title={item.name}>{item.name}</p>
              <p className="text-xs text-slate-500">{item.firId?.firNumber || item.firId || '-'}</p>
              <p className="text-xs text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</p>
              <button className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium opacity-0 group-hover:opacity-100 transition">
                <Eye className="w-3 h-3" /> Preview
              </button>
            </div>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-slate-500 py-8 text-center">No evidence uploaded yet</p>}
        </div>
      )}
    </div>
  )
}
