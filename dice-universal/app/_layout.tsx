import { Stack } from "expo-router";
import { DbProvider } from "../data/db/DbProvider";
import { ActiveProfileProvider } from "../data/state/ActiveProfileProvider";

export default function RootLayout() {
  return (
    <DbProvider>
      <ActiveProfileProvider>
        <Stack screenOptions={{ headerTitleAlign: "center" }}>
          <Stack.Screen name="index" options={{ title: "Accueil" }} />
          <Stack.Screen name="roll" options={{ title: "Jet" }} />
          <Stack.Screen name="tables" options={{ title: "Mes tables" }} />
          <Stack.Screen name="history" options={{ title: "Historique" }} />
        </Stack>
      </ActiveProfileProvider>
    </DbProvider>
  );
}