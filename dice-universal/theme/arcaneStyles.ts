// dice-universal/theme/arcaneStyles.ts

import { arcane } from "./arcaneTheme";

function createArcaneStyles() {
  return {
    screen: {
      flex: 1,
      backgroundColor: arcane.colors.background,
    },

    card: {
      backgroundColor: arcane.colors.surface,
      borderColor: arcane.colors.border,
      borderWidth: 1,
      borderRadius: arcane.radius.lg,
      padding: arcane.spacing.lg,
      ...arcane.shadow.card,
    },

    cardSoft: {
      backgroundColor: arcane.colors.surfaceAlt,
      borderColor: arcane.colors.borderSoft,
      borderWidth: 1,
      borderRadius: arcane.radius.lg,
      padding: arcane.spacing.md,
    },

    title: {
      color: arcane.colors.text,
      fontSize: arcane.typography.title,
      fontWeight: "900" as const,
    },

    sectionTitle: {
      color: arcane.colors.text,
      fontSize: arcane.typography.sectionTitle,
      fontWeight: "900" as const,
    },

    body: {
      color: arcane.colors.text,
      fontSize: arcane.typography.body,
    },

    muted: {
      color: arcane.colors.textMuted,
      fontSize: arcane.typography.body,
    },

    subtle: {
      color: arcane.colors.textSubtle,
      fontSize: arcane.typography.small,
    },

    pill: {
      borderRadius: arcane.radius.pill,
      borderWidth: 1,
      borderColor: arcane.colors.border,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: arcane.colors.surfaceAlt,
    },
  };
}

export const arcaneStyles = createArcaneStyles();

export function refreshArcaneStyles() {
  const nextStyles = createArcaneStyles();

  Object.assign(arcaneStyles.screen, nextStyles.screen);
  Object.assign(arcaneStyles.card, nextStyles.card);
  Object.assign(arcaneStyles.cardSoft, nextStyles.cardSoft);
  Object.assign(arcaneStyles.title, nextStyles.title);
  Object.assign(arcaneStyles.sectionTitle, nextStyles.sectionTitle);
  Object.assign(arcaneStyles.body, nextStyles.body);
  Object.assign(arcaneStyles.muted, nextStyles.muted);
  Object.assign(arcaneStyles.subtle, nextStyles.subtle);
  Object.assign(arcaneStyles.pill, nextStyles.pill);
}
