# Plan d’action — Refonte premium sécurisée et modulaire du Roll Screen

> **Projet :** Dice Universal / Lancer 2D  
> **Objectif :** transformer le Roll Screen en cockpit de résolution premium : sombre, sobre, tactile, lisible, modulaire et prêt pour les futurs thèmes/skins.  
> **Thème par défaut recommandé :** **Graphite Astral**  
> **Règle centrale :** le thème et les skins ne doivent jamais modifier la logique du jet. Ils modifient uniquement la présentation.

---

## Suivi global

- [ ] Phase 0 — Sécurisation avant refonte
- [ ] Phase 1 — Nouveau design system premium centralisé
- [ ] Phase 2 — Adaptation progressive du provider de thème
- [ ] Phase 3 — Paramètres sécurité / accessibilité
- [ ] Phase 4 — Composants primitifs premium
- [ ] Phase 5 — Découpage premium du Roll Screen par zones
- [ ] Phase 6 — Refonte du fond d’écran
- [ ] Phase 7 — Refonte du bouton LANCER
- [ ] Phase 8 — Jet préparé compact + édition complète
- [ ] Phase 9 — Carte résultat premium
- [ ] Phase 10 — Événements visuels pour thèmes et skins
- [ ] Phase 11 — Navigation basse premium
- [ ] Phase 12 — Sécurité des données et actions utilisateur
- [ ] Sprint 1 — Fondations premium
- [ ] Sprint 2 — Background + bouton LANCER
- [ ] Sprint 3 — Header + navigation
- [ ] Sprint 4 — Résultat premium
- [ ] Sprint 5 — Dés + jet préparé compact
- [ ] Sprint 6 — Bottom sheets premium
- [ ] Sprint 7 — Accessibilité + thèmes futurs

---

# Phase 0 — Sécurisation avant refonte

## Objectif

Figer la base actuelle pour pouvoir revenir en arrière si une modification visuelle casse une partie du Roll Screen.

## Tâches

- [ ] Créer une branche Git dédiée.

```bash
git checkout -b refactor/premium-roll-screen
```

- [ ] Garder le Roll Screen actuel fonctionnel comme référence.
- [ ] Ne pas modifier le moteur de jet pendant la refonte visuelle.
- [ ] Ne pas toucher au schéma SQLite sauf pour les futurs paramètres de thème/accessibilité.
- [ ] Avancer par composants remplaçables, pas par énorme réécriture d’un coup.
- [ ] Tester régulièrement sur Android réel avec Expo.
- [ ] Garder les anciennes versions des composants tant que les nouveaux ne sont pas validés.

## Points de vigilance

- [ ] Ne pas casser `rollGroup`.
- [ ] Ne pas modifier la structure de `GroupRollResult` pendant la refonte visuelle.
- [ ] Ne pas modifier les règles ou comportements tant que l’UI premium n’est pas stabilisée.

## Critère de validation

- [ ] Une branche dédiée existe.
- [ ] L’app fonctionne encore avant les changements visuels.
- [ ] La refonte peut être interrompue sans perdre l’état stable actuel.

---

# Phase 1 — Nouveau design system premium centralisé

## Objectif

Créer une base visuelle unique, réutilisable partout, pour éviter les couleurs, bordures, ombres, rayons et tailles définies au hasard dans chaque composant.

## Structure cible

- [ ] Créer le dossier :

```txt
theme/premium/
```

- [ ] Créer les fichiers :

```txt
theme/premium/tokens.ts
theme/premium/themes.ts
theme/premium/createPremiumTheme.ts
theme/premium/premiumTypes.ts
theme/premium/premiumMotion.ts
theme/premium/premiumHaptics.ts
theme/premium/premiumComponents.ts
```

## Types de base

- [ ] Créer `theme/premium/premiumTypes.ts`.

```ts
export type PremiumThemeId = "graphite_astral" | "nocturne";

export type PremiumThemeColors = {
  background: {
    primary: string;
    secondary: string;
    elevated: string;
    bottomFade: string;
  };
  surface: {
    primary: string;
    secondary: string;
    elevated: string;
    pressed: string;
    disabled: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  accent: {
    primary: string;
    secondary: string;
    soft: string;
  };
  state: {
    success: string;
    failure: string;
    critical: string;
    warning: string;
    complication: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
  };
};

export type PremiumTheme = {
  id: PremiumThemeId;
  name: string;
  colors: PremiumThemeColors;
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    tiny: number;
    small: number;
    body: number;
    title: number;
    hero: number;
  };
  shadow: {
    card: object;
    button: object;
    none: object;
  };
  animation: {
    fast: number;
    normal: number;
    slow: number;
    pressScale: number;
  };
};
```

