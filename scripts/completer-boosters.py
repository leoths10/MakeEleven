#!/usr/bin/env python3
"""Donne une note_booster à chaque joueur des fichiers sources.

Le bonus grandit avec la note de base, dans le prolongement de la courbe des
boosters écrits à la main (~+6 pour un remplaçant, ~+20 pour un cadre),
plafonné à 120 comme les valeurs existantes.

Une note_booster déjà présente n'est jamais abaissée : on garde la plus haute
des deux valeurs. Les curations généreuses (Yamal 88 -> 112) survivent donc
telles quelles, tandis que les plus timides sont remontées à la courbe pour
qu'un cadre ne finisse jamais sous un remplaçant en mode boosté.

Idempotent : relancer le script ne change plus rien une fois la passe faite.

Usage: completer-boosters.py <fichier.json> [<fichier.json> ...]
"""
import json
import math
import sys

NOTE_PLANCHER = 62   # note de base la plus faible du jeu
BONUS_PLANCHER = 6   # bonus accordé à cette note de base
PENTE = 0.5          # points de bonus gagnés par point de note de base
PLAFOND = 120        # note boostée maximale (aligné sur les boosters curatés)


def note_boostee(note: float) -> int:
    bonus = BONUS_PLANCHER + (note - NOTE_PLANCHER) * PENTE
    return min(PLAFOND, math.floor(note + bonus + 0.5))


def completer(chemin: str) -> tuple[int, int, int]:
    with open(chemin) as f:
        campagnes = json.load(f)

    ajoutes = 0
    releves = 0
    total = 0
    for campagne in campagnes:
        joueurs = []
        for joueur in campagne['joueurs']:
            total += 1
            courbe = note_boostee(joueur['note'])
            existant = joueur.get('note_booster')

            if existant is None:
                ajoutes += 1
            elif existant < courbe:
                releves += 1
            else:
                joueurs.append(joueur)
                continue

            # On reconstruit le dict pour glisser note_booster juste après note.
            complete = {}
            for cle, valeur in joueur.items():
                if cle == 'note_booster':
                    continue
                complete[cle] = valeur
                if cle == 'note':
                    complete['note_booster'] = courbe
            joueurs.append(complete)
        campagne['joueurs'] = joueurs

    with open(chemin, 'w') as f:
        json.dump(campagnes, f, indent=2, ensure_ascii=False)
        f.write('\n')

    return ajoutes, releves, total


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        sys.exit(2)

    for chemin in sys.argv[1:]:
        ajoutes, releves, total = completer(chemin)
        print(f'{chemin} : {ajoutes} booster(s) ajouté(s), {releves} relevé(s) à la courbe, sur {total} joueurs.')


if __name__ == '__main__':
    main()
