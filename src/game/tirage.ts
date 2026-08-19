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

const CHANCE_NOTE_BOOSTEE = 0.05

// En mode normal, un joueur disposant d'une note_booster a une petite chance
// d'apparaître avec cette note surpuissante au lieu de sa note habituelle.
function appliquerNoteAleatoire<T extends { note: number; note_booster?: number }>(joueur: T): T {
  if (joueur.note_booster !== undefined && Math.random() < CHANCE_NOTE_BOOSTEE) {
    return { ...joueur, note: joueur.note_booster }
  }
  return joueur
}

export interface ResultatTirage {
  campagne: Campagne
  joueurs: JoueurPioche[]
}

function tirerParmi(
  campagnes: Campagne[],
  disponibles: SlotId[],
  formation: DefinitionSlot[],
  nomsExclus: Set<string>
): ResultatTirage | null {
  const campagnesMelangees = melanger(campagnes)

  for (const campagne of campagnesMelangees) {
    const eligibles = campagne.joueurs.filter(
      (j) => estEligible(j.poste, disponibles, formation) && !nomsExclus.has(j.nom)
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
        .map(appliquerNoteAleatoire)
        .sort((a, b) => a.note - b.note)
      return { campagne, joueurs }
    }
  }

  return null
}

export function tirerCinqJoueurs(
  campagnes: Campagne[],
  composition: JoueurComposition[],
  nomsDejaUtilises: Set<string>,
  formation: DefinitionSlot[],
  nomsDejaProposes: Set<string> = new Set()
): ResultatTirage | null {
  const disponibles = slotsLibres(composition, formation)
  if (disponibles.length === 0) return null

  const nomsExclus = new Set([...nomsDejaUtilises, ...nomsDejaProposes])
  const resultat = tirerParmi(campagnes, disponibles, formation, nomsExclus)
  if (resultat) return resultat

  // Plus aucune campagne ne peut fournir de joueur inédit : on retombe sur le
  // pool complet (seuls les joueurs déjà utilisés dans l'équipe restent exclus)
  // plutôt que de bloquer le tirage.
  return tirerParmi(campagnes, disponibles, formation, nomsDejaUtilises)
}

function tirerAutresParmi(
  campagne: Campagne,
  disponibles: SlotId[],
  formation: DefinitionSlot[],
  nomsExclus: Set<string>
): JoueurPioche[] | null {
  const eligibles = campagne.joueurs.filter(
    (j) => estEligible(j.poste, disponibles, formation) && !nomsExclus.has(j.nom)
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
    .map(appliquerNoteAleatoire)
    .sort((a, b) => a.note - b.note)
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

  const nomsExclus = new Set([...nomsDejaUtilises, ...nomsDejaProposes])
  const resultat = tirerAutresParmi(campagne, disponibles, formation, nomsExclus)
  if (resultat) return resultat

  // Effectif de la campagne épuisé : on retombe sur le pool complet de la
  // campagne (seuls les joueurs déjà utilisés dans l'équipe restent exclus)
  // plutôt que de bloquer la repioche.
  return tirerAutresParmi(campagne, disponibles, formation, nomsDejaUtilises)
}
