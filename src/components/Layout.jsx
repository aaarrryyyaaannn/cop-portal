import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FileText, Search, FolderOpen, Shield, Users, BarChart3,
  Settings, LogOut, Menu, X, Bell
} from 'lucide-react'
import NotificationsDropdown from './NotificationsDropdown'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const citizenNav = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/file-fir', icon: FileText, label: 'File FIR' },
    { to: '/track-fir', icon: Search, label: 'Track FIR' },
  ]
  const officerNav = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/file-fir', icon: FileText, label: 'File FIR' },
    { to: '/track-fir', icon: Search, label: 'Track FIR' },
    { to: '/cases', icon: FolderOpen, label: 'Case Management' },
    { to: '/evidence', icon: Shield, label: 'Evidence' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ]
  const adminNav = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/file-fir', icon: FileText, label: 'File FIR' },
    { to: '/track-fir', icon: Search, label: 'Track FIR' },
    { to: '/cases', icon: FolderOpen, label: 'Case Management' },
    { to: '/evidence', icon: Shield, label: 'Evidence' },
    { to: '/users', icon: Users, label: 'User Management' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ]

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'officer' ? officerNav : citizenNav

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-40 hidden lg:flex`}>
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <span className="font-semibold">FIR Portal</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-800'}`
            }
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </NavLink>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-40 transform transition-transform lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between">
          <span className="font-semibold">FIR Portal</span>
          <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300'}`
              }
            >
              <Icon className="w-5 h-5" /><span>{label}</span>
            </NavLink>
          ))}
          <NavLink to="/settings" onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300">
            <Settings className="w-5 h-5" /><span>Settings</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all`}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 lg:px-8 py-4 flex items-center justify-between">
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-medium text-slate-800 text-sm">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
