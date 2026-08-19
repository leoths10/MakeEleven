import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiLogin, apiLogout, apiMe, apiRegister, type Utilisateur } from '../api/client'

interface AuthContextValue {
  user: Utilisateur | null
  chargement: boolean
  connexion: (username: string, password: string) => Promise<void>
  inscription: (username: string, password: string) => Promise<void>
  deconnexion: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Utilisateur | null>(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    apiMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChargement(false))
  }, [])

  const connexion = useCallback(async (username: string, password: string) => {
    const utilisateur = await apiLogin(username, password)
    setUser(utilisateur)
  }, [])

  const inscription = useCallback(async (username: string, password: string) => {
    const utilisateur = await apiRegister(username, password)
    setUser(utilisateur)
  }, [])

  const deconnexion = useCallback(async () => {
    await apiLogout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, chargement, connexion, inscription, deconnexion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}
