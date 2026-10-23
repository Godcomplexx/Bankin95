import { PressStart2P_400Regular, useFonts as usePressStart } from '@expo-google-fonts/press-start-2p';
import { VT323_400Regular, useFonts as useVT323 } from '@expo-google-fonts/vt323';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PButton, PText } from '@/components/ui';
import { StoreProvider, useStore } from '@/state/store';

SplashScreen.preventAutoHideAsync();

function Root() {
  const { state, themeName, colors, t, catalogStatus, reloadCatalog } = useStore();
  const [a, ea] = usePressStart({ PressStart2P_400Regular });
  const [b, eb] = useVT323({ VT323_400Regular });
  const fontsReady = (a || !!ea) && (b || !!eb);
  const ready = fontsReady && state.hydrated && catalogStatus !== 'loading';

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  if (catalogStatus === 'error') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.page, justifyContent: 'center', padding: 24, gap: 16 }}>
        <PText size={12} align="center">
          {t.noConnection}
        </PText>
        <PText size={8} color={colors.textMuted} align="center">
          {t.noConnectionHint}
        </PText>
        <PButton label={t.retry} accent="blue" onPress={reloadCatalog} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 120 }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
