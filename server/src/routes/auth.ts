import { Router } from 'express'
import { db } from '../db.js'
import {
  creerSession,
  effacerCookieSession,
  hashMotDePasse,
  lireSessionId,
  poserCookieSession,
  resoudreUtilisateurOptionnel,
  supprimerSession,
  verifierMotDePasse,
} from '../auth.js'

export const authRouter = Router()

interface UserRow {
  id: number
  username: string
  password_hash: string
}

function validerIdentifiants(username: unknown, password: unknown): string | null {
  if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 24) {
    return "Le nom d'utilisateur doit contenir entre 3 et 24 caractères."
  }
  if (typeof password !== 'string' || password.length < 6) {
    return 'Le mot de passe doit contenir au moins 6 caractères.'
  }
  return null
}

authRouter.post('/register', (req, res) => {
  const { username, password } = req.body ?? {}
  const erreur = validerIdentifiants(username, password)
  if (erreur) {
    res.status(400).json({ error: erreur })
    return
  }

  const nomNormalise = (username as string).trim()
  const existant = db.prepare('SELECT id FROM users WHERE username = ?').get(nomNormalise)
  if (existant) {
    res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà pris.' })
    return
  }

  const passwordHash = hashMotDePasse(password as string)
  const info = db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(nomNormalise, passwordHash)

  const session = creerSession(Number(info.lastInsertRowid))
  poserCookieSession(res, session.id)
  res.status(201).json({ id: info.lastInsertRowid, username: nomNormalise })
})

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body ?? {}
  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Identifiants invalides.' })
    return
  }

  const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username.trim()) as
    | UserRow
    | undefined

  if (!user || !verifierMotDePasse(password, user.password_hash)) {
    res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect." })
    return
  }

  const session = creerSession(user.id)
  poserCookieSession(res, session.id)
  res.json({ id: user.id, username: user.username })
})

authRouter.post('/logout', (req, res) => {
  const sessionId = lireSessionId(req)
  if (sessionId) supprimerSession(sessionId)
  effacerCookieSession(res)
  res.status(204).end()
})

authRouter.get('/me', (req, res) => {
  const userId = resoudreUtilisateurOptionnel(req)
  if (!userId) {
    res.status(401).json({ error: 'Non connecté' })
    return
  }
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId) as
    | Pick<UserRow, 'id' | 'username'>
    | undefined
  if (!user) {
    res.status(401).json({ error: 'Non connecté' })
    return
  }
  res.json(user)
})
