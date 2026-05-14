// dice-universal\features\tables\components\TableDetailHeader.tsx

import { View, Text, Pressable } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";

type TableDetailHeaderProps = {
  tableName: string;
  isSystem: boolean;
  onRenameTable: () => void;
  onCreateProfile: () => void;
};

function HeaderButton({
  label,
  onPress,
  variant = "default",
}: {
  label: string;
  onPress: () => void;
  variant?: "default" | "accent";
}) {
  const { theme } = useArcaneTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor:
          variant === "accent" ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.pill,
        backgroundColor:
          variant === "accent"
            ? theme.colors.accentSoft
            : theme.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TableDetailHeader({
  tableName,
  isSystem,
  onRenameTable,
  onCreateProfile,
}: TableDetailHeaderProps) {
  const { theme, styles } = useArcaneTheme();
  return (
    <View
      style={{
        ...styles.card,
        gap: theme.spacing.md,
      }}
    >
      <View style={{ gap: theme.spacing.xs }}>
        <Text
          style={{
            color: theme.colors.textSubtle,
            fontSize: theme.typography.tiny,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Table
        </Text>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 26,
            fontWeight: "900",
            letterSpacing: -0.3,
          }}
        >
          {tableName}
        </Text>

        {isSystem ? (
          <Text style={styles.muted}>
            Table système : modification interdite.
          </Text>
        ) : (
          <Text style={styles.muted}>
            Gère les profils, actions et entrées de dés de cette table.
          </Text>
        )}
      </View>

      {!isSystem ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing.sm,
          }}
        >
          <HeaderButton label="Renommer la table" onPress={onRenameTable} />
          <HeaderButton
            label="Créer un profil"
            onPress={onCreateProfile}
            variant="accent"
          />
        </View>
      ) : null}
    </View>
  );
}
