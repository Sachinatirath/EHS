import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { AgentStack } from './AgentStack';
import { HodStack } from './HodStack';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { PrimaryButton } from '@/components';
import { colors, spacing, fontSize } from '@/theme';

function UnsupportedRoleScreen({ role }: { role: string }) {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: spacing.xl, gap: spacing.md }}>
      <Text style={{ fontSize: fontSize.lg, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>
        Account not supported here
      </Text>
      <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' }}>
        This account's role ("{role}") isn't a Safety Agent or HOD account, so this app has nothing to show for
        it. Log in with a Safety Agent or HOD employee ID instead.
      </Text>
      <PrimaryButton label="Log Out" onPress={logout} style={{ marginTop: spacing.md }} />
    </View>
  );
}

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) return <LoginScreen />;
  if (user.role === 'hod') return <HodStack />;
  if (user.role === 'agent') return <AgentStack />;
  return <UnsupportedRoleScreen role={user.role} />;
}
