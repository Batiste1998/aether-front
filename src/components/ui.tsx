import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <Link to="/dashboard" className="font-serif text-lg text-gold-soft">
        ✦ Quiz d'Æther
      </Link>
      <nav className="flex items-center gap-5 text-sm text-parch/60">
        <Link to="/dashboard" className="hover:text-parch">
          Jouer
        </Link>
        <Link to="/classement" className="hover:text-parch">
          Classement
        </Link>
        <span className="text-parch/40">·</span>
        <span className="text-parch/80">{user?.pseudo}</span>
        <button
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="hover:text-parch"
        >
          Déconnexion
        </button>
      </nav>
    </header>
  )
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'gold' | 'ghost' }) {
  const styles = {
    primary: 'bg-arcane hover:bg-arcane/80 text-white',
    gold: 'bg-gold hover:bg-gold-soft text-ink font-semibold',
    ghost: 'bg-transparent border border-white/15 hover:bg-white/5 text-parch',
  }[variant]
  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
    />
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-white/10 bg-ink-soft px-3 py-2 text-sm text-parch placeholder-white/30 outline-none focus:border-arcane ${className}`}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-panel/60 p-5 ${className}`}>{children}</div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-white/40">{label}</span>
      {children}
    </label>
  )
}
