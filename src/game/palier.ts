export type PalierNote = 'legende' | 'or' | 'argent' | 'bronze'

export function palierNote(note: number): PalierNote {
  if (note >= 90) return 'legende'
  if (note >= 85) return 'or'
  if (note >= 78) return 'argent'
  return 'bronze'
}
