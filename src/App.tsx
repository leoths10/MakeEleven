import { useMemo, useState } from 'react'
import campagnesSelections from './data/campagnes.json'
import campagnesLdc from './data/campagnes-ldc.json'
import campagnesNba from './data/campagnes-nba.json'
import ChoixSport from './components/ChoixSport'
import ChoixMode from './components/ChoixMode'
import Jeu from './Jeu'
import { FORMATION_433, FORMATION_NBA } from './game/formation'
import type { Campagne, PosteJoueur } from './game/types'

const CAMPAGNES_SELECTIONS = campagnesSelections as Campagne[]
const CAMPAGNES_LDC = campagnesLdc as Campagne[]
const CAMPAGNES_NBA = campagnesNba as Campagne[]

const LABEL_POSTE_FOOT: Record<PosteJoueur, string> = {
  GB: 'Gardien',
  DC: 'Défenseur central',
  DD: 'Défenseur droit',
  DG: 'Défenseur gauche',
  MIL: 'Milieu',
  ATT: 'Attaquant',
  EXT: 'Extérieur',
  INT: 'Intérieur',
}

const LABEL_POSTE_NBA: Record<PosteJoueur, string> = LABEL_POSTE_FOOT

type SportId = 'foot' | 'nba'
type ModeId = 'selections' | 'ldc'

function appliquerBoost(campagnes: Campagne[]): Campagne[] {
  return campagnes.map((campagne) => ({
    ...campagne,
    joueurs: campagne.joueurs.map((joueur) => ({
      ...joueur,
      note: joueur.note_booster ?? joueur.note,
    })),
  }))
}

const SPORTS = [
  {
    id: 'foot' as SportId,
    titre: 'Football',
    description: 'Sélections nationales et clubs européens, un onze de légende à composer.',
    nbEquipes: CAMPAGNES_SELECTIONS.length + CAMPAGNES_LDC.length,
  },
  {
    id: 'nba' as SportId,
    titre: 'NBA',
    description: 'Les plus grandes franchises NBA et leurs effectifs mythiques.',
    nbEquipes: CAMPAGNES_NBA.length,
  },
]

const MODES = [
  {
    id: 'selections' as ModeId,
    titre: 'Sélections',
    description: 'Coupes du monde et Euros, des légendes de chaque équipe nationale.',
    nbCampagnes: CAMPAGNES_SELECTIONS.length,
  },
  {
    id: 'ldc' as ModeId,
    titre: 'Ligue des Champions',
    description: 'Les plus grands clubs européens et leurs effectifs mythiques.',
    nbCampagnes: CAMPAGNES_LDC.length,
  },
]

export default function App() {
  const [sport, setSport] = useState<SportId | null>(null)
  const [mode, setMode] = useState<ModeId | null>(null)
  const [boosteActif, setBoosteActif] = useState(false)

  const campagnesSelectionsFinal = useMemo(
    () => (boosteActif ? appliquerBoost(CAMPAGNES_SELECTIONS) : CAMPAGNES_SELECTIONS),
    [boosteActif]
  )
  const campagnesLdcFinal = useMemo(() => (boosteActif ? appliquerBoost(CAMPAGNES_LDC) : CAMPAGNES_LDC), [boosteActif])

  const eyebrowSuffixe = boosteActif ? ' — Boosté' : ''

  const retourAccueil = () => {
    setSport(null)
    setMode(null)
  }

  if (sport === 'nba') {
    return (
      <Jeu
        campagnes={CAMPAGNES_NBA}
        eyebrow="Draft mode — NBA"
        sousTitre="Pioche 5 joueurs parmi les plus grandes franchises, garde-en un, compose ton cinq de légende."
        formation={FORMATION_NBA}
        labelPoste={LABEL_POSTE_NBA}
        variante="nba"
        onChangerMode={retourAccueil}
      />
    )
  }

  if (sport === 'foot' && mode === 'selections') {
    return (
      <Jeu
        campagnes={campagnesSelectionsFinal}
        eyebrow={`Draft mode — Sélections${eyebrowSuffixe}`}
        sousTitre="Pioche 5 joueurs, garde-en un, compose ton onze de légende."
        formation={FORMATION_433}
        labelPoste={LABEL_POSTE_FOOT}
        onChangerMode={() => setMode(null)}
      />
    )
  }

  if (sport === 'foot' && mode === 'ldc') {
    return (
      <Jeu
        campagnes={campagnesLdcFinal}
        eyebrow={`Draft mode — Ligue des Champions${eyebrowSuffixe}`}
        sousTitre="Pioche 5 joueurs parmi les plus grands clubs, garde-en un, compose ton onze de légende."
        formation={FORMATION_433}
        labelPoste={LABEL_POSTE_FOOT}
        onChangerMode={() => setMode(null)}
      />
    )
  }

  if (sport === 'foot') {
    return (
      <ChoixMode
        modes={MODES}
        boosteActif={boosteActif}
        onChangerBoost={setBoosteActif}
        onChoisir={(id) => setMode(id as ModeId)}
      />
    )
  }

  return <ChoixSport sports={SPORTS} onChoisir={(id) => setSport(id as SportId)} />
}
