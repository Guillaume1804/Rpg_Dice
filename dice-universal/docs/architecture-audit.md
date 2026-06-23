# Dice Universal — Architecture Audit

## Objectif

Auditer l’application existante avant refactor, sans casser le moteur ni ajouter de nouvelles fonctionnalités.

## État de branche

- Branche de travail :
- Date :
- Dernier commit main intégré :
- Objectif de la branche :

## 1. Navigation actuelle

## 1. Navigation actuelle

### Routes Expo Router détectées

- `/` → redirection actuelle vers `/roll`
- `/(tabs)/roll` → écran Jet actuel / table de lancer actuelle
- `/(tabs)/tables` → liste des tables
- `/tables/[id]` → détail table, profils, actions, dés, règles
- `/(tabs)/history` → historique
- `/(tabs)/rules` → règles / comportements
- `/(tabs)/settings` → paramètres

### Diagnostic

La navigation actuelle est encore organisée par modules techniques : Jet, Tables, Historique, Règles, Paramètres.

La navigation cible doit être organisée par intention utilisateur :

- Table de lancer
- Préparation du jeu
- Comportements
- Réglages
- Historique accessible depuis Table/Résultat ou onglet secondaire

### Risque

Si on garde `Tables` comme destination principale, l’utilisateur est poussé vers une logique d’administration au lieu d’une logique de jeu.

### Écrans principaux actuels

À compléter.

### Écrans à conserver

À compléter.

### Écrans à fusionner ou déplacer

À compléter.

### Écrans suspects / legacy

À compléter.

## 2. Modèle de données actuel

### Diagnostic

Le modèle SQLite est fonctionnel mais certains noms techniques sont hérités d’une ancienne vision.

- `tables` correspond bien à Table.
- `profiles` correspond bien à Profil.
- `groups` correspond plutôt à Action / Set.
- `group_dice` correspond plutôt à Entrée.
- `rules` correspond à Comportement.
- `roll_events` correspond à Historique / événements de jet.

### Décision provisoire

Ne pas renommer les tables SQLite maintenant.

Créer plus tard une couche de mapping :

- GroupRow → ActionSet
- GroupDieRow → ActionEntry
- RuleRow → BehaviorDefinition / BehaviorRef
- GroupRollResult → RollResultPresentation

### Fichier suspect

- `data/repositories/rulesetsRepo.ts`
  - À vérifier : semble référencer une table `rulesets` absente du schéma actuel.

### Tables SQLite

À compléter.

### Repositories

À compléter.

### Mapping produit cible

| Produit cible | Nom technique actuel | Commentaire |
|---|---|---|
| Table | tables | OK |
| Profil | profiles | OK |
| Action / Set | groups | Nom legacy |
| Entrée | group_dice | Nom legacy |
| Comportement | rules | OK mais à clarifier |
| Historique | roll_events | OK |

## 3. Moteur de jet et comportements

### Fichiers core détectés

- `core/roll/roll.ts`
- `core/rules/types.ts`
- `core/rules/evaluate.ts`
- `core/rules/behaviorRegistry.ts`
- `core/rules/builtins.ts`

### Diagnostic

Le moteur est déjà relativement bien séparé de l’UI.

Le risque principal n’est pas dans le moteur mais dans les couches qui préparent les jets et affichent les résultats.

### Décision

Ne pas modifier le moteur pendant la Phase 0.

Créer plus tard une couche de présentation commune pour transformer les résultats moteur en résultat lisible joueur.

### Fichiers core

À compléter.

### Comportements supportés

À compléter.

### Zones à ne pas casser

À compléter.

## 4. Écrans et responsabilités

### Écran suspect majeur : `app/tables/[id].tsx`

Diagnostic :

Cet écran contient trop de responsabilités :

- affichage détail table
- gestion profils
- gestion actions/groupes
- gestion dés
- sélection de règles
- création d’action via wizard
- création/édition de règle avancée
- modales multiples
- orchestration de refresh

Décision :

Ne pas le supprimer.

Le transformer progressivement en écran de Préparation du jeu, puis extraire :

- un conteneur de données
- des sections UI
- des hooks d’action
- des modales spécialisées
- le wizard de création de Set/Action
- l’éditeur de comportement

