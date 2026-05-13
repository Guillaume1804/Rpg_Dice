// dice-universal/features/rules/components/RulesEditorModalShell.tsx

import { Modal, View } from "react-native";
import type { ReactNode } from "react";

import { arcane } from "../../../theme/arcaneTheme";
import { arcaneStyles } from "../../../theme/arcaneStyles";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function RulesEditorModalShell({ visible, onClose, children }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.68)",
          justifyContent: "center",
          padding: arcane.spacing.md,
        }}
      >
        <View
          style={{
            ...arcaneStyles.card,
            maxHeight: "90%",
            gap: arcane.spacing.md,
            borderColor: arcane.colors.accent,
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}
