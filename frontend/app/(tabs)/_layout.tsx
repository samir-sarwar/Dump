import { Tabs } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.outline,
        tabBarStyle: {
          backgroundColor: Colors.surfaceContainerLowest,
          borderTopWidth: 0,
          elevation: 0,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 10,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="(feed)"
        options={{
          title: 'Feed',
          tabBarTestID: 'tab.feed',
          tabBarIcon: ({ color }) => <Icon name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(upload)"
        options={{
          title: 'Upload',
          tabBarTestID: 'tab.upload',
          tabBarIcon: ({ color }) => <Icon name="plus-square" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(library)"
        options={{
          title: 'Library',
          tabBarTestID: 'tab.library',
          tabBarIcon: ({ color }) => <Icon name="grid" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarTestID: 'tab.profile',
          tabBarIcon: ({ color }) => <Icon name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
