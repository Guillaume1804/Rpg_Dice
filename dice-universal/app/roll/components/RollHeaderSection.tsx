import { View, Text, Pressable } from "react-native";

type RollHeaderSectionProps = {
  tableName: string;
  onRollTable: () => void;
};

export function RollHeaderSection({
  tableName,
  onRollTable,
}: RollHeaderSectionProps) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        Jet — {tableName}
      </Text>

      <Pressable
        onPress={onRollTable}
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          Lancer la table
        </Text>
      </Pressable>
    </View>
  );
}