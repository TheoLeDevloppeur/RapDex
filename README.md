# RapDex

Le Pokédex des rappeurs, chanteurs et DJ que tu as vus en concert.

## Lancer l'app

Prérequis : Node.js LTS, et l'app **Expo Go** sur ton téléphone (même réseau Wi-Fi que le PC).

```bash
npm install
npm start
```

Scanne le QR code affiché dans le terminal avec Expo Go (Android) ou l'appareil photo (iPhone).

Autres commandes : `npm run web` (version navigateur), `npm run lint`, `npm run typecheck`.

## Organisation

- `src/app/` : les écrans (expo-router, un fichier = un écran)
- `src/` : le reste du code (composants, données, thème)
- `PLAN.md` : le plan de développement étape par étape

## Maquette V1

[design/maquette-v1.html](design/maquette-v1.html) : système de design et prototype interactif au format téléphone (Collection, Ajouter une carte, Détail). Ouvre le fichier dans un navigateur.
