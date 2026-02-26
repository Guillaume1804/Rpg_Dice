import { Stack } from "expo-router";
import { DbProvider } from "../data/db/DbProvider";

export default function RootLayout() {
  return (
    <DbProvider>
      <Stack screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen name="index" options={{ title: "Accueil" }} />
        <Stack.Screen name="roll" options={{ title: "Jet" }} />
        <Stack.Screen name="tables" options={{ title: "Mes tables" }} />
        <Stack.Screen name="history" options={{ title: "Historique" }} />
      </Stack>
    </DbProvider>
  );
}