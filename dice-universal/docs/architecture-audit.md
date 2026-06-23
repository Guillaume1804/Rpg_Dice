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