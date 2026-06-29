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

export interface Categorie {
  id_categorie: number
  libelle: string
  description: string | null
  emoji: string | null
}

export interface ChoixPublic {
  id_choix: number
  position: number
  texte: string
}

export interface QuestionPublic {
  id_question: number
  position: number
  intitule: string
  choix: ChoixPublic[]
}

export interface QuizSession {
  id_session: number
  id_quiz: number
  theme: string
  difficulte: string
  temps_par_question_ms: number
  questions: QuestionPublic[]
}

export interface AnswerResponse {
  correcte: boolean
  id_choix_correct: number
  explication: string | null
  points: number
  score_total: number
  serie_actuelle: number
  nb_bonnes: number
}

export interface FinishResponse {
  score: number
  nb_bonnes: number
  serie_max: number
  total_questions: number
  rang: number
}

export interface LeaderboardEntry {
  pseudo: string
  theme: string
  difficulte: string
  score: number
  nb_bonnes: number
  created_at: string
}

export interface HistoryEntry {
  id_session: number
  theme: string
  difficulte: string
  score: number
  nb_bonnes: number
  termine: boolean
  created_at: string
}

export interface GenerateParams {
  id_categorie?: number
  theme?: string
  difficulte: string
  nb_questions: number
}

export function genererQuiz(params: GenerateParams): Promise<QuizSession> {
  return api<QuizSession>('/quiz', { method: 'POST', body: JSON.stringify(params) })
}

export function repondre(
  idSession: number,
  body: { id_question: number; id_choix: number | null; temps_ms: number },
): Promise<AnswerResponse> {
  return api<AnswerResponse>(`/sessions/${idSession}/answers`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function terminerSession(idSession: number): Promise<FinishResponse> {
  return api<FinishResponse>(`/sessions/${idSession}/finish`, { method: 'POST' })
}
