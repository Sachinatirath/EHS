import React from 'react';
import { Text, View } from 'react-native';

import { colors, spacing, fontSize } from '@/theme';

interface KeyValueRowProps {
  label: string;
  value: string;
  last?: boolean;
}

export function KeyValueRow({ label, value, last }: KeyValueRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '600' }}>
        {value}
      </Text>
    </View>
  );
}
