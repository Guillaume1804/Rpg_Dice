# Modèle métier canonique — Dice Universal

Ce document décrit le vocabulaire produit cible de Dice Universal.

La base SQLite actuelle conserve encore des noms techniques historiques comme `groups`, `group_dice` ou `rules`.

La couche `domain/*` sert à traduire ces données legacy vers un modèle métier plus clair, orienté utilisateur et compatible avec la vision long terme de l’application.

---

## Objectif

Ne plus raisonner côté interface avec :

- Group
- GroupDie
- Rule
- Scope
- Entry / Group / Both

Mais avec :

- Table
- Profil
- Action / Set
- Entrée
- Comportement
- Jet préparé
- Résultat
- Événement de résultat

La base de données n’est pas modifiée pendant cette phase.

La couche `domain/*` agit comme une couche de traduction entre la DB legacy et le produit final.

---

## Correspondance legacy → produit

| Legacy DB / code | Modèle produit cible |
|---|---|
| `TableRow` | `GameTable` |
| `ProfileRow` | `GameProfile` |
| `GroupRow` | `ActionSet` |
| `GroupDieRow` | `ActionEntry` |
| `RuleRow` | `BehaviorDefinition` / `BehaviorRef` |
| `Roll3DDraft` | Draft technique Roll3D |
| `RollDraft` | Draft canonique produit |
| `GroupRollResult` | Résultat officiel moteur |
| `RollPresentation` | Résultat présenté à l’utilisateur |

---

## Table

Une table représente un contexte de jeu ou de système.

Exemples :

- D&D 5e
- Chroniques Oubliées
- Shadowrun
- Système maison
- Table libre

Modèle canonique :

'''ts
export type GameTable = {
  id: string;
  name: string;
  isSystem: boolean;
};