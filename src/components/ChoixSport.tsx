interface SportInfo {
  id: string
  titre: string
  description: string
  nbEquipes: number
}

interface ChoixSportProps {
  sports: SportInfo[]
  onChoisir: (id: string) => void
  onVoirJoueurs: () => void
  onOuvrirProfil: () => void
  libelleProfil: string
}

export default function ChoixSport({ sports, onChoisir, onVoirJoueurs, onOuvrirProfil, libelleProfil }: ChoixSportProps) {
  return (
    <div className="app">
      <header className="entete">
        <span className="entete-eyebrow">Draft mode</span>
        <h1>MakeEleven</h1>
        <p>Choisis ton sport avant de composer ton équipe de légende.</p>
      </header>

      <div className="choix-mode-grille choix-sport-grille">
        {sports.map((sport) => (
          <button key={sport.id} className="carte-mode carte-sport" onClick={() => onChoisir(sport.id)}>
            <span className="carte-mode-titre">{sport.titre}</span>
            <span className="carte-mode-description">{sport.description}</span>
            <span className="carte-mode-compte">{sport.nbEquipes} équipes disponibles</span>
            <span className="carte-mode-cta">Continuer →</span>
          </button>
        ))}
      </div>

      <div className="liens-secondaires">
        <button type="button" className="lien-liste-joueurs" onClick={onVoirJoueurs}>
          Voir tous les joueurs →
        </button>
        <button type="button" className="lien-liste-joueurs" onClick={onOuvrirProfil}>
          {libelleProfil} →
        </button>
      </div>
    </div>
  )
}
