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

function ActionBadge({ label }: { label: string }) {
  const { theme } = useArcaneTheme();

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingVertical: 5,
        paddingHorizontal: 9,
        borderWidth: 1,
        borderColor: theme.colors.borderSoft,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.surfaceAlt,
      }}
    >
      <Text
        style={{
          color: theme.colors.textMuted,
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {label}
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
  const { theme, styles } = useArcaneTheme();
  const rollTheme = useMemo(() => createRollScreenTheme(theme), [theme]);

  if (!profileName) return null;

  return (
    <View
      style={{
        ...styles.card,
        gap: theme.spacing.md,
        borderRadius: rollTheme.layout.cockpitRadius,
        borderColor: rollTheme.cockpit.border,
        backgroundColor: rollTheme.cockpit.panel,
        overflow: "hidden",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -60,
          top: -70,
          width: 180,
          height: 180,
          borderRadius: 999,
          backgroundColor: rollTheme.cockpit.magicGlow,
          opacity: 0.12,
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
            ✦ Actions rapides
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.text,
              fontSize: 20,
              fontWeight: "900",
              letterSpacing: -0.2,
            }}
          >
            {profileName}
          </Text>
        </View>

        <ActionBadge
          label={`${actions.length} action${actions.length > 1 ? "s" : ""}`}
        />
      </View>

      {actions.length === 0 ? (
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
            Aucune action enregistrée
          </Text>

          <Text
            style={{
              color: theme.colors.textMuted,
              lineHeight: 20,
              fontWeight: "600",
            }}
          >
            Crée des actions depuis l’écran Tables pour les retrouver ici en un
            geste.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: theme.spacing.sm,
            paddingRight: theme.spacing.xs,
          }}
        >
          {actions.map((action) => {
            const isSelected = selectedActionId === action.id;

            return (
              <Pressable
                key={action.id}
                onPress={() => onPrepareAction(action.id)}
                style={({ pressed }) => ({
                  width: 168,
                  minHeight: 116,
                  padding: theme.spacing.md,
                  borderWidth: 1,
                  borderColor: isSelected
                    ? theme.colors.accent
                    : rollTheme.cockpit.borderSoft,
                  borderRadius: theme.radius.lg,
                  backgroundColor: isSelected
                    ? theme.colors.accentSoft
                    : rollTheme.cockpit.panelAlt,
                  justifyContent: "space-between",
                  opacity: pressed ? 0.84 : isSelected ? 1 : 0.92,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  shadowColor: isSelected
                    ? rollTheme.cockpit.glow
                    : theme.colors.black,
                  shadowOpacity: isSelected ? 0.22 : 0.08,
                  shadowRadius: isSelected ? 14 : 8,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: isSelected ? 4 : 1,
                })}
              >
                <View style={{ gap: theme.spacing.xs }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: theme.colors.text,
                      fontSize: 16,
                      fontWeight: "900",
                    }}
                  >
                    {action.name}
                  </Text>

                  <Text
                    numberOfLines={3}
                    style={{
                      color: theme.colors.textMuted,
                      lineHeight: 18,
                      fontWeight: "600",
                    }}
                  >
                    {action.detail}
                  </Text>
                </View>

                <View
                  style={{
                    marginTop: theme.spacing.md,
                    alignSelf: "flex-start",
                    paddingVertical: 5,
                    paddingHorizontal: 9,
                    borderWidth: 1,
                    borderColor: isSelected
                      ? theme.colors.accent
                      : theme.colors.borderSoft,
                    borderRadius: theme.radius.pill,
                    backgroundColor: isSelected
                      ? theme.colors.accentSoft
                      : theme.colors.surfaceAlt,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected
                        ? theme.colors.accent
                        : theme.colors.textMuted,
                      fontSize: 12,
                      fontWeight: "900",
                    }}
                  >
                    {isSelected ? "Prêt" : "Préparer"}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
