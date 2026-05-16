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

  if (trimmed.length <= 16) return trimmed;

  return `${trimmed.slice(0, 14).trim()}…`;
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
        width: 92,
        height: 94,
        paddingVertical: 9,
        paddingHorizontal: 7,
        borderWidth: 1,
        borderColor: selected
          ? theme.colors.accent
          : "rgba(145, 113, 255, 0.22)",
        borderRadius: 16,
        backgroundColor: selected
          ? "rgba(217, 160, 55, 0.18)"
          : "rgba(18, 23, 58, 0.72)",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        opacity: pressed ? 0.84 : selected ? 1 : 0.94,
        transform: [{ scale: pressed ? 0.96 : 1 }],
        shadowColor: selected ? theme.colors.accent : rollTheme.cockpit.glow,
        shadowOpacity: selected ? 0.24 : 0.08,
        shadowRadius: selected ? 14 : 8,
        shadowOffset: { width: 0, height: selected ? 6 : 4 },
        elevation: selected ? 4 : 1,
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: selected
            ? theme.colors.accent
            : "rgba(173, 102, 255, 0.56)",
          backgroundColor: selected
            ? "rgba(217, 160, 55, 0.16)"
            : "rgba(90, 55, 170, 0.16)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 23,
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
          fontSize: 12,
          lineHeight: 14,
          fontWeight: "800",
          textAlign: "center",
        }}
      >
        {compactActionName(action.name)}
      </Text>
    </Pressable>
  );
}

function MoreActionTile() {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        width: 92,
        height: 94,
        paddingVertical: 9,
        paddingHorizontal: 7,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.18)",
        borderRadius: 16,
        backgroundColor: "rgba(18, 23, 58, 0.52)",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        opacity: 0.82,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: "rgba(145, 113, 255, 0.28)",
          backgroundColor: "rgba(90, 55, 170, 0.1)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: 25,
            fontWeight: "900",
            lineHeight: 26,
          }}
        >
          ⋯
        </Text>
      </View>

      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: 12,
          fontWeight: "800",
          textAlign: "center",
        }}
      >
        Plus
      </Text>
    </View>
  );
}

function EmptyActionTile() {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        minHeight: 82,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.18)",
        borderRadius: 18,
        backgroundColor: "rgba(18, 23, 58, 0.56)",
        justifyContent: "center",
        gap: 4,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 15,
          fontWeight: "900",
        }}
      >
        Aucune action rapide
      </Text>

      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: 13,
          lineHeight: 18,
          fontWeight: "600",
        }}
      >
        Crée des actions depuis l’écran Tables pour les retrouver ici.
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
    <View
      style={{
        gap: 8,
        marginTop: -2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: theme.spacing.md,
          paddingHorizontal: 2,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 14,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.7,
            }}
          >
            Actions rapides
          </Text>

          <Text
            numberOfLines={1}
            style={{
              marginTop: 1,
              color: theme.colors.textSubtle,
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            {profileName}
          </Text>
        </View>

        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: 12,
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
            gap: 10,
            paddingHorizontal: 2,
            paddingBottom: 3,
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

          <MoreActionTile />
        </ScrollView>
      )}
    </View>
  );
}
