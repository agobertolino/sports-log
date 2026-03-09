import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DMSans_400Regular }  from '@expo-google-fonts/dm-sans/';
import { DMSans_500Medium }   from '@expo-google-fonts/dm-sans/';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/';
import { DMSans_700Bold }     from '@expo-google-fonts/dm-sans/';

import {
  DMSerifDisplay_400Regular,
  DMSerifDisplay_400Regular_Italic,
} from '@expo-google-fonts/dm-serif-display';
import * as Font from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { initDatabase } from '@/db/database';
import { hasUser } from '@/db/users';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await Font.loadAsync({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold,
        DMSerifDisplay_400Regular,
        DMSerifDisplay_400Regular_Italic,
      });

      initDatabase();

      const isReturningUser = hasUser();
      setReady(true);

      if (!isReturningUser) {
        router.replace('/onboarding');
      }
    }

    prepare();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.gray3} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="nuovo-allenamento" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}
