import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { api, type Partie, type Personnage } from '../lib/api'
import { useAuth } from '../store/auth'
import { Button } from '../components/ui'

export default function Dashboard() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user, logout } = useAuth()

  const persos = useQuery({
    queryKey: ['personnages'],
    queryFn: () => api<Personnage[]>('/personnages'),
  })
  const parties = useQuery({
    queryKey: ['parties'],
    queryFn: () => api<Partie[]>('/parties'),
  })

  const startPartie = useMutation({
    mutationFn: (id_personnage: number) =>
      api<Partie>('/parties', { method: 'POST', body: JSON.stringify({ id_personnage }) }),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['parties'] })
      navigate(`/parties/${p.id_partie}`)
    },
  })

  const nomPerso = (id: number) =>
    persos.data?.find((p) => p.id_personnage === id)?.nom ?? `Personnage #${id}`

  return (
    <div className="min-h-full">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link to="/" className="font-serif text-lg text-gold-soft">
          ✦ Chroniques d'Æther
        </Link>
        <div className="flex items-center gap-4 text-sm text-parch/60">
          <span>{user?.pseudo}</span>
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="hover:text-parch"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl text-white">Mes personnages</h2>
            <Link to="/personnages/nouveau">
              <Button variant="gold">+ Nouveau personnage</Button>
            </Link>
          </div>

          {persos.isLoading ? (
            <p className="text-parch/50">Chargement…</p>
          ) : persos.data && persos.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {persos.data.map((p) => (
                <div key={p.id_personnage} className="rounded-xl border border-white/10 bg-panel/60 p-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg text-white">{p.nom}</h3>
                    <span className="text-xs text-gold-soft">Niv. {p.niveau}</span>
                  </div>
                  <p className="text-sm text-arcane">{p.classe_nom}</p>
                  <p className="mt-2 text-xs text-parch/50">
                    PV {p.pv_actuels}/{p.pv_max} · {p.or_pieces} or · {p.xp} XP
                  </p>
                  <Button
                    variant="primary"
                    className="mt-4 w-full"
                    disabled={startPartie.isPending}
                    onClick={() => startPartie.mutate(p.id_personnage)}
                  >
                    Nouvelle aventure
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-parch/50">
              Aucun personnage pour l'instant. Créez votre héros pour commencer !
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-2xl text-white">Mes parties</h2>
          {parties.isLoading ? (
            <p className="text-parch/50">Chargement…</p>
          ) : parties.data && parties.data.length > 0 ? (
            <div className="space-y-2">
              {parties.data.map((partie) => (
                <Link
                  key={partie.id_partie}
                  to={`/parties/${partie.id_partie}`}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-panel/40 px-4 py-3 hover:border-arcane"
                >
                  <div>
                    <span className="text-parch">{partie.titre}</span>
                    <span className="ml-2 text-xs text-parch/40">
                      — {nomPerso(partie.id_personnage)}
                    </span>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-gold-soft">
                    {partie.statut === 'en_cours' ? 'Reprendre →' : partie.statut}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-parch/50">Aucune aventure commencée.</p>
          )}
        </section>
      </main>
    </div>
  )
}
