import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="roll"
        options={{
          title: "Jet",
          tabBarLabel: "Jet",
        }}
      />

      <Tabs.Screen
        name="tables"
        options={{
          title: "Mes tables",
          tabBarLabel: "Tables",
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "Historique",
          tabBarLabel: "Historique",
        }}
      />

      <Tabs.Screen
        name="rules"
        options={{
          title: "Règles",
          tabBarLabel: "Règles",
        }}
      />
    </Tabs>
  );
}