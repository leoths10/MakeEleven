import { readFileSync } from 'fs';

const fichier = process.argv[2];
const formationArg = process.argv[3];
const PARTIES = Number(process.argv[4] || 500);

if (!fichier || !formationArg) {
  console.error('Usage: node simulate.mjs <fichier.json> <foot|ldc|nba> [nbParties]');
  process.exit(1);
}

const FORMATIONS = {
  foot: [
    { id: 'GB', postes: ['GB'] },
    { id: 'DG', postes: ['DG'] },
    { id: 'DC1', postes: ['DC'] },
    { id: 'DC2', postes: ['DC'] },
    { id: 'DD', postes: ['DD'] },
    { id: 'MC1', postes: ['MIL'] },
    { id: 'MC2', postes: ['MIL'] },
    { id: 'MC3', postes: ['MIL'] },
    { id: 'AG', postes: ['ATT'] },
    { id: 'BU', postes: ['ATT'] },
    { id: 'AD', postes: ['ATT'] },
  ],
  nba: [
    { id: 'INT1', postes: ['INT'] },
    { id: 'INT2', postes: ['INT'] },
    { id: 'EXT1', postes: ['EXT'] },
    { id: 'EXT2', postes: ['EXT'] },
    { id: 'EXT3', postes: ['EXT'] },
  ],
};
FORMATIONS.ldc = FORMATIONS.foot;

const FORMATION = FORMATIONS[formationArg];
if (!FORMATION) {
  console.error(`Formation inconnue: ${formationArg} (attendu: foot, ldc, nba)`);
  process.exit(1);
}
const TAILLE = FORMATION.length;

const campagnes = JSON.parse(readFileSync(fichier, 'utf-8'));

function melanger(arr) {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function slotsLibres(composition) {
  const occupes = new Set(composition.map((j) => j.slotId));
  return FORMATION.filter((s) => !occupes.has(s.id));
}

function slotsCompatibles(poste, disponibles) {
  return disponibles.filter((s) => s.postes.includes(poste));
}

function tirer(composition, nomsUtilises) {
  const disponibles = slotsLibres(composition);
  if (disponibles.length === 0) return null;
  const campagnesMel = melanger(campagnes);
  for (const camp of campagnesMel) {
    const eligibles = camp.joueurs.filter(
      (j) => slotsCompatibles(j.poste, disponibles).length > 0 && !nomsUtilises.has(j.nom)
    );
    if (eligibles.length >= 1) {
      const choisis = melanger(eligibles)
        .slice(0, Math.min(5, eligibles.length))
        .sort((a, b) => a.note - b.note);
      return { campagne: camp, joueurs: choisis };
    }
  }
  return null;
}

let echecs = 0;

for (let partie = 0; partie < PARTIES; partie++) {
  let composition = [];
  let nomsUtilises = new Set();
  let tours = 0;

  while (composition.length < TAILLE && tours < 200) {
    tours++;
    const resultat = tirer(composition, nomsUtilises);
    if (!resultat) {
      console.log(
        `Partie ${partie}: tirage impossible avec ${composition.length}/${TAILLE} joueurs, slots libres:`,
        slotsLibres(composition).map((s) => s.id)
      );
      echecs++;
      break;
    }
    const { campagne, joueurs } = resultat;
    for (let i = 1; i < joueurs.length; i++) {
      if (joueurs[i].note < joueurs[i - 1].note) {
        console.log(`Partie ${partie}: BUG - ordre de note non croissant`, joueurs.map((j) => j.note));
        echecs++;
      }
    }
    const disponibles = slotsLibres(composition);
    const joueurChoisi = joueurs[Math.floor(Math.random() * joueurs.length)];
    const compatibles = slotsCompatibles(joueurChoisi.poste, disponibles);
    if (compatibles.length === 0) {
      console.log(`Partie ${partie}: BUG - joueur choisi non compatible`, joueurChoisi);
      echecs++;
      break;
    }
    const slot = compatibles[0];
    composition.push({ ...joueurChoisi, slotId: slot.id, campagneId: campagne.id });
    nomsUtilises.add(joueurChoisi.nom);
  }

  if (composition.length === TAILLE) {
    const slotsUtilises = new Set(composition.map((j) => j.slotId));
    if (slotsUtilises.size !== TAILLE) {
      console.log(`Partie ${partie}: BUG - doublon de slot`, composition.map((j) => j.slotId));
      echecs++;
    }
  } else if (tours >= 200) {
    console.log(`Partie ${partie}: boucle infinie suspectée`);
    echecs++;
  }
}

console.log(`${PARTIES} parties simulées (${fichier}, formation ${formationArg}), ${echecs} échec(s).`);
process.exit(echecs > 0 ? 1 : 0);
