import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'

export const scoresRouter = Router()

interface ScoreRow {
  sport: string
  mode: string
  boost: number
  infini: number
  note_equipe: number
  formation_json: string
  variante: string
  updated_at: string
}

function serialiser(row: ScoreRow) {
  return {
    sport: row.sport,
    mode: row.mode,
    boost: Boolean(row.boost),
    infini: Boolean(row.infini),
    noteEquipe: row.note_equipe,
    variante: row.variante,
    formation: JSON.parse(row.formation_json),
    updatedAt: row.updated_at,
  }
}

scoresRouter.use(requireAuth)

scoresRouter.post('/', (req, res) => {
  const { sport, mode, boost, infini, noteEquipe, variante, formation } = req.body ?? {}

  if (
    (sport !== 'foot' && sport !== 'nba') ||
    typeof mode !== 'string' ||
    typeof boost !== 'boolean' ||
    typeof infini !== 'boolean' ||
    typeof noteEquipe !== 'number' ||
    (variante !== 'foot' && variante !== 'nba') ||
    !Array.isArray(formation)
  ) {
    res.status(400).json({ error: 'Payload de score invalide.' })
    return
  }

  const modeNormalise = sport === 'nba' ? 'nba' : mode

  const avant = db
    .prepare(
      'SELECT note_equipe FROM scores WHERE user_id = ? AND sport = ? AND mode = ? AND boost = ? AND infini = ?'
    )
    .get(req.userId, sport, modeNormalise, boost ? 1 : 0, infini ? 1 : 0) as { note_equipe: number } | undefined

  db.prepare(
    `INSERT INTO scores (user_id, sport, mode, boost, infini, note_equipe, formation_json, variante, updated_at)
     VALUES (@user_id, @sport, @mode, @boost, @infini, @note_equipe, @formation_json, @variante, datetime('now'))
     ON CONFLICT(user_id, sport, mode, boost, infini)
     DO UPDATE SET
       note_equipe = excluded.note_equipe,
       formation_json = excluded.formation_json,
       variante = excluded.variante,
       updated_at = excluded.updated_at
     WHERE excluded.note_equipe > scores.note_equipe`
  ).run({
    user_id: req.userId,
    sport,
    mode: modeNormalise,
    boost: boost ? 1 : 0,
    infini: infini ? 1 : 0,
    note_equipe: noteEquipe,
    formation_json: JSON.stringify(formation),
    variante,
  })

  const meilleur = db
    .prepare(
      'SELECT sport, mode, boost, infini, note_equipe, formation_json, variante, updated_at FROM scores WHERE user_id = ? AND sport = ? AND mode = ? AND boost = ? AND infini = ?'
    )
    .get(req.userId, sport, modeNormalise, boost ? 1 : 0, infini ? 1 : 0) as ScoreRow

  const isNewRecord = !avant || noteEquipe > avant.note_equipe

  res.json({
    saved: true,
    isNewRecord,
    best: serialiser(meilleur),
  })
})

scoresRouter.get('/', (req, res) => {
  const rows = db
    .prepare(
      'SELECT sport, mode, boost, infini, note_equipe, formation_json, variante, updated_at FROM scores WHERE user_id = ?'
    )
    .all(req.userId) as ScoreRow[]

  res.json(rows.map(serialiser))
})
