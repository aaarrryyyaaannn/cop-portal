import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Search, ChevronDown, UserPlus, FileText } from 'lucide-react'

function statusLabel(s) {
  if (!s) return '-'
  if (s === 'investigation') return 'In Progress'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function CaseManagement() {
  const [firs, setFirs] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCrime, setFilterCrime] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [firList, userList] = await Promise.all([api.getFirs(), api.getUsers().catch(() => [])])
        setFirs(Array.isArray(firList) ? firList : [])
        setUsers(Array.isArray(userList) ? userList : [])
      } catch (err) {
        console.error('Failed to load cases:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = firs.filter((f) => {
    const matchSearch = !search || (f.firNumber?.toLowerCase().includes(search.toLowerCase())) || (f.complainant?.name?.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = filterStatus === 'all' || f.status === filterStatus || (filterStatus === 'inprogress' && f.status === 'investigation')
    const matchCrime = filterCrime === 'all' || (f.incident?.crimeType?.toLowerCase() === filterCrime)
    return matchSearch && matchStatus && matchCrime
  })

  const handleAssign = async (firId, officerId) => {
    try {
      await api.assignFir(firId, officerId)
      const updated = firs.map((f) => (f._id === firId ? { ...f, assignedTo: users.find((u) => u._id === officerId) } : f))
      setFirs(updated)
    } catch (e) {
      alert(e.message)
    }
  }

  const handleStatus = async (firId, status) => {
    try {
      await api.updateFirStatus(firId, status)
      const updated = firs.map((f) => (f._id === firId ? { ...f, status } : f))
      setFirs(updated)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Case Management</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by FIR number or complainant"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="all">All Status</option>
            <option value="filed">Filed</option>
            <option value="assigned">Assigned</option>
            <option value="investigation">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filterCrime}
            onChange={(e) => setFilterCrime(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="all">All Crimes</option>
            <option value="theft">Theft</option>
            <option value="assault">Assault</option>
            <option value="cybercrime">Cybercrime</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-600 text-sm">
                  <th className="px-6 py-4 font-medium">FIR Number</th>
                  <th className="px-6 py-4 font-medium">Crime Type</th>
                  <th className="px-6 py-4 font-medium">Complainant</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Assigned Officer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((fir) => (
                  <React.Fragment key={fir._id}>
                    <tr
                      className="border-t border-slate-100 hover:bg-slate-50/50 cursor-pointer"
                      onClick={() => setExpanded(expanded === fir._id ? null : fir._id)}
                    >
                      <td className="px-6 py-4 font-medium">{fir.firNumber}</td>
                      <td className="px-6 py-4">{fir.incident?.crimeType || '-'}</td>
                      <td className="px-6 py-4">{fir.complainant?.name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${fir.status === 'closed' ? 'bg-emerald-100 text-emerald-800' :
                            fir.status === 'investigation' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                          {statusLabel(fir.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">{fir.assignedTo?.name || '-'}</td>
                      <td className="px-6 py-4 text-slate-500">{fir.createdAt ? new Date(fir.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {!fir.assignedTo && users.length > 0 && (
                            <select
                              className="text-sm border rounded px-2 py-1"
                              onChange={(e) => { const v = e.target.value; if (v) handleAssign(fir._id, v) }}
                            >
                              <option value="">Assign</option>
                              {users.filter((u) => u.role === 'officer').map((u) => (
                                <option key={u._id} value={u._id}>{u.name}</option>
                              ))}
                            </select>
                          )}
                          {fir.status !== 'closed' && (
                            <select
                              className="text-sm border rounded px-2 py-1"
                              value={fir.status}
                              onChange={(e) => handleStatus(fir._id, e.target.value)}
                            >
                              <option value="filed">Filed</option>
                              <option value="assigned">Assigned</option>
                              <option value="investigation">In Progress</option>
                              <option value="closed">Closed</option>
                            </select>
                          )}
                          <ChevronDown className={`w-4 h-4 mt-2 transition-transform ${expanded === fir._id ? 'rotate-180' : ''}`} />
                        </div>
                      </td>
                    </tr>
                    {expanded === fir._id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-slate-50">
                          <div className="text-sm text-slate-600">
                            <p><strong>Description:</strong> {fir.incident?.description}</p>
                            <p className="mt-1"><strong>Location:</strong> {fir.incident?.location}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
