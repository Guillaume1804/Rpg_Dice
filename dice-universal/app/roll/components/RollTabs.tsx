import { View, Text, Pressable } from "react-native";

type RollTabsProps = {
  activeTab: "quick" | "profiles";
  onChangeTab: (tab: "quick" | "profiles") => void;
};

export function RollTabs({ activeTab, onChangeTab }: RollTabsProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: 12,
        marginBottom: 12,
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
          Jet Libre
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChangeTab("profiles")}
        style={{
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 16,
          alignItems: "center",
          backgroundColor: activeTab === "profiles" ? "#eaeaea" : "transparent",
          borderLeftWidth: 1,
        }}
      >
        <Text style={{ fontWeight: activeTab === "profiles" ? "700" : "500" }}>
          Profils
        </Text>
      </Pressable>
    </View>
  );
}