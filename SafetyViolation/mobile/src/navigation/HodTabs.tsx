import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { DashboardScreen } from '@/screens/hod/DashboardScreen';
import { ViolationsScreen } from '@/screens/hod/ViolationsScreen';
import { NotificationsScreen } from '@/screens/hod/NotificationsScreen';
import { ProfileScreen } from '@/screens/shared/ProfileScreen';
import type { HodTabParamList } from './types';

const Tab = createBottomTabNavigator<HodTabParamList>();

/**
 * The bottom tab bar / sidebar is hidden — the global RoleNavPanel dropdown
 * (Agent UI / HOD Dashboard) is the only navigation chrome in this build,
 * and it drives these tabs via the shared navigationRef.
 */
export function HodTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Violations" component={ViolationsScreen} options={{ title: 'Violations' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
