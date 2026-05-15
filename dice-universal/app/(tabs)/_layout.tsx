// dice-universal/app/(tabs)/_layout.tsx

import { Tabs } from "expo-router";
import { Text } from "react-native";

import { useArcaneTheme } from "../../theme/ArcaneThemeProvider";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 18,
        fontWeight: "900",
        opacity: focused ? 1 : 0.58,
      }}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  const { theme } = useArcaneTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          minHeight: 72,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderSoft,
          backgroundColor: theme.colors.backgroundElevated,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800",
          marginTop: 2,
        },

        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSubtle,
      }}
    >
      <Tabs.Screen
        name="roll"
        options={{
          title: "Jet",
          tabBarLabel: "Jet",
          tabBarIcon: ({ focused }) => <TabIcon label="🎲" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="tables"
        options={{
          title: "Tables",
          tabBarLabel: "Tables",
          tabBarIcon: ({ focused }) => <TabIcon label="▦" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "Historique",
          tabBarLabel: "Historique",
          tabBarIcon: ({ focused }) => <TabIcon label="↺" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="rules"
        options={{
          title: "Règles",
          tabBarLabel: "Règles",
          tabBarIcon: ({ focused }) => <TabIcon label="✦" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Paramètres",
          tabBarLabel: "Paramètres",
          tabBarIcon: ({ focused }) => <TabIcon label="⚙" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
