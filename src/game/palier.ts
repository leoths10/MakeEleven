import type { JoueurComposition } from './types'

export type PalierNote = 'goat' | 'rainbow' | 'diamant' | 'or' | 'argent' | 'bronze'

export function palierNote(note: number): PalierNote {
  if (note >= 100) return 'goat'
  if (note >= 90) return 'rainbow'
  if (note > 85) return 'diamant'
  if (note >= 80) return 'or'
  if (note >= 78) return 'argent'
  return 'bronze'
}

export function calculerNoteEquipe(composition: JoueurComposition[]): number {
  return Math.round(composition.reduce((somme, j) => somme + j.note, 0) / composition.length)
}
