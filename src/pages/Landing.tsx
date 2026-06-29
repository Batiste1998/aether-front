import { Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { Button } from '../components/ui'

export default function Landing() {
  const isAuth = useAuth((s) => s.isAuthenticated)

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-5xl">✦</div>
      <h1 className="text-5xl font-semibold text-white">Quiz d'Æther</h1>
      <p className="mt-4 max-w-xl text-lg text-parch/70">
        Le quiz de culture générale où l'IA crée les questions. Choisis un thème — n'importe
        lequel — réponds vite, enchaîne les bonnes réponses et grimpe au classement.
      </p>
      <div className="mt-8 flex gap-3">
        {isAuth ? (
          <Link to="/dashboard">
            <Button variant="gold">Jouer →</Button>
          </Link>
        ) : (
          <>
            <Link to="/register">
              <Button variant="gold">Commencer à jouer</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
          </>
        )}
      </div>

      <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['Thèmes infinis', 'Histoire, sciences, ton groupe préféré… l’IA génère le quiz sur mesure.'],
          ['Rapidité = points', 'Plus tu réponds vite et enchaînes, plus ton score grimpe.'],
          ['Classement', 'Compare tes scores aux autres joueurs et vise la première place.'],
        ].map(([title, desc]) => (
          <div key={title} className="rounded-xl border border-white/10 bg-panel/40 p-4 text-left">
            <h3 className="text-gold-soft">{title}</h3>
            <p className="mt-1 text-sm text-parch/60">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
