import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AgentTabs } from './AgentTabs';
import { CreateViolationScreen } from '@/screens/agent/CreateViolationScreen';
import { ViolationDetailScreen } from '@/screens/agent/ViolationDetailScreen';
import type { AgentStackParamList } from './types';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<AgentStackParamList>();

export function AgentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', color: colors.textPrimary },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={AgentTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="CreateViolation"
        component={CreateViolationScreen}
        options={{ title: 'New Safety Violation' }}
      />
      <Stack.Screen
        name="ViolationDetail"
        component={ViolationDetailScreen}
        options={{ title: 'Violation Detail' }}
      />
    </Stack.Navigator>
  );
}
