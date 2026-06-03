// dice-universal/app/(tabs)/_layout.tsx

import { Tabs, router, usePathname, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
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

function CentralRollToggleButton() {
  const premium = usePremiumTheme();
  const pathname = usePathname();

  const isRoll3D = pathname.includes("/roll");
  const isPrepare = pathname.includes("/prepare");

  const label = isRoll3D ? "Préparer" : "Lancer";
  const icon = isRoll3D ? "⚙" : "◆";
  const target = (isRoll3D ? "/prepare" : "/roll") as Href;

  const focused = isRoll3D || isPrepare;

  return (
    <Pressable
      onPress={() => router.replace(target)}
      style={({ pressed }) => ({
        alignItems: "center",
        justifyContent: "center",
        minWidth: 74,
        transform: [
          {
            translateY: -10,
          },
          {
            scale: pressed ? premium.animation.pressScale : 1,
          },
        ],
        opacity: pressed ? 0.86 : 1,
      })}
    >
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: focused
            ? premium.colors.border.accent
            : premium.colors.border.subtle,
          backgroundColor: premium.colors.background.primary,
          shadowColor: "#000",
          shadowOpacity: 0.34,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        }}
      >
        <Text
          style={{
            color: premium.colors.accent.primary,
            fontSize: 22,
            fontWeight: "900",
            lineHeight: 26,
          }}
        >
          {icon}
        </Text>
      </View>

      <Text
        style={{
          color: focused
            ? premium.colors.accent.primary
            : premium.colors.text.muted,
          fontSize: 10,
          fontWeight: "900",
          marginTop: 3,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  const premium = usePremiumTheme();
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, 10);
  const tabBarHeight = 72 + bottomInset;

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
          href: null,
          title: "Lancer",
        }}
      />

      <Tabs.Screen
        name="collection"
        options={{
          title: "Collection",
          tabBarLabel: "Collection",
          tabBarIcon: ({ focused }) => <TabIcon label="◇" focused={focused} />,
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
        name="prepare"
        options={{
          title: "Préparer",
          tabBarLabel: "",
          tabBarButton: () => <CentralRollToggleButton />,
        }}
      />

      <Tabs.Screen
        name="rules"
        options={{
          title: "Comportements",
          tabBarLabel: "Comportements",
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

      <Tabs.Screen
        name="history"
        options={{
          href: null,
          title: "Historique",
        }}
      />
    </Tabs>
  );
}
