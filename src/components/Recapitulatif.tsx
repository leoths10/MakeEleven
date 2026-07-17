import type { JoueurComposition } from '../game/types'
import { FORMATION_442 } from '../game/formation'
import { palierNote } from '../game/palier'
import BadgeNote from './BadgeNote'

interface RecapitulatifProps {
  composition: JoueurComposition[]
  onRecommencer: () => void
}

const LABEL_POSTE: Record<string, string> = {
  GB: 'Gardien',
  DC: 'Défenseur central',
  DD: 'Défenseur droit',
  DG: 'Défenseur gauche',
  MIL: 'Milieu',
  ATT: 'Attaquant',
}

export default function Recapitulatif({ composition, onRecommencer }: RecapitulatifProps) {
  const parSlot = new Map(composition.map((j) => [j.slotId, j]))
  const campagnesOrigine = Array.from(new Set(composition.map((j) => `${j.pays} ${j.annee}`))).sort()
  const noteMoyenne = Math.round(composition.reduce((somme, j) => somme + j.note, 0) / composition.length)

  return (
    <div className="recapitulatif">
      <div className="recapitulatif-entete">
        <span className="recapitulatif-badge">Onze complet</span>
        <h2>Ton équipe de légende</h2>
        <p>Composée de joueurs piochés dans {campagnesOrigine.length} campagne{campagnesOrigine.length > 1 ? 's' : ''}.</p>
        <div className="recapitulatif-note-moyenne">
          <span>Note d'équipe</span>
          <BadgeNote note={noteMoyenne} />
        </div>
      </div>

      <ul className="recapitulatif-liste">
        {FORMATION_442.map((slot) => {
          const joueur = parSlot.get(slot.id)
          if (!joueur) return null
          return (
            <li key={slot.id} className={`recapitulatif-ligne recapitulatif-ligne-${palierNote(joueur.note)}`}>
              <span className="recapitulatif-maillot">{joueur.numero}</span>
              <span className="recapitulatif-nom-poste">
                <span className="recapitulatif-nom">{joueur.nom}</span>
                <span className="recapitulatif-poste">{LABEL_POSTE[joueur.poste]}</span>
              </span>
              <BadgeNote note={joueur.note} />
              <span className="recapitulatif-origine">
                {joueur.pays} {joueur.annee}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="recapitulatif-campagnes">
        {campagnesOrigine.map((c) => (
          <span key={c} className="recapitulatif-tag">
            {c}
          </span>
        ))}
      </div>

      <button className="bouton-tirer" onClick={onRecommencer}>
        Recommencer une draft
      </button>
    </div>
  )
}
