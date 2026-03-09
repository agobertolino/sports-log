import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { DMSerifDisplay_400Regular, DMSerifDisplay_400Regular_Italic } from '@expo-google-fonts/dm-serif-display';
import * as Font from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { initDatabase } from '@/db/database';
import { hasUser } from '@/db/users';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        initDatabase();
        setIsNewUser(!hasUser());
        await Font.loadAsync({
          DMSans_400Regular,
          DMSans_500Medium,
          DMSans_700Bold,
          DMSerifDisplay_400Regular,
          DMSerifDisplay_400Regular_Italic,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (ready && isNewUser) {
      router.replace('/onboarding');
    }
  }, [ready, isNewUser]);

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