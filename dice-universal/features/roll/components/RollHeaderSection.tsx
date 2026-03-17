import { View, Text } from "react-native";

type RollHeaderSectionProps = {
  tableName: string;
  profileCount: number;
  groupCount: number;
};

export function RollHeaderSection({
  tableName,
  profileCount,
  groupCount,
}: RollHeaderSectionProps) {
  return (
    <View
      style={{
        padding: 14,
        borderWidth: 1,
        borderRadius: 14,
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 13, opacity: 0.72 }}>Table active</Text>

      <Text style={{ fontSize: 22, fontWeight: "800" }}>
        {tableName}
      </Text>

      <Text style={{ opacity: 0.75 }}>
        {profileCount} profil{profileCount > 1 ? "s" : ""} • {groupCount} action
        {groupCount > 1 ? "s" : ""}
      </Text>
    </View>
  );
}