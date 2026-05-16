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
  onPressTableMenu: () => void;
  onPressProfileMenu: () => void;
};

function HeaderLogo() {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 66,
        paddingTop: 1,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.text,
          fontSize: 22,
          fontWeight: "900",
          letterSpacing: 2.8,
          lineHeight: 25,
        }}
      >
        DICE
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.accent,
          fontSize: 8,
          fontWeight: "900",
          letterSpacing: 2.4,
          textTransform: "uppercase",
          marginTop: -2,
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
  onPress,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 56,
        paddingVertical: 7,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.22)",
        borderRadius: 18,
        backgroundColor: "rgba(13, 19, 43, 0.72)",
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        overflow: "hidden",
        opacity: disabled ? 0.74 : pressed ? 0.86 : 1,
        transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
      })}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -32,
          right: -28,
          width: 82,
          height: 82,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.magicGlow,
          opacity: 0.13,
        }}
      />

      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "rgba(145, 113, 255, 0.2)",
          backgroundColor: "rgba(32, 41, 88, 0.5)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          {icon}
        </Text>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.textSubtle,
            fontSize: 9,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.7,
            lineHeight: 12,
          }}
        >
          {eyebrow}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.text,
            fontSize: 14,
            fontWeight: "900",
            letterSpacing: -0.2,
            lineHeight: 17,
          }}
        >
          {title}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.textMuted,
            fontSize: 10,
            fontWeight: "800",
            lineHeight: 13,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: 16,
          fontWeight: "900",
          marginLeft: -4,
          lineHeight: 18,
        }}
      >
        ☰
      </Text>
    </Pressable>
  );
}

export function SessionBar({
  tableName,
  activeProfileName,
  hasActiveTable,
  profileCount,
  onPressTableMenu,
  onPressProfileMenu,
}: SessionBarProps) {
  const displayTableName = tableName ?? "Mode libre";
  const displayProfileName = activeProfileName ?? "Aucun profil";

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          gap: 7,
          alignItems: "center",
        }}
      >
        <SessionTile
          eyebrow={hasActiveTable ? "Table active" : "Table"}
          title={displayTableName}
          subtitle={hasActiveTable ? "Session liée" : "Jet libre"}
          icon={hasActiveTable ? "🏰" : "🎲"}
          onPress={onPressTableMenu}
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
          disabled={!hasActiveTable}
          onPress={onPressProfileMenu}
        />
      </View>
    </View>
  );
}