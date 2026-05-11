import { arcane } from "./arcaneTheme";

export const arcaneStyles = {
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
} as const;