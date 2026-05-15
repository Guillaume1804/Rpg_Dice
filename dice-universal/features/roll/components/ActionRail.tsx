// dice-universal/features/roll/components/ActionRail.tsx

import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useArcaneTheme } from "../../../theme/ArcaneThemeProvider";
import { createRollScreenTheme } from "../../../theme/rollScreenTheme";

export type ActionRailItem = {
  id: string;
  name: string;
  detail: string;
};

type ActionRailProps = {
  profileName: string | null;
  actions: ActionRailItem[];
  selectedActionId: string | null;
  onPrepareAction: (actionId: string) => void;
};

function getActionIcon(index: number) {
  const icons = ["📖", "🎒", "🎯", "✦", "⏳", "⋯"];
  return icons[index % icons.length];
}

function compactActionName(name: string) {
  const trimmed = name.trim();

  if (trimmed.length <= 18) return trimmed;

  return `${trimmed.slice(0, 16).trim()}…`;
}

function ActionTile({
  action,
  index,
  selected,
  onPress,
}: {
  action: ActionRailItem;
  index: number;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 112,
        minHeight: 116,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        borderWidth: 1,
        borderColor: selected
          ? theme.colors.accent
          : rollTheme.quickActions.border,
        borderRadius: theme.radius.lg,
        backgroundColor: selected
          ? theme.colors.accentSoft
          : rollTheme.quickActions.background,
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.spacing.sm,
        opacity: pressed ? 0.84 : selected ? 1 : 0.94,
        transform: [{ scale: pressed ? 0.96 : 1 }],
        shadowColor: selected ? rollTheme.cockpit.glow : theme.colors.black,
        shadowOpacity: selected ? 0.2 : 0.08,
        shadowRadius: selected ? 14 : 8,
        shadowOffset: { width: 0, height: 6 },
        elevation: selected ? 4 : 1,
      })}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: selected ? theme.colors.accent : theme.colors.arcane,
          backgroundColor: selected
            ? theme.colors.accentSoft
            : theme.colors.arcaneSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            color: selected ? theme.colors.accent : theme.colors.arcane,
          }}
        >
          {getActionIcon(index)}
        </Text>
      </View>

      <Text
        numberOfLines={2}
        style={{
          color: theme.colors.text,
          fontSize: 13,
          lineHeight: 16,
          fontWeight: "900",
          textAlign: "center",
        }}
      >
        {compactActionName(action.name)}
      </Text>

      <View
        style={{
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderWidth: 1,
          borderColor: selected ? theme.colors.accent : theme.colors.borderSoft,
          borderRadius: theme.radius.pill,
          backgroundColor: selected
            ? theme.colors.accentSoft
            : rollTheme.cockpit.panelAlt,
        }}
      >
        <Text
          style={{
            color: selected ? theme.colors.accent : theme.colors.textSubtle,
            fontSize: 10,
            fontWeight: "900",
            textTransform: "uppercase",
          }}
        >
          {selected ? "Prêt" : "Action"}
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyActionTile() {
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  return (
    <View
      style={{
        ...styles.cardSoft,
        backgroundColor: rollTheme.cockpit.panelAlt,
        borderColor: rollTheme.cockpit.borderSoft,
        gap: theme.spacing.xs,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: "900",
        }}
      >
        Aucune action rapide
      </Text>

      <Text
        style={{
          color: theme.colors.textMuted,
          lineHeight: 20,
          fontWeight: "600",
        }}
      >
        Crée des actions depuis l’écran Tables pour les retrouver ici pendant la
        partie.
      </Text>
    </View>
  );
}

export function ActionRail({
  profileName,
  actions,
  selectedActionId,
  onPrepareAction,
}: ActionRailProps) {
  const { theme } = useArcaneTheme();

  if (!profileName) return null;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: theme.spacing.md,
          paddingHorizontal: 2,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 15,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Actions rapides
          </Text>

          <Text
            numberOfLines={1}
            style={{
              marginTop: 2,
              color: theme.colors.textSubtle,
              fontSize: theme.typography.small,
              fontWeight: "700",
            }}
          >
            {profileName}
          </Text>
        </View>

        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.small,
            fontWeight: "800",
          }}
        >
          {actions.length} action{actions.length > 1 ? "s" : ""}
        </Text>
      </View>

      {actions.length === 0 ? (
        <EmptyActionTile />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: theme.spacing.sm,
            paddingHorizontal: 2,
            paddingBottom: 2,
          }}
        >
          {actions.map((action, index) => (
            <ActionTile
              key={action.id}
              action={action}
              index={index}
              selected={selectedActionId === action.id}
              onPress={() => onPrepareAction(action.id)}
            />
          ))}

          <View
            style={{
              width: 112,
              minHeight: 116,
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.sm,
              borderWidth: 1,
              borderColor: theme.colors.borderSoft,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surfaceAlt,
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.sm,
              opacity: 0.72,
            }}
          >
            <Text
              style={{
                color: theme.colors.textSubtle,
                fontSize: 28,
                fontWeight: "900",
              }}
            >
              ⋯
            </Text>

            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: 13,
                lineHeight: 16,
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              Plus
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
