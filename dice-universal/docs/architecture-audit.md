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

### Fichiers core

À compléter.

### Comportements supportés

À compléter.

### Zones à ne pas casser

À compléter.

## 4. Écrans et responsabilités

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