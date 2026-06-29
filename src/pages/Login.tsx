import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError, type AuthResponse } from '../lib/api'
import { useAuth } from '../store/auth'
import { Button, Card, Field, Input } from '../components/ui'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuth((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, mot_de_passe: motDePasse }),
      })
      setAuth(res.token, res.utilisateur)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-6">
      <Link to="/" className="mb-6 text-center text-sm text-parch/50 hover:text-parch">
        ← Chroniques d'Æther
      </Link>
      <Card>
        <h1 className="mb-4 text-center text-2xl text-white">Connexion</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Mot de passe">
            <Input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" variant="gold" className="w-full" disabled={loading}>
            {loading ? '...' : 'Se connecter'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-parch/50">
          Pas de compte ?{' '}
          <Link to="/register" className="text-arcane hover:underline">
            S'inscrire
          </Link>
        </p>
      </Card>
    </div>
  )
}
