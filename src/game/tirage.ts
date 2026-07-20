import type { Campagne, DefinitionSlot, JoueurComposition, JoueurPioche, SlotId } from './types'

export function slotsLibres(composition: JoueurComposition[], formation: DefinitionSlot[]): SlotId[] {
  const occupes = new Set(composition.map((j) => j.slotId))
  return formation.filter((slot) => !occupes.has(slot.id)).map((slot) => slot.id)
}

export function slotsCompatibles(
  poste: JoueurPioche['poste'],
  slotsDisponibles: SlotId[],
  formation: DefinitionSlot[]
): SlotId[] {
  return formation.filter(
    (slot) => slotsDisponibles.includes(slot.id) && slot.postesEligibles.includes(poste)
  ).map((slot) => slot.id)
}

function estEligible(poste: JoueurPioche['poste'], slotsDisponibles: SlotId[], formation: DefinitionSlot[]): boolean {
  return slotsCompatibles(poste, slotsDisponibles, formation).length > 0
}

function melanger<T>(tableau: T[]): T[] {
  const copie = [...tableau]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

export interface ResultatTirage {
  campagne: Campagne
  joueurs: JoueurPioche[]
}

export function tirerCinqJoueurs(
  campagnes: Campagne[],
  composition: JoueurComposition[],
  nomsDejaUtilises: Set<string>,
  formation: DefinitionSlot[]
): ResultatTirage | null {
  const disponibles = slotsLibres(composition, formation)
  if (disponibles.length === 0) return null

  const campagnesMelangees = melanger(campagnes)

  for (const campagne of campagnesMelangees) {
    const eligibles = campagne.joueurs.filter(
      (j) => estEligible(j.poste, disponibles, formation) && !nomsDejaUtilises.has(j.nom)
    )
    if (eligibles.length >= 1) {
      const choisis = melanger(eligibles).slice(0, Math.min(5, eligibles.length))
      const joueurs: JoueurPioche[] = choisis
        .map((j) => ({
          ...j,
          campagneId: campagne.id,
          pays: campagne.pays,
          annee: campagne.annee,
        }))
        .sort((a, b) => a.note - b.note)
      return { campagne, joueurs }
    }
  }

  return null
}

export function tirerCinqAutresJoueurs(
  campagne: Campagne,
  composition: JoueurComposition[],
  nomsDejaUtilises: Set<string>,
  nomsDejaProposes: Set<string>,
  formation: DefinitionSlot[]
): JoueurPioche[] | null {
  const disponibles = slotsLibres(composition, formation)
  if (disponibles.length === 0) return null

  const eligibles = campagne.joueurs.filter(
    (j) => estEligible(j.poste, disponibles, formation) && !nomsDejaUtilises.has(j.nom) && !nomsDejaProposes.has(j.nom)
  )
  if (eligibles.length === 0) return null

  return melanger(eligibles)
    .slice(0, Math.min(5, eligibles.length))
    .map((j) => ({
      ...j,
      campagneId: campagne.id,
      pays: campagne.pays,
      annee: campagne.annee,
    }))
    .sort((a, b) => a.note - b.note)
}
