import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './store/auth'
import type { ReactNode } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreatePersonnage from './pages/CreatePersonnage'
import Game from './pages/Game'

function Protected({ children }: { children: ReactNode }) {
  const isAuth = useAuth((s) => s.isAuthenticated)
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/personnages/nouveau"
        element={
          <Protected>
            <CreatePersonnage />
          </Protected>
        }
      />
      <Route
        path="/parties/:id"
        element={
          <Protected>
            <Game />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
