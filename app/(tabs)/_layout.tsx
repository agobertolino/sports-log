import { Tabs } from 'expo-router';
import { colors, fonts } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10,10,10,0.95)',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 82,
          paddingBottom: 16,
        },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.gray3,
        tabBarLabelStyle: {
          fontFamily: fonts.sans,
          fontSize: 10,
          letterSpacing: 0.4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <TabIcon emoji="⬡" color={color} /> }}
      />
      <Tabs.Screen
        name="storico"
        options={{ title: 'Storico', tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} /> }}
      />
      <Tabs.Screen
        name="profilo"
        options={{ title: 'Profilo', tabBarIcon: ({ color }) => <TabIcon emoji="⚙" color={color} /> }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20, opacity: color === colors.white ? 1 : 0.4 }}>{emoji}</Text>;
}
