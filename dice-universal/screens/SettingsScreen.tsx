// dice-universal/screens/SettingsScreen.tsx

import { Pressable, ScrollView, Text, View } from "react-native";

import type { ArcaneTheme, ArcaneThemeKey } from "../theme/arcaneTheme";
import type { createArcaneStyles } from "../theme/arcaneStyles";
import { useArcaneLayout } from "../theme/useArcaneLayout";
import { useArcaneTheme } from "../theme/useArcaneTheme";

type ArcaneStyles = ReturnType<typeof createArcaneStyles>;

function SectionLabel({
  children,
  theme,
}: {
  children: string;
  theme: ArcaneTheme;
}) {
  return (
    <Text
      style={{
        color: theme.colors.textSubtle,
        fontSize: theme.typography.tiny,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      {children}
    </Text>
  );
}

function SettingsCard({
  title,
  description,
  value,
  theme,
  styles,
}: {
  title: string;
  description: string;
  value?: string;
  theme: ArcaneTheme;
  styles: ArcaneStyles;
}) {
  return (
    <View
      style={{
        ...styles.cardSoft,
        gap: theme.spacing.xs,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: theme.colors.textMuted,
          lineHeight: 19,
        }}
      >
        {description}
      </Text>

      {value ? (
        <View
          style={{
            alignSelf: "flex-start",
            marginTop: theme.spacing.xs,
            paddingVertical: 5,
            paddingHorizontal: 9,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.surfaceAlt,
          }}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 12,
              fontWeight: "900",
            }}
          >
            {value}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function ThemeChoiceCard({
  title,
  description,
  selected,
  onPress,
  theme,
  styles,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  theme: ArcaneTheme;
  styles: ArcaneStyles;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...styles.cardSoft,
        gap: theme.spacing.xs,
        borderColor: selected ? theme.colors.accent : theme.colors.borderSoft,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : theme.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: theme.spacing.sm,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: selected ? "900" : "800",
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: theme.colors.textMuted,
              lineHeight: 19,
            }}
          >
            {description}
          </Text>
        </View>

        {selected ? (
          <View
            style={{
              paddingVertical: 5,
              paddingHorizontal: 9,
              borderWidth: 1,
              borderColor: theme.colors.accent,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.accentSoft,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              Actif
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function ColorPreviewRow({ theme }: { theme: ArcaneTheme }) {
  const colors = [
    theme.colors.accent,
    theme.colors.arcane,
    theme.colors.success,
    theme.colors.warning,
    theme.colors.failure,
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.spacing.sm,
        marginTop: theme.spacing.xs,
      }}
    >
      {colors.map((color) => (
        <View
          key={color}
          style={{
            width: 28,
            height: 28,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const layout = useArcaneLayout();
  const { theme, styles, themeKey, availableThemes, setThemeKey } =
    useArcaneTheme();

  const currentTheme = availableThemes[themeKey];

  async function handleSelectTheme(nextThemeKey: ArcaneThemeKey) {
    await setThemeKey(nextThemeKey);
  }

  return (
    <View style={styles.screen}>
      <View
        style={{
          flex: 1,
          paddingTop: layout.insets.top + theme.spacing.md,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: layout.insets.bottom + theme.spacing.md,
          alignSelf: "center",
          width: "100%",
          maxWidth: layout.maxContentWidth,
          gap: theme.spacing.md,
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 28,
              fontWeight: "900",
              letterSpacing: -0.4,
            }}
          >
            Paramètres
          </Text>

          <Text style={styles.muted}>
            Ajuste l’expérience visuelle et prépare les options de confort de
            l’application.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            gap: theme.spacing.md,
            paddingBottom: theme.spacing.xl,
          }}
          showsVerticalScrollIndicator
        >
          <View style={{ gap: theme.spacing.sm }}>
            <SectionLabel theme={theme}>Apparence</SectionLabel>

            <SettingsCard
              title="Thème visuel"
              description="Choisis l’ambiance générale de l’application. Le choix est sauvegardé localement."
              value={currentTheme.label}
              theme={theme}
              styles={styles}
            />

            <View style={{ gap: theme.spacing.sm }}>
              {Object.values(availableThemes).map((themeOption) => (
                <ThemeChoiceCard
                  key={themeOption.key}
                  title={themeOption.label}
                  description={themeOption.description}
                  selected={themeOption.key === themeKey}
                  theme={theme}
                  styles={styles}
                  onPress={() => {
                    void handleSelectTheme(themeOption.key);
                  }}
                />
              ))}
            </View>

            <View
              style={{
                ...styles.cardSoft,
                gap: theme.spacing.xs,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                Aperçu des couleurs
              </Text>

              <Text style={styles.muted}>
                Ces couleurs servent aux accents, réussites, avertissements et
                échecs.
              </Text>

              <ColorPreviewRow theme={theme} />
            </View>
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <SectionLabel theme={theme}>Confort</SectionLabel>

            <SettingsCard
              title="Animations"
              description="Prévu pour les révélations de résultat, les effets critiques et les transitions plus ludiques."
              value="À venir"
              theme={theme}
              styles={styles}
            />

            <SettingsCard
              title="Vibrations"
              description="Prévu pour renforcer les lancers, les réussites critiques et les complications."
              value="À venir"
              theme={theme}
              styles={styles}
            />

            <SettingsCard
              title="Sons"
              description="Prévu pour ajouter une sensation plus proche d’un jeu mobile, avec option de désactivation."
              value="À venir"
              theme={theme}
              styles={styles}
            />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <SectionLabel theme={theme}>Préférences</SectionLabel>

            <SettingsCard
              title="Données locales"
              description="Les tables, profils, règles et historiques sont actuellement stockés localement sur l’appareil."
              value="SQLite local"
              theme={theme}
              styles={styles}
            />
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <SectionLabel theme={theme}>Version</SectionLabel>

            <SettingsCard
              title="Dice Universal"
              description="Application de lancer de dés universelle pour jeu de rôle, en cours de stabilisation vers une V1 propre."
              value="Pré-V1"
              theme={theme}
              styles={styles}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
