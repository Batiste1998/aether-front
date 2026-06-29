/** Pourcentage de bonnes réponses, borné entre 0 et 100. */
export function pourcentageReussite(bonnes: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((bonnes / total) * 100)
}

/** Fraction de temps restant (0 à 1) pour la barre de chrono. */
export function fractionTempsRestant(restantMs: number, totalMs: number): number {
  if (totalMs <= 0) return 0
  return Math.max(0, Math.min(1, restantMs / totalMs))
}
