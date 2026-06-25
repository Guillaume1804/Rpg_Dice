# Dice Universal — Responsabilités des écrans

## Objectif

Ce document fixe la frontière entre les écrans principaux de Dice Universal après la refonte architecture / Roll3D / Préparation.

Le but est d’éviter que `RollScreen` ou un autre écran redevienne un fichier central qui porte toute la logique produit.

---

## Principe général

L’application doit être structurée autour de deux grands espaces :

1. **Table de lancer / Roll3D**
   - lancer réellement les dés ;
   - afficher la table 3D ;
   - gérer la mise en scène du lancer ;
   - afficher le résultat final premium ;
   - exploiter les événements de résultat pour les effets visuels, sons, haptics et skins.

2. **Préparation du jeu / GamePreparationScreen**
   - choisir le contexte de jeu ;
   - choisir table et profil ;
   - préparer des jets ;
   - modifier les entrées de dés ;
   - configurer les comportements ;
   - sauvegarder ou mettre à jour des actions ;
   - envoyer un jet prêt vers Roll3D.

---

## Roll3D / écran de lancement

Roll3D est l’écran officiel de lancement.

Il doit porter :

- la table de lancer visuelle ;
- les dés posés sur la table ;
- la physique ou simulation du lancer ;
- le bouton principal de lancer ;
- la réception d’un handoff depuis la Préparation ;
- l’exécution officielle du jet via le moteur ;
- l’affichage du résultat premium ;
- les hooks d’événements pour thèmes / skins ;
- l’historique récent de lancer si nécessaire.

Il ne doit pas porter :

- la création complète des tables ;
- l’édition avancée des profils ;
- la construction complète des comportements ;
- les formulaires lourds de sauvegarde ;
- la logique métier durable des tables/profils/actions ;
- la logique de résultat elle-même en dehors du moteur officiel.

---

## GamePreparationScreen / écran Préparation

GamePreparationScreen est l’écran officiel de préparation.

Il doit porter :

- la session active ;
- la sélection de table ;
- la sélection de profil ;
- la liste des actions / sets disponibles ;
- le jet préparé ;
- les entrées de dés indépendantes ;
- la configuration rapide des dés et comportements ;
- la sauvegarde d’un jet libre comme action ;
- la mise à jour ou duplication d’une action existante ;
- l’envoi vers Roll3D.

Il ne doit pas porter :

- la mise en scène finale du lancer ;
- la table 3D ;
- le rendu premium final du résultat ;
- la logique interne du moteur de règles ;
- les calculs de résultats officiels en dehors du moteur.

La Préparation peut afficher une prévisualisation technique, mais cette prévisualisation ne doit pas devenir le rendu final cible.

---

## RollScreen legacy

`RollScreen` est une implémentation historique et temporaire.

Il est actuellement utilisé par `GamePreparationScreen`, mais il ne doit plus recevoir de nouvelle responsabilité produit majeure.

Son rôle temporaire :

- conserver le comportement actuel pendant la transition ;
- servir de base à l’extraction progressive ;
- éviter une régression brutale pendant la refonte.

Toute nouvelle logique durable doit aller dans :

- `domain/*` pour le modèle métier ;
- `features/preparation/*` pour la préparation ;
- `features/roll3d/*` pour le lancement 3D ;
- `features/rollResult/*` pour le résultat commun ;
- `data/repositories/*` pour la persistance.

---

## Tables

L’écran Tables doit devenir un espace d’organisation.

Il doit porter :

- la création de tables ;
- l’édition de tables ;
- la gestion des profils ;
- la gestion des actions / sets ;
- la consultation structurée des éléments d’une table ;
- les modifications administratives.

Il ne doit pas devenir l’écran principal de lancer.

---

## Comportements

L’écran Comportements doit devenir l’atelier de règles.

Il doit porter :

- la bibliothèque de comportements ;
- les comportements système ;
- les comportements utilisateur ;
- la création guidée ;
- le mode expert ;
- l’aperçu / test d’un comportement ;
- la documentation pédagogique des comportements.

Il ne doit pas porter :

- la sélection de table/profil active ;
- la préparation complète d’un jet de session ;
- le lancement officiel en jeu ;
- le résultat premium final.

---

## Résultats

Le résultat doit progressivement être centralisé dans une feature dédiée :

`features/rollResult/*`

Cette couche doit servir à :

- transformer le résultat moteur en présentation UI ;
- produire un résumé clair ;
- produire les détails par action, entrée, dé et comportement ;
- exposer les événements exploitables par Roll3D, thèmes et skins ;
- unifier les rendus Roll3D, historique, aperçu et préparation.

Le moteur reste la source de vérité.

Les skins, animations et effets visuels ne doivent jamais modifier :

- les probabilités ;
- les résultats ;
- les règles ;
- les dés réellement lancés ;
- les événements moteur officiels.

---

## Règle de décision

Avant d’ajouter une nouvelle fonctionnalité, vérifier :

1. Est-ce une logique métier durable ?
   - Oui : `domain/*`

2. Est-ce une logique de persistance ?
   - Oui : `data/repositories/*`

3. Est-ce lié à la préparation du jeu ?
   - Oui : `features/preparation/*`

4. Est-ce lié au lancement 3D ?
   - Oui : `features/roll3d/*`

5. Est-ce lié au rendu des résultats ?
   - Oui : `features/rollResult/*`

6. Est-ce seulement du legacy temporaire ?
   - Alors seulement : `RollScreen`, avec commentaire de transition.

---

## Cap produit

La direction produit reste :

- application simple au premier usage ;
- table de lancer immédiate ;
- préparation puissante mais progressive ;
- résultat premium clair et émotionnel ;
- expérience proche d’un jeu mobile premium 2026 ;
- puissance technique invisible pour l’utilisateur ;
- moteur de règles universel et stable.