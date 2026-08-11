import React from 'react';
import { Text, View } from 'react-native';

import { CountUpNumber } from './CountUpNumber';
import { colors, radius, spacing, fontSize } from '@/theme';

interface StatChipProps {
  label: string;
  value: number;
  accent?: string;
}

export function StatChip({ label, value, accent = colors.primary }: StatChipProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        alignItems: 'center',
        gap: spacing.xs,
      }}
    >
      <CountUpNumber
        value={value}
        style={{ fontSize: fontSize.xxl, fontWeight: '800', color: accent }}
      />
      <Text
        style={{
          fontSize: fontSize.xs,
          color: colors.textSecondary,
          textAlign: 'center',
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
