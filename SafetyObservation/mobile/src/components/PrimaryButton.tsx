import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleProp,
  Text,
  ViewStyle,
} from 'react-native';

import { colors, radius, spacing, fontSize } from '@/theme';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

const variantStyles: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: colors.textOnPrimary },
  secondary: { bg: colors.primaryLight, fg: colors.primaryDark },
  success: { bg: colors.success, fg: colors.textOnPrimary },
  danger: { bg: colors.danger, fg: colors.textOnPrimary },
  outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  icon,
}: PrimaryButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;
  const v = variantStyles[variant];

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={() => !isDisabled && animateTo(0.96)}
        onPressOut={() => !isDisabled && animateTo(1)}
        style={{
          backgroundColor: isDisabled ? colors.border : v.bg,
          borderColor: v.border,
          borderWidth: v.border ? 1.5 : 0,
          borderRadius: radius.md,
          paddingVertical: spacing.md + 2,
          paddingHorizontal: spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
        }}
      >
        {loading ? (
          <ActivityIndicator color={isDisabled ? colors.textMuted : v.fg} />
        ) : (
          <>
            {icon}
            <Text
              style={{
                color: isDisabled ? colors.textMuted : v.fg,
                fontSize: fontSize.md,
                fontWeight: '600',
              }}
            >
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
