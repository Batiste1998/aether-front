import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
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

export default function Game() {
  const { id } = useParams()
  const partieId = Number(id)

  const partie = useQuery({
    queryKey: ['partie', partieId],
    queryFn: () => api<PartieDetail>(`/parties/${partieId}`),
  })
  const persos = useQuery({ queryKey: ['personnages'], queryFn: () => api<Personnage[]>('/personnages') })

  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
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
      setStats(res.personnage)
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

  const pvPct = stats ? Math.round((stats.pv_actuels / stats.pv_max) * 100) : 0

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <Link to="/dashboard" className="text-sm text-parch/50 hover:text-parch">
          ← Dashboard
        </Link>
        <span className="font-serif text-gold-soft">{partie.data?.titre ?? '…'}</span>
        <span className="w-20" />
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 gap-4 overflow-hidden px-4 py-4">
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
                  <span className="mt-1 rounded-full bg-arcane px-2 py-0.5 text-xs text-white">MJ</span>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap leading-relaxed text-parch">{m.text}</p>
                    {m.des && m.des.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.des.map((d, j) => (
                          <span
                            key={j}
                            className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs text-gold-soft"
                          >
                            🎲 {d.de} → {d.resultat} ({d.raison})
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
        <aside className="hidden w-64 shrink-0 flex-col gap-4 sm:flex">
          <div className="rounded-xl border border-white/10 bg-panel/50 p-4">
            {stats ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-white">Niveau {stats.niveau}</span>
                  <span className="text-xs text-gold-soft">{stats.xp} XP</span>
                </div>
                <p className="mt-3 text-xs text-parch/50">Points de vie</p>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-red-500" style={{ width: `${pvPct}%` }} />
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
        </aside>
      </div>
    </div>
  )
}
