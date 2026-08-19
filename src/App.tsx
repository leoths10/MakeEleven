import { useMemo, useState } from 'react'
import campagnesSelections from './data/campagnes.json'
import campagnesLdc from './data/campagnes-ldc.json'
import campagnesNba from './data/campagnes-nba.json'
import ChoixSport from './components/ChoixSport'
import ChoixMode from './components/ChoixMode'
import ListeJoueurs, { type JoueurCatalogue } from './components/ListeJoueurs'
import Connexion from './components/Connexion'
import Profil from './components/Profil'
import Jeu from './Jeu'
import { FORMATION_433, FORMATION_NBA } from './game/formation'
import type { Campagne, CombinaisonJeu, PosteJoueur } from './game/types'
import { useAuth } from './auth/AuthContext'

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

function construireCatalogue(): JoueurCatalogue[] {
  const sources: { campagnes: Campagne[]; source: JoueurCatalogue['source'] }[] = [
    { campagnes: CAMPAGNES_SELECTIONS, source: 'selections' },
    { campagnes: CAMPAGNES_LDC, source: 'ldc' },
    { campagnes: CAMPAGNES_NBA, source: 'nba' },
  ]
  return sources.flatMap(({ campagnes, source }) =>
    campagnes.flatMap((campagne) =>
      campagne.joueurs.map((joueur) => ({
        nom: joueur.nom,
        poste: joueur.poste,
        note: joueur.note,
        note_booster: joueur.note_booster,
        equipe: campagne.pays,
        annee: campagne.annee,
        source,
      }))
    )
  )
}

const CATALOGUE_JOUEURS = construireCatalogue()

type Vue = 'jeu' | 'liste' | 'profil' | 'connexion'

export default function App() {
  const { user } = useAuth()
  const [sport, setSport] = useState<SportId | null>(null)
  const [mode, setMode] = useState<ModeId | null>(null)
  const [boosteActif, setBoosteActif] = useState(false)
  const [infiniActif, setInfiniActif] = useState(false)
  const [vue, setVue] = useState<Vue>('jeu')

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

  if (vue === 'liste') {
    return <ListeJoueurs joueurs={CATALOGUE_JOUEURS} labelPoste={LABEL_POSTE_FOOT} onRetour={() => setVue('jeu')} />
  }

  if (vue === 'profil') {
    return (
      <Profil
        labelPoste={LABEL_POSTE_FOOT}
        onRetour={() => setVue('jeu')}
        onOuvrirConnexion={() => setVue('connexion')}
      />
    )
  }

  if (vue === 'connexion') {
    return <Connexion onSucces={() => setVue('profil')} onRetour={() => setVue('jeu')} />
  }

  if (sport === 'nba') {
    const combinaison: CombinaisonJeu = { sport: 'nba', mode: 'nba', boost: false, infini: false }
    return (
      <Jeu
        campagnes={CAMPAGNES_NBA}
        eyebrow="Draft mode — NBA"
        sousTitre="Pioche 5 joueurs parmi les plus grandes franchises, garde-en un, compose ton cinq de légende."
        formation={FORMATION_NBA}
        labelPoste={LABEL_POSTE_NBA}
        variante="nba"
        combinaison={combinaison}
        onChangerMode={retourAccueil}
      />
    )
  }

  if (sport === 'foot' && mode === 'selections') {
    const combinaison: CombinaisonJeu = { sport: 'foot', mode: 'selections', boost: boosteActif, infini: infiniActif }
    return (
      <Jeu
        campagnes={campagnesSelectionsFinal}
        eyebrow={`Draft mode — Sélections${eyebrowSuffixe}`}
        sousTitre="Pioche 5 joueurs, garde-en un, compose ton onze de légende."
        formation={FORMATION_433}
        labelPoste={LABEL_POSTE_FOOT}
        jokersInfinis={infiniActif}
        combinaison={combinaison}
        onChangerMode={() => setMode(null)}
      />
    )
  }

  if (sport === 'foot' && mode === 'ldc') {
    const combinaison: CombinaisonJeu = { sport: 'foot', mode: 'ldc', boost: boosteActif, infini: infiniActif }
    return (
      <Jeu
        campagnes={campagnesLdcFinal}
        eyebrow={`Draft mode — Ligue des Champions${eyebrowSuffixe}`}
        sousTitre="Pioche 5 joueurs parmi les plus grands clubs, garde-en un, compose ton onze de légende."
        formation={FORMATION_433}
        labelPoste={LABEL_POSTE_FOOT}
        jokersInfinis={infiniActif}
        combinaison={combinaison}
        onChangerMode={() => setMode(null)}
      />
    )
  }

  if (sport === 'foot') {
    return (
      <ChoixMode
        modes={MODES}
        boosteActif={boosteActif}
        infiniActif={infiniActif}
        onChangerBoost={setBoosteActif}
        onChangerInfini={setInfiniActif}
        onChoisir={(id) => setMode(id as ModeId)}
      />
    )
  }

  return (
    <ChoixSport
      sports={SPORTS}
      onChoisir={(id) => setSport(id as SportId)}
      onVoirJoueurs={() => setVue('liste')}
      onOuvrirProfil={() => setVue(user ? 'profil' : 'connexion')}
      libelleProfil={user ? 'Mon profil' : 'Connexion'}
    />
  )
}
