import '@/src/i18n';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import {Platform, useColorScheme} from 'react-native';
import 'react-native-reanimated';
import {Ionicons} from "@expo/vector-icons";

export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

if (Platform.OS === 'web') {
  const injectFaviconAndFonts = () => {
    if (document.getElementById('expo-web-fonts')) return;

    const style = document.createElement('style');
    style.id = 'expo-web-fonts';
    style.textContent = `
      @font-face {
        font-family: 'Feather';
        src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf') format('truetype');
      }
      @font-face {
        font-family: 'FontAwesome';
        src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf') format('truetype');
      }
      @font-face {
        font-family: 'Material Icons';
        src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf') format('truetype');
      }
      @font-face {
        font-family: 'MaterialIcons';
        src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf') format('truetype');
      }
      @font-face {
        font-family: 'Ionicons';
        src: url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
      }
    `;
    document.head.appendChild(style);
  };

  if (typeof window !== 'undefined') {
    injectFaviconAndFonts();
  }
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    InterRegular: require("../assets/fonts/Inter-Regular.ttf"),
    InterMedium: require("../assets/fonts/Inter-Medium.ttf"),
    InterSemiBold: require("../assets/fonts/Inter-SemiBold.ttf"),
    InterBold: require("../assets/fonts/Inter-Bold.ttf"),
    InterExtraBold: require("../assets/fonts/Inter-ExtraBold.ttf"),

    ...FontAwesome.font,
    ...Feather.font,
    ...MaterialIcons.font,
    ...Ionicons.font
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />

          <Stack.Screen name="(player)" />

          <Stack.Screen name="(host)" />

          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
  );
}