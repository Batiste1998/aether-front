import { useQuery } from '@tanstack/react-query'
import { api, type LeaderboardEntry } from '../lib/api'
import { Header } from '../components/ui'
import { useAuth } from '../store/auth'

const MEDAILLES = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const pseudo = useAuth((s) => s.user?.pseudo)
  const lb = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api<LeaderboardEntry[]>('/leaderboard'),
  })

  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-3xl text-white">Classement</h1>
        <p className="mt-1 text-parch/60">Les meilleurs scores, tous thèmes confondus.</p>

        <div className="mt-6 space-y-2">
          {lb.isLoading ? (
            <p className="text-parch/50">Chargement…</p>
          ) : lb.isError ? (
            <p className="text-sm text-red-400">Impossible de charger le classement.</p>
          ) : lb.data && lb.data.length > 0 ? (
            lb.data.map((e, i) => {
              const moi = e.pseudo === pseudo
              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
                    moi ? 'border-arcane bg-arcane/10' : 'border-white/10 bg-panel/40'
                  }`}
                >
                  <span className="w-8 text-center text-lg">{MEDAILLES[i] ?? <span className="text-sm text-parch/40">{i + 1}</span>}</span>
                  <div className="flex-1">
                    <div className="text-parch">{e.pseudo}</div>
                    <div className="text-xs text-parch/40">
                      {e.theme} · {e.difficulte} · {e.nb_bonnes} bonnes
                    </div>
                  </div>
                  <span className="font-semibold text-gold-soft">{e.score} pts</span>
                </div>
              )
            })
          ) : (
            <p className="text-parch/50">Aucun score pour l'instant. Sois le premier !</p>
          )}
        </div>
      </main>
    </div>
  )
}
