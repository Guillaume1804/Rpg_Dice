import { Stack } from "expo-router";
import { DbProvider } from "../data/db/DbProvider";
import { ActiveTableProvider } from "../data/state/ActiveTableProvider";

export default function RootLayout() {
  return (
    <DbProvider>
      <ActiveTableProvider>
        <Stack screenOptions={{ headerTitleAlign: "center" }}>
          <Stack.Screen name="index" options={{ title: "Accueil" }} />
          <Stack.Screen name="roll" options={{ title: "Jet" }} />
          <Stack.Screen name="tables" options={{ title: "Mes tables" }} />
          <Stack.Screen name="history" options={{ title: "Historique" }} />
        </Stack>
      </ActiveTableProvider>
    </DbProvider>
  );
}