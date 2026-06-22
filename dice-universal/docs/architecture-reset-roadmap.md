# Dice Universal — Architecture Reset Roadmap

## Objectif

Remettre l’application sur des bases produit et techniques propres sans casser le moteur existant.

## Gel fonctionnel

Pendant cette phase, aucune nouvelle fonctionnalité majeure n’est ajoutée.

## Concepts métier officiels

- Table = contexte de jeu / système / univers
- Profil = personnage, PNJ, créature ou entité
- Action / Set = capacité ou jet préparé
- Entrée = ligne précise de dés
- Dé = instance ou groupe de dés
- Comportement = règle de lecture, transformation ou interprétation
- Résultat = sortie lisible joueur
- Événement = critique, complication, explosion, relance, degré, palier

## Écrans cibles

### Table de lancer

Accueil simple, premium, lancement immédiat.

### Préparation du jeu

Organisation avancée : tables, profils, actions/sets, entrées, comportements.

### Comportements

Bibliothèque, création guidée, édition avancée, aperçu.

### Historique

Consultation, relance, nettoyage.

### Réglages

Préférences app, haptics, sons, animations, thème.

## Zones à auditer

- app/
- screens/
- features/roll/
- features/roll3d/
- features/tables/
- features/rules/
- core/roll/
- core/rules/
- data/db/
- data/repositories/
- data/state/

## Fichiers suspects / legacy à vérifier

- anciens fichiers RollScreen
- anciens composants de résultat
- anciens modals de règles
- rulesetsRepo.ts
- doublons ids.ts
- usages restants de ArcaneTheme dans les écrans premium

## Checklist de non-régression

- lancer simple sans table active
- lancer avec table active
- lancer avec profil/action
- comportement somme
- comportement seuil
- comportement seuil avec degrés
- pool de succès
- complication
- critique
- explosion
- relance
- historique
- sauvegarde action/set