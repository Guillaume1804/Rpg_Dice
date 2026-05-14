// dice-universal/theme/arcaneStyles.ts

import { arcane } from "./arcaneTheme";

/**
 * Important :
 * React Native peut freezer les objets de style en mode dev.
 * Donc on ne doit jamais muter arcaneStyles.screen/card/etc. après rendu.
 *
 * Ces getters retournent un nouvel objet à chaque accès, ce qui permet
 * au thème runtime de changer les valeurs de `arcane.colors` sans casser RN.
 */
export const arcaneStyles = {
  get screen() {
    return {
      flex: 1,
      backgroundColor: arcane.colors.background,
    };
  },

  get card() {
    return {
      backgroundColor: arcane.colors.surface,
      borderColor: arcane.colors.border,
      borderWidth: 1,
      borderRadius: arcane.radius.lg,
      padding: arcane.spacing.lg,
      ...arcane.shadow.card,
    };
  },

  get cardSoft() {
    return {
      backgroundColor: arcane.colors.surfaceAlt,
      borderColor: arcane.colors.borderSoft,
      borderWidth: 1,
      borderRadius: arcane.radius.lg,
      padding: arcane.spacing.md,
    };
  },

  get title() {
    return {
      color: arcane.colors.text,
      fontSize: arcane.typography.title,
      fontWeight: "900" as const,
    };
  },

  get sectionTitle() {
    return {
      color: arcane.colors.text,
      fontSize: arcane.typography.sectionTitle,
      fontWeight: "900" as const,
    };
  },

  get body() {
    return {
      color: arcane.colors.text,
      fontSize: arcane.typography.body,
    };
  },

  get muted() {
    return {
      color: arcane.colors.textMuted,
      fontSize: arcane.typography.body,
    };
  },

  get subtle() {
    return {
      color: arcane.colors.textSubtle,
      fontSize: arcane.typography.small,
    };
  },

  get pill() {
    return {
      borderRadius: arcane.radius.pill,
      borderWidth: 1,
      borderColor: arcane.colors.border,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: arcane.colors.surfaceAlt,
    };
  },
} as const;

/**
 * Conservé pour compatibilité avec ArcaneThemeProvider.
 * Avant, cette fonction mutait arcaneStyles, ce qui provoquait l'erreur RN.
 * Maintenant elle ne fait volontairement rien.
 */
export function refreshArcaneStyles(..._args: unknown[]): void {
  // no-op volontaire
}
