// dice-universal/app/_layout.tsx

import { Stack } from "expo-router";
import { DbProvider } from "../data/db/DbProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ActiveTableProvider } from "../data/state/ActiveTableProvider";
import { DataRefreshProvider } from "../data/state/DataRefreshProvider";
import { ArcaneThemeProvider } from "../theme/ArcaneThemeProvider";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DbProvider>
        <ArcaneThemeProvider>
          <DataRefreshProvider>
            <ActiveTableProvider>
              <Stack screenOptions={{ headerTitleAlign: "center" }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="tables/[id]" options={{ title: "Table" }} />
              </Stack>
            </ActiveTableProvider>
          </DataRefreshProvider>
        </ArcaneThemeProvider>
      </DbProvider>
    </SafeAreaProvider>
  );
}