## Thème par défaut : Graphite Astral

- [ ] Créer `theme/premium/themes.ts`.
- [ ] Ajouter le thème `GRAPHITE_ASTRAL_THEME`.

```ts
import type { PremiumTheme } from "./premiumTypes";

export const GRAPHITE_ASTRAL_THEME: PremiumTheme = {
  id: "graphite_astral",
  name: "Graphite Astral",

  colors: {
    background: {
      primary: "#060812",
      secondary: "#0B0E1A",
      elevated: "#101321",
      bottomFade: "rgba(0, 0, 0, 0.64)",
    },

    surface: {
      primary: "rgba(15, 18, 32, 0.86)",
      secondary: "rgba(22, 24, 42, 0.72)",
      elevated: "rgba(28, 31, 50, 0.88)",
      pressed: "rgba(36, 39, 58, 0.92)",
      disabled: "rgba(35, 37, 50, 0.48)",
    },

    text: {
      primary: "#F5F3EA",
      secondary: "#A7A8B8",
      muted: "#6F7184",
      inverse: "#060812",
    },

    accent: {
      primary: "#E8C878",
      secondary: "#7C5CFF",
      soft: "rgba(232, 200, 120, 0.12)",
    },

    state: {
      success: "#88D39A",
      failure: "#EF6F91",
      critical: "#F0D98A",
      warning: "#DFAF55",
      complication: "#DFAF55",
    },

    border: {
      subtle: "rgba(255,255,255,0.06)",
      default: "rgba(255,255,255,0.10)",
      strong: "rgba(232,200,120,0.36)",
    },
  },

  radius: {
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    pill: 999,
  },

  spacing: {
    xxs: 3,
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
  },

  typography: {
    tiny: 10,
    small: 12,
    body: 14,
    title: 18,
    hero: 34,
  },

  shadow: {
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.22,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    button: {
      shadowColor: "#000",
      shadowOpacity: 0.28,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 7,
    },
    none: {
      shadowOpacity: 0,
      elevation: 0,
    },
  },

  animation: {
    fast: 120,
    normal: 220,
    slow: 360,
    pressScale: 0.985,
  },
};
```

## Règle de migration

À partir de cette phase, tout nouveau composant du Roll Screen doit utiliser :

```ts
premium.colors.surface.primary;
premium.colors.text.primary;
premium.radius.lg;
premium.animation.pressScale;
```

et éviter autant que possible les valeurs dispersées du type :

```ts
"rgba(...)";
borderColor;
shadowOpacity;
fontSize;
```

## Critère de validation

- [ ] Le thème `Graphite Astral` existe.
- [ ] Les types premium existent.
- [ ] Les futurs composants peuvent importer `usePremiumTheme`.
- [ ] La refonte peut démarrer sans toucher à l’ancien thème global.

---

# Phase 2 — Adaptation progressive du provider de thème

## Objectif

Ajouter une couche premium sans supprimer immédiatement `ArcaneThemeProvider`.

## Plan sûr

- [ ] Créer :

```txt
theme/premium/usePremiumTheme.ts
```

- [ ] Première version simple :

```ts
import { GRAPHITE_ASTRAL_THEME } from "./themes";

export function usePremiumTheme() {
  return GRAPHITE_ASTRAL_THEME;
}
```

- [ ] Utiliser progressivement ce hook dans les nouveaux composants premium.
- [ ] Ne pas remplacer tout de suite `ArcaneThemeProvider`.
- [ ] Garder la compatibilité avec les composants existants.

## Plus tard

- [ ] Connecter `usePremiumTheme` aux paramètres persistés.
- [ ] Lire `selectedThemeId` depuis les settings.
- [ ] Prévoir un fallback si un thème n’existe plus.

## Critère de validation

- [ ] L’ancien thème fonctionne encore.
- [ ] Le nouveau thème premium peut être utilisé par les nouveaux composants.
- [ ] Aucun écran existant n’est cassé.

