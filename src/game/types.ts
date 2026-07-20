export type PosteJoueur = 'GB' | 'DC' | 'DD' | 'DG' | 'MIL' | 'ATT' | 'EXT' | 'INT'

export type SlotId =
  | 'GB'
  | 'DG'
  | 'DC1'
  | 'DC2'
  | 'DD'
  | 'MC1'
  | 'MC2'
  | 'MC3'
  | 'AG'
  | 'BU'
  | 'AD'
  | 'EXT1'
  | 'EXT2'
  | 'EXT3'
  | 'INT1'
  | 'INT2'

export interface DefinitionSlot {
  id: SlotId
  label: string
  postesEligibles: PosteJoueur[]
  ligne: 'GB' | 'DEF' | 'MIL' | 'ATT'
  colonne: number
  rangee: number
}

export interface Joueur {
  numero: number
  nom: string
  poste: PosteJoueur
  note: number
  note_booster?: number
}

export interface Campagne {
  id: string
  pays: string
  annee: number
  competition: string
  resultat: string
  selectionneur: string
  joueurs: Joueur[]
}

export interface JoueurPioche extends Joueur {
  campagneId: string
  pays: string
  annee: number
}

export interface JoueurComposition extends JoueurPioche {
  slotId: SlotId
}
