import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Icon, IconName } from '@/components';
import { DashboardScreen } from '@/screens/hod/DashboardScreen';
import { IncidentsScreen } from '@/screens/hod/IncidentsScreen';
import { NotificationsScreen } from '@/screens/hod/NotificationsScreen';
import { ProfileScreen } from '@/screens/shared/ProfileScreen';
import { HodSidebar } from './HodSidebar';
import type { HodTabParamList } from './types';
import { colors } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const Tab = createBottomTabNavigator<HodTabParamList>();

const ICONS: Record<keyof HodTabParamList, IconName> = {
  Dashboard: 'home',
  Incidents: 'alertTriangle',
  Notifications: 'bell',
  Profile: 'user',
};

export function HodTabs() {
  const { isTabletUp } = useBreakpoint();

  return (
    <View style={{ flex: 1, flexDirection: isTabletUp ? 'row' : 'column' }}>
      {isTabletUp ? <HodSidebar /> : null}
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            tabBarStyle: isTabletUp ? { display: 'none' } : { borderTopColor: colors.border },
            tabBarIcon: ({ color, size }) => (
              <Icon name={ICONS[route.name as keyof HodTabParamList]} color={color} size={size} />
            ),
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Incidents" component={IncidentsScreen} options={{ title: 'Incidents' }} />
          <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Alerts' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </View>
    </View>
  );
}