---

# Phase 3 — Paramètres sécurité / accessibilité

## Objectif

Préparer l’application aux préférences utilisateur : réduction d’animations, désactivation des flashs, sons, vibrations, économie batterie, thème choisi et skin choisi.

## AppSettings cible

- [ ] Étendre le type `AppSettings`.

```ts
export type AppSettings = {
  animationsEnabled: boolean;
  hapticsEnabled: boolean;
  soundsEnabled: boolean;

  reduceMotion: boolean;
  disableFlashes: boolean;
  batterySaver: boolean;
  soberMode: boolean;

  selectedThemeId: string;
  selectedDiceSkinId: string;
};
```

- [ ] Étendre les valeurs par défaut.

```ts
export const DEFAULT_APP_SETTINGS: AppSettings = {
  animationsEnabled: true,
  hapticsEnabled: true,
  soundsEnabled: false,

  reduceMotion: false,
  disableFlashes: false,
  batterySaver: false,
  soberMode: false,

  selectedThemeId: "graphite_astral",
  selectedDiceSkinId: "classic_graphite",
};
```

## Règles sécurité utilisateur

- [ ] Aucun flash fort par défaut.
- [ ] Toutes les animations importantes respectent `reduceMotion`.
- [ ] Les effets critiques restent courts et non agressifs.
- [ ] Les vibrations sont désactivables.
- [ ] Les sons restent désactivés par défaut.
- [ ] Les skins premium ne modifient jamais la logique du jet.
- [ ] Les animations lourdes ne sont pas chargées au démarrage.
- [ ] Prévoir un mode économie batterie.
- [ ] Prévoir un mode sobre.

## Critère de validation

- [ ] Les settings restent rétrocompatibles.
- [ ] Si un ancien JSON de settings existe, l’app ne plante pas.
- [ ] Les nouveaux champs ont des valeurs par défaut sûres.

---

# Phase 4 — Composants primitifs premium

## Objectif

Créer des briques UI communes pour éviter de répéter les mêmes styles et comportements tactiles dans tous les composants.

## Fichiers proposés

- [ ] Créer :

```txt
components/premium/PremiumScreen.tsx
components/premium/PremiumSurface.tsx
components/premium/PremiumPressable.tsx
components/premium/PremiumPill.tsx
components/premium/PremiumBottomSheet.tsx
components/premium/PremiumDivider.tsx
components/premium/PremiumText.tsx
```

## PremiumPressable

- [ ] Créer un composant qui centralise la pression tactile.

```tsx
import { Pressable } from "react-native";
import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: object;
};

export function PremiumPressable({
  children,
  onPress,
  disabled,
  style,
}: Props) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: disabled ? 0.48 : pressed ? 0.88 : 1,
        transform: [
          {
            scale:
              pressed && !disabled
                ? premium.animation.pressScale
                : 1,
          },
        ],
        ...style,
      })}
    >
      {children}
    </Pressable>
  );
}
```

## PremiumSurface

- [ ] Créer une carte/surface générique.
- [ ] Gérer les variantes : `primary`, `secondary`, `elevated`, `transparent`.
- [ ] Gérer les radius et borders depuis les tokens.

## PremiumBottomSheet

- [ ] Créer une bottom sheet commune.
- [ ] Ajouter fond sombre.
- [ ] Ajouter poignée de drag visuelle.
- [ ] Ajouter coins arrondis.
- [ ] Ajouter padding safe-area.
- [ ] Prévoir fermeture au tap overlay.

## Critère de validation

- [ ] Les nouveaux composants premium utilisent les tokens.
- [ ] Les press states sont centralisés.
- [ ] On peut commencer à remplacer les anciens composants sans dupliquer du style.

---

# Phase 5 — Découpage premium du Roll Screen par zones

## Objectif

Faire de `RollScreen.tsx` un orchestrateur logique, pas un fichier rempli de styles.

## Nouvelle structure cible

- [ ] Créer le dossier :

```txt
features/roll/premium/
```

- [ ] Créer progressivement :

```txt
features/roll/premium/PremiumRollScreenBackground.tsx
features/roll/premium/PremiumSessionHeader.tsx
features/roll/premium/PremiumResultCard.tsx
features/roll/premium/PremiumDiceWheel.tsx
features/roll/premium/PremiumPreparedRollSummary.tsx
features/roll/premium/PremiumRollButton.tsx
features/roll/premium/PremiumFocusedLineBar.tsx
features/roll/premium/PremiumRollResetOverlay.tsx
```

