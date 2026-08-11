import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Set false for screens that should stay edge-to-edge on wide viewports. */
  centered?: boolean;
}

export function Screen({ children, style, edges = ['top', 'left', 'right'], centered = true }: ScreenProps) {
  const { isTabletUp, contentMaxWidth } = useBreakpoint();

  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
    >
      <View style={{ flex: 1, alignItems: centered && isTabletUp ? 'center' : 'stretch' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: centered ? contentMaxWidth : undefined }}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}
