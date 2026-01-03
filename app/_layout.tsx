import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { initDatabase } from '@/src/services/database';
import { Colors } from '@/constants/theme';

// Custom dark theme matching our design
const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.accent,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.accent,
  },
};

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  // Initialize database on app start
  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  return (
    <ThemeProvider value={customDarkTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
          headerTintColor: Colors.dark.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.dark.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="drive"
          options={{
            headerShown: false,
            gestureEnabled: false, // Prevent accidental swipe during driving
          }}
        />
        <Stack.Screen
          name="summary/[id]"
          options={{
            title: 'Drive Summary',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: 'Drive History',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Car Profile',
          }}
        />
        <Stack.Screen
          name="routes"
          options={{
            title: 'Routes',
          }}
        />
        <Stack.Screen
          name="route/[id]"
          options={{
            title: 'Route Details',
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
