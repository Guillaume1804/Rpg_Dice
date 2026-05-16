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

  if (trimmed.length <= 13) return trimmed;

  return `${trimmed.slice(0, 11).trim()}…`;
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
        width: 78,
        height: 78,
        paddingVertical: 7,
        paddingHorizontal: 6,
        borderWidth: 1,
        borderColor: selected
          ? "rgba(217, 160, 55, 0.76)"
          : "rgba(145, 113, 255, 0.2)",
        borderRadius: 15,
        backgroundColor: selected
          ? "rgba(217, 160, 55, 0.15)"
          : "rgba(18, 23, 58, 0.58)",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        opacity: pressed ? 0.82 : selected ? 1 : 0.92,
        transform: [{ scale: pressed ? 0.96 : 1 }],
        shadowColor: selected ? theme.colors.accent : rollTheme.cockpit.glow,
        shadowOpacity: selected ? 0.22 : 0.06,
        shadowRadius: selected ? 12 : 6,
        shadowOffset: { width: 0, height: selected ? 5 : 3 },
        elevation: selected ? 4 : 1,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: selected
            ? "rgba(217, 160, 55, 0.74)"
            : "rgba(173, 102, 255, 0.48)",
          backgroundColor: selected
            ? "rgba(217, 160, 55, 0.14)"
            : "rgba(90, 55, 170, 0.14)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 20,
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
          fontSize: 11,
          lineHeight: 13,
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
        width: 78,
        height: 78,
        paddingVertical: 7,
        paddingHorizontal: 6,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.16)",
        borderRadius: 15,
        backgroundColor: "rgba(18, 23, 58, 0.42)",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        opacity: 0.78,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "rgba(145, 113, 255, 0.24)",
          backgroundColor: "rgba(90, 55, 170, 0.08)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: 23,
            fontWeight: "900",
            lineHeight: 24,
          }}
        >
          ⋯
        </Text>
      </View>

      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: 11,
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
        minHeight: 64,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "rgba(145, 113, 255, 0.16)",
        borderRadius: 16,
        backgroundColor: "rgba(18, 23, 58, 0.48)",
        justifyContent: "center",
        gap: 3,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: "900",
        }}
      >
        Aucune action rapide
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: theme.colors.textMuted,
          fontSize: 12,
          lineHeight: 16,
          fontWeight: "600",
        }}
      >
        Crée des actions depuis l’écran Tables.
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
        gap: 6,
        marginTop: -4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: theme.spacing.sm,
          paddingHorizontal: 2,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 13,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.65,
            }}
          >
            Actions rapides
          </Text>

          <Text
            numberOfLines={1}
            style={{
              marginTop: 0,
              color: theme.colors.textSubtle,
              fontSize: 11,
              fontWeight: "700",
            }}
          >
            {profileName}
          </Text>
        </View>

        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: 11,
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
            gap: 8,
            paddingHorizontal: 2,
            paddingBottom: 1,
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