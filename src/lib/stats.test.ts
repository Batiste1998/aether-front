import { describe, expect, it } from 'vitest'
import { pvPourcentage, xpVersProchainNiveau } from './stats'

describe('pvPourcentage', () => {
  it('calcule le ratio en pourcentage', () => {
    expect(pvPourcentage(130, 130)).toBe(100)
    expect(pvPourcentage(65, 130)).toBe(50)
    expect(pvPourcentage(0, 130)).toBe(0)
  })

  it('borne entre 0 et 100 et gère un max invalide', () => {
    expect(pvPourcentage(-10, 100)).toBe(0)
    expect(pvPourcentage(150, 100)).toBe(100)
    expect(pvPourcentage(50, 0)).toBe(0)
  })
})

describe('xpVersProchainNiveau', () => {
  it('renvoie la progression dans le niveau courant', () => {
    expect(xpVersProchainNiveau(0)).toEqual({ actuel: 0, requis: 100, pct: 0 })
    expect(xpVersProchainNiveau(50)).toEqual({ actuel: 50, requis: 100, pct: 50 })
    expect(xpVersProchainNiveau(250)).toEqual({ actuel: 50, requis: 100, pct: 50 })
  })
})
