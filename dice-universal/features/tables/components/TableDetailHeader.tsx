import { View, Text, Pressable } from "react-native";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor:
          variant === "accent" ? arcane.colors.accent : arcane.colors.border,
        borderRadius: arcane.radius.pill,
        backgroundColor:
          variant === "accent"
            ? arcane.colors.accentSoft
            : arcane.colors.surfaceAlt,
        opacity: pressed ? 0.84 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
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

export function TableDetailHeader({
  tableName,
  isSystem,
  onRenameTable,
  onCreateProfile,
}: TableDetailHeaderProps) {
  return (
    <View
      style={{
        ...arcaneStyles.card,
        gap: arcane.spacing.md,
      }}
    >
      <View style={{ gap: arcane.spacing.xs }}>
        <Text
          style={{
            color: arcane.colors.textSubtle,
            fontSize: arcane.typography.tiny,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Table
        </Text>

        <Text
          style={{
            color: arcane.colors.text,
            fontSize: 26,
            fontWeight: "900",
            letterSpacing: -0.3,
          }}
        >
          {tableName}
        </Text>

        {isSystem ? (
          <Text style={arcaneStyles.muted}>
            Table système : modification interdite.
          </Text>
        ) : (
          <Text style={arcaneStyles.muted}>
            Gère les profils, actions et entrées de dés de cette table.
          </Text>
        )}
      </View>

      {!isSystem ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: arcane.spacing.sm,
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
