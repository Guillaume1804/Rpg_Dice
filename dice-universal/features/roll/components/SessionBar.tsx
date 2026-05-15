// dice-universal\features\roll\components\SessionBar.tsx

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

function HeaderLogo() {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        minWidth: 86,
        paddingTop: 2,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.text,
          fontSize: 30,
          fontWeight: "900",
          letterSpacing: 4,
          lineHeight: 34,
        }}
      >
        DICE
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.accent,
          fontSize: 11,
          fontWeight: "900",
          letterSpacing: 4,
          textTransform: "uppercase",
          marginTop: -1,
        }}
      >
        Universal
      </Text>
    </View>
  );
}

function SessionTile({
  eyebrow,
  title,
  subtitle,
  icon,
  disabled = false,
  showChevron = false,
  onPress,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: string;
  disabled?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
}) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  const content = (
    <>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -34,
          right: -26,
          width: 92,
          height: 92,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.magicGlow,
          opacity: 0.18,
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -28,
          bottom: -38,
          width: 82,
          height: 82,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.glow,
          opacity: 0.08,
        }}
      />

      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: rollTheme.cockpit.borderSoft,
          backgroundColor: rollTheme.cockpit.panelAlt,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 21,
            fontWeight: "900",
          }}
        >
          {icon}
        </Text>
      </View>

      <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.textSubtle,
            fontSize: 10,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {eyebrow}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "900",
            letterSpacing: -0.25,
            lineHeight: 20,
          }}
        >
          {title}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.textMuted,
            fontSize: 12,
            fontWeight: "800",
            lineHeight: 15,
          }}
        >
          {subtitle}
        </Text>
      </View>

      {showChevron ? (
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: 16,
            fontWeight: "900",
            marginLeft: -2,
          }}
        >
          ▾
        </Text>
      ) : null}
    </>
  );

  const baseStyle = {
    flex: 1,
    minHeight: 68,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: rollTheme.cockpit.borderSoft,
    borderRadius: theme.radius.xl,
    backgroundColor: rollTheme.cockpit.panel,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    overflow: "hidden" as const,
    opacity: disabled ? 0.74 : 1,
  };

  if (!onPress) {
    return <View style={baseStyle}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        ...baseStyle,
        opacity: disabled ? 0.74 : pressed ? 0.86 : 1,
        transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
      })}
    >
      {content}
    </Pressable>
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
  const { theme } = useArcaneTheme();

  const displayTableName = tableName ?? "Mode libre";
  const displayProfileName = activeProfileName ?? "Aucun profil";
  const canCycleProfile = hasActiveTable && profileCount > 1;

  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
        }}
      >
        <SessionTile
          eyebrow={hasActiveTable ? "Table active" : "Table"}
          title={displayTableName}
          subtitle={hasActiveTable ? "Session liée" : "Jet libre"}
          icon={hasActiveTable ? "🏰" : "🎲"}
          showChevron={hasActiveTable}
        />

        <HeaderLogo />

        <SessionTile
          eyebrow="Profil actif"
          title={displayProfileName}
          subtitle={
            hasActiveTable
              ? `${profileCount} profil${profileCount > 1 ? "s" : ""}`
              : "Non lié"
          }
          icon={hasActiveTable ? "✦" : "◇"}
          disabled={!canCycleProfile}
          showChevron={canCycleProfile}
          onPress={canCycleProfile ? onPressProfile : undefined}
        />
      </View>

      {hasActiveTable ? (
        <Pressable
          onPress={onClearTable}
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            paddingVertical: 7,
            paddingHorizontal: 11,
            borderWidth: 1,
            borderColor: theme.colors.borderSoft,
            borderRadius: theme.radius.pill,
            backgroundColor: pressed
              ? theme.colors.surfaceSoft
              : theme.colors.surfaceAlt,
            opacity: pressed ? 0.86 : 1,
          })}
        >
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 12,
              fontWeight: "900",
            }}
          >
            Quitter la table
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}