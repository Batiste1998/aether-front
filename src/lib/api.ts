const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const TOKEN_KEY = 'aether_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Appel HTTP typé vers l'API ; injecte le JWT et remonte les erreurs. */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = `Erreur ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* réponse sans corps JSON */
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ============ Types partagés avec le backend ============

export interface Utilisateur {
  id: number
  pseudo: string
  email: string
  role: string
}

export interface AuthResponse {
  token: string
  utilisateur: Utilisateur
}

export interface Personnage {
  id_personnage: number
  nom: string
  niveau: number
  xp: number
  pv_actuels: number
  pv_max: number
  or_pieces: number
  histoire: string | null
  created_at: string
  id_classe: number
  classe_nom: string
}

export interface Partie {
  id_partie: number
  titre: string
  statut: string
  theme: string | null
  created_at: string
  updated_at: string
  id_personnage: number
}

export interface Tour {
  id_tour: number
  numero: number
  action_joueur: string | null
  narration_ia: string
  etat_jeu: unknown
  created_at: string
}

export interface Quete {
  id_quete: number
  titre: string
  description: string | null
  statut: string
  recompense_xp: number
  recompense_or: number
}

export interface Pnj {
  id_pnj: number
  nom: string
  description: string | null
  attitude: string | null
}

export interface InventaireItem {
  id_objet: number
  nom: string
  type_objet: string
  description: string | null
  effet: string | null
  quantite: number
  equipe: boolean
}

export interface PartieDetail extends Partie {
  tours: Tour[]
  quetes: Quete[]
  pnj: Pnj[]
  inventaire: InventaireItem[]
}

export interface De {
  raison: string
  de: string
  resultat: number
  reussite: boolean
}

export interface TourResponse {
  numero: number
  narration: string
  jets_de_des: De[]
  personnage: {
    niveau: number
    xp: number
    pv_actuels: number
    pv_max: number
    or_pieces: number
  }
}

export interface UtiliserResponse {
  pv_actuels: number
  pv_max: number
  soin: number
}

/** Équipe ou retire un objet de l'inventaire d'un personnage. */
export function equiperObjet(pid: number, oid: number, equipe: boolean): Promise<void> {
  return api<void>(`/personnages/${pid}/inventaire/${oid}/equiper`, {
    method: 'POST',
    body: JSON.stringify({ equipe }),
  })
}

/** Consomme un objet (potion…) et renvoie les PV mis à jour. */
export function utiliserObjet(pid: number, oid: number): Promise<UtiliserResponse> {
  return api<UtiliserResponse>(`/personnages/${pid}/inventaire/${oid}/utiliser`, { method: 'POST' })
}
