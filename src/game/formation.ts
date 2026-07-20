import type { DefinitionSlot } from './types'

export const FORMATION_433: DefinitionSlot[] = [
  { id: 'GB', label: 'Gardien', postesEligibles: ['GB'], ligne: 'GB', colonne: 3, rangee: 5 },

  { id: 'DG', label: 'Défenseur gauche', postesEligibles: ['DG'], ligne: 'DEF', colonne: 1, rangee: 4 },
  { id: 'DC1', label: 'Défenseur central', postesEligibles: ['DC'], ligne: 'DEF', colonne: 2, rangee: 4 },
  { id: 'DC2', label: 'Défenseur central', postesEligibles: ['DC'], ligne: 'DEF', colonne: 4, rangee: 4 },
  { id: 'DD', label: 'Défenseur droit', postesEligibles: ['DD'], ligne: 'DEF', colonne: 5, rangee: 4 },

  { id: 'MC1', label: 'Milieu', postesEligibles: ['MIL'], ligne: 'MIL', colonne: 1, rangee: 3 },
  { id: 'MC2', label: 'Milieu', postesEligibles: ['MIL'], ligne: 'MIL', colonne: 3, rangee: 3 },
  { id: 'MC3', label: 'Milieu', postesEligibles: ['MIL'], ligne: 'MIL', colonne: 5, rangee: 3 },

  { id: 'AG', label: 'Ailier gauche', postesEligibles: ['ATT'], ligne: 'ATT', colonne: 1, rangee: 2 },
  { id: 'BU', label: 'Buteur', postesEligibles: ['ATT'], ligne: 'ATT', colonne: 3, rangee: 2 },
  { id: 'AD', label: 'Ailier droit', postesEligibles: ['ATT'], ligne: 'ATT', colonne: 5, rangee: 2 },
]

export const FORMATION_NBA: DefinitionSlot[] = [
  { id: 'INT1', label: 'Intérieur', postesEligibles: ['INT'], ligne: 'DEF', colonne: 2, rangee: 4 },
  { id: 'INT2', label: 'Intérieur', postesEligibles: ['INT'], ligne: 'DEF', colonne: 4, rangee: 4 },

  { id: 'EXT1', label: 'Extérieur', postesEligibles: ['EXT'], ligne: 'MIL', colonne: 1, rangee: 3 },
  { id: 'EXT2', label: 'Extérieur', postesEligibles: ['EXT'], ligne: 'MIL', colonne: 3, rangee: 3 },
  { id: 'EXT3', label: 'Extérieur', postesEligibles: ['EXT'], ligne: 'MIL', colonne: 5, rangee: 3 },
]
