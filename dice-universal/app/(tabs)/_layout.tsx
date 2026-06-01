// dice-universal/app/(tabs)/_layout.tsx

import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePremiumTheme } from "../../theme/premium/usePremiumTheme";

type TabIconProps = {
  label: string;
  focused: boolean;
};

function TabIcon({ label, focused }: TabIconProps) {
  const premium = usePremiumTheme();

  return (
    <View
      style={{
        width: 32,
        height: 26,
        borderRadius: premium.radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? premium.colors.accent.soft : "transparent",
        borderWidth: focused ? 1 : 0,
        borderColor: focused ? premium.colors.border.accent : "transparent",
      }}
    >
      <Text
        style={{
          color: focused
            ? premium.colors.accent.primary
            : premium.colors.text.muted,
          fontSize: 15,
          fontWeight: "900",
          lineHeight: 18,
          opacity: focused ? 1 : 0.72,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const premium = usePremiumTheme();
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, 10);
  const tabBarHeight = 64 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: bottomInset,
          borderTopWidth: 1,
          borderTopColor: premium.colors.border.subtle,
          backgroundColor: premium.colors.background.secondary,
          elevation: 0,
          shadowColor: "#000",
          shadowOpacity: 0.22,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -8 },
        },

        tabBarItemStyle: {
          paddingTop: 4,
          paddingBottom: 2,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "900",
          marginTop: 2,
          letterSpacing: 0.2,
        },

        tabBarActiveTintColor: premium.colors.accent.primary,
        tabBarInactiveTintColor: premium.colors.text.muted,
      }}
    >
      <Tabs.Screen
        name="roll"
        options={{
          title: "Jet",
          tabBarLabel: "Jet",
          tabBarIcon: ({ focused }) => <TabIcon label="◆" focused={focused} />,
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
          tabBarLabel: "Réglages",
          tabBarIcon: ({ focused }) => <TabIcon label="◎" focused={focused} />,
        }}
      />
    </Tabs>
  );
}