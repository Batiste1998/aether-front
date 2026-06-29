import { describe, expect, it } from 'vitest'
import { fractionTempsRestant, pourcentageReussite } from './stats'

describe('pourcentageReussite', () => {
  it('calcule le ratio de bonnes réponses', () => {
    expect(pourcentageReussite(2, 3)).toBe(67)
    expect(pourcentageReussite(5, 5)).toBe(100)
    expect(pourcentageReussite(0, 10)).toBe(0)
  })

  it('gère un total nul', () => {
    expect(pourcentageReussite(0, 0)).toBe(0)
  })
})

describe('fractionTempsRestant', () => {
  it('renvoie une fraction entre 0 et 1', () => {
    expect(fractionTempsRestant(15000, 15000)).toBe(1)
    expect(fractionTempsRestant(7500, 15000)).toBe(0.5)
    expect(fractionTempsRestant(0, 15000)).toBe(0)
    expect(fractionTempsRestant(-100, 15000)).toBe(0)
    expect(fractionTempsRestant(99999, 15000)).toBe(1)
  })
})
