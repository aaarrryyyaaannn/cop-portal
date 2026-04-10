import { useState, useEffect } from 'react'
import { Search, ShieldAlert, Plus, Filter } from 'lucide-react'
import { api } from '../lib/api'

export default function CriminalManagement() {
    const [criminals, setCriminals] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterRisk, setFilterRisk] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showForm, setShowForm] = useState(false)

    const [newCrim, setNewCrim] = useState({ name: '', age: '', gender: 'male', riskLevel: 'medium', status: 'at_large', lastKnownLocation: '' })

    useEffect(() => {
        fetchCriminals()
    }, [])

    async function fetchCriminals() {
        try {
            const data = await api.getCriminals()
            setCriminals(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleCreate(e) {
        e.preventDefault()
        try {
            await api.createCriminal({ ...newCrim, age: Number(newCrim.age) })
            fetchCriminals()
            setShowForm(false)
            setNewCrim({ name: '', age: '', gender: 'male', riskLevel: 'medium', status: 'at_large', lastKnownLocation: '' })
        } catch (err) {
            console.error(err)
        }
    }

    const filteredCriminals = criminals.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
        const matchesRisk = filterRisk === 'all' || c.riskLevel === filterRisk
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus
        return matchesSearch && matchesRisk && matchesStatus
    })

    if (loading) return <div className="p-6">Loading Criminal Database...</div>

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldAlert className="w-7 h-7 text-red-500" />
                        Criminal Database
                    </h1>
                    <p className="text-slate-500 mt-1">Track, filter, and manage criminal profiles.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
                    <Plus className="w-5 h-5" /> Add Profile
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="text-sm font-medium mb-1 block">Name</label><input required value={newCrim.name} onChange={e => setNewCrim({ ...newCrim, name: e.target.value })} className="w-full border rounded-lg p-2" /></div>
                        <div><label className="text-sm font-medium mb-1 block">Age</label><input type="number" required value={newCrim.age} onChange={e => setNewCrim({ ...newCrim, age: e.target.value })} className="w-full border rounded-lg p-2" /></div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Gender</label>
                            <select value={newCrim.gender} onChange={e => setNewCrim({ ...newCrim, gender: e.target.value })} className="w-full border rounded-lg p-2">
                                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Risk Level</label>
                            <select value={newCrim.riskLevel} onChange={e => setNewCrim({ ...newCrim, riskLevel: e.target.value })} className="w-full border rounded-lg p-2">
                                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Status</label>
                            <select value={newCrim.status} onChange={e => setNewCrim({ ...newCrim, status: e.target.value })} className="w-full border rounded-lg p-2">
                                <option value="at_large">At Large</option><option value="arrested">Arrested</option>
                            </select>
                        </div>
                        <div><label className="text-sm font-medium mb-1 block">Last Known Location</label><input value={newCrim.lastKnownLocation} onChange={e => setNewCrim({ ...newCrim, lastKnownLocation: e.target.value })} className="w-full border rounded-lg p-2" /></div>
                        <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Save Criminal Profile</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-500" />
                            <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none">
                                <option value="all">All Risks</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none">
                                <option value="all">All Status</option>
                                <option value="at_large">At Large</option>
                                <option value="arrested">Arrested</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Age/Gender</th>
                                <th className="p-4 font-medium">Location</th>
                                <th className="p-4 font-medium">Risk Level</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCriminals.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No records found.</td></tr>
                            ) : (
                                filteredCriminals.map((c) => (
                                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-semibold text-slate-900">{c.name}</td>
                                        <td className="p-4 text-slate-600">{c.age} / <span className="capitalize">{c.gender}</span></td>
                                        <td className="p-4 text-slate-600 capitalize">{c.lastKnownLocation || '-'}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c.riskLevel === 'critical' ? 'bg-red-50 border-red-200 text-red-700' : c.riskLevel === 'high' ? 'bg-orange-50 border-orange-200 text-orange-700' : c.riskLevel === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                                {c.riskLevel.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c.status === 'arrested' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                                                {c.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
