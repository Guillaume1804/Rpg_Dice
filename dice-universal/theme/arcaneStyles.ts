// dice-universal/theme/arcaneStyles.ts

import { arcane, type ArcaneTheme } from "./arcaneTheme";

export function createArcaneStyles(theme: ArcaneTheme) {
  return {
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      ...theme.shadow.card,
    },

    cardSoft: {
      backgroundColor: theme.colors.surfaceAlt,
      borderColor: theme.colors.borderSoft,
      borderWidth: 1,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
    },

    title: {
      color: theme.colors.text,
      fontSize: theme.typography.title,
      fontWeight: "900" as const,
    },

    sectionTitle: {
      color: theme.colors.text,
      fontSize: theme.typography.sectionTitle,
      fontWeight: "900" as const,
    },

    body: {
      color: theme.colors.text,
      fontSize: theme.typography.body,
    },

    muted: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.body,
    },

    subtle: {
      color: theme.colors.textSubtle,
      fontSize: theme.typography.small,
    },

    pill: {
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.surfaceAlt,
    },
  } as const;
}

/**
 * Compatibilité ancienne.
 * Les nouveaux écrans doivent utiliser les styles fournis par useArcaneTheme().
 */
export const arcaneStyles = createArcaneStyles(arcane);

export function refreshArcaneStyles(..._args: unknown[]): void {
  // no-op volontaire
}
