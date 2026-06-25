# Phase 2 — Extraction progressive de RollScreen vers features/preparation

## Objectif de la phase

La Phase 2 avait pour objectif de réduire progressivement les responsabilités de `RollScreen` sans casser le comportement actuel.

`RollScreen` reste une implémentation legacy temporaire, encore utilisée par `GamePreparationScreen`, mais il ne doit plus recevoir de nouvelle responsabilité produit majeure.

La logique durable doit progressivement vivre dans :

- `domain/*`
- `features/preparation/*`
- `features/roll3d/*`
- `features/rollResult/*`
- `data/repositories/*`

---

## Ce qui a été fait

### Écran et responsabilité

- `GamePreparationScreen` est devenu un écran explicite.
- `RollScreen` a reçu une note d’architecture indiquant son rôle legacy.
- La structure `features/preparation/*` a été créée.

### Helpers extraits

- Helpers de recherche et formatage du jet préparé.
- Helpers de transition vers Roll3D.
- Helper de persistance des règles temporaires.
- Helper d’alerte doublon d’action.
- Constantes de préparation.
- Types UI de préparation.
- Helper d’animation layout.
- View-model de carte Jet préparé.
- Helpers d’items de menus session.
- Validations de sauvegarde d’action.
- Helpers de reset d’état.
- Helper de règle de prévisualisation.
- Types de sauvegarde Préparation.
- Helpers de noms par défaut de sauvegarde.
- Helpers de densité/layout de base.

### Documentation

- Responsabilités finales des écrans documentées dans `docs/screen-responsibilities.md`.

---

## Ce qui reste volontairement dans RollScreen

Certains blocs restent dans `RollScreen` car ils sont encore très couplés à l’ancienne UX :

- orchestration complète de `useQuickRollDraft`;
- orchestration complète de `useDraftTableActions`;
- `PreparedRollEditSheet`;
- `PreparedRollSaveSheet`;
- `QuickBehaviorConfigModal`;
- `QuickDieBehaviorPickerModal`;
- logique complète de session table/profil;
- rendu actuel du cockpit premium de préparation;
- prévisualisation temporaire du résultat.

Ces blocs ne doivent pas être extraits brutalement maintenant.

Ils devront être migrés lorsque `GamePreparationScreen` deviendra un vrai écran autonome.

---

## Prochaine grande étape

La suite logique est une Phase 3 dédiée à la création progressive du vrai écran Préparation.

Objectif cible :

- `GamePreparationScreen` ne doit plus être un simple wrapper de `RollScreen`;
- la préparation doit être organisée en sections claires;
- les hooks doivent refléter les responsabilités réelles;
- `RollScreen` doit pouvoir être supprimé ou réduit à un simple fichier legacy temporaire.

Exemples de futurs éléments :

- `usePreparationSession`
- `usePreparedRollState`
- `usePreparationSaveActions`
- `usePreparationBehaviorFlow`
- `PreparationSessionHeader`
- `PreparationDicePickerSection`
- `PreparationPreparedRollSection`
- `PreparationActionRailSection`
- `PreparationSaveSheetController`

---

## Règle de prudence

Ne pas extraire du code uniquement pour déplacer du legacy.

Chaque extraction future doit soit :

- clarifier une responsabilité durable ;
- préparer un vrai écran autonome ;
- réduire un couplage réel ;
- permettre un futur Result Reveal System commun ;
- préserver le cap Roll3D premium.

---

## Cap produit

Le cap reste :

- Préparation claire ;
- Roll3D comme écran officiel de lancement ;
- résultat premium / jeu mobile premium 2026 ;
- puissance technique masquée derrière une UX progressive ;
- moteur de règles stable et universel.