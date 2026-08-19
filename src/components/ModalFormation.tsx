import { useEffect } from 'react'
import type { DefinitionSlot, JoueurComposition, PosteJoueur } from '../game/types'
import Terrain from './Terrain'

interface ModalFormationProps {
  titre: string
  composition: JoueurComposition[]
  formation: DefinitionSlot[]
  labelPoste: Record<PosteJoueur, string>
  variante: 'foot' | 'nba'
  onFermer: () => void
}

export default function ModalFormation({ titre, composition, formation, labelPoste, variante, onFermer }: ModalFormationProps) {
  useEffect(() => {
    const onEchap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer()
    }
    document.addEventListener('keydown', onEchap)
    return () => document.removeEventListener('keydown', onEchap)
  }, [onFermer])

  return (
    <div className="modal-fond" onClick={onFermer}>
      <div className="modal-contenu" onClick={(e) => e.stopPropagation()}>
        <div className="modal-entete">
          <h3>{titre}</h3>
          <button className="modal-fermer" onClick={onFermer} aria-label="Fermer">
            ✕
          </button>
        </div>

        <Terrain
          composition={composition}
          formation={formation}
          labelPoste={labelPoste}
          dernierSlotRempli={null}
          variante={variante}
        />
      </div>
    </div>
  )
}
