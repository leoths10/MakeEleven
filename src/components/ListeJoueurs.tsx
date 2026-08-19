import { useMemo, useState } from 'react'
import type { PosteJoueur } from '../game/types'
import { palierNote } from '../game/palier'
import BadgeNote from './BadgeNote'

export interface JoueurCatalogue {
  nom: string
  poste: PosteJoueur
  note: number
  note_booster?: number
  equipe: string
  annee: number
  source: 'selections' | 'ldc' | 'nba'
}

interface ListeJoueursProps {
  joueurs: JoueurCatalogue[]
  labelPoste: Record<PosteJoueur, string>
  onRetour: () => void
}

type SourceFiltre = 'tous' | 'selections' | 'ldc' | 'nba'
type ColonneTri = 'nom' | 'poste' | 'equipe' | 'annee' | 'note'

const LABEL_SOURCE: Record<Exclude<SourceFiltre, 'tous'>, string> = {
  selections: 'Sélections',
  ldc: 'Ligue des Champions',
  nba: 'NBA',
}

export default function ListeJoueurs({ joueurs, labelPoste, onRetour }: ListeJoueursProps) {
  const [sourceFiltre, setSourceFiltre] = useState<SourceFiltre>('tous')
  const [posteFiltre, setPosteFiltre] = useState<PosteJoueur | 'tous'>('tous')
  const [equipeFiltre, setEquipeFiltre] = useState<string>('tous')
  const [boosteAffiche, setBoosteAffiche] = useState(false)
  const [colonneTri, setColonneTri] = useState<ColonneTri>('note')
  const [triDescendant, setTriDescendant] = useState(true)

  const postesDisponibles = useMemo(() => {
    const source = sourceFiltre === 'tous' ? joueurs : joueurs.filter((j) => j.source === sourceFiltre)
    return Array.from(new Set(source.map((j) => j.poste))).sort()
  }, [joueurs, sourceFiltre])

  const equipesDisponibles = useMemo(() => {
    const source = sourceFiltre === 'tous' ? joueurs : joueurs.filter((j) => j.source === sourceFiltre)
    const cles = new Map<string, { equipe: string; annee: number }>()
    for (const j of source) {
      cles.set(`${j.equipe}-${j.annee}`, { equipe: j.equipe, annee: j.annee })
    }
    return Array.from(cles.values()).sort((a, b) => a.equipe.localeCompare(b.equipe) || a.annee - b.annee)
  }, [joueurs, sourceFiltre])

  const lignes = useMemo(() => {
    let liste = joueurs
    if (sourceFiltre !== 'tous') liste = liste.filter((j) => j.source === sourceFiltre)
    if (posteFiltre !== 'tous') liste = liste.filter((j) => j.poste === posteFiltre)
    if (equipeFiltre !== 'tous') liste = liste.filter((j) => `${j.equipe}-${j.annee}` === equipeFiltre)

    const avecNoteAffichee = liste.map((j) => ({
      ...j,
      noteAffichee: boosteAffiche ? j.note_booster ?? j.note : j.note,
    }))

    const triee = [...avecNoteAffichee].sort((a, b) => {
      let comparaison = 0
      switch (colonneTri) {
        case 'nom':
          comparaison = a.nom.localeCompare(b.nom)
          break
        case 'poste':
          comparaison = a.poste.localeCompare(b.poste)
          break
        case 'equipe':
          comparaison = a.equipe.localeCompare(b.equipe)
          break
        case 'annee':
          comparaison = a.annee - b.annee
          break
        case 'note':
          comparaison = a.noteAffichee - b.noteAffichee
          break
      }
      return triDescendant ? -comparaison : comparaison
    })

    return triee
  }, [joueurs, sourceFiltre, posteFiltre, equipeFiltre, boosteAffiche, colonneTri, triDescendant])

  const trierPar = (colonne: ColonneTri) => {
    if (colonne === colonneTri) {
      setTriDescendant((prev) => !prev)
    } else {
      setColonneTri(colonne)
      setTriDescendant(colonne === 'note')
    }
  }

  const flecheTri = (colonne: ColonneTri) => (colonne === colonneTri ? (triDescendant ? ' ↓' : ' ↑') : '')

  return (
    <div className="app">
      <header className="entete">
        <button className="bouton-changer-mode" onClick={onRetour}>
          ← Retour
        </button>
        <span className="entete-eyebrow">Catalogue</span>
        <h1>Tous les joueurs</h1>
        <p>{lignes.length} joueur{lignes.length > 1 ? 's' : ''} trouvé{lignes.length > 1 ? 's' : ''}</p>
      </header>

      <div className="liste-joueurs-filtres">
        <div className="filtre-groupe">
          <label htmlFor="filtre-source">Compétition</label>
          <select
            id="filtre-source"
            value={sourceFiltre}
            onChange={(e) => {
              setSourceFiltre(e.target.value as SourceFiltre)
              setPosteFiltre('tous')
              setEquipeFiltre('tous')
            }}
          >
            <option value="tous">Toutes</option>
            <option value="selections">{LABEL_SOURCE.selections}</option>
            <option value="ldc">{LABEL_SOURCE.ldc}</option>
            <option value="nba">{LABEL_SOURCE.nba}</option>
          </select>
        </div>

        <div className="filtre-groupe">
          <label htmlFor="filtre-equipe">Équipe</label>
          <select id="filtre-equipe" value={equipeFiltre} onChange={(e) => setEquipeFiltre(e.target.value)}>
            <option value="tous">Toutes</option>
            {equipesDisponibles.map(({ equipe, annee }) => (
              <option key={`${equipe}-${annee}`} value={`${equipe}-${annee}`}>
                {equipe} {annee}
              </option>
            ))}
          </select>
        </div>

        <div className="filtre-groupe">
          <label htmlFor="filtre-poste">Poste</label>
          <select id="filtre-poste" value={posteFiltre} onChange={(e) => setPosteFiltre(e.target.value as PosteJoueur | 'tous')}>
            <option value="tous">Tous</option>
            {postesDisponibles.map((poste) => (
              <option key={poste} value={poste}>
                {labelPoste[poste]}
              </option>
            ))}
          </select>
        </div>

        <label className={`toggle-boost toggle-liste${boosteAffiche ? ' toggle-boost-actif' : ''}`}>
          <input type="checkbox" checked={boosteAffiche} onChange={(e) => setBoosteAffiche(e.target.checked)} />
          <span className="toggle-boost-piste" aria-hidden="true">
            <span className="toggle-boost-curseur" />
          </span>
          <span className="toggle-boost-texte">
            <span className="toggle-boost-titre">Notes boostées</span>
            <span className="toggle-boost-detail">Affiche la note surpuissante quand elle existe</span>
          </span>
        </label>
      </div>

      <div className="liste-joueurs-tableau-conteneur">
        <table className="liste-joueurs-tableau">
          <thead>
            <tr>
              <th onClick={() => trierPar('nom')}>Nom{flecheTri('nom')}</th>
              <th onClick={() => trierPar('poste')}>Poste{flecheTri('poste')}</th>
              <th onClick={() => trierPar('equipe')}>Équipe{flecheTri('equipe')}</th>
              <th onClick={() => trierPar('annee')}>Année{flecheTri('annee')}</th>
              <th onClick={() => trierPar('note')}>Note{flecheTri('note')}</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((joueur, index) => {
              const palier = palierNote(joueur.noteAffichee)
              const estBoostee = boosteAffiche && joueur.note_booster !== undefined
              return (
                <tr key={`${joueur.source}-${joueur.equipe}-${joueur.annee}-${joueur.nom}-${index}`}>
                  <td>{joueur.nom}</td>
                  <td>{labelPoste[joueur.poste]}</td>
                  <td>{joueur.equipe}</td>
                  <td>{joueur.annee}</td>
                  <td className={`liste-joueurs-note liste-joueurs-note-${palier}${estBoostee ? ' liste-joueurs-note-boostee' : ''}`}>
                    <BadgeNote note={joueur.noteAffichee} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
