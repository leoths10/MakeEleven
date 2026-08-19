#!/usr/bin/env bash
# Met à jour les données du jeu (Sélections, LDC, NBA) si les fichiers sources ont changé.
# Sources : /home/dev/campagnes-v2.json, /home/dev/ldc.json, /home/dev/nba.json
set -euo pipefail

RACINE_PROJET="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$RACINE_PROJET/src/data"
SCRIPTS_DIR="$RACINE_PROJET/scripts"
ETAT_DIR="$RACINE_PROJET/.data-sources-sha"
mkdir -p "$ETAT_DIR"

SRC_CAMPAGNES="/home/dev/campagnes-v2.json"
SRC_LDC="/home/dev/ldc.json"
SRC_NBA="/home/dev/nba.json"

CIBLE_CAMPAGNES="$DATA_DIR/campagnes.json"
CIBLE_LDC="$DATA_DIR/campagnes-ldc.json"
CIBLE_NBA="$DATA_DIR/campagnes-nba.json"

quelque_chose_a_change=false
declare -A SHA_EN_ATTENTE

log() { printf '\n\033[1;34m▶ %s\033[0m\n' "$1"; }
ok()  { printf '\033[1;32m✓ %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m⚠ %s\033[0m\n' "$1"; }
err() { printf '\033[1;31m✗ %s\033[0m\n' "$1"; }

# Transforme une source (club/entraineur ou equipe/entraineur) vers le schéma interne du projet.
transformer_ldc() {
  python3 - "$SRC_LDC" "$CIBLE_LDC" <<'PY'
import json, sys
src, dst = sys.argv[1], sys.argv[2]
with open(src) as f:
    data = json.load(f)
transformed = []
for c in data:
    nc = dict(c)
    nc['pays'] = nc.pop('club')
    nc['selectionneur'] = nc.pop('entraineur')
    transformed.append(nc)
with open(dst, 'w') as f:
    json.dump(transformed, f, indent=2, ensure_ascii=False)
    f.write('\n')
print(len(transformed))
PY
}

transformer_nba() {
  python3 - "$SRC_NBA" "$CIBLE_NBA" <<'PY'
import json, sys
src, dst = sys.argv[1], sys.argv[2]
POSTE_MAP = {'Extérieur': 'EXT', 'Intérieur': 'INT'}
with open(src) as f:
    data = json.load(f)
transformed = []
for c in data:
    nc = {
        'id': c['id'],
        'pays': c['equipe'],
        'annee': c['annee'],
        'competition': c['ligue'],
        'resultat': c['resultat'],
        'selectionneur': c['entraineur'],
        'joueurs': [],
    }
    for j in c['joueurs']:
        nj = dict(j)
        nj['poste'] = POSTE_MAP[j['poste']]
        nc['joueurs'].append(nj)
    transformed.append(nc)
with open(dst, 'w') as f:
    json.dump(transformed, f, indent=2, ensure_ascii=False)
    f.write('\n')
print(len(transformed))
PY
}

# $1 = label, $2 = fichier source, $3 = fichier cible, $4 = sport (foot|ldc|nba), $5 = fonction de copie/transform
traiter() {
  local label="$1" src="$2" cible="$3" sport="$4" fonction_copie="$5"

  if [ ! -f "$src" ]; then
    warn "$label : fichier source introuvable ($src), ignoré."
    return
  fi

  log "$label : vérification des changements"

  local fichier_sha="$ETAT_DIR/$(basename "$src").sha256"
  local sha_actuel
  sha_actuel="$(sha256sum "$src" | cut -d' ' -f1)"

  if [ -f "$fichier_sha" ] && [ -f "$cible" ] && [ "$(cat "$fichier_sha")" = "$sha_actuel" ]; then
    ok "$label : aucun changement détecté."
    return
  fi

  ok "$label : changement détecté, mise à jour en cours."

  log "$label : validation du schéma"
  if ! python3 "$SCRIPTS_DIR/valider_campagnes.py" "$src" "$sport"; then
    err "$label : erreurs bloquantes dans le fichier source, mise à jour annulée."
    exit 1
  fi

  log "$label : copie vers $cible"
  $fonction_copie
  ok "$label : copié."

  SHA_EN_ATTENTE["$fichier_sha"]="$sha_actuel"
  quelque_chose_a_change=true
}

copier_campagnes() {
  cp "$SRC_CAMPAGNES" "$CIBLE_CAMPAGNES"
}

traiter "Sélections" "$SRC_CAMPAGNES" "$CIBLE_CAMPAGNES" "foot" copier_campagnes
traiter "Ligue des Champions" "$SRC_LDC" "$CIBLE_LDC" "ldc" transformer_ldc
traiter "NBA" "$SRC_NBA" "$CIBLE_NBA" "nba" transformer_nba

if [ "$quelque_chose_a_change" = false ]; then
  log "Rien à faire : toutes les sources sont déjà à jour."
  exit 0
fi

log "Vérification TypeScript (tsc --noEmit)"
(cd "$RACINE_PROJET" && npx tsc -b --noEmit)
ok "tsc propre."

log "Simulation Sélections (500 parties)"
node "$SCRIPTS_DIR/simulate.mjs" "$CIBLE_CAMPAGNES" foot 500

log "Simulation LDC (500 parties)"
node "$SCRIPTS_DIR/simulate.mjs" "$CIBLE_LDC" ldc 500

log "Simulation NBA (500 parties)"
node "$SCRIPTS_DIR/simulate.mjs" "$CIBLE_NBA" nba 500

log "Reconstruction du conteneur Docker"
(cd "$RACINE_PROJET" && docker compose up -d --build)

for fichier_sha in "${!SHA_EN_ATTENTE[@]}"; do
  echo "${SHA_EN_ATTENTE[$fichier_sha]}" > "$fichier_sha"
done

ok "Mise à jour terminée : http://localhost:8080"
