import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'
import { db } from './db.js'

const SESSION_COOKIE = 'session_id'
const SESSION_DUREE_JOURS = 30

export function hashMotDePasse(motDePasse: string): string {
  return bcrypt.hashSync(motDePasse, 10)
}

export function verifierMotDePasse(motDePasse: string, hash: string): boolean {
  return bcrypt.compareSync(motDePasse, hash)
}

export function creerSession(userId: number): { id: string; expiresAt: string } {
  const id = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DUREE_JOURS * 24 * 60 * 60 * 1000).toISOString()
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(id, userId, expiresAt)
  return { id, expiresAt }
}

export function supprimerSession(sessionId: string): void {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
}

interface SessionRow {
  user_id: number
  expires_at: string
}

function resoudreSession(sessionId: string | undefined): number | null {
  if (!sessionId) return null
  const row = db.prepare('SELECT user_id, expires_at FROM sessions WHERE id = ?').get(sessionId) as
    | SessionRow
    | undefined
  if (!row) return null
  if (new Date(row.expires_at).getTime() < Date.now()) {
    supprimerSession(sessionId)
    return null
  }
  return row.user_id
}

export function poserCookieSession(res: Response, sessionId: string): void {
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: SESSION_DUREE_JOURS * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

export function effacerCookieSession(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: '/' })
}

export function lireSessionId(req: Request): string | undefined {
  return req.cookies?.[SESSION_COOKIE]
}

declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = resoudreSession(lireSessionId(req))
  if (!userId) {
    res.status(401).json({ error: 'Non connecté' })
    return
  }
  req.userId = userId
  next()
}

export function resoudreUtilisateurOptionnel(req: Request): number | null {
  return resoudreSession(lireSessionId(req))
}
