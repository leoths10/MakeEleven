import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { apiGetScores } from '../api/client'
import { FORMATION_433, FORMATION_NBA } from '../game/formation'
import type { CombinaisonJeu, PosteJoueur, ScoreSauvegarde } from '../game/types'
import CarteScoreProfil from './CarteScoreProfil'

interface ProfilProps {
  labelPoste: Record<PosteJoueur, string>
  onRetour: () => void
  onOuvrirConnexion: () => void
}

interface CombinaisonAffichee {
  combinaison: CombinaisonJeu
  titre: string
}

const COMBINAISONS: CombinaisonAffichee[] = [
  { combinaison: { sport: 'foot', mode: 'selections', boost: false, infini: false }, titre: 'Sélections' },
  { combinaison: { sport: 'foot', mode: 'selections', boost: true, infini: false }, titre: 'Sélections — Boosté' },
  { combinaison: { sport: 'foot', mode: 'selections', boost: false, infini: true }, titre: 'Sélections — Jokers illimités' },
  { combinaison: { sport: 'foot', mode: 'selections', boost: true, infini: true }, titre: 'Sélections — Boosté — Jokers illimités' },
  { combinaison: { sport: 'foot', mode: 'ldc', boost: false, infini: false }, titre: 'Ligue des Champions' },
  { combinaison: { sport: 'foot', mode: 'ldc', boost: true, infini: false }, titre: 'Ligue des Champions — Boosté' },
  { combinaison: { sport: 'foot', mode: 'ldc', boost: false, infini: true }, titre: 'Ligue des Champions — Jokers illimités' },
  { combinaison: { sport: 'foot', mode: 'ldc', boost: true, infini: true }, titre: 'Ligue des Champions — Boosté — Jokers illimités' },
  { combinaison: { sport: 'nba', mode: 'nba', boost: false, infini: false }, titre: 'NBA' },
]

function correspond(score: ScoreSauvegarde, combinaison: CombinaisonJeu): boolean {
  return (
    score.sport === combinaison.sport &&
    score.mode === combinaison.mode &&
    score.boost === combinaison.boost &&
    score.infini === combinaison.infini
  )
}

export default function Profil({ labelPoste, onRetour, onOuvrirConnexion }: ProfilProps) {
  const { user, chargement: chargementAuth, deconnexion } = useAuth()
  const [scores, setScores] = useState<ScoreSauvegarde[]>([])
  const [chargementScores, setChargementScores] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setChargementScores(true)
    apiGetScores()
      .then(setScores)
      .catch((err) => setErreur(err instanceof Error ? err.message : 'Impossible de charger les scores.'))
      .finally(() => setChargementScores(false))
  }, [user])

  if (chargementAuth) {
    return (
      <div className="app">
        <header className="entete">
          <h1>MakeEleven</h1>
        </header>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        <header className="entete">
          <button className="bouton-changer-mode" onClick={onRetour}>
            ← Retour
          </button>
          <span className="entete-eyebrow">Profil</span>
          <h1>MakeEleven</h1>
          <p>Connecte-toi pour sauvegarder et retrouver tes meilleurs scores.</p>
        </header>
        <button className="bouton-tirer" onClick={onOuvrirConnexion}>
          Se connecter
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="entete">
        <button className="bouton-changer-mode" onClick={onRetour}>
          ← Retour
        </button>
        <span className="entete-eyebrow">Profil</span>
        <h1>{user.username}</h1>
        <p>Tes meilleurs scores et formations, par mode de jeu.</p>
        <button className="lien-liste-joueurs" onClick={() => deconnexion()}>
          Se déconnecter
        </button>
      </header>

      {chargementScores && <p>Chargement des scores…</p>}
      {erreur && <p className="formulaire-erreur">{erreur}</p>}

      <div className="profil-grille">
        {COMBINAISONS.map(({ combinaison, titre }) => (
          <CarteScoreProfil
            key={`${combinaison.sport}-${combinaison.mode}-${combinaison.boost}-${combinaison.infini}`}
            titre={titre}
            score={scores.find((s) => correspond(s, combinaison)) ?? null}
            formation={combinaison.sport === 'nba' ? FORMATION_NBA : FORMATION_433}
            labelPoste={labelPoste}
            variante={combinaison.sport}
          />
        ))}
      </div>
    </div>
  )
}
