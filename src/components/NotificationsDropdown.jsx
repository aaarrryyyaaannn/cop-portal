import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'

const mockNotifications = [
  { id: 1, text: 'FIR #2024-001 assigned to you', time: '2 min ago', urgent: true },
  { id: 2, text: 'Court date: FIR #2024-002 - Feb 25, 2025', time: '1 hour ago', urgent: true },
  { id: 3, text: 'Investigation deadline in 3 days', time: '2 hours ago', urgent: false },
]

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {mockNotifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 hover:bg-slate-50 cursor-pointer flex gap-3 ${n.urgent ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <p className="text-sm text-slate-700 flex-1">{n.text}</p>
                <span className="text-xs text-slate-400 whitespace-nowrap">{n.time}</span>
              </div>
            ))}
            {mockNotifications.length === 0 && (
              <p className="px-4 py-6 text-slate-500 text-sm text-center">No notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