## Structure JSX cible

À terme, `RollScreen.tsx` devrait ressembler davantage à :

```tsx
<PremiumRollScreenBackground />
<PremiumSessionHeader />
<PremiumResultCard result={latestResult} />
<PremiumDiceWheel />
<PremiumPreparedRollSummary />
<PremiumFocusedLineBar />
<PremiumRollButton />
```

## Critère de validation

- [ ] `RollScreen.tsx` contient moins de style inline.
- [ ] Les zones principales sont isolées.
- [ ] Chaque zone peut être remplacée sans casser les autres.

---

# Phase 6 — Refonte du fond d’écran

## Objectif

Remplacer le fond violet/fantasy/glow par une scène sombre, calme et premium.

## Tâches

- [ ] Créer `PremiumRollScreenBackground.tsx`.
- [ ] Remplacer les grands cercles décoratifs actuels.
- [ ] Réduire fortement les halos violets.
- [ ] Ajouter un fond noir bleuté profond.
- [ ] Ajouter un halo très discret derrière la zone des dés.
- [ ] Ajouter un dégradé sombre en bas pour intégrer le bouton `LANCER`.
- [ ] Vérifier que le fond reste discret pendant une session.

## Exemple de base

```tsx
import { View } from "react-native";
import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";

export function PremiumRollScreenBackground() {
  const premium = usePremiumTheme();

  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: premium.colors.background.primary,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 120,
          alignSelf: "center",
          width: 260,
          height: 260,
          borderRadius: 999,
          backgroundColor: "rgba(232, 200, 120, 0.045)",
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 180,
          backgroundColor: "rgba(0, 0, 0, 0.48)",
        }}
      />
    </>
  );
}
```

## Critère de validation

- [ ] Le fond ne concurrence plus les informations.
- [ ] Le bouton `LANCER` paraît intégré dans la scène.
- [ ] L’écran donne une impression sombre, premium et calme.

---

# Phase 7 — Refonte du bouton LANCER

## Objectif

Créer le bouton signature premium de Dice Universal : noir/graphite, tactile, sobre, précis.

## Fichier cible

- [ ] Créer :

```txt
features/roll/premium/PremiumRollButton.tsx
```

## API cible

```ts
type PremiumRollButtonProps = {
  disabled: boolean;
  rolling?: boolean;
  focusedLine?: boolean;
  label: string;
  disabledLabel?: string;
  onPress: () => void | Promise<void>;
};
```

## Direction visuelle

- [ ] Fond graphite/noir.
- [ ] Texte blanc cassé.
- [ ] Bordure fine champagne très subtile.
- [ ] Pas de glow violet permanent.
- [ ] Pression très légère, façon clic Mac.
- [ ] Texte en capitales espacées.
- [ ] Disabled très discret.
- [ ] Rolling minimal, sans animation longue.

## États à gérer

- [ ] Aucun jet : `AJOUTE DES DÉS`.
- [ ] Jet prêt : `LANCER` ou `LANCER LE JET`.
- [ ] Ligne ciblée : `LANCER LA LIGNE`.
- [ ] Pressed : scale léger, assombrissement discret.
- [ ] Rolling : feedback minimal.

## Critère de validation

- [ ] Le bouton devient l’élément visuel principal.
- [ ] Il ne ressemble plus à un bouton fantasy/violet.
- [ ] Le press feedback est satisfaisant.
- [ ] La logique focus line reste fonctionnelle.

---

# Phase 8 — Jet préparé compact + édition complète

## Objectif

Faire du jet préparé la vérité centrale du lancer, sans transformer l’écran principal en grille complexe.

## Niveau 1 — Vue compacte dans le Roll Screen

- [ ] Créer `PremiumPreparedRollSummary.tsx`.
- [ ] Afficher le nom du jet.
- [ ] Afficher le nombre de lignes.
- [ ] Afficher maximum 2 ou 3 premières lignes.
- [ ] Afficher un résumé du type `+11 autres` si beaucoup de lignes.
- [ ] Garder un bouton `Modifier` clair.
- [ ] Garder `Sauver` et `Vider` discrets.
- [ ] Ne plus afficher 8 tuiles sur l’écran principal.

