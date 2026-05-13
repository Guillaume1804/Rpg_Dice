import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";

import { useDb } from "../data/db/DbProvider";
import { deleteAllRollEvents } from "../data/repositories/rollEventsRepo";
import { useAppSettings } from "../features/settings/useAppSettings";

import { arcane } from "../theme/arcaneTheme";
import { arcaneStyles } from "../theme/arcaneStyles";
import { useArcaneLayout } from "../theme/useArcaneLayout";

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
  children,
}: {
  title: string;
  description: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <View
      style={{
        ...arcaneStyles.cardSoft,
        gap: arcane.spacing.sm,
      }}
    >
      <View style={{ gap: arcane.spacing.xs }}>
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
      </View>

      {value ? (
        <View
          style={{
            alignSelf: "flex-start",
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

      {children}
    </View>
  );
}

function ToggleRow({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View
      style={{
        ...arcaneStyles.cardSoft,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: arcane.spacing.md,
      }}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            color: arcane.colors.text,
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
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        thumbColor={value ? arcane.colors.accent : arcane.colors.textSubtle}
        trackColor={{
          false: arcane.colors.surfaceAlt,
          true: arcane.colors.accentSoft,
        }}
      />
    </View>
  );
}

function PillButton({
  label,
  onPress,
  variant = "default",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent" | "danger";
  disabled?: boolean;
}) {
  const borderColor =
    variant === "accent"
      ? arcane.colors.accent
      : variant === "danger"
        ? arcane.colors.failure
        : arcane.colors.border;

  const backgroundColor =
    variant === "accent"
      ? arcane.colors.accentSoft
      : variant === "danger"
        ? arcane.colors.failureSoft
        : arcane.colors.surfaceAlt;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        alignSelf: "flex-start",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor,
        borderRadius: arcane.radius.pill,
        backgroundColor,
        opacity: disabled ? 0.48 : pressed ? 0.84 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: arcane.colors.text,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const db = useDb();
  const layout = useArcaneLayout();

  const { settings, loading, error, setSetting, resetSettings } =
    useAppSettings({ db });

  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [dataMessage, setDataMessage] = useState<string | null>(null);

  async function handleClearHistory() {
    try {
      setDataMessage(null);
      setIsClearingHistory(true);

      await deleteAllRollEvents(db);

      setDataMessage("Historique vidé.");
    } catch (e: any) {
      setDataMessage(e?.message ?? "Impossible de vider l’historique.");
    } finally {
      setIsClearingHistory(false);
    }
  }

  async function handleResetSettings() {
    setDataMessage(null);
    await resetSettings();
    setDataMessage("Préférences réinitialisées.");
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
            Ajuste l’expérience de Dice Universal et gère les données locales.
          </Text>
        </View>

        {error ? (
          <View
            style={{
              ...arcaneStyles.cardSoft,
              borderColor: arcane.colors.failure,
              backgroundColor: arcane.colors.failureSoft,
            }}
          >
            <Text
              style={{
                color: arcane.colors.text,
                fontWeight: "800",
              }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {dataMessage ? (
          <View
            style={{
              ...arcaneStyles.cardSoft,
              borderColor: arcane.colors.accent,
              backgroundColor: arcane.colors.accentSoft,
            }}
          >
            <Text
              style={{
                color: arcane.colors.text,
                fontWeight: "800",
              }}
            >
              {dataMessage}
            </Text>
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={{
            gap: arcane.spacing.md,
            paddingBottom: arcane.spacing.xl,
          }}
          showsVerticalScrollIndicator
        >
          <View style={{ gap: arcane.spacing.sm }}>
            <SectionLabel>Expérience</SectionLabel>

            <SettingsCard
              title="Thème visuel"
              description="L’application utilise actuellement le thème Arcane Console."
              value="Arcane Console"
            />

            <ToggleRow
              title="Animations"
              description="Préférence sauvegardée pour activer ou réduire les animations de l’interface."
              value={settings.animationsEnabled}
              disabled={loading}
              onValueChange={(value) =>
                void setSetting("animationsEnabled", value)
              }
            />

            <ToggleRow
              title="Vibrations"
              description="Préférence sauvegardée pour les retours haptiques pendant les lancers."
              value={settings.hapticsEnabled}
              disabled={loading}
              onValueChange={(value) =>
                void setSetting("hapticsEnabled", value)
              }
            />

            <ToggleRow
              title="Sons"
              description="Préférence sauvegardée pour les futurs sons de dés et de résultats."
              value={settings.soundsEnabled}
              disabled={loading}
              onValueChange={(value) => void setSetting("soundsEnabled", value)}
            />
          </View>

          <View style={{ gap: arcane.spacing.sm }}>
            <SectionLabel>Données locales</SectionLabel>

            <SettingsCard
              title="Historique des jets"
              description="Supprime tous les jets enregistrés localement dans l’historique."
              value="Action locale"
            >
              <PillButton
                label={
                  isClearingHistory ? "Suppression..." : "Vider l’historique"
                }
                onPress={handleClearHistory}
                variant="danger"
                disabled={isClearingHistory}
              />
            </SettingsCard>

            <SettingsCard
              title="Préférences"
              description="Réinitialise les préférences d’expérience à leurs valeurs par défaut."
              value="Réinitialisation"
            >
              <PillButton
                label="Réinitialiser les préférences"
                onPress={handleResetSettings}
                variant="accent"
                disabled={loading}
              />
            </SettingsCard>

            <SettingsCard
              title="Tables, profils et règles"
              description="Les données de jeu sont stockées localement dans la base SQLite de l’application."
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
