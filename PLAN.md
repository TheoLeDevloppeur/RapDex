# Plan de développement RapDex V1

Une étape = un commit testable. On ne passe à la suivante qu'après validation sur téléphone.

**Stack** : Expo (React Native) + TypeScript, expo-router, react-native-reanimated, react-native-svg, AsyncStorage, Jest.
**Référence visuelle** : [design/maquette-v1.html](design/maquette-v1.html)

- [x] **0. Prérequis** : Node.js LTS installé, Expo Go sur le téléphone.
  Validation : `node -v` affiche une version.
- [x] **1. Squelette** : projet Expo SDK 57 + TypeScript, expo-router (écrans dans `src/app/`), lint et typecheck.
  Validation : l'app s'ouvre sur le téléphone et affiche « RapDex ».
- [x] **2. Système de design** : `theme.ts` (couleurs, espacements, rayons), chargement des trois polices.
  Validation : un écran de démo montre la palette et les polices.
- [x] **3. Données artistes** : type `Artist`, `artists.json` (169 artistes, ajouts toujours en fin de liste), fonction de variante de carte (motif, mise en page, encre) testée.
  Validation : `npm test` passe.
- [x] **4. Collection persistante** : hook `useCollection` (ajouter, retirer, lister) enregistré dans AsyncStorage, testé.
  Validation : une carte ajoutée survit au redémarrage de l'app.
- [x] **5. Composant Carte** : format 5:7, 6 motifs, 3 mises en page, versions grille et détail.
  Validation : un écran galerie montre toutes les cartes, toutes différentes.
- [x] **6. Écran Collection** : compteur, filtres par genre, grille 2 colonnes, case « ? », état vide, bouton « Ajouter une carte ».
  Validation : on voit sa collection, les filtres fonctionnent.
- [ ] **7. Écran Ajouter** : recherche insensible aux accents, suggestions, sélection, artistes déjà possédés, aucun résultat, bouton de validation (sans animation).
  Validation : chercher « lay », ajouter Laylow, la carte apparaît dans la collection.
- [ ] **8. Écran Détail** : grande carte, genre, date d'ajout, retrait avec confirmation.
  Validation : toucher une carte ouvre son détail, on peut la retirer.
- [ ] **9. Le temps fort** : billet, déchirure, retournement, rayons, tampon ; vibration, passage au toucher, fondu si mouvement réduit.
  Validation : ça donne envie d'ajouter une carte.
- [ ] **10. Retour en collection** : la carte atterrit, le compteur grimpe, étiquette « NEW ».
  Validation : l'enchaînement ajout → collection est fluide.
- [ ] **11. Accessibilité** : libellés lecteur d'écran, zones de tap, taille de texte système, test VoiceOver/TalkBack.
  Validation : on peut ajouter une carte sans regarder l'écran.
- [ ] **12. Finitions et build** : icône, écran de démarrage, APK via EAS.
  Validation : l'app s'installe sans Expo Go.
