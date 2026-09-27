import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Platform, UIManager } from 'react-native';

import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { RootNavigator } from '@/navigation/RootNavigator';
import { navigationRef } from '@/navigation/navigationRef';
import { colors } from '@/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('thin-scrollbar')) {
  const style = document.createElement('style');
  style.id = 'thin-scrollbar';
  style.textContent = `
    * { scrollbar-width: thin; scrollbar-color: ${colors.border} transparent; }
    *::-webkit-scrollbar { width: 8px; height: 8px; }
    *::-webkit-scrollbar-track { background: transparent; }
    *::-webkit-scrollbar-thumb { background-color: ${colors.border}; border-radius: 8px; }
    *::-webkit-scrollbar-thumb:hover { background-color: ${colors.textMuted}; }
  `;
  document.head.appendChild(style);
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <NavigationContainer ref={navigationRef}>
            <RootNavigator />
            <StatusBar style="dark" />
          </NavigationContainer>
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
