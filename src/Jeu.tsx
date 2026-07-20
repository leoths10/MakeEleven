import { useEffect, useRef, useState } from 'react'
import ZoneTirage from './components/ZoneTirage'
import Terrain from './components/Terrain'
import Recapitulatif from './components/Recapitulatif'
import { slotsCompatibles, slotsLibres, tirerCinqAutresJoueurs, tirerCinqJoueurs } from './game/tirage'
import type { Campagne, DefinitionSlot, JoueurComposition, JoueurPioche, PosteJoueur, SlotId } from './game/types'

export type PhaseTirage = 'inactif' | 'suspense' | 'pays' | 'annee' | 'joueurs'

const DELAI_SUSPENSE = 400
const DELAI_PAYS = 300
const DELAI_ANNEE = 300
const DELAI_ENTRE_JOUEURS = 450

interface EtatTirage {
  campagne: Campagne | null
  joueurs: JoueurPioche[]
}

interface JeuProps {
  campagnes: Campagne[]
  eyebrow: string
  sousTitre: string
  formation: DefinitionSlot[]
  labelPoste: Record<PosteJoueur, string>
  variante?: 'foot' | 'nba'
  onChangerMode: () => void
}

export default function Jeu({ campagnes, eyebrow, sousTitre, formation, labelPoste, variante = 'foot', onChangerMode }: JeuProps) {
  const [composition, setComposition] = useState<JoueurComposition[]>([])
  const [nomsUtilises, setNomsUtilises] = useState<Set<string>>(new Set())
  const [nomsProposes, setNomsProposes] = useState<Set<string>>(new Set())
  const [tirage, setTirage] = useState<EtatTirage>({ campagne: null, joueurs: [] })
  const [dernierSlotRempli, setDernierSlotRempli] = useState<SlotId | null>(null)
  const [retirageDisponible, setRetirageDisponible] = useState(true)
  const [pioche5AutresDisponible, setPioche5AutresDisponible] = useState(true)
  const [phase, setPhase] = useState<PhaseTirage>('inactif')
  const [nbJoueursRevele, setNbJoueursRevele] = useState(0)

  const minuteurs = useRef<ReturnType<typeof setTimeout>[]>([])

  const tailleEquipe = formation.length
  const compositionComplete = composition.length >= tailleEquipe
  const tirageEnCours = tirage.joueurs.length > 0
  const tirageBloque = tirageEnCours && !retirageDisponible
  const animationEnCours = phase !== 'inactif' && phase !== 'joueurs'

  useEffect(() => {
    if (!dernierSlotRempli) return
    const minuteur = setTimeout(() => setDernierSlotRempli(null), 900)
    return () => clearTimeout(minuteur)
  }, [dernierSlotRempli])

  useEffect(() => {
    return () => minuteurs.current.forEach(clearTimeout)
  }, [])

  const planifier = (delai: number, action: () => void) => {
    const id = setTimeout(action, delai)
    minuteurs.current.push(id)
  }

  const lancerTirage = () => {
    if (tirageBloque || animationEnCours) return
    if (tirageEnCours) setRetirageDisponible(false)

    minuteurs.current.forEach(clearTimeout)
    minuteurs.current = []

    const resultat = tirerCinqJoueurs(campagnes, composition, nomsUtilises, formation)
    if (!resultat) {
      setTirage({ campagne: null, joueurs: [] })
      return
    }

    setNbJoueursRevele(0)
    setTirage({ campagne: null, joueurs: [] })
    setPhase('suspense')

    planifier(DELAI_SUSPENSE, () => {
      setTirage({ campagne: resultat.campagne, joueurs: [] })
      setPhase('pays')
    })

    planifier(DELAI_SUSPENSE + DELAI_PAYS, () => {
      setPhase('annee')
    })

    planifier(DELAI_SUSPENSE + DELAI_PAYS + DELAI_ANNEE, () => {
      setTirage({ campagne: resultat.campagne, joueurs: resultat.joueurs })
      setNomsProposes(new Set(resultat.joueurs.map((j) => j.nom)))
      setPhase('joueurs')
    })

    resultat.joueurs.forEach((_, index) => {
      planifier(DELAI_SUSPENSE + DELAI_PAYS + DELAI_ANNEE + index * DELAI_ENTRE_JOUEURS, () => {
        setNbJoueursRevele(index + 1)
      })
    })
  }

  const piocherCinqAutres = () => {
    if (!tirage.campagne || animationEnCours || !pioche5AutresDisponible) return

    const nouveauxJoueurs = tirerCinqAutresJoueurs(tirage.campagne, composition, nomsUtilises, nomsProposes, formation)
    if (!nouveauxJoueurs) return

    minuteurs.current.forEach(clearTimeout)
    minuteurs.current = []

    setPioche5AutresDisponible(false)
    setNbJoueursRevele(0)
    setTirage({ campagne: tirage.campagne, joueurs: [] })
    setPhase('joueurs')

    planifier(80, () => {
      setTirage({ campagne: tirage.campagne, joueurs: nouveauxJoueurs })
      setNomsProposes((prev) => new Set([...prev, ...nouveauxJoueurs.map((j) => j.nom)]))
    })

    nouveauxJoueurs.forEach((_, index) => {
      planifier(80 + index * DELAI_ENTRE_JOUEURS, () => {
        setNbJoueursRevele(index + 1)
      })
    })
  }

  const choisirJoueur = (joueur: JoueurPioche) => {
    if (animationEnCours) return
    const disponibles = slotsLibres(composition, formation)
    const compatibles = slotsCompatibles(joueur.poste, disponibles, formation)
    if (compatibles.length === 0) return

    const slotChoisi = compatibles[0]
    const nouveauJoueur: JoueurComposition = { ...joueur, slotId: slotChoisi }

    setComposition((prev) => [...prev, nouveauJoueur])
    setNomsUtilises((prev) => new Set(prev).add(joueur.nom))
    setNomsProposes(new Set())
    setTirage({ campagne: null, joueurs: [] })
    setDernierSlotRempli(slotChoisi)
    setPhase('inactif')
    setNbJoueursRevele(0)
  }

  const recommencer = () => {
    minuteurs.current.forEach(clearTimeout)
    minuteurs.current = []
    setComposition([])
    setNomsUtilises(new Set())
    setNomsProposes(new Set())
    setTirage({ campagne: null, joueurs: [] })
    setDernierSlotRempli(null)
    setRetirageDisponible(true)
    setPioche5AutresDisponible(true)
    setPhase('inactif')
    setNbJoueursRevele(0)
  }

  return (
    <div className="app">
      <header className="entete">
        <button className="bouton-changer-mode" onClick={onChangerMode}>
          ← Changer de mode
        </button>
        <span className="entete-eyebrow">{eyebrow}</span>
        <h1>MakeEleven</h1>
        <p>{sousTitre}</p>
        <div className="progression">
          <div className="progression-barre">
            <div className="progression-remplissage" style={{ width: `${(composition.length / tailleEquipe) * 100}%` }} />
          </div>
          <span className="progression-texte">
            {composition.length} / {tailleEquipe}
          </span>
        </div>
      </header>

      {compositionComplete ? (
        <Recapitulatif
          composition={composition}
          formation={formation}
          labelPoste={labelPoste}
          variante={variante}
          onRecommencer={recommencer}
        />
      ) : (
        <div className="zone-jeu">
          <div className="colonne-tirage">
            <ZoneTirage
              campagne={tirage.campagne}
              joueurs={tirage.joueurs}
              slotsRestants={tailleEquipe - composition.length}
              retirageDisponible={retirageDisponible}
              pioche5AutresDisponible={pioche5AutresDisponible}
              tirageBloque={tirageBloque || animationEnCours}
              phase={phase}
              nbJoueursRevele={nbJoueursRevele}
              labelPoste={labelPoste}
              onChoisir={choisirJoueur}
              onTirer={lancerTirage}
              onPiocherCinqAutres={piocherCinqAutres}
            />
          </div>

          <div className="colonne-terrain">
            <Terrain
              composition={composition}
              dernierSlotRempli={dernierSlotRempli}
              formation={formation}
              labelPoste={labelPoste}
              variante={variante}
            />
          </div>
        </div>
      )}
    </div>
  )
}
