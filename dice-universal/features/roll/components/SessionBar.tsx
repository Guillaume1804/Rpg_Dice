// dice-universal/features/roll/components/SessionBar.tsx

import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

type SessionBarProps = {
  tableName: string | null;
  activeProfileName: string | null;
  hasActiveTable: boolean;
  profileCount: number;
  onPressProfile: () => void;
  onClearTable: () => void | Promise<void>;
};

function StatusPill({ label, active }: { label: string; active: boolean }) {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: active ? theme.colors.success : theme.colors.borderSoft,
        borderRadius: theme.radius.pill,
        backgroundColor: active
          ? theme.colors.successSoft
          : theme.colors.surfaceAlt,
      }}
    >
      <Text
        style={{
          color: active ? theme.colors.success : theme.colors.textMuted,
          fontSize: theme.typography.small,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function SessionBar({
  tableName,
  activeProfileName,
  hasActiveTable,
  profileCount,
  onPressProfile,
  onClearTable,
}: SessionBarProps) {
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const displayTableName = tableName ?? "Mode libre";
  const displayProfileName = activeProfileName ?? "Aucun profil";
  const canCycleProfile = hasActiveTable && profileCount > 1;

  return (
    <View
      style={{
        ...styles.card,
        gap: theme.spacing.md,
        borderRadius: rollTheme.layout.cockpitRadius,
        borderColor: hasActiveTable
          ? rollTheme.cockpit.border
          : theme.colors.borderSoft,
        backgroundColor: rollTheme.cockpit.panel,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -56,
          right: -40,
          width: 150,
          height: 150,
          borderRadius: 999,
          backgroundColor: hasActiveTable
            ? rollTheme.cockpit.magicGlow
            : theme.colors.surfaceSoft,
          opacity: hasActiveTable ? 0.18 : 0.1,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <Text
            style={{
              color: theme.colors.textSubtle,
              fontSize: theme.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.9,
            }}
          >
            ✦ Session active
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.text,
              fontSize: 22,
              fontWeight: "900",
              letterSpacing: -0.3,
            }}
          >
            {displayTableName}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              color: theme.colors.textMuted,
              lineHeight: 20,
              fontWeight: "600",
            }}
          >
            {hasActiveTable
              ? "Table chargée : actions, profils et règles disponibles."
              : "Lance librement ou active une table pour retrouver tes actions."}
          </Text>
        </View>

        <StatusPill
          label={hasActiveTable ? "Table active" : "Libre"}
          active={hasActiveTable}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.sm,
          alignItems: "stretch",
        }}
      >
        <Pressable
          onPress={onPressProfile}
          disabled={!canCycleProfile}
          style={({ pressed }) => ({
            flex: 1,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: canCycleProfile
              ? theme.colors.accent
              : theme.colors.borderSoft,
            borderRadius: theme.radius.lg,
            backgroundColor: canCycleProfile
              ? theme.colors.accentSoft
              : theme.colors.surfaceAlt,
            gap: theme.spacing.xs,
            opacity: !hasActiveTable ? 0.68 : pressed ? 0.86 : 1,
            transform: [{ scale: pressed && canCycleProfile ? 0.98 : 1 }],
          })}
        >
          <Text
            style={{
              color: theme.colors.textSubtle,
              fontSize: theme.typography.tiny,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Profil
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.text,
              fontSize: 17,
              fontWeight: "900",
            }}
          >
            {displayProfileName}
            {canCycleProfile ? " ▾" : ""}
          </Text>
        </Pressable>

        {hasActiveTable ? (
          <Pressable
            onPress={onClearTable}
            style={({ pressed }) => ({
              width: 94,
              padding: theme.spacing.md,
              borderWidth: 1,
              borderColor: theme.colors.borderSoft,
              borderRadius: theme.radius.lg,
              backgroundColor: pressed
                ? theme.colors.surfaceSoft
                : theme.colors.surfaceAlt,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.86 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.typography.small,
                fontWeight: "900",
                textAlign: "center",
              }}
            >
              Quitter
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