### Table de lancer

À compléter.

### Préparation du jeu

À compléter.

### Comportements

À compléter.

### Historique

À compléter.

### Réglages

À compléter.

## 5. Hooks majeurs

À compléter.

## 6. Composants majeurs

À compléter.

## 7. Fichiers suspects / obsolètes

À compléter.

## 8. Risques identifiés

À compléter.

## 9. Checklist de non-régression

À compléter.

## 10. Premiers doublons fonctionnels identifiés

### Doublon fonctionnel : préparation de jet

Fichiers concernés :

- `screens/RollScreen.tsx`
- `screens/GamePreparationScreen.tsx`
- `app/(tabs)/prepare.tsx`
- `features/roll/*`
- `features/roll3d/logic/roll3DHandoff.ts`

Diagnostic :

`RollScreen.tsx` contient encore beaucoup de logique de préparation, édition, sauvegarde, configuration rapide et handoff vers Roll3D.

Décision provisoire :

- `RollScreen.tsx` devient un fichier de transition.
- `GamePreparationScreen.tsx` doit devenir l’écran cible de Préparation du jeu.
- Ne rien supprimer avant d’avoir audité `GamePreparationScreen.tsx` et `app/(tabs)/prepare.tsx`.

---

### Doublon fonctionnel : résultat de jet

Fichiers concernés :

- `features/roll/components/ResultPanel.tsx`
- `features/roll/components/RollResultCard.tsx`
- `features/roll/premium/PremiumResultCard.tsx`
- `features/roll/renderers/rollResultRenderer.ts`
- `features/roll/result/rollResultViewModel.ts`
- `features/roll3d/presentation/roll3DResultPresentation.ts`
- `features/roll3d/presentation/roll3DResultSkinEvents.ts`
- `features/roll3d/components/Roll3DResultOverlay.tsx`

Diagnostic :

Il existe probablement deux systèmes de présentation du résultat :

- ancien système Roll/RollScreen
- nouveau système Roll3D

Décision provisoire :

Créer en Phase 4 une couche commune `features/rollResult/presentation`.

---

### Doublon fonctionnel : création/configuration de comportements

Fichiers concernés :

- `features/rules/components/HumanRuleEditorModal.tsx`
- `features/rules/ruleWizard/*`
- `features/rules/guidedBehavior/*`
- `features/tables/actionWizard/*`
- `features/roll/components/QuickBehaviorConfigModal.tsx`
- `features/roll/components/QuickDieBehaviorPickerModal.tsx`

Diagnostic :

Plusieurs parcours permettent de créer, choisir ou configurer des règles/comportements.

Décision provisoire :

Ne pas fusionner maintenant.

En Phase 1/2, définir les responsabilités :

- Comportements = création/édition profonde
- Préparation = choix et configuration contrôlée
- Table de lancer = ajustement rapide temporaire

## 11. Audit des écrans de transition

### Route `prepare`

Fichiers :

- `app/(tabs)/prepare.tsx`
- `screens/GamePreparationScreen.tsx`
- `screens/RollScreen.tsx`

Diagnostic :

La route `prepare` existe déjà, mais elle pointe vers `GamePreparationScreen`, qui réexporte temporairement `RollScreen`.

`GamePreparationScreen` représente la bonne intention produit : Préparation du jeu.

Cependant, l’écran cible n’est pas encore indépendant. Toute la logique de préparation est encore portée par `RollScreen`.

Décision :

- Conserver ce fonctionnement pendant la Phase 0.
- Classer `RollScreen` comme écran de transition.
- En Phase 5, commencer à extraire les responsabilités de préparation vers `GamePreparationScreen`.

---

### Route `tables`

Fichiers :

- `app/(tabs)/tables.tsx`
- `screens/TablesScreen.tsx`
- `app/tables/[id].tsx`
- `features/tables/*`

Diagnostic :

`TablesScreen` est fonctionnel et relativement clair, mais son rôle produit devrait être intégré à Préparation du jeu.

Il gère actuellement :

- liste des tables
- création de table
- suppression de table
- activation/désactivation de la table active
- navigation vers le détail table
- affichage de statistiques profils/actions/entrées

Décision :

