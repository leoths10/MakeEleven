import type { CombinaisonJeu, JoueurComposition, ScoreSauvegarde } from '../game/types'

const BASE = '/api'

export interface Utilisateur {
  id: number
  username: string
}

const DELAI_MAX_MS = 10000

async function requeteJson<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  const controleur = new AbortController()
  const minuteur = setTimeout(() => controleur.abort(), DELAI_MAX_MS)

  let reponse: Response
  try {
    reponse = await fetch(`${BASE}${chemin}`, {
      ...options,
      credentials: 'include',
      signal: controleur.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('La requête a mis trop de temps à répondre. Réessaie.')
    }
    throw new Error('Impossible de contacter le serveur. Vérifie ta connexion.')
  } finally {
    clearTimeout(minuteur)
  }

  if (!reponse.ok) {
    const corps = await reponse.json().catch(() => ({}))
    const erreur = new Error(corps.error ?? `Erreur ${reponse.status}`) as Error & { status: number }
    erreur.status = reponse.status
    throw erreur
  }
  if (reponse.status === 204) return undefined as T
  return reponse.json() as Promise<T>
}

export function apiRegister(username: string, password: string): Promise<Utilisateur> {
  return requeteJson('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) })
}

export function apiLogin(username: string, password: string): Promise<Utilisateur> {
  return requeteJson('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
}

export function apiLogout(): Promise<void> {
  return requeteJson('/auth/logout', { method: 'POST' })
}

export function apiMe(): Promise<Utilisateur> {
  return requeteJson('/auth/me')
}

interface PayloadScore extends CombinaisonJeu {
  noteEquipe: number
  variante: 'foot' | 'nba'
  formation: JoueurComposition[]
}

export interface ReponseSauvegardeScore {
  saved: boolean
  isNewRecord: boolean
  best: ScoreSauvegarde
}

export function apiSaveScore(payload: PayloadScore): Promise<ReponseSauvegardeScore> {
  return requeteJson('/scores', { method: 'POST', body: JSON.stringify(payload) })
}

export function apiGetScores(): Promise<ScoreSauvegarde[]> {
  return requeteJson('/scores')
}
