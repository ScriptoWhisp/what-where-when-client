import '@/src/i18n';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import {Platform, useColorScheme} from 'react-native';
import 'react-native-reanimated';
import {Ionicons} from "@expo/vector-icons";
import { mixpanel } from "@/src/analytics/mixpanel";

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

  // Init analytics once fonts are ready (safe point for app bootstrap).
  useEffect(() => {
    void mixpanel.init();
  }, []);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RouteAnalytics />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />

          <Stack.Screen name="(player)" />

          <Stack.Screen name="(host)" />

          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
  );
}

function roleFromSegments(segments: string[]) {
  if (segments.includes("(host)")) return "host";
  if (segments.includes("(player)")) return "player";
  return "unknown";
}

function screenNameFromPathname(pathname: string) {
  // Keep it stable/readable in Mixpanel; route remains available as raw pathname.
  if (pathname === "/") return "Home";
  if (pathname === "/join") return "PlayerJoin";
  if (pathname === "/select-team") return "PlayerSelectTeam";
  if (pathname === "/game") return "PlayerGame";
  if (pathname === "/login") return "HostLogin";
  if (pathname === "/signup") return "HostSignup";
  if (pathname === "/setup") return "HostSetup";
  if (pathname.startsWith("/game/")) {
    if (pathname === "/game/new") return "HostGameCreate";
    return "HostGameAdmin";
  }
  return "Unknown";
}

function RouteAnalytics() {
  const pathname = usePathname();
  const segments = useSegments();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    const role = roleFromSegments(segments as any);
    mixpanel.setSuperProps({ role });

    void mixpanel.screen(screenNameFromPathname(pathname), {
      route: pathname,
      role,
    });
  }, [pathname, segments]);

  return null;
}