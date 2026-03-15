import { Modal, View } from "react-native";
import type { ReactNode } from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function RulesEditorModalShell({
  visible,
  onClose,
  children,
}: Props) {
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
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            maxHeight: "90%",
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}