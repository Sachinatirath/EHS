import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HodTabs } from './HodTabs';
import { ViolationDetailScreen } from '@/screens/hod/ViolationDetailScreen';
import type { HodStackParamList } from './types';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<HodStackParamList>();

export function HodStack() {
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
      <Stack.Screen name="Tabs" component={HodTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ViolationDetail" component={ViolationDetailScreen} options={{ title: 'Violation Detail' }} />
    </Stack.Navigator>
  );
}
