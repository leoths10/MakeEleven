import type { DefinitionSlot, JoueurComposition, PosteJoueur, SlotId } from '../game/types'
import { palierNote } from '../game/palier'
import BadgeNote from './BadgeNote'
import SilhouetteJoueur from './SilhouetteJoueur'

interface TerrainProps {
  composition: JoueurComposition[]
  formation: DefinitionSlot[]
  labelPoste: Record<PosteJoueur, string>
  dernierSlotRempli: SlotId | null
  variante?: 'foot' | 'nba'
}

export default function Terrain({ composition, formation, labelPoste, dernierSlotRempli, variante = 'foot' }: TerrainProps) {
  const parSlot = new Map(composition.map((j) => [j.slotId, j]))

  return (
    <div className={`terrain terrain-${variante}`}>
      <div className="terrain-lignes">
        {variante === 'foot' ? (
          <>
            <div className="ligne-milieu" />
            <div className="rond-central" />
            <div className="surface surface-haut" />
            <div className="surface surface-bas" />
          </>
        ) : (
          <>
            <div className="rond-central rond-central-nba" />
            <div className="raquette raquette-haut" />
            <div className="raquette raquette-bas" />
            <div className="ligne-3points ligne-3points-haut" />
            <div className="ligne-3points ligne-3points-bas" />
          </>
        )}
      </div>

      {formation.map((slot) => {
        const joueur = parSlot.get(slot.id)
        const vientDetreRempli = slot.id === dernierSlotRempli
        return (
          <div
            key={slot.id}
            className={`slot slot-${joueur ? 'rempli' : 'vide'}`}
            style={{
              gridColumn: slot.colonne,
              gridRow: slot.rangee,
            }}
          >
            {joueur ? (
              <div
                className={`carte-slot carte-slot-${palierNote(joueur.note)}${vientDetreRempli ? ' carte-slot-nouvelle' : ''}`}
                title={`Pioché en ${joueur.pays} ${joueur.annee}`}
              >
                <BadgeNote note={joueur.note} />
                <div className={`maillot maillot-${palierNote(joueur.note)}`}>
                  <SilhouetteJoueur className="silhouette-joueur" />
                  <span className="maillot-numero">{joueur.numero}</span>
                </div>
                <div className="nom-joueur">{joueur.nom}</div>
                <div className="poste-joueur">{labelPoste[joueur.poste]}</div>
                <div className="origine-joueur">
                  {joueur.pays} {joueur.annee}
                </div>
              </div>
            ) : (
              <div className="slot-attente">
                <div className="slot-pointille" />
                <div className="slot-label">{slot.label}</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
