interface ModeJeu {
  id: string
  titre: string
  description: string
  nbCampagnes: number
}

interface ChoixModeProps {
  modes: ModeJeu[]
  boosteActif: boolean
  infiniActif: boolean
  onChangerBoost: (actif: boolean) => void
  onChangerInfini: (actif: boolean) => void
  onChoisir: (id: string) => void
}

export default function ChoixMode({ modes, boosteActif, infiniActif, onChangerBoost, onChangerInfini, onChoisir }: ChoixModeProps) {
  return (
    <div className="app">
      <header className="entete">
        <span className="entete-eyebrow">Draft mode</span>
        <h1>MakeEleven</h1>
        <p>Choisis ton univers avant de composer ton onze de légende.</p>
      </header>

      <div className="toggles-options">
        <label className={`toggle-boost${boosteActif ? ' toggle-boost-actif' : ''}`}>
          <input
            type="checkbox"
            checked={boosteActif}
            onChange={(e) => onChangerBoost(e.target.checked)}
          />
          <span className="toggle-boost-piste" aria-hidden="true">
            <span className="toggle-boost-curseur" />
          </span>
          <span className="toggle-boost-texte">
            <span className="toggle-boost-titre">Mode Boosté</span>
            <span className="toggle-boost-detail">Les légendes jouent avec des notes surpuissantes</span>
          </span>
        </label>

        <label className={`toggle-boost toggle-infini${infiniActif ? ' toggle-boost-actif' : ''}`}>
          <input
            type="checkbox"
            checked={infiniActif}
            onChange={(e) => onChangerInfini(e.target.checked)}
          />
          <span className="toggle-boost-piste" aria-hidden="true">
            <span className="toggle-boost-curseur" />
          </span>
          <span className="toggle-boost-texte">
            <span className="toggle-boost-titre">Jokers illimités</span>
            <span className="toggle-boost-detail">Retirage et repioche disponibles sans limite</span>
          </span>
        </label>
      </div>

      <div className="choix-mode-grille">
        {modes.map((mode) => (
          <button key={mode.id} className="carte-mode" onClick={() => onChoisir(mode.id)}>
            <span className="carte-mode-titre">{mode.titre}</span>
            <span className="carte-mode-description">{mode.description}</span>
            <span className="carte-mode-compte">{mode.nbCampagnes} campagnes disponibles</span>
            <span className="carte-mode-cta">Jouer →</span>
          </button>
        ))}
      </div>
    </div>
  )
}
