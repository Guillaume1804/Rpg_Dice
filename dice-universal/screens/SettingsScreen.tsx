// dice-universal/screens/SettingsScreen.tsx

import { Pressable, ScrollView, Text, View } from "react-native";

import { arcane } from "../theme/arcaneTheme";
import { arcaneStyles } from "../theme/arcaneStyles";
import { useArcaneLayout } from "../theme/useArcaneLayout";
import { useArcaneTheme } from "../theme/ArcaneThemeProvider";
import type { ArcaneThemeKey } from "../theme/arcaneTheme";

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: arcane.colors.textSubtle,
        fontSize: arcane.typography.tiny,
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
}: {
  title: string;
  description: string;
  value?: string;
}) {
  return (
    <View
      style={{
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.xs,
      }}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontSize: 16,
          fontWeight: "900",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: arcane.colors.textMuted,
          lineHeight: 19,
        }}
      >
        {description}
      </Text>

      {value ? (
        <View
          style={{
            alignSelf: "flex-start",
            marginTop: arcane.spacing.xs,
            paddingVertical: 5,
            paddingHorizontal: 9,
            borderWidth: 1,
            borderColor: arcane.colors.border,
            borderRadius: arcane.radius.pill,
            backgroundColor: arcane.colors.surfaceAlt,
          }}
        >
          <Text
            style={{
              color: arcane.colors.textMuted,
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
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.xs,
        borderColor: selected ? arcane.colors.accent : arcane.colors.borderSoft,
        backgroundColor: selected
          ? arcane.colors.accentSoft
          : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: arcane.spacing.sm,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: arcane.colors.text,
              fontSize: 16,
              fontWeight: selected ? "900" : "800",
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: arcane.colors.textMuted,
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
              borderColor: arcane.colors.accent,
              borderRadius: arcane.radius.pill,
              backgroundColor: arcane.colors.accentSoft,
            }}
          >
            <Text
              style={{
                color: arcane.colors.text,
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

function ColorPreviewRow() {
  const colors = [
    arcane.colors.accent,
    arcane.colors.arcane,
    arcane.colors.success,
    arcane.colors.warning,
    arcane.colors.failure,
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: arcane.spacing.sm,
        marginTop: arcane.spacing.xs,
      }}
    >
      {colors.map((color) => (
        <View
          key={color}
          style={{
            width: 28,
            height: 28,
            borderRadius: arcane.radius.pill,
            borderWidth: 1,
            borderColor: arcane.colors.border,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const layout = useArcaneLayout();
  const { themeKey, availableThemes, setThemeKey } = useArcaneTheme();

  const currentTheme = availableThemes[themeKey];

  async function handleSelectTheme(nextThemeKey: ArcaneThemeKey) {
    await setThemeKey(nextThemeKey);
  }

  return (
    <View style={arcaneStyles.screen}>
      <View
        style={{
          flex: 1,
          paddingTop: layout.insets.top + arcane.spacing.md,
          paddingHorizontal: layout.horizontalPadding,
          paddingBottom: layout.insets.bottom + arcane.spacing.md,
          alignSelf: "center",
          width: "100%",
          maxWidth: layout.maxContentWidth,
          gap: arcane.spacing.md,
        }}
      >
        <View style={{ gap: arcane.spacing.xs }}>
          <Text
            style={{
              color: arcane.colors.text,
              fontSize: 28,
              fontWeight: "900",
              letterSpacing: -0.4,
            }}
          >
            Paramètres
          </Text>

          <Text style={arcaneStyles.muted}>
            Ajuste l’expérience visuelle et prépare les options de confort de
            l’application.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            gap: arcane.spacing.md,
            paddingBottom: arcane.spacing.xl,
          }}
          showsVerticalScrollIndicator
        >
          <View style={{ gap: arcane.spacing.sm }}>
            <SectionLabel>Apparence</SectionLabel>

            <SettingsCard
              title="Thème visuel"
              description="Choisis l’ambiance générale de l’application. Le choix est sauvegardé localement."
              value={currentTheme.label}
            />

            <View style={{ gap: arcane.spacing.sm }}>
              {Object.values(availableThemes).map((theme) => (
                <ThemeChoiceCard
                  key={theme.key}
                  title={theme.label}
                  description={theme.description}
                  selected={theme.key === themeKey}
                  onPress={() => {
                    void handleSelectTheme(theme.key);
                  }}
                />
              ))}
            </View>

            <View
              style={{
                ...arcaneStyles.cardSoft,
                gap: arcane.spacing.xs,
              }}
            >
              <Text
                style={{
                  color: arcane.colors.text,
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                Aperçu des couleurs
              </Text>

              <Text style={arcaneStyles.muted}>
                Ces couleurs servent aux accents, réussites, avertissements et
                échecs.
              </Text>

              <ColorPreviewRow />
            </View>
          </View>

          <View style={{ gap: arcane.spacing.sm }}>
            <SectionLabel>Confort</SectionLabel>

            <SettingsCard
              title="Animations"
              description="Prévu pour les révélations de résultat, les effets critiques et les transitions plus ludiques."
              value="À venir"
            />

            <SettingsCard
              title="Vibrations"
              description="Prévu pour renforcer les lancers, les réussites critiques et les complications."
              value="À venir"
            />

            <SettingsCard
              title="Sons"
              description="Prévu pour ajouter une sensation plus proche d’un jeu mobile, avec option de désactivation."
              value="À venir"
            />
          </View>

          <View style={{ gap: arcane.spacing.sm }}>
            <SectionLabel>Préférences</SectionLabel>

            <SettingsCard
              title="Données locales"
              description="Les tables, profils, règles et historiques sont actuellement stockés localement sur l’appareil."
              value="SQLite local"
            />
          </View>

          <View style={{ gap: arcane.spacing.sm }}>
            <SectionLabel>Version</SectionLabel>

            <SettingsCard
              title="Dice Universal"
              description="Application de lancer de dés universelle pour jeu de rôle, en cours de stabilisation vers une V1 propre."
              value="Pré-V1"
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
