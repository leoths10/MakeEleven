import type { DefinitionSlot } from './types'

export const FORMATION_442: DefinitionSlot[] = [
  { id: 'GB', label: 'Gardien', postesEligibles: ['GB'], ligne: 'GB', colonne: 3, rangee: 5 },

  { id: 'DG', label: 'Défenseur gauche', postesEligibles: ['DG'], ligne: 'DEF', colonne: 1, rangee: 4 },
  { id: 'DC1', label: 'Défenseur central', postesEligibles: ['DC'], ligne: 'DEF', colonne: 2, rangee: 4 },
  { id: 'DC2', label: 'Défenseur central', postesEligibles: ['DC'], ligne: 'DEF', colonne: 4, rangee: 4 },
  { id: 'DD', label: 'Défenseur droit', postesEligibles: ['DD'], ligne: 'DEF', colonne: 5, rangee: 4 },

  { id: 'MG', label: 'Milieu gauche', postesEligibles: ['MIL'], ligne: 'MIL', colonne: 1, rangee: 3 },
  { id: 'MC1', label: 'Milieu central', postesEligibles: ['MIL'], ligne: 'MIL', colonne: 2, rangee: 3 },
  { id: 'MC2', label: 'Milieu central', postesEligibles: ['MIL'], ligne: 'MIL', colonne: 4, rangee: 3 },
  { id: 'MD', label: 'Milieu droit', postesEligibles: ['MIL'], ligne: 'MIL', colonne: 5, rangee: 3 },

  { id: 'BU1', label: 'Buteur', postesEligibles: ['ATT'], ligne: 'ATT', colonne: 2, rangee: 2 },
  { id: 'BU2', label: 'Buteur', postesEligibles: ['ATT'], ligne: 'ATT', colonne: 4, rangee: 2 },
]
