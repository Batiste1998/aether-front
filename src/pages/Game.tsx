import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import {
  api,
  type De,
  type PartieDetail,
  type Personnage,
  type TourResponse,
} from '../lib/api'
import { Button } from '../components/ui'

interface Message {
  role: 'joueur' | 'mj'
  text: string
  des?: De[]
}

interface Stats {
  niveau: number
  xp: number
  pv_actuels: number
  pv_max: number
  or_pieces: number
}

const STATUT_QUETE: Record<string, string> = {
  active: 'border-gold/40 bg-gold/10 text-gold-soft',
  reussie: 'border-green-500/40 bg-green-500/10 text-green-400',
  echouee: 'border-red-500/40 bg-red-500/10 text-red-400 line-through',
}

export default function Game() {
  const { id } = useParams()
  const partieId = Number(id)
  const qc = useQueryClient()

  const partie = useQuery({
    queryKey: ['partie', partieId],
    queryFn: () => api<PartieDetail>(`/parties/${partieId}`),
  })
  const persos = useQuery({ queryKey: ['personnages'], queryFn: () => api<Personnage[]>('/personnages') })

  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pvDelta, setPvDelta] = useState<number | null>(null)
  const [action, setAction] = useState('')
  const seeded = useRef(false)
  const filRef = useRef<HTMLDivElement>(null)

  // Reconstruit le fil narratif initial une seule fois.
  useEffect(() => {
    if (seeded.current || !partie.data) return
    const init: Message[] = []
    for (const t of partie.data.tours) {
      if (t.action_joueur) init.push({ role: 'joueur', text: t.action_joueur })
      init.push({ role: 'mj', text: t.narration_ia })
    }
    setMessages(init)
    seeded.current = true
  }, [partie.data])

  // Statistiques courantes du personnage de la partie.
  useEffect(() => {
    if (stats || !partie.data || !persos.data) return
    const p = persos.data.find((x) => x.id_personnage === partie.data!.id_personnage)
    if (p)
      setStats({
        niveau: p.niveau,
        xp: p.xp,
        pv_actuels: p.pv_actuels,
        pv_max: p.pv_max,
        or_pieces: p.or_pieces,
      })
  }, [partie.data, persos.data, stats])

  const jouer = useMutation({
    mutationFn: (act: string) =>
      api<TourResponse>(`/parties/${partieId}/tours`, {
        method: 'POST',
        body: JSON.stringify({ action: act }),
      }),
    onSuccess: (res) => {
      setMessages((m) => [...m, { role: 'mj', text: res.narration, des: res.jets_de_des }])
      setPvDelta(stats ? res.personnage.pv_actuels - stats.pv_actuels : null)
      setStats(res.personnage)
      // Rafraîchit inventaire / quêtes / PNJ depuis le serveur.
      qc.invalidateQueries({ queryKey: ['partie', partieId] })
    },
  })

  // Auto-scroll vers le bas du fil.
  useEffect(() => {
    filRef.current?.scrollTo({ top: filRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, jouer.isPending])

  function envoyer(act: string) {
    if (jouer.isPending) return
    if (act) setMessages((m) => [...m, { role: 'joueur', text: act }])
    setAction('')
    jouer.mutate(act)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const act = action.trim()
    if (act) envoyer(act)
  }

  const pvPct = stats ? Math.max(0, Math.round((stats.pv_actuels / stats.pv_max) * 100)) : 0
  const quetes = partie.data?.quetes ?? []
  const inventaire = partie.data?.inventaire ?? []
  const pnj = partie.data?.pnj ?? []

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <Link to="/dashboard" className="text-sm text-parch/50 hover:text-parch">
          ← Dashboard
        </Link>
        <span className="font-serif text-gold-soft">{partie.data?.titre ?? '…'}</span>
        <span className="w-20" />
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-4 overflow-hidden px-4 py-4">
        {/* Fil narratif */}
        <div className="flex flex-1 flex-col">
          <div ref={filRef} className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-white/10 bg-panel/30 p-4">
            {messages.length === 0 && !jouer.isPending && (
              <div className="flex h-full flex-col items-center justify-center text-center text-parch/50">
                <p>Votre aventure n'a pas encore commencé.</p>
                <Button variant="gold" className="mt-4" onClick={() => envoyer('')}>
                  Commencer l'aventure
                </Button>
              </div>
            )}
            {messages.map((m, i) =>
              m.role === 'mj' ? (
                <div key={i} className="flex gap-3">
                  <span className="mt-1 h-fit rounded-full bg-arcane px-2 py-0.5 text-xs text-white">MJ</span>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap leading-relaxed text-parch">{m.text}</p>
                    {m.des && m.des.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.des.map((d, j) => (
                          <span
                            key={j}
                            className={`rounded-full border px-2 py-0.5 text-xs ${
                              d.reussite
                                ? 'border-green-500/40 bg-green-500/10 text-green-400'
                                : 'border-red-500/40 bg-red-500/10 text-red-400'
                            }`}
                          >
                            🎲 {d.de} → {d.resultat} · {d.raison}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[80%] rounded-lg bg-arcane/20 px-3 py-2 text-right text-sm text-parch/90">
                    {m.text}
                  </p>
                </div>
              ),
            )}
            {jouer.isPending && <p className="text-sm italic text-parch/40">Le Maître du Jeu écrit…</p>}
            {jouer.isError && <p className="text-sm text-red-400">Le Maître du Jeu est indisponible.</p>}
          </div>

          <form onSubmit={onSubmit} className="mt-3 flex gap-2">
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Qu'allez-vous faire ?"
              disabled={jouer.isPending}
              className="flex-1 rounded-lg border border-white/10 bg-ink-soft px-3 py-2 text-sm text-parch placeholder-white/30 outline-none focus:border-arcane disabled:opacity-50"
            />
            <Button type="submit" disabled={jouer.isPending || !action.trim()}>
              Agir →
            </Button>
          </form>
        </div>

        {/* Panneau latéral */}
        <aside className="hidden w-72 shrink-0 flex-col gap-3 overflow-y-auto sm:flex">
          {/* Statistiques */}
          <div className="rounded-xl border border-white/10 bg-panel/50 p-4">
            {stats ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-white">Niveau {stats.niveau}</span>
                  <span className="text-xs text-gold-soft">{stats.xp} XP</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-parch/50">Points de vie</span>
                  {pvDelta !== null && pvDelta !== 0 && (
                    <span className={`text-xs font-semibold ${pvDelta < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {pvDelta > 0 ? `+${pvDelta}` : pvDelta} PV
                    </span>
                  )}
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-red-500 transition-all" style={{ width: `${pvPct}%` }} />
                </div>
                <p className="mt-1 text-xs text-parch/60">
                  {stats.pv_actuels} / {stats.pv_max}
                </p>
                <p className="mt-3 text-xs text-parch/60">💰 {stats.or_pieces} pièces d'or</p>
              </>
            ) : (
              <p className="text-sm text-parch/40">Chargement…</p>
            )}
          </div>

          {/* Inventaire */}
          <div className="rounded-xl border border-white/10 bg-panel/50 p-4">
            <h3 className="mb-2 text-sm text-white">Inventaire</h3>
            {inventaire.length > 0 ? (
              <ul className="space-y-1">
                {inventaire.map((it) => (
                  <li key={it.id_objet} className="flex items-center justify-between text-xs">
                    <span className="text-parch/80">
                      {it.nom}
                      {it.quantite > 1 && <span className="text-parch/40"> ×{it.quantite}</span>}
                      {it.equipe && <span className="ml-1 text-gold-soft">⚔</span>}
                    </span>
                    <span className="text-parch/40">{it.type_objet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-parch/40">Sac vide.</p>
            )}
          </div>

          {/* Quêtes */}
          <div className="rounded-xl border border-white/10 bg-panel/50 p-4">
            <h3 className="mb-2 text-sm text-white">Journal de quêtes</h3>
            {quetes.length > 0 ? (
              <ul className="space-y-2">
                {quetes.map((q) => (
                  <li
                    key={q.id_quete}
                    className={`rounded-lg border px-2 py-1.5 text-xs ${
                      STATUT_QUETE[q.statut] ?? 'border-white/10 text-parch/70'
                    }`}
                  >
                    <div className="font-medium">{q.titre}</div>
                    {q.description && <div className="mt-0.5 opacity-70">{q.description}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-parch/40">Aucune quête en cours.</p>
            )}
          </div>

          {/* PNJ rencontrés */}
          {pnj.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-panel/50 p-4">
              <h3 className="mb-2 text-sm text-white">Personnages rencontrés</h3>
              <ul className="space-y-1">
                {pnj.map((p) => (
                  <li key={p.id_pnj} className="text-xs">
                    <span className="text-parch/80">{p.nom}</span>
                    {p.attitude && <span className="ml-1 text-parch/40">· {p.attitude}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
