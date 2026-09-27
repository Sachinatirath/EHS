import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

import { Icon } from '@/components';
import { colors, radius, spacing, fontSize, shadow } from '@/theme';

export function WelcomeScreen() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: spacing.xl }}>
      <Animated.View
        style={{
          alignItems: 'center',
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
        }}
      >
        <View
          style={[
            {
              width: 72,
              height: 72,
              borderRadius: radius.xl,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            },
            shadow.raised,
          ]}
        >
          <Icon name="eye" size={36} color={colors.textOnPrimary} />
        </View>
        <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>
          Safety Observation
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2, textAlign: 'center' }}>
          Digital Safety Observation Reporting System
        </Text>
        <Text
          style={{
            fontSize: fontSize.sm,
            color: colors.textMuted,
            marginTop: spacing.xl,
            textAlign: 'center',
            maxWidth: 320,
          }}
        >
          Pick "Agent UI" or "HOD Dashboard" from the panel to get started.
        </Text>
      </Animated.View>
    </View>
  );
}
