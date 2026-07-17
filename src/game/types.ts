export type PosteJoueur = 'GB' | 'DC' | 'DD' | 'DG' | 'MIL' | 'ATT'

export type SlotId = 'GB' | 'DG' | 'DC1' | 'DC2' | 'DD' | 'MG' | 'MC1' | 'MC2' | 'MD' | 'BU1' | 'BU2'

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
