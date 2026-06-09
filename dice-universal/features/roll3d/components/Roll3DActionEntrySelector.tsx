// dice-universal\features\roll3d\components\Roll3DActionEntrySelector.tsx

import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DActionEntryInsertMode } from "../types";

export type Roll3DActionEntryItem = {
  id: string;
  label: string;
  detail: string;
};

export type Roll3DActionItem = {
  id: string;
  name: string;
  detail: string;
  entries: Roll3DActionEntryItem[];
};

type Roll3DActionEntrySelectorProps = {
  profileName: string | null;
  actions: Roll3DActionItem[];
  selectedActionId: string | null;
  selectedEntryId: string | null;
  insertMode: Roll3DActionEntryInsertMode;
  compact?: boolean;
  onSelectAction: (actionId: string) => void;
  onSelectEntry: (params: { actionId: string; entryId: string }) => void;
  onAdjustEntry?: (params: { actionId: string; entryId: string }) => void;
  onChangeInsertMode: (mode: Roll3DActionEntryInsertMode) => void;
};

function getActionIcon(index: number) {
  const icons = ["✦", "◇", "⬟", "✧", "⬢", "◆"];
  return icons[index % icons.length];
}

function formatInsertModeLabel(mode: Roll3DActionEntryInsertMode) {
  return mode === "replace" ? "Remplacer" : "Ajouter";
}

