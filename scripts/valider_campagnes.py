#!/usr/bin/env python3
import json
import sys

POSTES_VALIDES = {
    'foot': {'GB', 'DC', 'DD', 'DG', 'MIL', 'ATT'},
    'nba': {'Extérieur', 'Intérieur'},
}


def valider(data, cle_equipe, cle_coach, cle_competition, postes_valides):
    erreurs = []
    ids = set()
    for c in data:
        cid = c.get('id')
        if cid in ids:
            erreurs.append(f'id dupliqué: {cid}')
        ids.add(cid)

        for req in ['id', cle_equipe, 'annee', cle_competition, 'resultat', cle_coach, 'joueurs']:
            if req not in c:
                erreurs.append(f'{cid}: champ manquant {req}')

        noms = {}
        for j in c.get('joueurs', []):
            for req in ['numero', 'nom', 'poste', 'note']:
                if req not in j:
                    erreurs.append(f'{cid}/{j.get("nom", "?")}: champ joueur manquant {req}')
            if j.get('poste') not in postes_valides:
                erreurs.append(f'{cid}/{j.get("nom")}: poste invalide {j.get("poste")}')
            if not isinstance(j.get('note'), (int, float)):
                erreurs.append(f'{cid}/{j.get("nom")}: note invalide {j.get("note")}')
            if 'note_booster' in j and not isinstance(j['note_booster'], (int, float)):
                erreurs.append(f'{cid}/{j.get("nom")}: note_booster invalide {j.get("note_booster")}')
            noms.setdefault(j['nom'], []).append(j)

        for nom, occ in noms.items():
            if len(occ) > 1:
                erreurs.append(f'{cid}: doublon {nom} x{len(occ)} (avertissement, non bloquant)')

    return erreurs


def main():
    if len(sys.argv) != 3:
        print('Usage: valider_campagnes.py <fichier.json> <foot|ldc|nba>', file=sys.stderr)
        sys.exit(2)

    fichier, sport = sys.argv[1], sys.argv[2]
    with open(fichier) as f:
        data = json.load(f)

    if sport == 'nba':
        cle_equipe, cle_coach, cle_competition = 'equipe', 'entraineur', 'ligue'
        postes = POSTES_VALIDES['nba']
    elif sport == 'ldc':
        cle_equipe, cle_coach, cle_competition = 'club', 'entraineur', 'competition'
        postes = POSTES_VALIDES['foot']
    else:
        cle_equipe, cle_coach, cle_competition = 'pays', 'selectionneur', 'competition'
        postes = POSTES_VALIDES['foot']

    erreurs = valider(data, cle_equipe, cle_coach, cle_competition, postes)

    bloquantes = [e for e in erreurs if 'non bloquant' not in e]
    avertissements = [e for e in erreurs if 'non bloquant' in e]

    for a in avertissements:
        print(f'AVERTISSEMENT: {a}')
    for e in bloquantes:
        print(f'ERREUR: {e}')

    print(f'{len(data)} campagnes, {len(bloquantes)} erreur(s) bloquante(s), {len(avertissements)} avertissement(s).')
    sys.exit(1 if bloquantes else 0)


if __name__ == '__main__':
    main()
