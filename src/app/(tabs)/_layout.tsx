import { Redirect, Tabs } from 'expo-router';

import { TabBar } from '@/components/TabBar';
import { useStore } from '@/store/AppStore';

export default function TabsLayout() {
  const { state } = useStore();
  if (!state.profile.onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="garden" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
