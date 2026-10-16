import { Navigate, Route, Routes } from 'react-router'
import { useAuth } from './auth'
import Login from './pages/Login'
import Sessions from './pages/Sessions'
import SessionDetail from './pages/SessionDetail'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return <p className="center muted">Cargando…</p>
  if (!session) return <Login />

  return (
    <Routes>
      <Route path="/" element={<Sessions />} />
      <Route path="/sesion/:id" element={<SessionDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
