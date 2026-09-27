import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import { Icon, IconName } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, radius, fontSize, shadow } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { navigationRef } from './navigationRef';

type RoleKey = 'agent' | 'hod';

interface MenuOption {
  key: string;
  label: string;
  icon: IconName;
}

interface MenuGroup {
  role: RoleKey;
  title: string;
  icon: IconName;
  options: MenuOption[];
}

const GROUPS: MenuGroup[] = [
  {
    role: 'agent',
    title: 'Agent UI',
    icon: 'alertTriangle',
    options: [
      { key: 'Home', label: 'Home', icon: 'home' },
      { key: 'CreateIncident', label: 'New Incident', icon: 'plus' },
      { key: 'Notifications', label: 'Alerts', icon: 'bell' },
      { key: 'Profile', label: 'Profile', icon: 'user' },
    ],
  },
  {
    role: 'hod',
    title: 'HOD Dashboard',
    icon: 'clipboard',
    options: [
      { key: 'Dashboard', label: 'Dashboard', icon: 'home' },
      { key: 'Incidents', label: 'Incidents', icon: 'alertTriangle' },
      { key: 'Notifications', label: 'Alerts', icon: 'bell' },
      { key: 'Profile', label: 'Profile', icon: 'user' },
    ],
  },
];

function navigateTo(role: RoleKey, screenKey: string) {
  if (!navigationRef.isReady()) return;
  if (role === 'agent' && screenKey === 'CreateIncident') {
    navigationRef.dispatch(CommonActions.navigate({ name: 'CreateIncident' }));
    return;
  }
  // A plain `navigate({name:'Tabs', params:{screen}})` only cleanly pops back
  // to Tabs when Tabs is already the focused route; dispatched while
  // CreateIncident is pushed on top, native-stack (on web) can end up
  // rendering both the old and new tab content instead of replacing it. A
  // `reset` atomically replaces the whole tree with the exact target state.
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Tabs', state: { index: 0, routes: [{ name: screenKey }] } }],
    }),
  );
}

export function RoleNavPanel() {
  const { user, setRole } = useAuth();
  const { isTabletUp } = useBreakpoint();
  const [openRole, setOpenRole] = useState<RoleKey | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [pending, setPending] = useState<{ role: RoleKey; screen: string } | null>(null);

  useEffect(() => {
    if (!pending || user?.role !== pending.role) return undefined;
    // The freshly-switched Agent/HOD stack mounts in this same commit, and
    // it registers its screens with navigationRef in its own effect — which
    // (as a later sibling in the tree) hasn't run yet at this point. Wait a
    // frame so the target screen actually exists before navigating to it.
    const raf = requestAnimationFrame(() => {
      navigateTo(pending.role, pending.screen);
      setPending(null);
    });
    return () => cancelAnimationFrame(raf);
  }, [user?.role, pending]);

  const handleSelect = (role: RoleKey, screenKey: string) => {
    setOpenRole(null);
    setActiveKey(`${role}:${screenKey}`);

    if (user?.role === role) {
      navigateTo(role, screenKey);
      return;
    }

    setPending({ role, screen: screenKey });
    setRole(role);
  };

  const panel = (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.md,
          gap: spacing.md,
        },
        isTabletUp
          ? { width: 280, borderRightWidth: 1, borderRightColor: colors.border }
          : { borderBottomWidth: 1, borderBottomColor: colors.border },
        shadow.card,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xs, marginBottom: spacing.xs }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.full,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="alertTriangle" size={18} color={colors.textOnPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.md, fontWeight: '800', color: colors.textPrimary }}>Incident Report</Text>
          <Text style={{ fontSize: 11, color: colors.textSecondary }}>Pick a view below</Text>
        </View>
      </View>

      <View style={{ flexDirection: isTabletUp ? 'column' : 'row', gap: spacing.sm, position: 'relative', zIndex: openRole ? 50 : 1 }}>
        {GROUPS.map((group) => {
          const isOpen = openRole === group.role;
          const isActiveGroup = user?.role === group.role;
          return (
            <View
              key={group.role}
              style={{ flex: isTabletUp ? undefined : 1, position: 'relative', zIndex: isOpen ? 50 : 1 }}
            >
              <Pressable
                onPress={() => setOpenRole(isOpen ? null : group.role)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  paddingVertical: 10,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: isActiveGroup ? colors.primary : colors.border,
                  backgroundColor: isActiveGroup ? colors.primaryLight : colors.background,
                }}
              >
                <Icon name={group.icon} size={16} color={isActiveGroup ? colors.primary : colors.textSecondary} />
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    fontSize: fontSize.sm,
                    fontWeight: '700',
                    color: isActiveGroup ? colors.primary : colors.textPrimary,
                  }}
                >
                  {group.title}
                </Text>
                <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} size={14} color={colors.textMuted} />
              </Pressable>

              {isOpen ? (
                <View
                  style={[
                    {
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      minWidth: isTabletUp ? '100%' : 200,
                      marginTop: 6,
                      backgroundColor: colors.surface,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingVertical: spacing.xs,
                      zIndex: 30,
                    },
                    shadow.raised,
                  ]}
                >
                  {group.options.map((opt) => {
                    const key = `${group.role}:${opt.key}`;
                    const active = activeKey === key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() => handleSelect(group.role, opt.key)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: spacing.sm,
                          paddingVertical: 9,
                          paddingHorizontal: spacing.md,
                          backgroundColor: active ? colors.primaryLight : 'transparent',
                        }}
                      >
                        <Icon name={opt.icon} size={15} color={active ? colors.primary : colors.textSecondary} />
                        <Text
                          style={{
                            fontSize: fontSize.sm,
                            fontWeight: active ? '700' : '600',
                            color: active ? colors.primary : colors.textPrimary,
                          }}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {user ? (
        <View style={{ paddingTop: spacing.sm, paddingHorizontal: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xs }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>
            Viewing as {user.name}
          </Text>
          <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 1 }}>
            {user.employee_id} · {user.role === 'hod' ? 'HOD' : 'Safety Agent'}
          </Text>
        </View>
      ) : null}
    </View>
  );

  return panel;
}
