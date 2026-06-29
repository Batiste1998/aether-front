import { create } from 'zustand'
import { clearToken, setToken, getToken, type Utilisateur } from '../lib/api'

const USER_KEY = 'aether_user'

function loadUser(): Utilisateur | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as Utilisateur) : null
}

interface AuthState {
  user: Utilisateur | null
  isAuthenticated: boolean
  setAuth: (token: string, user: Utilisateur) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  user: loadUser(),
  isAuthenticated: !!getToken(),
  setAuth: (token, user) => {
    setToken(token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },
  logout: () => {
    clearToken()
    localStorage.removeItem(USER_KEY)
    set({ user: null, isAuthenticated: false })
  },
}))
