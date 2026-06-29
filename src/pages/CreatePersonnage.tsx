import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError, type Personnage } from '../lib/api'
import { Button, Field, Input } from '../components/ui'

interface Classe {
  id_classe: number
  nom: string
  description: string | null
  pv_base: number
  force_base: number
  intelligence_base: number
  agilite_base: number
}

export default function CreatePersonnage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [nom, setNom] = useState('')
  const [histoire, setHistoire] = useState('')
  const [idClasse, setIdClasse] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const classes = useQuery({ queryKey: ['classes'], queryFn: () => api<Classe[]>('/classes') })

  const create = useMutation({
    mutationFn: () =>
      api<Personnage>('/personnages', {
        method: 'POST',
        body: JSON.stringify({ nom, id_classe: idClasse, histoire: histoire || null }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['personnages'] })
      navigate('/dashboard')
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Création impossible'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!idClasse) {
      setError('Choisissez une classe')
      return
    }
    create.mutate()
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/dashboard" className="text-sm text-parch/50 hover:text-parch">
        ← Retour au dashboard
      </Link>
      <h1 className="mb-6 mt-3 text-3xl text-white">Nouveau personnage</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <Field label="Nom du personnage">
          <Input value={nom} onChange={(e) => setNom(e.target.value)} required />
        </Field>

        <div>
          <span className="mb-2 block text-xs uppercase tracking-wide text-white/40">Classe</span>
          {classes.isLoading ? (
            <p className="text-parch/50">Chargement…</p>
          ) : classes.isError ? (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <span>Impossible de charger les classes. L'API est-elle bien démarrée ?</span>
              <button
                type="button"
                onClick={() => classes.refetch()}
                className="rounded border border-red-400/50 px-2 py-0.5 text-xs hover:bg-red-500/20"
              >
                Réessayer
              </button>
            </div>
          ) : !classes.data || classes.data.length === 0 ? (
            <p className="text-sm text-parch/50">Aucune classe disponible.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {classes.data.map((c) => {
                const selected = idClasse === c.id_classe
                return (
                  <button
                    type="button"
                    key={c.id_classe}
                    onClick={() => setIdClasse(c.id_classe)}
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? 'border-arcane bg-arcane/15'
                        : 'border-white/10 bg-panel/40 hover:border-white/30'
                    }`}
                  >
                    <h3 className="text-white">{c.nom}</h3>
                    <p className="mt-1 text-xs text-parch/50">{c.description}</p>
                    <p className="mt-2 text-xs text-gold-soft">
                      {c.pv_base} PV · FOR {c.force_base} · INT {c.intelligence_base} · AGI{' '}
                      {c.agilite_base}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <Field label="Histoire du personnage (optionnel)">
          <textarea
            value={histoire}
            onChange={(e) => setHistoire(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-ink-soft px-3 py-2 text-sm text-parch placeholder-white/30 outline-none focus:border-arcane"
            placeholder="Ancien garde de la cité, en quête de rédemption…"
          />
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" variant="gold" disabled={create.isPending}>
          {create.isPending ? 'Création…' : 'Créer & retourner au dashboard'}
        </Button>
      </form>
    </div>
  )
}
