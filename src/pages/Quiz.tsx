import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  repondre,
  terminerSession,
  type AnswerResponse,
  type FinishResponse,
  type QuizSession,
} from '../lib/api'
import { fractionTempsRestant, pourcentageReussite } from '../lib/stats'
import { Button, Header } from '../components/ui'

export default function Quiz() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = (location.state as { session?: QuizSession } | null)?.session

  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<'question' | 'feedback' | 'finished'>('question')
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<AnswerResponse | null>(null)
  const [finish, setFinish] = useState<FinishResponse | null>(null)
  const [score, setScore] = useState(0)
  const [serie, setSerie] = useState(0)
  const [remaining, setRemaining] = useState(session?.temps_par_question_ms ?? 0)
  const startRef = useRef(0)
  const answeredRef = useRef(false)

  const total = session?.temps_par_question_ms ?? 15000
  const question = session?.questions[idx]

  const repondreMut = useMutation({
    mutationFn: (body: { id_question: number; id_choix: number | null; temps_ms: number }) =>
      repondre(session!.id_session, body),
    onSuccess: (res) => {
      setResult(res)
      setScore(res.score_total)
      setSerie(res.serie_actuelle)
      setPhase('feedback')
    },
  })

  const terminerMut = useMutation({
    mutationFn: () => terminerSession(session!.id_session),
    onSuccess: (res) => {
      setFinish(res)
      setPhase('finished')
    },
  })

  function soumettre(idChoix: number | null) {
    if (answeredRef.current || !question) return
    answeredRef.current = true
    setSelected(idChoix)
    const temps = Math.min(total, Math.max(0, Date.now() - startRef.current))
    repondreMut.mutate({ id_question: question.id_question, id_choix: idChoix, temps_ms: temps })
  }

  // Démarre le chrono à chaque nouvelle question.
  useEffect(() => {
    if (phase !== 'question' || !session) return
    answeredRef.current = false
    setSelected(null)
    setResult(null)
    startRef.current = Date.now()
    setRemaining(total)
    const handle = setInterval(() => {
      setRemaining(Math.max(0, total - (Date.now() - startRef.current)))
    }, 100)
    return () => clearInterval(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase === 'question'])

  // Temps écoulé : réponse automatique vide.
  useEffect(() => {
    if (phase === 'question' && remaining <= 0 && !answeredRef.current) {
      soumettre(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  function suivant() {
    if (!session) return
    if (idx < session.questions.length - 1) {
      setIdx((i) => i + 1)
      setPhase('question')
    } else {
      terminerMut.mutate()
    }
  }

  if (!session) {
    return (
      <div className="min-h-full">
        <Header />
        <div className="mx-auto max-w-md px-6 py-20 text-center text-parch/60">
          <p>Aucun quiz en cours.</p>
          <Button variant="gold" className="mt-4" onClick={() => navigate('/dashboard')}>
            Lancer un quiz
          </Button>
        </div>
      </div>
    )
  }

  // ---- Écran de résultats ----
  if (phase === 'finished' && finish) {
    return (
      <div className="min-h-full">
        <Header />
        <div className="mx-auto max-w-lg px-6 py-12 text-center">
          <div className="text-5xl">🏆</div>
          <h1 className="mt-3 text-3xl text-white">Quiz terminé !</h1>
          <p className="mt-1 text-parch/60">{session.theme}</p>

          <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/10 p-6">
            <div className="text-5xl font-bold text-gold-soft">{finish.score}</div>
            <div className="text-sm text-parch/60">points</div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-white/10 bg-panel/50 p-4">
              <div className="text-2xl text-white">
                {finish.nb_bonnes}/{finish.total_questions}
              </div>
              <div className="text-xs text-parch/50">bonnes réponses</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-panel/50 p-4">
              <div className="text-2xl text-white">
                {pourcentageReussite(finish.nb_bonnes, finish.total_questions)}%
              </div>
              <div className="text-xs text-parch/50">réussite</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-panel/50 p-4">
              <div className="text-2xl text-white">#{finish.rang}</div>
              <div className="text-xs text-parch/50">au classement</div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button variant="gold" onClick={() => navigate('/dashboard')}>
              Rejouer
            </Button>
            <Button variant="ghost" onClick={() => navigate('/classement')}>
              Voir le classement
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Écran de jeu ----
  const pct = fractionTempsRestant(remaining, total) * 100

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-6">
        {/* Barre d'infos */}
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-parch/60">
            Question {idx + 1}/{session.questions.length}
          </span>
          <div className="flex items-center gap-4">
            {serie > 1 && <span className="text-gold-soft">🔥 série x{serie}</span>}
            <span className="text-white">{score} pts</span>
          </div>
        </div>

        {/* Chrono */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full transition-[width] duration-100 ${pct < 30 ? 'bg-red-500' : 'bg-arcane'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Question */}
        <h1 className="mt-8 text-2xl leading-snug text-white">{question?.intitule}</h1>

        {/* Choix */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question?.choix.map((c) => {
            let cls = 'border-white/10 bg-panel/50 hover:border-arcane'
            if (phase === 'feedback' && result) {
              if (c.id_choix === result.id_choix_correct) cls = 'border-green-500 bg-green-500/15'
              else if (c.id_choix === selected) cls = 'border-red-500 bg-red-500/15'
              else cls = 'border-white/10 bg-panel/30 opacity-60'
            }
            return (
              <button
                key={c.id_choix}
                disabled={phase !== 'question' || repondreMut.isPending}
                onClick={() => soumettre(c.id_choix)}
                className={`rounded-xl border p-4 text-left text-parch transition disabled:cursor-default ${cls}`}
              >
                {c.texte}
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {phase === 'feedback' && result && (
          <div className="mt-6 rounded-xl border border-white/10 bg-panel/40 p-4">
            <div className="flex items-center justify-between">
              <span className={result.correcte ? 'text-green-400' : 'text-red-400'}>
                {result.correcte ? '✓ Bonne réponse !' : '✗ Raté'}
              </span>
              <span className="text-gold-soft">+{result.points} pts</span>
            </div>
            {result.explication && <p className="mt-2 text-sm text-parch/70">{result.explication}</p>}
            <Button
              variant="gold"
              className="mt-4"
              disabled={terminerMut.isPending}
              onClick={suivant}
            >
              {idx < session.questions.length - 1 ? 'Question suivante →' : 'Voir les résultats →'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
