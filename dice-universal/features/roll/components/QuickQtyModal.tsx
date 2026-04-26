// dice-universal/features/roll/components/QuickQtyModal.tsx

import { View, Text, Pressable, TextInput } from "react-native";

type Props = {
  visible: boolean;
  qtyValue: string;
  modifierValue: string;
  onChangeQtyValue: (value: string) => void;
  onChangeModifierValue: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function QuickQtyModal({
  visible,
  qtyValue,
  modifierValue,
  onChangeQtyValue,
  onChangeModifierValue,
  onClose,
  onSave,
}: Props) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 14,
          padding: 16,
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800" }}>
          Modifier la quantité
        </Text>

        <Text style={{ opacity: 0.72 }}>Saisis le nombre de dés voulu.</Text>

        <View
          style={{
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <TextInput
            value={qtyValue}
            onChangeText={onChangeQtyValue}
            keyboardType="number-pad"
            placeholder="Quantité"
            style={{ fontSize: 16 }}
          />
        </View>

        <Text style={{ opacity: 0.72 }}>
          Modificateur appliqué à cette entrée uniquement.
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <TextInput
            value={modifierValue}
            onChangeText={onChangeModifierValue}
            keyboardType="numbers-and-punctuation"
            placeholder="Modificateur"
            style={{ fontSize: 16 }}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <Pressable
            onPress={onClose}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text>Annuler</Text>
          </Pressable>

          <Pressable
            onPress={onSave}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "700" }}>Valider</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}