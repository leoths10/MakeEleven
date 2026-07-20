import type { Campagne, JoueurPioche, PosteJoueur } from '../game/types'
import type { PhaseTirage } from '../Jeu'
import { palierNote } from '../game/palier'
import BadgeNote from './BadgeNote'
import SilhouetteJoueur from './SilhouetteJoueur'

interface ZoneTirageProps {
  campagne: Campagne | null
  joueurs: JoueurPioche[]
  slotsRestants: number
  retirageDisponible: boolean
  pioche5AutresDisponible: boolean
  tirageBloque: boolean
  phase: PhaseTirage
  nbJoueursRevele: number
  labelPoste: Record<PosteJoueur, string>
  onChoisir: (joueur: JoueurPioche) => void
  onTirer: () => void
  onPiocherCinqAutres: () => void
}

export default function ZoneTirage({
  campagne,
  joueurs,
  slotsRestants,
  retirageDisponible,
  pioche5AutresDisponible,
  tirageBloque,
  phase,
  nbJoueursRevele,
  labelPoste,
  onChoisir,
  onTirer,
  onPiocherCinqAutres,
}: ZoneTirageProps) {
  const choixLimite = phase === 'joueurs' && joueurs.length > 0 && joueurs.length < 5
  const tirageEnCours = phase !== 'inactif'
  const paysVisible = phase === 'pays' || phase === 'annee' || phase === 'joueurs'
  const anneeVisible = phase === 'annee' || phase === 'joueurs'
  const piocheCinqAutresPossible = tirageEnCours && phase === 'joueurs' && pioche5AutresDisponible && !!campagne

  return (
    <div className="zone-tirage">
      <button className="bouton-tirer" onClick={onTirer} disabled={tirageBloque}>
        {tirageEnCours ? 'Retirer 5 joueurs' : 'Tirer 5 joueurs'}
      </button>

      <div className="jokers">
        <span
          className={`joker joker-retirage${retirageDisponible ? ' joker-disponible' : ' joker-utilise'}`}
          title={retirageDisponible ? 'Change de campagne et retire un nouveau lot de 5 joueurs' : 'Retirage déjà utilisé'}
        >
          <span className="joker-icone" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </span>
          <span className="joker-texte">
            <span className="joker-label">Retirage</span>
            <span className="joker-etat">{retirageDisponible ? 'Disponible' : 'Utilisé'}</span>
          </span>
        </span>

        <button
          type="button"
          className={`joker joker-piocher${pioche5AutresDisponible ? ' joker-disponible' : ' joker-utilise'}${piocheCinqAutresPossible ? ' joker-actif' : ''}`}
          onClick={piocheCinqAutresPossible ? onPiocherCinqAutres : undefined}
          disabled={!piocheCinqAutresPossible}
          title={
            pioche5AutresDisponible
              ? 'Repioche 5 autres joueurs dans la même équipe'
              : 'Repioche déjà utilisée'
          }
        >
          <span className="joker-icone" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </span>
          <span className="joker-texte">
            <span className="joker-label">Autres joueurs</span>
            <span className="joker-etat">{pioche5AutresDisponible ? 'Disponible' : 'Utilisé'}</span>
          </span>
        </button>
      </div>

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
            const exceptionnel = joueur.note > 85
            return (
              <button
                key={joueur.numero}
                className={`carte-joueur carte-joueur-${palier}${exceptionnel ? ' carte-joueur-exceptionnelle' : ''}`}
                onClick={() => onChoisir(joueur)}
              >
                <span className="carte-eclat" aria-hidden="true" />
                {palier === 'diamant' && <span className="carte-facettes" aria-hidden="true" />}
                {palier === 'rainbow' && <span className="carte-rayons" aria-hidden="true" />}
                {palier === 'goat' && <span className="carte-eclairs" aria-hidden="true" />}
                <BadgeNote note={joueur.note} />
                <div className={`carte-maillot carte-maillot-${palier}`}>
                  <SilhouetteJoueur className="silhouette-joueur" />
                  <span className="carte-maillot-numero">{joueur.numero}</span>
                </div>
                <div className="carte-nom-poste">
                  <div className="carte-nom">{joueur.nom}</div>
                  <div className="carte-poste">{labelPoste[joueur.poste]}</div>
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
