import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import OfficerDashboard from './pages/dashboards/OfficerDashboard'
import CitizenDashboard from './pages/dashboards/CitizenDashboard'
import FirFiling from './pages/FirFiling'
import FirTracking from './pages/FirTracking'
import CaseManagement from './pages/CaseManagement'
import EvidenceManagement from './pages/EvidenceManagement'
import UserManagement from './pages/UserManagement'
import ReportsAnalytics from './pages/ReportsAnalytics'
import Settings from './pages/Settings'
import WorkforceManagement from './pages/WorkforceManagement'
import NewsFeed from './pages/NewsFeed'
import CrimeMap from './pages/CrimeMap'
import CriminalManagement from './pages/CriminalManagement'

function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full" /></div>
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={
          user?.role === 'admin' ? <AdminDashboard /> :
            user?.role === 'officer' ? <OfficerDashboard /> :
              <CitizenDashboard />
        } />
        <Route path="file-fir" element={<ProtectedRoute><FirFiling /></ProtectedRoute>} />
        <Route path="track-fir" element={<ProtectedRoute><FirTracking /></ProtectedRoute>} />
        <Route path="cases" element={<ProtectedRoute roles={['admin', 'officer']}><CaseManagement /></ProtectedRoute>} />
        <Route path="evidence" element={<ProtectedRoute><EvidenceManagement /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="workforce" element={<ProtectedRoute roles={['admin']}><WorkforceManagement /></ProtectedRoute>} />
        <Route path="criminals" element={<ProtectedRoute roles={['admin', 'officer']}><CriminalManagement /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute roles={['admin', 'officer']}><ReportsAnalytics /></ProtectedRoute>} />
        <Route path="alerts" element={<ProtectedRoute><NewsFeed /></ProtectedRoute>} />
        <Route path="map" element={<ProtectedRoute><CrimeMap /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
