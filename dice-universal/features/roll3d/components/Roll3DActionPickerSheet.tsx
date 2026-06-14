import { Modal, Pressable, Text, View } from "react-native";

import { usePremiumTheme } from "../../../theme/premium/usePremiumTheme";
import type { Roll3DActionEntryInsertMode } from "../types";
import {
  Roll3DActionEntrySelector,
  type Roll3DActionItem,
} from "./Roll3DActionEntrySelector";

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
  onAdjustEntry?: (params: { actionId: string; entryId: string }) => void;
  onChangeInsertMode: (mode: Roll3DActionEntryInsertMode) => void;
};

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
  onAdjustEntry,
  onChangeInsertMode,
}: Roll3DActionPickerSheetProps) {
  const premium = usePremiumTheme();

  const selectedAction =
    actions.find((action) => action.id === selectedActionId) ?? null;

  const title = selectedAction ? "Choisir un jet" : "Jets préparés";
  const subtitle = selectedAction
    ? selectedAction.name
    : profileName
      ? `${actions.length} jet${actions.length > 1 ? "s" : ""} disponible${actions.length > 1 ? "s" : ""} · ${profileName}`
      : "Choisis un jet préparé";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.58)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 28,
        }}
      >
        <Pressable
          onPress={() => {
            return;
          }}
          style={{
            width: "100%",
            maxWidth: 430,
            maxHeight: "82%",
            borderRadius: 32,
            borderWidth: 1,
            borderColor: "rgba(232, 200, 120, 0.14)",
            backgroundColor: "rgba(6, 8, 18, 0.955)",
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: 14,
            gap: 11,
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
                  fontSize: 11,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1.1,
                }}
              >
                {title}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: premium.colors.text.secondary,
                  fontSize: 12,
                  fontWeight: "800",
                  marginTop: 3,
                }}
              >
                {subtitle}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                opacity: pressed ? 0.74 : 1,
                transform: [
                  {
                    scale: pressed ? premium.animation.pressScale : 1,
                  },
                ],
              })}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(239, 111, 145, 0.32)",
                  backgroundColor: "rgba(239, 111, 145, 0.10)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: premium.colors.state.failure,
                    fontSize: 13,
                    fontWeight: "900",
                  }}
                >
                  ×
                </Text>
              </View>
            </Pressable>
          </View>

          <Roll3DActionEntrySelector
            compact
            profileName={profileName}
            actions={actions}
            selectedActionId={selectedActionId}
            selectedEntryId={selectedEntryId}
            insertMode={insertMode}
            onSelectAction={onSelectAction}
            onSelectEntry={(params) => {
              onSelectEntry(params);
              onClose();
            }}
            onChangeInsertMode={onChangeInsertMode}
            onAdjustEntry={onAdjustEntry}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
