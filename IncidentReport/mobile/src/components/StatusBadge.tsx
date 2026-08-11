import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

import { statusColor, StatusKind } from '@/theme/colors';
import { radius, spacing, fontSize } from '@/theme';

interface StatusBadgeProps {
  status: StatusKind;
  pulse?: boolean;
}

export function StatusBadge({ status, pulse }: StatusBadgeProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const { fg, bg, label } = statusColor[status];

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, opacity]);

  return (
    <Animated.View
      style={{
        opacity: pulse ? opacity : 1,
        backgroundColor: bg,
        borderRadius: radius.full,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color: fg, fontSize: fontSize.xs, fontWeight: '700' }}>{label}</Text>
    </Animated.View>
  );
}
