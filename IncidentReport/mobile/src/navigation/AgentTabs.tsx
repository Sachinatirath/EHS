import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '@/screens/agent/HomeScreen';
import { NotificationsScreen } from '@/screens/agent/NotificationsScreen';
import { ProfileScreen } from '@/screens/shared/ProfileScreen';
import type { AgentTabParamList } from './types';

const Tab = createBottomTabNavigator<AgentTabParamList>();

/**
 * The bottom tab bar is hidden — the global RoleNavPanel dropdown (Agent UI /
 * HOD Dashboard) is the only navigation chrome in this build, and it drives
 * these tabs via the shared navigationRef instead of a visible tab bar.
 */
export function AgentTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
