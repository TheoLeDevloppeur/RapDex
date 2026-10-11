import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { CollectionProvider, useCollection } from '@/hooks/use-collection';
import { fontAssets } from '@/theme/fonts';
import { colors } from '@/theme/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <CollectionProvider>
      <AppShell />
    </CollectionProvider>
  );
}

/** Garde l'écran de démarrage jusqu'à ce que les polices et la collection soient prêtes. */
function AppShell() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const { ready } = useCollection();
  const fontsDone = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (fontsDone && ready) {
      SplashScreen.hideAsync();
    }
  }, [fontsDone, ready]);

  if (!fontsDone || !ready) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.nuit },
        }}
      />
    </>
  );
}