export function Roll3DActionEntrySelector({
  profileName,
  actions,
  selectedActionId,
  selectedEntryId,
  insertMode,
  compact = false,
  onSelectAction,
  onSelectEntry,
  onAdjustEntry,
  onChangeInsertMode,
}: Roll3DActionEntrySelectorProps) {
  const premium = usePremiumTheme();

  const selectedAction =
    actions.find((action) => action.id === selectedActionId) ?? null;

  return (
    <View
      style={{
        width: "100%",
        borderRadius: premium.radius.xl,
        borderWidth: 1,
        borderColor: "rgba(232, 200, 120, 0.12)",
        backgroundColor: compact
          ? "rgba(5, 6, 11, 0.58)"
          : "rgba(5, 6, 11, 0.72)",
        paddingVertical: compact ? 7 : 9,
        paddingHorizontal: compact ? 7 : 9,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: compact ? 6 : 8,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              color: premium.colors.text.secondary,
              fontSize: 10,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 1.1,
            }}
          >
            {selectedAction ? "Entrées de l’action" : "Actions"}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: premium.colors.text.muted,
              fontSize: 10,
              fontWeight: "800",
              marginTop: 2,
            }}
          >
            {selectedAction
              ? selectedAction.name
              : profileName
                ? `${actions.length} action${actions.length > 1 ? "s" : ""} · ${profileName}`
                : "Aucun profil actif"}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 6,
          }}
        >
          {(["replace", "append"] as const).map((mode) => {
            const selected = insertMode === mode;

            return (
              <Pressable
                key={`action-entry-insert-mode-${mode}`}
                onPress={() => onChangeInsertMode(mode)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.78 : 1,
                  transform: [
                    { scale: pressed ? premium.animation.pressScale : 1 },
                  ],
                })}
              >
                <View
                  style={{
                    borderRadius: premium.radius.pill,
                    borderWidth: 1,
                    borderColor: selected
                      ? premium.colors.border.accent
                      : premium.colors.border.subtle,
                    backgroundColor: selected
                      ? premium.colors.accent.soft
                      : "rgba(255,255,255,0.045)",
                    paddingHorizontal: 9,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    style={{
                      color: selected
                        ? premium.colors.accent.primary
                        : premium.colors.text.secondary,
                      fontSize: 9,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: 0.55,
                    }}
                  >
                    {formatInsertModeLabel(mode)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {actions.length === 0 ? (
        <View
          style={{
            minHeight: compact ? 58 : 68,
            borderRadius: premium.radius.lg,
            borderWidth: 1,
            borderColor: premium.colors.border.subtle,
            backgroundColor: "rgba(255,255,255,0.045)",
            paddingHorizontal: 12,
            paddingVertical: 10,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: premium.colors.text.primary,
              fontSize: 13,
              fontWeight: "900",
            }}
          >
            Aucune action disponible
          </Text>

          <Text
            style={{
              color: premium.colors.text.secondary,
              fontSize: 11,
              fontWeight: "700",
              lineHeight: 15,
              marginTop: 3,
            }}
          >
            Crée des actions depuis l’espace Préparation.
          </Text>
        </View>
      ) : selectedAction ? (
        <View style={{ gap: 8 }}>
          <Pressable
            onPress={() => onSelectAction("")}
            style={({ pressed }) => ({
              opacity: pressed ? 0.76 : 1,
              transform: [
                { scale: pressed ? premium.animation.pressScale : 1 },
              ],
            })}
          >
            <Text
              style={{
                color: premium.colors.accent.primary,
                fontSize: 10,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              ← Retour aux actions
            </Text>
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: compact ? 8 : 10,
              paddingRight: 2,
            }}
          >
            {selectedAction.entries.map((entry) => {
              const selected = selectedEntryId === entry.id;

              return (
                <Pressable
                  key={`roll-3d-action-entry-${entry.id}`}
                  onPress={() =>
                    onSelectEntry({
                      actionId: selectedAction.id,
                      entryId: entry.id,
                    })
                  }
                  style={({ pressed }) => ({
                    width: compact ? 190 : 230,
                    minHeight: compact ? 68 : 78,
                    opacity: pressed ? 0.84 : 1,
                    transform: [
                      {
                        scale: pressed
                          ? premium.animation.pressScale
                          : selected
                            ? 1.015
                            : 1,
                      },
                    ],
                  })}
                >
                  <LinearGradient
                    colors={
                      selected
                        ? ["rgba(232, 200, 120, 0.26)", "rgba(5, 6, 11, 0.92)"]
                        : ["rgba(255, 255, 255, 0.075)", "rgba(5, 6, 11, 0.9)"]
                    }
                    start={{ x: 0.18, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={{
                      flex: 1,
                      borderRadius: premium.radius.lg,
                      borderWidth: 1,
                      borderColor: selected
                        ? premium.colors.border.accent
                        : premium.colors.border.subtle,
                      padding: compact ? 10 : 12,
                      overflow: "hidden",
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        color: selected
                          ? premium.colors.accent.primary
                          : premium.colors.text.primary,
                        fontSize: compact ? 13 : 14,
                        fontWeight: "900",
                      }}
                    >
                      {entry.label}
                    </Text>

                    <Text
                      numberOfLines={2}
                      style={{
                        color: premium.colors.text.secondary,
                        fontSize: compact ? 10 : 11,
                        fontWeight: "700",
                        lineHeight: compact ? 14 : 15,
                        marginTop: 4,
                      }}
                    >
                      {entry.detail}
                    </Text>

                    {onAdjustEntry ? (
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          onAdjustEntry({
                            actionId: selectedAction.id,
                            entryId: entry.id,
                          });
                        }}
                        style={({ pressed }) => ({
                          alignSelf: "flex-start",
                          marginTop: 8,
                          borderRadius: premium.radius.pill,
                          borderWidth: 1,
                          borderColor: selected
                            ? premium.colors.border.accent
                            : premium.colors.border.subtle,
                          backgroundColor: pressed
                            ? premium.colors.surface.pressed
                            : "rgba(255,255,255,0.055)",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          opacity: pressed ? 0.78 : 1,
                          transform: [
                            {
                              scale: pressed ? premium.animation.pressScale : 1,
                            },
                          ],
                        })}
                      >
                        <Text
                          style={{
                            color: selected
                              ? premium.colors.accent.primary
                              : premium.colors.text.secondary,
                            fontSize: 9,
                            fontWeight: "900",
                            textTransform: "uppercase",
                            letterSpacing: 0.65,
                          }}
                        >
                          Ajuster
                        </Text>
                      </Pressable>
                    ) : null}
                    
                  </LinearGradient>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: compact ? 8 : 10,
            paddingRight: 2,
          }}
        >
          {actions.map((action, index) => (
            <Pressable
              key={`roll-3d-action-${action.id}`}
              onPress={() => onSelectAction(action.id)}
              style={({ pressed }) => ({
                width: compact ? 176 : 210,
                minHeight: compact ? 70 : 82,
                opacity: pressed ? 0.84 : 1,
                transform: [
                  { scale: pressed ? premium.animation.pressScale : 1 },
                ],
              })}
            >
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.075)", "rgba(5, 6, 11, 0.9)"]}
                start={{ x: 0.18, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: premium.radius.lg,
                  borderWidth: 1,
                  borderColor: premium.colors.border.subtle,
                  padding: compact ? 10 : 12,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 9,
                  }}
                >
                  <View
                    style={{
                      width: compact ? 32 : 36,
                      height: compact ? 32 : 36,
                      borderRadius: premium.radius.md,
                      borderWidth: 1,
                      borderColor: premium.colors.border.subtle,
                      backgroundColor: "rgba(255,255,255,0.055)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: premium.colors.text.secondary,
                        fontSize: compact ? 16 : 18,
                        fontWeight: "900",
                      }}
                    >
                      {getActionIcon(index)}
                    </Text>
                  </View>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: premium.colors.text.primary,
                        fontSize: compact ? 13 : 14,
                        fontWeight: "900",
                      }}
                    >
                      {action.name}
                    </Text>

                    <Text
                      numberOfLines={2}
                      style={{
                        color: premium.colors.text.secondary,
                        fontSize: compact ? 10 : 11,
                        fontWeight: "700",
                        lineHeight: compact ? 14 : 15,
                        marginTop: 3,
                      }}
                    >
                      {action.detail}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