Exemple cible :

```txt
Jet libre · 14 lignes
1d20 · 1d12 · 1d100 · +11 autres
```

## Niveau 2 — Bottom sheet d’édition

- [ ] Reprendre l’actuelle logique de mini-modale validée.
- [ ] L’intégrer dans une vraie bottom sheet premium.
- [ ] Afficher toutes les lignes.
- [ ] Permettre quantité + / -.
- [ ] Permettre modificateur + / -.
- [ ] Permettre signe positif/négatif.
- [ ] Permettre comportement/règle.
- [ ] Permettre suppression.
- [ ] Ajouter plus tard duplication.
- [ ] Ajouter plus tard réorganisation.
- [ ] Garder `Lancer cette ligne`.
- [ ] Garder `Cibler cette ligne avec le bouton principal`.

## Interactions ligne par ligne

- [ ] Tap sur une ligne : sélectionne la ligne.
- [ ] Appui long : menu rapide.
- [ ] Icône réglage : configuration comportement.
- [ ] Bouton ou swipe : suppression.
- [ ] Bouton dédié : lancer cette ligne.
- [ ] Option dédiée : cibler cette ligne avec le bouton principal.

## Critère de validation

- [ ] Même avec 14 lignes, l’écran principal reste calme.
- [ ] L’utilisateur comprend ce qu’il va lancer.
- [ ] Les détails restent accessibles en 1 tap via `Modifier`.

---

# Phase 9 — Carte résultat premium

## Objectif

Créer une carte de résultat lisible, émotionnelle et sobre.

## Fichiers cibles

- [ ] Créer :

```txt
features/roll/result/rollResultViewModel.ts
features/roll/premium/PremiumResultCard.tsx
```

## ViewModel cible

- [ ] Créer le type :

```ts
export type RollVisualTone =
  | "neutral"
  | "success"
  | "failure"
  | "crit_success"
  | "crit_failure"
  | "complication";

export type RollResultViewModel = {
  title: string;
  mainValue: string;
  subtitle: string;
  tone: RollVisualTone;
  detailsLabel: string;
  eventTags: string[];
};
```

- [ ] Créer la fonction :

```ts
export function buildRollResultViewModel(
  result: GroupRollResult | null,
): RollResultViewModel;
```

## États à gérer

- [ ] État vide : `Prêt à lancer` / `Compose ton jet.`
- [ ] Résultat neutre.
- [ ] Réussite.
- [ ] Échec.
- [ ] Réussite critique.
- [ ] Échec critique.
- [ ] Complication.
- [ ] Pool de succès.
- [ ] Seuil avec degrés.
- [ ] Table lookup.
- [ ] Pipeline.

## Critère de validation

- [ ] Après un lancer, le résultat est compris en moins d’une seconde.
- [ ] Le détail reste disponible mais ne surcharge pas la vue principale.
- [ ] Le visuel dépend d’un ViewModel, pas directement du moteur brut.

---

# Phase 10 — Événements visuels pour thèmes et skins

## Objectif

Préparer les futurs thèmes et skins sans les développer maintenant.

## Fichier cible

- [ ] Créer :

```txt
features/roll/visualEvents/rollVisualEvents.ts
```

## Type cible

```ts
export type RollVisualEvent =
  | "roll_started"
  | "dice_rolled"
  | "result_revealed"
  | "success"
  | "failure"
  | "crit_success"
  | "crit_failure"
  | "complication"
  | "glitch"
  | "explosion"
  | "reroll"
  | "keep_highest"
  | "keep_lowest"
  | "drop_highest"
  | "drop_lowest"
  | "sum_result"
  | "success_count"
  | "degree_result"
  | "table_lookup";
```

## Fonction cible

- [ ] Créer :

```ts
export function extractRollVisualEvents(result: GroupRollResult): RollVisualEvent[] {
  // inspecte entries, eval_result, group_eval_result, pipeline meta
}
```

## Objectif futur

- [ ] Permettre à un skin Dragon de réagir à `crit_success`.
- [ ] Permettre à un skin Dragon de réagir à `explosion`.
- [ ] Permettre à un skin Sci-Fi de réagir à `table_lookup`.
- [ ] Permettre au thème sobre de rester minimaliste.

