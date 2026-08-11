import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';

import { Icon, IconName } from '@/components';
import { notificationsApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, radius, fontSize, shadow } from '@/theme';
import type { HodTabParamList } from './types';

interface SidebarItem {
  route: keyof HodTabParamList;
  label: string;
  icon: IconName;
}

const ITEMS: SidebarItem[] = [
  { route: 'Dashboard', label: 'Dashboard', icon: 'home' },
  { route: 'Incidents', label: 'Incidents', icon: 'alertTriangle' },
  { route: 'Notifications', label: 'Alerts', icon: 'bell' },
  { route: 'Profile', label: 'Profile', icon: 'user' },
];

export function HodSidebar() {
  // HodSidebar is rendered as a sibling of the Tab.Navigator (not one of its
  // screens), so useNavigation() here resolves to the parent Stack navigator,
  // not the tab navigator — plain navigate('Dashboard') would silently fail.
  // Navigate into the nested "Tabs" navigator explicitly, and read its active
  // route out of the stack's own navigation state tree.
  const navigation = useNavigation();
  const { user } = useAuth();
  const activeRoute = useNavigationState((state) => {
    const tabsRoute = state?.routes.find((r) => r.name === 'Tabs');
    const tabState = tabsRoute?.state as { index?: number; routes?: { name: string }[] } | undefined;
    if (tabState && typeof tabState.index === 'number' && tabState.routes) {
      return tabState.routes[tabState.index]?.name;
    }
    return undefined;
  });
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationsApi
      .listNotifications()
      .then((list) => setUnread(list.filter((n) => !n.is_read).length))
      .catch(() => {});
  }, [activeRoute]);

  return (
    <View
      style={[
        {
          width: 240,
          backgroundColor: colors.surface,
          borderRightWidth: 1,
          borderRightColor: colors.border,
          paddingVertical: spacing.lg,
        },
        shadow.card,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.xl }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: radius.full,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="alertTriangle" size={20} color={colors.textOnPrimary} />
        </View>
        <View>
          <Text style={{ fontSize: fontSize.md, fontWeight: '800', color: colors.textPrimary }}>Incident</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>Report System</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 2 }}>
        {ITEMS.map((item) => {
          const active = activeRoute === item.route;
          const badge = item.route === 'Notifications' ? unread : 0;
          return (
            <Pressable
              key={item.route}
              onPress={() => (navigation.navigate as (name: string, params?: object) => void)('Tabs', { screen: item.route })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                paddingVertical: 10,
                paddingHorizontal: spacing.md - 3,
                borderRadius: radius.md,
                borderLeftWidth: 3,
                borderLeftColor: active ? colors.primary : 'transparent',
                backgroundColor: active ? colors.primaryLight : 'transparent',
              }}
            >
              <Icon name={item.icon} size={18} color={active ? colors.primary : colors.textSecondary} />
              <Text
                style={{
                  flex: 1,
                  fontSize: fontSize.sm,
                  fontWeight: active ? '700' : '600',
                  color: active ? colors.primary : colors.textSecondary,
                }}
              >
                {item.label}
              </Text>
              {badge > 0 ? (
                <View
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    paddingHorizontal: 5,
                    backgroundColor: colors.danger,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: colors.textOnPrimary }}>{badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {user ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md }}>
          <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{user.employee_id}</Text>
        </View>
      ) : null}
    </View>
  );
}
