import React from 'react';
import { View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { AgentStack } from './AgentStack';
import { HodStack } from './HodStack';
import { RoleNavPanel } from './RoleNavPanel';
import { WelcomeScreen } from '@/screens/shared/WelcomeScreen';
import { colors } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function RootNavigator() {
  const { user } = useAuth();
  const { isTabletUp } = useBreakpoint();

  let content: React.ReactNode;
  if (user?.role === 'hod') {
    content = <HodStack />;
  } else if (user?.role === 'agent') {
    content = <AgentStack />;
  } else {
    content = <WelcomeScreen />;
  }

  return (
    <View style={{ flex: 1, flexDirection: isTabletUp ? 'row' : 'column', backgroundColor: colors.background }}>
      <RoleNavPanel />
      <View style={{ flex: 1 }}>{content}</View>
    </View>
  );
}
