import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{headerTitleAlign: "center"}}>
        <Stack.Screen name="index" options={{ title: "Acceuil" }} />
        <Stack.Screen name="roll" options={{ title: 'Jet' }} />
        <Stack.Screen name="tables" options={{ title: 'Mes tables' }} />
        <Stack.Screen name="history" options={{ title: 'Historique' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
