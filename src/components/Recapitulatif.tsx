import type { DefinitionSlot, JoueurComposition, PosteJoueur } from '../game/types'
import { palierNote } from '../game/palier'
import Terrain from './Terrain'

interface RecapitulatifProps {
  composition: JoueurComposition[]
  formation: DefinitionSlot[]
  labelPoste: Record<PosteJoueur, string>
  variante?: 'foot' | 'nba'
  onRecommencer: () => void
}

const LABEL_PALIER: Record<string, string> = {
  bronze: 'Bronze',
  argent: 'Argent',
  or: 'Or',
  diamant: 'Diamant',
  rainbow: 'Rainbow',
  goat: 'GOAT',
}

export default function Recapitulatif({ composition, formation, labelPoste, variante = 'foot', onRecommencer }: RecapitulatifProps) {
  const campagnesOrigine = Array.from(new Set(composition.map((j) => `${j.pays} ${j.annee}`))).sort()
  const noteMoyenne = Math.round(composition.reduce((somme, j) => somme + j.note, 0) / composition.length)
  const palierEquipe = palierNote(noteMoyenne)
  const badgeComplet = variante === 'nba' ? 'Cinq complet' : 'Onze complet'

  return (
    <div className="recapitulatif">
      <div className="recapitulatif-entete">
        <span className="recapitulatif-badge">{badgeComplet}</span>
        <h2>Ton équipe de légende</h2>
        <p>
          Composée de joueurs piochés dans {campagnesOrigine.length} campagne{campagnesOrigine.length > 1 ? 's' : ''}.
        </p>
      </div>

      <div className={`note-equipe note-equipe-${palierEquipe}`}>
        <span className="note-equipe-label">Note d'équipe</span>
        <span className="note-equipe-valeur">{noteMoyenne}</span>
        <span className="note-equipe-palier">{LABEL_PALIER[palierEquipe]}</span>
      </div>

      <div className="recapitulatif-terrain">
        <Terrain
          composition={composition}
          formation={formation}
          labelPoste={labelPoste}
          dernierSlotRempli={null}
          variante={variante}
        />
      </div>

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