## Critère de validation

- [ ] Les événements visuels sont extraits sans changer le résultat du jet.
- [ ] Les skins restent une couche cosmétique.
- [ ] Le moteur reste indépendant de la présentation.

---

# Phase 11 — Navigation basse premium

## Objectif

Intégrer la bottom navigation au thème premium sans concurrencer le bouton `LANCER`.

## Tâches

- [ ] Migrer `app/(tabs)/_layout.tsx` vers les tokens premium.
- [ ] Fond plus sombre.
- [ ] Séparateur plus discret.
- [ ] Accent actif champagne.
- [ ] Inactif gris froid.
- [ ] Réduire l’effet emoji/fantasy.
- [ ] Prévoir plus tard des icônes sobres.

## Critère de validation

- [ ] La navigation reste utile.
- [ ] Elle ne concurrence pas le bouton principal.
- [ ] Elle paraît intégrée au thème Graphite Astral.

---

# Phase 12 — Sécurité des données et actions utilisateur

## Objectif

La refonte visuelle ne doit pas affaiblir les protections existantes.

## Principes à conserver

- [ ] Aucune action destructrice sans confirmation claire.
- [ ] `Vider un jet préparé` reste une action locale, avec animation/feedback.
- [ ] Supprimer une table demande confirmation.
- [ ] Supprimer un profil demande confirmation.
- [ ] Supprimer une action demande confirmation.
- [ ] Les tables système restent non modifiables.
- [ ] Les règles système restent non modifiables.
- [ ] Les skins ne changent jamais les résultats.
- [ ] Les thèmes ne changent jamais les résultats.
- [ ] Les paramètres cosmétiques ne changent jamais les jets.

## Vérifications techniques

- [ ] Garder les protections côté repository.
- [ ] Ne pas contourner les fonctions existantes par des updates directs non protégés.
- [ ] Ne pas mélanger logique métier et animation.
- [ ] Ne pas charger les skins premium au démarrage.

## Critère de validation

- [ ] Les protections existantes restent actives.
- [ ] La refonte ne rend pas les actions destructrices plus faciles par erreur.
- [ ] Les thèmes/skins restent strictement cosmétiques.

---

# Sprints de réalisation

## Sprint 1 — Fondations premium

Objectif : préparer la base sans changement visuel majeur.

- [ ] Créer `theme/premium/premiumTypes.ts`.
- [ ] Créer `theme/premium/themes.ts`.
- [ ] Créer `theme/premium/usePremiumTheme.ts`.
- [ ] Créer `components/premium/PremiumPressable.tsx`.
- [ ] Créer `components/premium/PremiumSurface.tsx`.
- [ ] Créer `components/premium/PremiumBottomSheet.tsx`.
- [ ] Vérifier que l’app compile.
- [ ] Vérifier que l’écran Jet fonctionne encore.

Validation :

- [ ] Aucun changement visuel majeur.
- [ ] Aucun bug introduit.
- [ ] Les fondations premium sont disponibles.

---

## Sprint 2 — Roll Screen background + bouton LANCER

Objectif : premier gros impact visuel, faible risque fonctionnel.

- [ ] Créer `PremiumRollScreenBackground.tsx`.
- [ ] Créer `PremiumRollButton.tsx`.
- [ ] Remplacer progressivement `StickyRollButton`.
- [ ] Ajouter le dégradé bas sobre.
- [ ] Tester état disabled.
- [ ] Tester état ready.
- [ ] Tester état focused line.
- [ ] Tester pression tactile.
- [ ] Tester sur écran petit Android.

Validation :

- [ ] Le bouton devient sobre, noir/graphite, premium.
- [ ] Le fond est calmé.
- [ ] La logique de lancer reste intacte.

---

## Sprint 3 — Header + navigation

Objectif : alléger le contexte table/profil et harmoniser la navigation basse.

- [ ] Créer ou refondre `PremiumSessionHeader`.
- [ ] Réduire hauteur des cartes table/profil.
- [ ] Remplacer hamburger par chevron ou icône légère.
- [ ] Réduire les icônes.
- [ ] Rendre le logo central plus discret.
- [ ] Migrer la bottom tab vers les tokens premium.
- [ ] Réduire l’effet emoji/fantasy.

Validation :