- Garder `TablesScreen` temporairement.
- Le considérer comme une future sous-section de Préparation.
- Ne pas le supprimer tant que `GamePreparationScreen` n’a pas repris ce rôle.

---

### Route `rules`

Fichiers :

- `app/(tabs)/rules.tsx`
- `screens/RulesScreen.tsx`
- `features/rules/guidedBehavior/*`
- `features/rules/components/HumanRuleEditorModal.tsx`
- `features/rules/ruleWizard/*`

Diagnostic :

`RulesScreen` est déjà proche de la cible produit “Comportements”.

Il propose :

- un atelier de comportements
- une bibliothèque
- des comportements système et personnalisés
- un builder guidé
- un aperçu de comportement
- un éditeur expert legacy

Décision :

- Renommer mentalement `rules` en `behaviors`.
- Garder le builder guidé comme parcours principal.
- Classer `HumanRuleEditorModal` comme mode expert / fallback legacy.
- Auditer plus tard `ruleWizard/*`, qui semble probablement ancien ou redondant avec `guidedBehavior/*`.

## 12. Candidat suppression Phase 6

### `data/repositories/rulesetsRepo.ts`

Diagnostic :

Le fichier référence une table `rulesets`, mais aucun usage applicatif réel n’a été trouvé hors documentation et file-map.

Commande utilisée :

grep -R -E "rulesets|getRulesetById|RulesetRow" -n . --exclude-dir=node_modules --exclude-dir=.git

Décision :

Ne pas supprimer en Phase 0.

Marquer comme candidat suppression Phase 6 après validation typecheck + recherche finale.

## 13. Audit Roll3D

### Chaîne Roll3D actuelle

La chaîne actuelle est :

- `screens/Roll3DScreen.tsx`
- `features/roll3d/components/Roll3DLauncherSurface.tsx`
- `features/roll3d/hooks/useRoll3DLauncher.ts`
- `features/roll3d/logic/roll3DDraft.ts`
- `features/roll3d/logic/roll3DEngine.ts`
- `core/roll/roll.ts`
- `core/rules/evaluate.ts`
- `features/roll3d/presentation/roll3DResultPresentation.ts`
- `features/roll3d/presentation/roll3DResultSkinEvents.ts`
- `features/roll3d/components/Roll3DResultOverlay.tsx`

### Diagnostic

La structure globale Roll3D est saine : le calcul officiel reste centralisé dans `core/roll/roll.ts` et `core/rules/evaluate.ts`.

`roll3DEngine.ts` sert de couche d’adaptation entre les dés visuels Roll3D et le moteur officiel.

`roll3DResultPresentation.ts` est une bonne base pour le futur Result Reveal System commun.

`roll3DResultSkinEvents.ts` prépare correctement les futurs thèmes, skins, sons, haptics et animations sans modifier la logique du jet.

### Point important

Le moteur physique / rendu 3D actuel ne correspond pas encore à la qualité souhaitée pour la V1.

Décision :

- Ne pas confondre architecture Roll3D et moteur physique actuel.
- Préserver les couches draft / engine / presentation.
- Remplacer ou améliorer plus tard la couche `DiceTable3D` / physique sans casser le reste.

### Zone à refactorer plus tard

`Roll3DLauncherSurface.tsx` est devenu trop chargé.

Il gère actuellement :

- table active
- profils
- actions
- entrées
- ajustements
- sauvegarde d’action ajustée
- sélection table/profil
- conversion action vers draft
- lancement
- résultat
- modal de sauvegarde
- reset de scène 3D

Décision :

En Phase 0, ne pas modifier.

En Phase 5 ou phase dédiée Roll3D, extraire progressivement :

- un hook de session Roll3D
- un hook d’actions Roll3D
- un hook d’ajustement Roll3D
- un hook de sauvegarde d’action ajustée
- un mapper DB legacy vers draft Roll3D
- un composant modal séparé pour la sauvegarde


## 14. Audit Roll3D — scène 3D, physique et renderer

### Fichiers audités

- `features/roll3d/components/DiceTable3D.tsx`
- `features/roll3d/physics/Roll3DPhysicsWorld.ts`
- `features/roll3d/physics/Roll3DPhysicsTypes.ts`
- `features/roll3d/renderer/DiceMeshFactory.ts`

### Diagnostic global

