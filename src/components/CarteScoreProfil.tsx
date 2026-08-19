import { useState } from 'react'
import type { DefinitionSlot, PosteJoueur, ScoreSauvegarde } from '../game/types'
import { palierNote } from '../game/palier'
import ModalFormation from './ModalFormation'

const LABEL_PALIER: Record<string, string> = {
  bronze: 'Bronze',
  argent: 'Argent',
  or: 'Or',
  diamant: 'Diamant',
  rainbow: 'Rainbow',
  goat: 'GOAT',
}

interface CarteScoreProfilProps {
  titre: string
  score: ScoreSauvegarde | null
  formation: DefinitionSlot[]
  labelPoste: Record<PosteJoueur, string>
  variante: 'foot' | 'nba'
}

export default function CarteScoreProfil({ titre, score, formation, labelPoste, variante }: CarteScoreProfilProps) {
  const [modalOuverte, setModalOuverte] = useState(false)

  if (!score) {
    return (
      <div className="carte-score-profil carte-score-profil-vide">
        <span className="carte-score-profil-titre">{titre}</span>
        <p>Pas encore de meilleur score pour cette combinaison.</p>
      </div>
    )
  }

  const palier = palierNote(score.noteEquipe)

  return (
    <div className="carte-score-profil">
      <span className="carte-score-profil-titre">{titre}</span>

      <div className={`note-equipe note-equipe-${palier}`}>
        <span className="note-equipe-label">Note d'équipe</span>
        <span className="note-equipe-valeur">{score.noteEquipe}</span>
        <span className="note-equipe-palier">{LABEL_PALIER[palier]}</span>
      </div>

      <button className="bouton-voir-formation" onClick={() => setModalOuverte(true)}>
        Voir la formation
      </button>

      {modalOuverte && (
        <ModalFormation
          titre={titre}
          composition={score.formation}
          formation={formation}
          labelPoste={labelPoste}
          variante={variante}
          onFermer={() => setModalOuverte(false)}
        />
      )}
    </div>
  )
}
