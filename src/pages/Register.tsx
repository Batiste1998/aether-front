import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError, type AuthResponse } from '../lib/api'
import { useAuth } from '../store/auth'
import { Button, Card, Field, Input } from '../components/ui'

export default function Register() {
  const navigate = useNavigate()
  const setAuth = useAuth((s) => s.setAuth)
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ pseudo, email, mot_de_passe: motDePasse }),
      })
      setAuth(res.token, res.utilisateur)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Inscription impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-6">
      <Link to="/" className="mb-6 text-center text-sm text-parch/50 hover:text-parch">
        ← Quiz d'Æther
      </Link>
      <Card>
        <h1 className="mb-4 text-center text-2xl text-white">Créer un compte</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Pseudo">
            <Input value={pseudo} onChange={(e) => setPseudo(e.target.value)} required />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Mot de passe (8 caractères min.)">
            <Input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              minLength={8}
              required
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" variant="gold" className="w-full" disabled={loading}>
            {loading ? '...' : "S'inscrire"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-parch/50">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-arcane hover:underline">
            Se connecter
          </Link>
        </p>
      </Card>
    </div>
  )
}
