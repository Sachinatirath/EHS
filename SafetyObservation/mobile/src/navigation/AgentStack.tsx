import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AgentTabs } from './AgentTabs';
import { CreateObservationScreen } from '@/screens/agent/CreateObservationScreen';
import { ObservationDetailScreen } from '@/screens/agent/ObservationDetailScreen';
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
        name="CreateObservation"
        component={CreateObservationScreen}
        options={{ title: 'New Safety Observation' }}
      />
      <Stack.Screen
        name="ObservationDetail"
        component={ObservationDetailScreen}
        options={{ title: 'Observation Detail' }}
      />
    </Stack.Navigator>
  );
}
