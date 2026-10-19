# MakeEleven

Jeu de draft : compose ton onze de légende en piochant dans des campagnes (équipes nationales, finalistes de Ligue des Champions, franchises NBA) tirées au hasard.

## Principe

1. Une campagne est tirée au hasard.
2. 5 joueurs de cette campagne sont proposés : tu en gardes **un** et il prend place dans un slot de la formation.
3. On recommence jusqu'à remplir tous les slots. La note d'équipe donne un **palier**.

| Palier   | Note       |
|----------|------------|
| goat     | ≥ 100      |
| rainbow  | ≥ 90       |
| diamant  | > 85       |
| or       | ≥ 80       |
| argent   | ≥ 78       |
| bronze   | en dessous |

## Modes

| Mode                 | Contenu                           | Formation    |
|----------------------|-----------------------------------|--------------|
| Foot — Sélections    | 34 campagnes, 829 joueurs         | 4-3-3        |
| Foot — Ligue des Champions | 35 campagnes, 683 joueurs   | 4-3-3        |
| NBA                  | 16 franchises, 198 joueurs        | cinq majeur  |

Options foot :
- **Boost** : chaque joueur prend sa `note_booster`.
- **Infini** : retirages illimités.

Hors boost, un joueur a 5 % de chance de sortir avec sa note boostée. La NBA n'a pas de mode boost dans l'interface : ses boosters ne sortent que par ce critique à 5 %.

Un record unique est conservé par combinaison utilisateur / sport / mode / boost / infini.

## Stack

- **Front** : React 18, Vite, TypeScript, CSS maison ([src/index.css](src/index.css)). Code et nommage en français.
- **Back** : [server/](server/) — Express 4, better-sqlite3, bcryptjs. Sessions par cookie httpOnly (`session_id`, 30 jours). Tables `users`, `sessions`, `scores`.
- **Déploiement** : Docker, nginx pour le front avec proxy `/api/` vers le backend.

## Structure

```
src/
  App.tsx, Jeu.tsx     # écrans principaux
  game/                # logique de jeu (tirage, paliers…)
  components/          # Terrain, ZoneTirage…
  auth/, api/          # connexion et appels au serveur
  data/                # campagnes*.json (générés, voir plus bas)
server/src/            # API Express, auth, base SQLite
scripts/               # maintenance des données et simulation
```

## Lancer le projet

### Docker (recommandé)

```bash
docker compose up -d --build
```

Le jeu est servi sur <http://localhost:8080>. Le backend écoute en interne sur le port 3001 et les données SQLite sont dans le volume `makeeleven-data`.

### Développement local

```bash
npm install
npm run dev          # front Vite

cd server
npm install
npm run dev          # API sur PORT (3001 par défaut)
```

Variables du backend : `PORT`, `DB_PATH` (chemin du fichier SQLite).

Build du front : `npm run build`.

## Données

Les fichiers de [src/data/](src/data/) sont **générés : ne pas les éditer à la main**. Les sources vivent hors du dépôt (`/home/dev/campagnes-v2.json`, `ldc.json`, `nba.json`).

```bash
scripts/maj-donnees.sh
```

Le script valide les sources, les transforme vers le schéma interne, lance `tsc`, simule 500 parties par mode, puis reconstruit Docker. Il ne fait rien si les sources n'ont pas changé.

Autres scripts :
- `scripts/completer-boosters.py` : complète les `note_booster` manquantes (`note + 6 + (note − 62) × 0,5`, plafond 120, jamais en dessous d'une valeur écrite à la main). Idempotent, à relancer sur les sources quand des joueurs sont ajoutés.
- `scripts/valider_campagnes.py` : validation des campagnes.
- `scripts/simulate.mjs` : simulation de parties pour vérifier la répartition des paliers.

> Limite connue : en mode boosté, 92 à 100 % des équipes finissent au palier *goat*, le barème ne discrimine plus.
