import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CelebrationHost } from '@/components/CelebrationHost';
import { configureNotifications } from '@/lib/notifications';
import { AppStoreProvider, useStore } from '@/store/AppStore';
import { useTheme } from '@/theme/useTheme';

SplashScreen.preventAutoHideAsync().catch((error: unknown) => console.warn('[splash] could not keep splash visible', error));
configureNotifications();

function RootNavigator() {
  const { isHydrated } = useStore();
  const { colors, isDark } = useTheme();
  const [areFontsLoaded, fontError] = useFonts({ Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black });
  const isReady = isHydrated && (areFontsLoaded || fontError !== null);

  useEffect(() => {
    if (fontError) console.warn('[fonts] falling back to system font', fontError);
  }, [fontError]);

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync().catch((error: unknown) => console.warn('[splash] could not hide splash', error));
  }, [isReady]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch((error: unknown) =>
      console.warn('[system-ui] could not set background', error),
    );
  }, [colors.background]);

  if (!isReady) return null;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="habit/editor" options={{ presentation: 'modal' }} />
        <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
        <Stack.Screen name="group/create" options={{ presentation: 'modal' }} />
      </Stack>
      <CelebrationHost />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStoreProvider>
          <RootNavigator />
        </AppStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
