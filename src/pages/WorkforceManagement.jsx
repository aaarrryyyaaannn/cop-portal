import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Users, Briefcase, Plus, CheckCircle, Clock } from 'lucide-react'

export default function WorkforceManagement() {
    const [workforce, setWorkforce] = useState([])
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', dueDate: '' })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const [w, t] = await Promise.all([
                api.getWorkforce(),
                api.getWorkforceTasks()
            ])
            setWorkforce(w || [])
            setTasks(t || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateTask(e) {
        e.preventDefault()
        try {
            await api.createWorkforceTask(newTask)
            setNewTask({ title: '', description: '', assignedTo: '', dueDate: '' })
            fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) return <div className="p-6">Loading...</div>

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Workforce Management</h1>
                    <p className="text-slate-500">Assign tasks and monitor officer workload</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                        <Users className="w-5 h-5 text-indigo-500" />
                        <div>
                            <p className="text-xs text-slate-500">Active Officers</p>
                            <p className="font-semibold text-slate-800">{workforce.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-500" />
                            Assign Task
                        </h2>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea required value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" rows="3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                                <select required value={newTask.assignedTo} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select Officer...</option>
                                    {workforce.map(w => <option key={w._id} value={w._id}>{w.name} ({w.taskCount} active tasks)</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                <input required type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Assign Task</button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-500" />
                            Recent Assignments
                        </h2>
                        <div className="space-y-4">
                            {tasks.length === 0 ? (
                                <p className="text-slate-500 text-center py-4">No active tasks found.</p>
                            ) : tasks.map(t => (
                                <div key={t._id} className="p-4 border border-slate-100 rounded-lg hover:border-indigo-100 transition bg-slate-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{t.title}</h3>
                                            <p className="text-sm text-slate-600 mt-1">{t.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" /> Assigned to: {t.assignedTo?.name || 'Unknown'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" /> Due: {new Date(t.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                            {t.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
