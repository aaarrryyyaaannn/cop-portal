import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Bell, AlertTriangle, Info, Send } from 'lucide-react'

export default function NewsFeed() {
    const { user } = useAuth()
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [newAlert, setNewAlert] = useState({ title: '', message: '', type: 'news' })

    useEffect(() => {
        fetchAlerts()
        const interval = setInterval(fetchAlerts, 15000) // Poll every 15s for realtime updates
        return () => clearInterval(interval)
    }, [])

    async function fetchAlerts() {
        try {
            const data = await api.getAlerts()
            setAlerts(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSendAlert(e) {
        e.preventDefault()
        try {
            await api.createAlert({ ...newAlert, targetRoles: [] })
            setNewAlert({ title: '', message: '', type: 'news' })
            fetchAlerts()
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) return <div className="p-6">Loading...</div>

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">News & Alerts</h1>
                    <p className="text-slate-500">Real-time law enforcement updates and emergency broadcasts</p>
                </div>
                <Bell className="w-8 h-8 text-amber-500" />
            </div>

            {user?.role === 'admin' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-blue-500" />
                        Broadcast Alert
                    </h2>
                    <form onSubmit={handleSendAlert} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input required value={newAlert.title} onChange={e => setNewAlert({ ...newAlert, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select value={newAlert.type} onChange={e => setNewAlert({ ...newAlert, type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                                    <option value="news">News</option>
                                    <option value="event">Upcoming Event / Drill</option>
                                    <option value="emergency">Emergency Alert</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                            <textarea required value={newAlert.message} onChange={e => setNewAlert({ ...newAlert, message: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg" rows="2" />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Broadcast</button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <p className="text-slate-500 text-center py-4 bg-white rounded-xl border border-slate-100">No active alerts.</p>
                ) : alerts.map(alert => (
                    <div key={alert._id} className={`p-5 rounded-xl border-l-4 shadow-sm bg-white ${alert.type === 'emergency' ? 'border-l-red-500 bg-red-50' :
                        alert.type === 'event' ? 'border-l-amber-500 bg-amber-50' : 'border-l-blue-500'
                        }`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${alert.type === 'emergency' ? 'bg-red-100 text-red-600' :
                                alert.type === 'event' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                {alert.type === 'emergency' ? <AlertTriangle className="w-5 h-5" /> :
                                    alert.type === 'event' ? <Bell className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-800">{alert.title}</h3>
                                    <span className="text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-slate-700 mt-1">{alert.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
