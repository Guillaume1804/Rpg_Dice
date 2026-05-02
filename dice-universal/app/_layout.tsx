import { Stack } from "expo-router";
import { DbProvider } from "../data/db/DbProvider";
import { ActiveTableProvider } from "../data/state/ActiveTableProvider";
import { DataRefreshProvider } from "../data/state/DataRefreshProvider";

export default function RootLayout() {
  return (
    <DbProvider>
      <DataRefreshProvider>
        <ActiveTableProvider>
          <Stack screenOptions={{ headerTitleAlign: "center" }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="tables/[id]" options={{ title: "Table" }} />
          </Stack>
        </ActiveTableProvider>
      </DataRefreshProvider>
    </DbProvider>
  );
}