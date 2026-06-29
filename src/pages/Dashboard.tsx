import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  api,
  genererQuiz,
  ApiError,
  type Categorie,
  type HistoryEntry,
} from '../lib/api'
import { Button, Header, Input } from '../components/ui'

const DIFFICULTES = [
  { val: 'facile', label: 'Facile' },
  { val: 'moyen', label: 'Moyen' },
  { val: 'difficile', label: 'Difficile' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [idCategorie, setIdCategorie] = useState<number | null>(null)
  const [theme, setTheme] = useState('')
  const [difficulte, setDifficulte] = useState('moyen')
  const [nb, setNb] = useState(5)
  const [error, setError] = useState<string | null>(null)

  const categories = useQuery({ queryKey: ['categories'], queryFn: () => api<Categorie[]>('/categories') })
  const historique = useQuery({ queryKey: ['historique'], queryFn: () => api<HistoryEntry[]>('/sessions') })

  const lancer = useMutation({
    mutationFn: () =>
      genererQuiz({
        id_categorie: theme.trim() ? undefined : idCategorie ?? undefined,
        theme: theme.trim() || undefined,
        difficulte,
        nb_questions: nb,
      }),
    onSuccess: (session) => navigate('/quiz', { state: { session } }),
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Génération impossible'),
  })

  function onLancer() {
    setError(null)
    if (!theme.trim() && idCategorie === null) {
      setError('Choisis une catégorie ou saisis un thème.')
      return
    }
    lancer.mutate()
  }

  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-3xl text-white">Lance un quiz</h1>
        <p className="mt-1 text-parch/60">
          Choisis un thème, l'IA génère les questions. Réponds vite pour scorer plus !
        </p>

        {/* Catégories */}
        <h2 className="mb-3 mt-8 text-xs uppercase tracking-wide text-white/40">Catégorie</h2>
        {categories.isLoading ? (
          <p className="text-parch/50">Chargement…</p>
        ) : categories.isError ? (
          <div className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <span>Impossible de charger les catégories. L'API est-elle démarrée ?</span>
            <button
              onClick={() => categories.refetch()}
              className="rounded border border-red-400/50 px-2 py-0.5 text-xs hover:bg-red-500/20"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.data?.map((c) => {
              const selected = idCategorie === c.id_categorie && !theme.trim()
              return (
                <button
                  key={c.id_categorie}
                  onClick={() => {
                    setIdCategorie(c.id_categorie)
                    setTheme('')
                  }}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? 'border-arcane bg-arcane/15'
                      : 'border-white/10 bg-panel/40 hover:border-white/30'
                  }`}
                >
                  <div className="text-2xl">{c.emoji}</div>
                  <div className="mt-1 text-sm text-white">{c.libelle}</div>
                </button>
              )
            })}
          </div>
        )}

        {/* Thème libre */}
        <div className="mt-6">
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/40">
            …ou un thème personnalisé
          </label>
          <Input
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value)
              if (e.target.value.trim()) setIdCategorie(null)
            }}
            placeholder="Ex : la mythologie grecque, le rap français, la conquête spatiale…"
          />
        </div>

        {/* Difficulté + nombre */}
        <div className="mt-6 flex flex-wrap gap-8">
          <div>
            <span className="mb-2 block text-xs uppercase tracking-wide text-white/40">Difficulté</span>
            <div className="flex gap-2">
              {DIFFICULTES.map((d) => (
                <button
                  key={d.val}
                  onClick={() => setDifficulte(d.val)}
                  className={`rounded-lg border px-4 py-2 text-sm transition ${
                    difficulte === d.val
                      ? 'border-gold bg-gold/15 text-gold-soft'
                      : 'border-white/10 text-parch/70 hover:border-white/30'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-2 block text-xs uppercase tracking-wide text-white/40">Questions</span>
            <div className="flex gap-2">
              {[3, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setNb(n)}
                  className={`rounded-lg border px-4 py-2 text-sm transition ${
                    nb === n
                      ? 'border-gold bg-gold/15 text-gold-soft'
                      : 'border-white/10 text-parch/70 hover:border-white/30'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <Button variant="gold" className="mt-6 px-8 py-3 text-base" disabled={lancer.isPending} onClick={onLancer}>
          {lancer.isPending ? 'Génération du quiz…' : 'Lancer le quiz →'}
        </Button>

        {/* Historique */}
        {historique.data && historique.data.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-3 text-xl text-white">Mes dernières parties</h2>
            <div className="space-y-2">
              {historique.data.slice(0, 8).map((h) => (
                <div
                  key={h.id_session}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-panel/40 px-4 py-2 text-sm"
                >
                  <span className="text-parch/80">
                    {h.theme} <span className="text-parch/40">· {h.difficulte}</span>
                  </span>
                  <span className="text-gold-soft">
                    {h.termine ? `${h.score} pts` : 'inachevée'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
