export const arcane = {
    colors: {
        background: "#0B1020",
        backgroundElevated: "#10172A",

        surface: "#141C2F",
        surfaceAlt: "#1B2540",
        surfaceSoft: "#202B47",

        border: "#2D3A5F",
        borderSoft: "#253151",

        text: "#F5F1E8",
        textMuted: "#AAB4D4",
        textSubtle: "#7F8AAD",

        accent: "#D9A441",
        accentSoft: "#3A2E16",

        arcane: "#8B5CF6",
        arcaneSoft: "#241A3F",

        success: "#34D399",
        successSoft: "#0F2F26",

        failure: "#FB7185",
        failureSoft: "#3A1420",

        warning: "#FBBF24",
        warningSoft: "#3A2A0A",

        white: "#FFFFFF",
        black: "#000000",
    },

    radius: {
        sm: 10,
        md: 14,
        lg: 18,
        xl: 24,
        pill: 999,
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
    },

    typography: {
        title: 24,
        sectionTitle: 18,
        body: 15,
        small: 13,
        tiny: 11,
    },

    shadow: {
        card: {
            shadowColor: "#000000",
            shadowOpacity: 0.24,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 5,
        },
        button: {
            shadowColor: "#000000",
            shadowOpacity: 0.32,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 10 },
            elevation: 7,
        },
    },
} as const;