- [ ] Le header informe sans dominer l’écran.
- [ ] La navigation reste discrète.
- [ ] Le bouton `LANCER` reste prioritaire visuellement.

---

## Sprint 4 — Résultat premium

Objectif : rendre le résultat immédiatement lisible.

- [ ] Créer `rollResultViewModel.ts`.
- [ ] Créer `PremiumResultCard.tsx`.
- [ ] Gérer état vide.
- [ ] Gérer résultat neutre.
- [ ] Gérer succès.
- [ ] Gérer échec.
- [ ] Gérer critique.
- [ ] Gérer complication.
- [ ] Garder bouton `Détails`.
- [ ] Tester avec d20.
- [ ] Tester avec pool de succès.
- [ ] Tester avec pipeline.
- [ ] Tester avec seuil avec degrés.

Validation :

- [ ] Le résultat est compris en moins d’une seconde.
- [ ] Le design est sobre et émotionnel.
- [ ] Les détails restent accessibles.

---

## Sprint 5 — Dés + jet préparé compact

Objectif : calmer l’écran principal et déporter la complexité dans l’édition.

- [ ] Refaire visuellement le cercle de dés.
- [ ] Rendre les dés non actifs plus discrets.
- [ ] Masquer `x1` ou le rendre très discret.
- [ ] Transformer les badges en capsules graphite/champagne.
- [ ] Réduire les contours violets permanents.
- [ ] Ajouter micro-interaction au tap.
- [ ] Créer `PremiumPreparedRollSummary`.
- [ ] Limiter l’écran principal à 2 ou 3 lignes visibles.
- [ ] Afficher `+X autres` si nécessaire.
- [ ] Garder `Modifier` comme entrée vers la complexité.

Validation :

- [ ] La roue reste agréable.
- [ ] Le jet préparé reste lisible avec beaucoup de lignes.
- [ ] L’écran principal est moins dense.

---

## Sprint 6 — Bottom sheets premium

Objectif : harmoniser toutes les modals du Roll Screen.

- [ ] Refaire édition du jet préparé.
- [ ] Refaire configuration d’un dé.
- [ ] Refaire choix comportement/règle.
- [ ] Refaire sauvegarde d’un jet.
- [ ] Utiliser `PremiumBottomSheet`.
- [ ] Garder une hiérarchie claire.
- [ ] Éviter les formulaires trop techniques au premier niveau.
- [ ] Séparer réglage simple et mode avancé.

Validation :

- [ ] Les modals ne cassent plus l’identité premium.
- [ ] Les réglages restent accessibles.
- [ ] L’utilisateur n’est pas noyé dans les options avancées.

---

## Sprint 7 — Accessibilité + thèmes futurs

Objectif : préparer le futur système de thèmes et skins sans commencer la boutique.

- [ ] Étendre `AppSettings`.
- [ ] Ajouter `reduceMotion`.
- [ ] Ajouter `disableFlashes`.
- [ ] Ajouter `batterySaver`.
- [ ] Ajouter `soberMode`.
- [ ] Ajouter `selectedThemeId`.
- [ ] Ajouter `selectedDiceSkinId`.
- [ ] Créer les types `DiceSkin`.
- [ ] Créer les types `RollVisualEvent`.
- [ ] Créer extraction basique des événements visuels.

Validation :

- [ ] L’app est prête pour plusieurs thèmes.
- [ ] L’app est prête pour des skins cosmétiques.
- [ ] Les options d’accessibilité sont prévues.

---

# Système de thèmes futur

## Objectif

Permettre de changer l’interface sans réécrire tous les composants.

## Type cible

```ts
type AppTheme = {
  id: string;
  name: string;
  colors: ThemeColors;
  gradients: ThemeGradients;
  typography: ThemeTypography;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  animation: ThemeAnimation;
};
```

## À prévoir

- [ ] Thème par défaut premium sombre.
- [ ] Futurs thèmes gratuits.
- [ ] Futurs thèmes premium.
- [ ] Persistance du thème choisi.
- [ ] Fallback si thème supprimé ou indisponible.
- [ ] Compatibilité avec réduction animations.

## Thème par défaut validé

- [ ] Nom retenu : **Graphite Astral**.

---

# Système de skins de dés futur

## Objectif

Changer l’apparence des dés indépendamment du thème global.

## Différence thème / skin

### Thème

Change :