La couche 3D actuelle est suffisante pour valider le flux Roll3D, mais pas encore suffisante pour la qualité premium attendue en V1.

La bonne nouvelle est que la physique est déjà relativement isolée :

- `DiceTable3D.tsx` orchestre Three.js / GLView / animation.
- `Roll3DPhysicsWorld.ts` isole `cannon-es`.
- `Roll3DPhysicsTypes.ts` fournit des types de transform/snapshot.
- `DiceMeshFactory.ts` isole la création des meshes de dés.

### Décision

Ne pas remplacer le moteur physique pendant la Phase 0.

Conserver l’architecture Roll3D actuelle, mais marquer la couche physique/rendu comme future zone de remplacement.

### Point fort

`DiceTable3D` expose déjà un contrat presque correct :

- `diceInstances`
- `rollRequestId`
- `skipRollRequestId`
- `onPhysicsRollSettled`

Ce contrat doit être préservé afin de pouvoir remplacer l’implémentation 3D plus tard.

### Point faible

`DiceTable3D.tsx` mélange encore :

- création scène Three.js
- caméra
- lumières
- table visuelle
- ombres
- animation de chute
- simulation physique
- transition cinématique
- skip / reveal
- stabilisation
- nettoyage mémoire

Il doit être considéré comme une implémentation temporaire de scène, pas comme une architecture finale.

### Physique actuelle

`Roll3DPhysicsWorld.ts` utilise `cannon-es`, mais les collisions de dés sont approximées par des boîtes.

Cela donne une simulation stable, mais pas assez réaliste pour une V1 premium.

Décision :

- garder temporairement pour valider le flux ;
- remplacer ou améliorer avant publication V1 ;
- éviter que la logique produit dépende de `cannon-es`.

### Renderer actuel

`DiceMeshFactory.ts` crée des géométries de dés simples et prépare plusieurs skins.

Limites actuelles :

- pas de vraies faces numérotées ;
- pas de face finale orientée vers l’utilisateur ;
- pas de correspondance visuelle stricte entre valeur officielle et face visible ;
- matériaux encore simples.

Décision :

Le renderer actuel est une base temporaire. La V1 devra prévoir des dés plus qualitatifs ou une stratégie de reveal qui affiche clairement la valeur officielle.

### Décision produit importante

Pour la V1, la vérité du résultat doit rester le moteur officiel Dice Universal.

La physique 3D doit servir l’expérience et la mise en scène, mais ne doit pas devenir la source de vérité des règles.

Orientation recommandée :

- moteur officiel calcule le résultat ;
- animation 3D accompagne le lancer ;
- reveal final oriente ou affiche les faces cohérentes avec le résultat officiel.

## 15. Audit TableDetail / préparation legacy

### Fichiers audités

- `features/tables/hooks/useTableDetailData.ts`
- `features/tables/hooks/useTableDetailActions.ts`
- `features/tables/hooks/useTableDetailUi.ts`
- `features/tables/actionWizard/useCreateActionWizard.ts`
- `features/tables/actionWizard/useCreateActionFromWizard.ts`
- `features/tables/actionWizard/types.ts`

### Diagnostic global

La zone `features/tables` est fonctionnelle et relativement structurée, mais elle correspond encore à une logique d'administration technique de table.

Elle manipule encore les concepts legacy :

- Group
- GroupDie
- Rule

La cible produit doit reformuler ces concepts en :

- Action / Set
- Entrée
- Comportement

### `useTableDetailData.ts`

Ce hook charge :

- table
- profils
- groupes/actions
- dés/entrées
- règles

Il est plutôt sain et peut servir de base à un futur hook de préparation.

Décision :

- conserver ;
- renommer mentalement `groups` en `actions/sets` côté produit ;
- filtrer plus tard les règles par compatibilité, table, scope et usage.

### `useTableDetailActions.ts`

Ce hook regroupe les actions CRUD :

- table
- profil
- groupe/action
- dé/entrée
- règle de groupe

Il est utile, mais trop large.

Décision :

- conserver pendant la transition ;
- extraire plus tard en hooks plus orientés Préparation :
  - table actions
  - profile actions
  - action/set actions
  - entry actions
  - behavior assignment

### `useTableDetailUi.ts`

