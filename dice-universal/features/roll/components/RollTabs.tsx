import { View, Text, Pressable } from "react-native";

type RollTabsProps = {
  activeTab: "quick" | "actions";
  onChangeTab: (tab: "quick" | "actions") => void;
};

export function RollTabs({ activeTab, onChangeTab }: RollTabsProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        borderWidth: 1,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={() => onChangeTab("quick")}
        style={{
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 16,
          alignItems: "center",
          backgroundColor: activeTab === "quick" ? "#eaeaea" : "transparent",
        }}
      >
        <Text style={{ fontWeight: activeTab === "quick" ? "700" : "500" }}>
          Jet rapide
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChangeTab("actions")}
        style={{
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 16,
          alignItems: "center",
          backgroundColor: activeTab === "actions" ? "#eaeaea" : "transparent",
          borderLeftWidth: 1,
        }}
      >
        <Text style={{ fontWeight: activeTab === "actions" ? "700" : "500" }}>
          Actions
        </Text>
      </Pressable>
    </View>
  );
}