- [ ] Fond.
- [ ] Cartes.
- [ ] Bouton.
- [ ] Navigation.
- [ ] Couleurs.
- [ ] Surfaces.

### Skin de dés

Change :

- [ ] Apparence des dés.
- [ ] Texture.
- [ ] Animation de dés.
- [ ] Effet de révélation.
- [ ] Sons/haptique éventuels.
- [ ] Cinématiques premium.

## Type cible

```ts
type DiceSkin = {
  id: string;
  name: string;
  rarity: "free" | "premium";
  diceAssets: DiceAssets;
  rollButtonStyle?: RollButtonSkin;
  resultAnimations?: ResultAnimationMap;
  eventAnimations?: EventAnimationMap;
};
```

## Règle absolue

- [ ] Le skin ne modifie jamais la logique du jet.
- [ ] Le skin ne modifie jamais les résultats.
- [ ] Le skin ne fait que présenter différemment.

---

# Exemple futur — Skin premium Dragon

## À ne pas faire maintenant

- [ ] Ne pas commencer maintenant.
- [ ] Ne pas créer la boutique maintenant.
- [ ] Ne pas créer les cinématiques maintenant.
- [ ] Ne pas charger d’assets lourds maintenant.

## Direction future

- [ ] Écailles sombres.
- [ ] Reflets rouges/dorés.
- [ ] Yeux de dragon subtils.
- [ ] Braises.
- [ ] Souffle de feu.
- [ ] Fumée.
- [ ] Griffures lumineuses.

## Événements spécifiques futurs

- [ ] Réussite critique : flamme dorée.
- [ ] Échec critique : fumée noire + fissure rouge.
- [ ] Complication : braises instables.
- [ ] Explosion : gerbe de feu.
- [ ] Relance : braise qui repart.
- [ ] Garder meilleurs dés : meilleurs dés illuminés, autres éteints.
- [ ] Degrés : marques de griffes lumineuses.

---

# Ce qu’il ne faut pas faire maintenant

- [ ] Ne pas commencer par les animations Dragon.
- [ ] Ne pas commencer par la 3D.
- [ ] Ne pas commencer par la boutique premium.
- [ ] Ne pas commencer par les cinématiques complexes.
- [ ] Ne pas commencer par les sons avancés.
- [ ] Ne pas commencer par les skins multiples.
- [ ] Ne pas refaire complètement les règles maintenant.
- [ ] Ne pas refaire complètement Tables maintenant.

## Bon chemin produit

```txt
Thème premium par défaut
→ Roll Screen excellent
→ composants partagés
→ accessibilité
→ thèmes
→ skins
→ animations premium
```

---

# Définition du résultat attendu V1

À la fin de cette première refonte, l’application doit avoir :

- [ ] Un Roll Screen sombre premium.
- [ ] Un bouton `LANCER` noir/graphite avec texte blanc.
- [ ] Une micro-interaction de pression satisfaisante.
- [ ] Des cartes sobres et cohérentes.
- [ ] Un fond calmé.
- [ ] Des dés moins chargés visuellement.
- [ ] Un jet préparé lisible même avec plusieurs lignes.
- [ ] Des modals harmonisées.
- [ ] Une architecture prête pour thèmes/skins futurs.
- [ ] Des options d’accessibilité prévues.
- [ ] Une logique moteur intacte.

---

# Phrase de cadrage à conserver

> La refonte doit transformer Dice Universal d’une application de lancer de dés fonctionnelle et stylisée en un cockpit de résolution premium : sombre, sobre, tactile, lisible et agréable à utiliser en pleine session de jeu de rôle. Le thème par défaut doit être suffisamment élégant pour porter toute l’identité de l’application. Les skins et animations spectaculaires viendront ensuite comme couche cosmétique optionnelle et monétisable, sans jamais nuire à la clarté ou à la rapidité du lancer.

---

# Journal d’avancement

## Notes générales

- [ ] À compléter au fur et à mesure.

## Décisions validées

- [ ] Thème par défaut : Graphite Astral.
- [ ] Priorité : Roll Screen premium avant skins/3D/boutique.
- [ ] Skins = uniquement cosmétique.
- [ ] Accessibilité obligatoire.

## Prochaine étape immédiate

- [ ] Créer les fondations premium : types, thème, hook, composants primitifs.

