import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

interface ConnexionProps {
  onSucces: () => void
  onRetour: () => void
}

export default function Connexion({ onSucces, onRetour }: ConnexionProps) {
  const { connexion, inscription } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    setEnvoiEnCours(true)
    try {
      if (mode === 'login') {
        await connexion(username, password)
      } else {
        await inscription(username, password)
      }
      onSucces()
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return (
    <div className="app">
      <header className="entete">
        <button className="bouton-changer-mode" onClick={onRetour}>
          ← Retour
        </button>
        <span className="entete-eyebrow">Compte</span>
        <h1>MakeEleven</h1>
        <p>{mode === 'login' ? 'Connecte-toi pour retrouver tes meilleurs scores.' : 'Crée un compte pour sauvegarder tes meilleures équipes.'}</p>
      </header>

      <form className="formulaire-connexion" onSubmit={onSubmit}>
        <div className="filtre-groupe">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="filtre-groupe">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
        </div>

        {erreur && <p className="formulaire-erreur">{erreur}</p>}

        <button className="bouton-tirer" type="submit" disabled={envoiEnCours}>
          {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        </button>

        <button
          type="button"
          className="lien-liste-joueurs"
          onClick={() => {
            setMode((prev) => (prev === 'login' ? 'register' : 'login'))
            setErreur(null)
          }}
        >
          {mode === 'login' ? "Pas encore de compte ? Créer un compte" : 'Déjà un compte ? Se connecter'}
        </button>
      </form>
    </div>
  )
}
