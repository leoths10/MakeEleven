import type { DefinitionSlot, JoueurComposition, SlotId } from '../game/types'
import { palierNote } from '../game/palier'
import BadgeNote from './BadgeNote'

interface TerrainProps {
  composition: JoueurComposition[]
  formation: DefinitionSlot[]
  dernierSlotRempli: SlotId | null
}

const LABEL_POSTE: Record<string, string> = {
  GB: 'Gardien',
  DC: 'Défenseur central',
  DD: 'Défenseur droit',
  DG: 'Défenseur gauche',
  MIL: 'Milieu',
  ATT: 'Attaquant',
}

export default function Terrain({ composition, formation, dernierSlotRempli }: TerrainProps) {
  const parSlot = new Map(composition.map((j) => [j.slotId, j]))

  return (
    <div className="terrain">
      <div className="terrain-lignes">
        <div className="ligne-milieu" />
        <div className="rond-central" />
        <div className="surface surface-haut" />
        <div className="surface surface-bas" />
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
                <div className="maillot">{joueur.numero}</div>
                <div className="nom-joueur">{joueur.nom}</div>
                <div className="poste-joueur">{LABEL_POSTE[joueur.poste]}</div>
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
