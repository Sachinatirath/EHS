import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AgentTabs } from './AgentTabs';
import { CreateIncidentScreen } from '@/screens/agent/CreateIncidentScreen';
import { IncidentDetailScreen } from '@/screens/agent/IncidentDetailScreen';
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
        name="CreateIncident"
        component={CreateIncidentScreen}
        options={{ title: 'New Incident Report' }}
      />
      <Stack.Screen
        name="IncidentDetail"
        component={IncidentDetailScreen}
        options={{ title: 'Incident Detail' }}
      />
    </Stack.Navigator>
  );
}
