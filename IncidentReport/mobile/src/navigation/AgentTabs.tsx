import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Icon, IconName } from '@/components';
import { HomeScreen } from '@/screens/agent/HomeScreen';
import { NotificationsScreen } from '@/screens/agent/NotificationsScreen';
import { ProfileScreen } from '@/screens/shared/ProfileScreen';
import type { AgentTabParamList } from './types';
import { colors } from '@/theme';

const Tab = createBottomTabNavigator<AgentTabParamList>();

const ICONS: Record<keyof AgentTabParamList, IconName> = {
  Home: 'home',
  Notifications: 'bell',
  Profile: 'user',
};

const LABELS: Record<keyof AgentTabParamList, string> = {
  Home: 'Home',
  Notifications: 'Alerts',
  Profile: 'Profile',
};

export function AgentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { borderTopColor: colors.border },
        tabBarLabel: LABELS[route.name as keyof AgentTabParamList],
        tabBarIcon: ({ color, size }) => (
          <Icon name={ICONS[route.name as keyof AgentTabParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