Ce hook centralise beaucoup d’états de modales.

Diagnostic :

L’écran fonctionne encore comme une interface CRUD à modales.

Décision :

- conserver en Phase 0 ;
- ne pas en faire le modèle final de `GamePreparationScreen`.

### ActionWizard

Le wizard suit actuellement :

- name
- type
- dice
- rule_choice
- behavior
- summary

Il est déjà en transition entre une action à un seul dé et une action composée de plusieurs dés/entrées.

Preuve :

- `die` est conservé pour compatibilité legacy ;
- `dice` devient la vraie source pour les actions composées.

Décision :

- conserver temporairement ;
- faire évoluer vers un wizard Action/Set ;
- ne pas supprimer tant que `GamePreparationScreen` n’a pas repris la création complète d’actions.

### Création de comportement dans ActionWizard

Le wizard d’action contient aussi beaucoup de paramètres de comportement.

Diagnostic :

Il existe un doublon fonctionnel partiel avec :

- `RulesScreen`
- `GuidedBehaviorWizard`
- `QuickBehaviorConfigModal`
- ajustements Roll3D

Décision produit :

- Comportements = création profonde et bibliothèque.
- Préparation = création d’action/set avec choix ou variante simple de comportement.
- Roll3D = ajustement temporaire avant lancer, avec sauvegarde possible en variante.

## 16. Audit Comportements — GuidedBehavior vs RuleWizard vs HumanRuleEditor

### Fichiers audités

- `features/rules/guidedBehavior/useGuidedBehaviorWizard.ts`
- `features/rules/guidedBehavior/types.ts`
- `features/rules/guidedBehavior/buildGuidedBehaviorPayload.ts`
- `features/rules/guidedBehavior/guidedBehaviorRuleAdapter.ts`
- `features/rules/ruleWizard/useRuleWizard.ts`
- `features/rules/ruleWizard/types.ts`
- `features/rules/components/HumanRuleEditorModal.tsx`

### Diagnostic global

La zone `guidedBehavior` est la meilleure base pour le futur atelier de comportements.

Elle organise la création par intention utilisateur :

- utilisation prévue
- dés compatibles
- type de comportement
- transformations avant résultat
- événements spéciaux
- résumé
- identité

Cette approche correspond mieux à la cible premium de Dice Universal que les anciens formulaires techniques.

### GuidedBehavior

Décision :

`features/rules/guidedBehavior/*` devient le builder principal futur.

Points forts :

- vocabulaire plus humain ;
- applicationMode au lieu d’exposer directement entry/group/both ;
- séparation claire transforms / reading / events / output ;
- capacité à produire soit une règle simple, soit un pipeline ;
- possibilité d’éditer des règles existantes compatibles via `guidedBehaviorRuleAdapter`.

### buildGuidedBehaviorPayload

Ce fichier est critique.

Il transforme un `GuidedBehaviorDraft` en `CreateRuleInput`.

Il décide automatiquement si la règle peut rester simple ou doit devenir un pipeline.

Décision :

À préserver.

Cette logique incarne l’objectif produit : rendre la puissance technique invisible pour l’utilisateur.

### guidedBehaviorRuleAdapter

Ce fichier permet de reconstruire un draft guidé depuis une règle existante.

Décision :

À conserver.

Point de vigilance :

Toutes les anciennes règles ou pipelines complexes ne seront pas forcément parfaitement représentables dans le builder guidé. Le mode expert doit donc rester disponible.

### RuleWizard

`features/rules/ruleWizard/*` correspond à l’ancien parcours de création de règles.

Il expose plus directement :

- behaviorKey
- scope
- supportedSidesText
- champs techniques de comportement

Décision :

Le classer comme legacy candidate.

Ne pas supprimer en Phase 0.

À terme, `CreateGuidedBehaviorWizardModal` doit remplacer `CreateRuleWizardModal`.

### HumanRuleEditorModal

`HumanRuleEditorModal` est un éditeur avancé.

Il reste utile pour :

- consulter des règles système ;
- modifier des règles non compatibles avec le builder guidé ;
- accéder à des paramètres techniques ;
- tester manuellement une règle.

Décision :

Le conserver comme mode expert / fallback.

Il ne doit pas être le parcours principal de création de comportements.