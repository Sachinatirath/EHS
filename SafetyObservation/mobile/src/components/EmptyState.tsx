import React from 'react';
import { Text, View } from 'react-native';

import { Icon, IconName } from './icons/Icon';
import { colors, spacing, fontSize } from '@/theme';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 1.5,
        paddingHorizontal: spacing.xl,
        gap: spacing.sm,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Icon name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary }}>
        {title}
      </Text>
      {message ? (
        <Text
          style={{
            fontSize: fontSize.sm,
            color: colors.textSecondary,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
