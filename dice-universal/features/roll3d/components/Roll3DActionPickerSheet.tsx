// dice-universal/features/roll3d/components/Roll3DActionPickerSheet.tsx

import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DActionEntryInsertMode } from "../types";
import type { Roll3DActionItem } from "./Roll3DActionEntrySelector";

import { useSafeAreaInsets } from "react-native-safe-area-context";

type Roll3DActionPickerSheetProps = {
  visible: boolean;
  profileName: string | null;
  actions: Roll3DActionItem[];
  selectedActionId: string | null;
  selectedEntryId: string | null;
  insertMode: Roll3DActionEntryInsertMode;
  onClose: () => void;
  onSelectAction: (actionId: string) => void;
  onSelectEntry: (params: { actionId: string; entryId: string }) => void;
  onChangeInsertMode: (mode: Roll3DActionEntryInsertMode) => void;
  onAdjustEntry: (params: { actionId: string; entryId: string }) => void;
};

function ModeSegmentButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          minHeight: 34,
          borderRadius: 999,
          borderWidth: selected ? 1 : 0,
          borderColor: selected ? "rgba(232, 200, 120, 0.30)" : "transparent",
          backgroundColor: selected ? "rgba(232, 200, 120, 0.15)" : "transparent",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 10,
        }}
      >
        <Text
          style={{
            color: selected
              ? premium.colors.accent.primary
              : "rgba(255,255,255,0.58)",
            fontSize: 10,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.75,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function ActionCard({
  name,
  detail,
  selected,
  onPress,
}: {
  name: string;
  detail: string;
  selected: boolean;
  onPress: () => void;
}) {
  const premium = usePremiumTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.78 : 1,
        transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
      })}
    >
      <View
        style={{
          minHeight: 66,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: selected
            ? "rgba(232, 200, 120, 0.34)"
            : "rgba(255,255,255,0.075)",
          backgroundColor: selected
            ? "rgba(232, 200, 120, 0.10)"
            : "rgba(255,255,255,0.04)",
          paddingHorizontal: 13,
          paddingVertical: 11,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              color: selected
                ? premium.colors.accent.primary
                : "rgba(255,255,255,0.92)",
              fontSize: 14,
              fontWeight: "900",
            }}
          >
            {name}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              color: "rgba(255,255,255,0.50)",
              fontSize: 11,
              fontWeight: "800",
              lineHeight: 15,
              marginTop: 4,
            }}
          >
            {detail}
          </Text>
        </View>

        <View
          style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: selected
              ? "rgba(232, 200, 120, 0.24)"
              : "rgba(255,255,255,0.075)",
            backgroundColor: selected
              ? "rgba(232, 200, 120, 0.08)"
              : "rgba(255,255,255,0.045)",
            paddingHorizontal: 9,
            paddingVertical: 6,
          }}
        >
          <Text
            style={{
              color: selected
                ? premium.colors.accent.primary
                : "rgba(255,255,255,0.58)",
              fontSize: 9,
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            {selected ? "Actif" : "Choisir"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function EntryCard({
  actionId,
  entryId,
  label,
  detail,
  selected,
  onSelectEntry,
  onAdjustEntry,
}: {
  actionId: string;
  entryId: string;
  label: string;
  detail: string;
  selected: boolean;
  onSelectEntry: (params: { actionId: string; entryId: string }) => void;
  onAdjustEntry: (params: { actionId: string; entryId: string }) => void;
}) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        borderRadius: 22,
        borderWidth: 1,
        borderColor: selected
          ? "rgba(232, 200, 120, 0.28)"
          : "rgba(255,255,255,0.075)",
        backgroundColor: selected
          ? "rgba(232, 200, 120, 0.085)"
          : "rgba(255,255,255,0.04)",
        paddingHorizontal: 12,
        paddingVertical: 11,
        gap: 10,
      }}
    >
      <View style={{ gap: 4 }}>
        <Text
          numberOfLines={1}
          style={{
            color: selected
              ? premium.colors.accent.primary
              : "rgba(255,255,255,0.92)",
            fontSize: 13,
            fontWeight: "900",
          }}
        >
          {label}
        </Text>

        <Text
          numberOfLines={2}
          style={{
            color: "rgba(255,255,255,0.50)",
            fontSize: 10,
            fontWeight: "800",
            lineHeight: 14,
          }}
        >
          {detail}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => onSelectEntry({ actionId, entryId })}
          style={({ pressed }) => ({
            flex: 1,
            opacity: pressed ? 0.78 : 1,
            transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
          })}
        >
          <View
            style={{
              minHeight: 38,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(232, 200, 120, 0.28)",
              backgroundColor: "rgba(232, 200, 120, 0.12)",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 12,
            }}
          >
            <Text
              style={{
                color: premium.colors.accent.primary,
                fontSize: 11,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}
            >
              Poser sur la table
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => onAdjustEntry({ actionId, entryId })}
          style={({ pressed }) => ({
            opacity: pressed ? 0.78 : 1,
            transform: [{ scale: pressed ? premium.animation.pressScale : 1 }],
          })}
        >
          <View
            style={{
              minHeight: 38,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
              backgroundColor: "rgba(255,255,255,0.055)",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 13,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.78)",
                fontSize: 10,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 0.65,
              }}
            >
              Ajuster
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export function Roll3DActionPickerSheet({
  visible,
  profileName,
  actions,
  selectedActionId,
  selectedEntryId,
  insertMode,
  onClose,
  onSelectAction,
  onSelectEntry,
  onChangeInsertMode,
  onAdjustEntry,
}: Roll3DActionPickerSheetProps) {
  const premium = usePremiumTheme();

  const insets = useSafeAreaInsets();

  const selectedAction =
    actions.find((action) => action.id === selectedActionId) ?? null;

  const showEntries = !!selectedAction;

  const title = showEntries ? "Choisir une Main" : "Mains sauvegardées";

  const subtitle = showEntries
    ? selectedAction.name
    : profileName
      ? `${actions.length} Main${actions.length > 1 ? "s" : ""} sauvegardée${actions.length > 1 ? "s" : ""} · ${profileName}`
      : "Choisis une Main sauvegardée";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.60)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: Math.max(28, insets.top + 18),
          paddingBottom: Math.max(28, insets.bottom + 18),
        }}
      >
        <Pressable
          onPress={() => {
            return;
          }}
          style={{
            width: "100%",
            maxWidth: 430,
            maxHeight: "84%",
            borderRadius: 32,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.14)",
            backgroundColor: "rgba(6, 8, 18, 0.965)",
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: 14,
            gap: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  color: premium.colors.accent.primary,
                  fontSize: 10,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                {title}
              </Text>

              <Text
                numberOfLines={2}
                style={{
                  color: premium.colors.text.primary,
                  fontSize: 21,
                  fontWeight: "900",
                  marginTop: 4,
                  letterSpacing: -0.35,
                }}
              >
                {subtitle}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                opacity: pressed ? 0.72 : 1,
              })}
            >
              <View
                style={{
                  minWidth: 72,
                  height: 34,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  backgroundColor: "rgba(255,255,255,0.045)",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.66)",
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                  }}
                >
                  Fermer
                </Text>
              </View>
            </Pressable>
          </View>

          <View
            style={{
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.07)",
              backgroundColor: "rgba(255,255,255,0.035)",
              padding: 4,
              flexDirection: "row",
              gap: 6,
            }}
          >
            <ModeSegmentButton
              label="Remplacer"
              selected={insertMode === "replace"}
              onPress={() => onChangeInsertMode("replace")}
            />

            <ModeSegmentButton
              label="Cumuler"
              selected={insertMode === "append"}
              onPress={() => onChangeInsertMode("append")}
            />
          </View>

          {showEntries ? (
            <Pressable
              onPress={() => onSelectAction("")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.74 : 1,
              })}
            >
              <View
                style={{
                  minHeight: 34,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.62)",
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                  }}
                >
                  Revenir aux Mains
                </Text>
              </View>
            </Pressable>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: 9,
              paddingBottom: 24,
            }}
          >
            {actions.length === 0 ? (
              <View
                style={{
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  paddingHorizontal: 13,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.78)",
                    fontSize: 12,
                    fontWeight: "800",
                    lineHeight: 17,
                  }}
                >
                  Aucune Main sauvegardée. Crée une Main depuis la table ou l’atelier
                  pour la retrouver ici.
                </Text>
              </View>
            ) : showEntries && selectedAction ? (
              selectedAction.entries.map((entry) => (
                <EntryCard
                  key={`roll-3d-action-entry-card-${selectedAction.id}-${entry.id}`}
                  actionId={selectedAction.id}
                  entryId={entry.id}
                  label={entry.label}
                  detail={entry.detail}
                  selected={entry.id === selectedEntryId}
                  onSelectEntry={onSelectEntry}
                  onAdjustEntry={onAdjustEntry}
                />
              ))
            ) : (
              actions.map((action) => (
                <ActionCard
                  key={`roll-3d-action-card-${action.id}`}
                  name={action.name}
                  detail={action.detail}
                  selected={action.id === selectedActionId}
                  onPress={() => onSelectAction(action.id)}
                />
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}