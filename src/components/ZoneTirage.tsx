import type { Campagne, JoueurPioche } from '../game/types'
import type { PhaseTirage } from '../App'
import { palierNote } from '../game/palier'
import BadgeNote from './BadgeNote'

interface ZoneTirageProps {
  campagne: Campagne | null
  joueurs: JoueurPioche[]
  slotsRestants: number
  retirageDisponible: boolean
  tirageBloque: boolean
  phase: PhaseTirage
  nbJoueursRevele: number
  onChoisir: (joueur: JoueurPioche) => void
  onTirer: () => void
}

const LABEL_POSTE: Record<string, string> = {
  GB: 'Gardien',
  DC: 'Défenseur central',
  DD: 'Défenseur droit',
  DG: 'Défenseur gauche',
  MIL: 'Milieu',
  ATT: 'Attaquant',
}

export default function ZoneTirage({
  campagne,
  joueurs,
  slotsRestants,
  retirageDisponible,
  tirageBloque,
  phase,
  nbJoueursRevele,
  onChoisir,
  onTirer,
}: ZoneTirageProps) {
  const choixLimite = phase === 'joueurs' && joueurs.length > 0 && joueurs.length < 5
  const tirageEnCours = phase !== 'inactif'
  const paysVisible = phase === 'pays' || phase === 'annee' || phase === 'joueurs'
  const anneeVisible = phase === 'annee' || phase === 'joueurs'

  return (
    <div className="zone-tirage">
      <button className="bouton-tirer" onClick={onTirer} disabled={tirageBloque}>
        {tirageEnCours ? 'Retirer 5 joueurs' : 'Tirer 5 joueurs'}
      </button>

      <span className={`jeton-retirage${retirageDisponible ? '' : ' jeton-retirage-utilise'}`}>
        {retirageDisponible ? 'Retirage disponible : 1' : 'Retirage utilisé'}
      </span>

      {tirageEnCours ? (
        <p className={`zone-tirage-aide${tirageBloque && phase === 'joueurs' ? ' zone-tirage-aide-alerte' : ''}`}>
          {phase === 'joueurs' && tirageBloque
            ? 'Retirage déjà utilisé : choisis un joueur parmi ces 5.'
            : phase === 'joueurs'
              ? 'Dernier retirage disponible pour cette partie.'
              : 'Tirage en cours…'}
        </p>
      ) : (
        <p className="zone-tirage-aide">
          {slotsRestants === 1 ? 'Encore 1 poste à pourvoir.' : `Encore ${slotsRestants} postes à pourvoir.`}
        </p>
      )}

      {phase === 'suspense' && (
        <div className="suspense-tirage" aria-hidden="true">
          <span className="suspense-point" />
          <span className="suspense-point" />
          <span className="suspense-point" />
        </div>
      )}

      {campagne && paysVisible && (
        <div className="info-campagne">
          <span className="campagne-titre campagne-titre-pays">{campagne.pays}</span>
          {anneeVisible && <span className="campagne-titre campagne-titre-annee">{campagne.annee}</span>}
          {anneeVisible && (
            <span className="campagne-detail">
              {campagne.competition} — {campagne.resultat}
            </span>
          )}
        </div>
      )}

      {choixLimite && (
        <p className="alerte-choix-limite">
          Choix limité cette fois : seulement {joueurs.length} joueur{joueurs.length > 1 ? 's' : ''} éligible
          {joueurs.length > 1 ? 's' : ''} dans cet effectif.
        </p>
      )}

      {phase === 'joueurs' && joueurs.length > 0 && (
        <div className="cartes-tirage cartes-tirage-empilees">
          {joueurs.slice(0, nbJoueursRevele).map((joueur) => {
            const palier = palierNote(joueur.note)
            const exceptionnel = joueur.note >= 85
            return (
              <button
                key={joueur.numero}
                className={`carte-joueur carte-joueur-${palier}${exceptionnel ? ' carte-joueur-exceptionnelle' : ''}`}
                onClick={() => onChoisir(joueur)}
              >
                <span className="carte-eclat" aria-hidden="true" />
                {exceptionnel && <span className="carte-rayons" aria-hidden="true" />}
                <BadgeNote note={joueur.note} />
                <div className="carte-maillot">{joueur.numero}</div>
                <div className="carte-nom-poste">
                  <div className="carte-nom">{joueur.nom}</div>
                  <div className="carte-poste">{LABEL_POSTE[joueur.poste]}</div>
                </div>
                <span className="carte-cta">Choisir</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
