import { useEffect, useRef, useState } from 'react'
import campagnesData from './data/campagnes.json'
import ZoneTirage from './components/ZoneTirage'
import Terrain from './components/Terrain'
import Recapitulatif from './components/Recapitulatif'
import { FORMATION_442 } from './game/formation'
import { slotsCompatibles, slotsLibres, tirerCinqJoueurs } from './game/tirage'
import type { Campagne, JoueurComposition, JoueurPioche, SlotId } from './game/types'

const CAMPAGNES = campagnesData as Campagne[]

export type PhaseTirage = 'inactif' | 'suspense' | 'pays' | 'annee' | 'joueurs'

const DELAI_SUSPENSE = 400
const DELAI_PAYS = 300
const DELAI_ANNEE = 300
const DELAI_ENTRE_JOUEURS = 450

interface EtatTirage {
  campagne: Campagne | null
  joueurs: JoueurPioche[]
}

export default function App() {
  const [composition, setComposition] = useState<JoueurComposition[]>([])
  const [nomsUtilises, setNomsUtilises] = useState<Set<string>>(new Set())
  const [tirage, setTirage] = useState<EtatTirage>({ campagne: null, joueurs: [] })
  const [dernierSlotRempli, setDernierSlotRempli] = useState<SlotId | null>(null)
  const [retirageDisponible, setRetirageDisponible] = useState(true)
  const [phase, setPhase] = useState<PhaseTirage>('inactif')
  const [nbJoueursRevele, setNbJoueursRevele] = useState(0)

  const minuteurs = useRef<ReturnType<typeof setTimeout>[]>([])

  const compositionComplete = composition.length >= 11
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

    const resultat = tirerCinqJoueurs(CAMPAGNES, composition, nomsUtilises)
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
      setPhase('joueurs')
    })

    resultat.joueurs.forEach((_, index) => {
      planifier(DELAI_SUSPENSE + DELAI_PAYS + DELAI_ANNEE + index * DELAI_ENTRE_JOUEURS, () => {
        setNbJoueursRevele(index + 1)
      })
    })
  }

  const choisirJoueur = (joueur: JoueurPioche) => {
    if (animationEnCours) return
    const disponibles = slotsLibres(composition)
    const compatibles = slotsCompatibles(joueur.poste, disponibles)
    if (compatibles.length === 0) return

    const slotChoisi = compatibles[0]
    const nouveauJoueur: JoueurComposition = { ...joueur, slotId: slotChoisi }

    setComposition((prev) => [...prev, nouveauJoueur])
    setNomsUtilises((prev) => new Set(prev).add(joueur.nom))
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
    setTirage({ campagne: null, joueurs: [] })
    setDernierSlotRempli(null)
    setRetirageDisponible(true)
    setPhase('inactif')
    setNbJoueursRevele(0)
  }

  return (
    <div className="app">
      <header className="entete">
        <span className="entete-eyebrow">Draft mode</span>
        <h1>MakeEleven</h1>
        <p>Pioche 5 joueurs, garde-en un, compose ton onze de légende.</p>
        <div className="progression">
          <div className="progression-barre">
            <div className="progression-remplissage" style={{ width: `${(composition.length / 11) * 100}%` }} />
          </div>
          <span className="progression-texte">{composition.length} / 11</span>
        </div>
      </header>

      <div className="zone-jeu">
        <div className="colonne-tirage">
          {compositionComplete ? (
            <Recapitulatif composition={composition} onRecommencer={recommencer} />
          ) : (
            <ZoneTirage
              campagne={tirage.campagne}
              joueurs={tirage.joueurs}
              slotsRestants={11 - composition.length}
              retirageDisponible={retirageDisponible}
              tirageBloque={tirageBloque || animationEnCours}
              phase={phase}
              nbJoueursRevele={nbJoueursRevele}
              onChoisir={choisirJoueur}
              onTirer={lancerTirage}
            />
          )}
        </div>

        <div className="colonne-terrain">
          <Terrain composition={composition} dernierSlotRempli={dernierSlotRempli} formation={FORMATION_442} />
        </div>
      </div>
    </div>
  )
}
