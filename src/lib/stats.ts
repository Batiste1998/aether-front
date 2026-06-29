/** Pourcentage de points de vie restants, borné entre 0 et 100. */
export function pvPourcentage(actuels: number, max: number): number {
  if (max <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((actuels / max) * 100)))
}

/** Progression d'XP vers le prochain niveau (1 niveau tous les 100 XP). */
export function xpVersProchainNiveau(xp: number): { actuel: number; requis: number; pct: number } {
  const requis = 100
  const actuel = ((xp % requis) + requis) % requis
  return { actuel, requis, pct: Math.round((actuel / requis) * 100) }
}
