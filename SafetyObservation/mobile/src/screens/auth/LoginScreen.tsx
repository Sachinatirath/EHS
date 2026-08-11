import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Card, Icon, PrimaryButton, Screen } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { apiErrorMessage } from '@/api/client';
import { colors, radius, spacing, fontSize, shadow } from '@/theme';

const ROLE_OPTIONS: { key: 'agent' | 'hod'; label: string }[] = [
  { key: 'agent', label: 'Safety Agent' },
  { key: 'hod', label: 'HOD' },
];

export function LoginScreen() {
  const { login } = useAuth();
  const [role, setRole] = useState<'agent' | 'hod'>('agent');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const handleLogin = async () => {
    if (!employeeId || !password) {
      setError('Enter your Employee ID and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(employeeId.trim().toUpperCase(), password, role);
    } catch (e) {
      setError(apiErrorMessage(e, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl }}>
          <Animated.View
            style={{
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
                },
              ],
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: spacing.xxl }}>
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
              <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary }}>
                Safety Observation
              </Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
                Digital Safety Observation Reporting System
              </Text>
            </View>

            <Card>
              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: '700',
                  color: colors.textSecondary,
                  marginBottom: spacing.xs,
                }}
              >
                LOGIN AS
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: 3,
                  marginBottom: spacing.md,
                }}
              >
                {ROLE_OPTIONS.map((opt) => {
                  const active = role === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => setRole(opt.key)}
                      style={{
                        flex: 1,
                        paddingVertical: 9,
                        borderRadius: radius.sm,
                        alignItems: 'center',
                        backgroundColor: active ? colors.primary : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: fontSize.xs,
                          fontWeight: '700',
                          color: active ? colors.textOnPrimary : colors.textSecondary,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: '700',
                  color: colors.textSecondary,
                  marginBottom: spacing.xs,
                }}
              >
                EMPLOYEE ID
              </Text>
              <TextInput
                value={employeeId}
                onChangeText={(t) => setEmployeeId(t.toUpperCase())}
                autoCapitalize="characters"
                placeholder={role === 'hod' ? 'e.g. HOD001' : 'e.g. AGT001'}
                placeholderTextColor={colors.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm + 2,
                  fontSize: fontSize.md,
                  color: colors.textPrimary,
                  marginBottom: spacing.md,
                }}
              />

              <Text
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: '700',
                  color: colors.textSecondary,
                  marginBottom: spacing.xs,
                }}
              >
                PASSWORD
              </Text>
              <View style={{ position: 'relative', justifyContent: 'center', marginBottom: spacing.md }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.sm,
                    paddingHorizontal: spacing.md,
                    paddingRight: spacing.xxl,
                    paddingVertical: spacing.sm + 2,
                    fontSize: fontSize.md,
                    color: colors.textPrimary,
                  }}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={10}
                  style={{ position: 'absolute', right: spacing.md }}
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} color={colors.textMuted} />
                </Pressable>
              </View>

              {error ? (
                <Text style={{ color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.md }}>
                  {error}
                </Text>
              ) : null}

              <PrimaryButton label="Login" onPress={handleLogin} loading={loading} />
            </Card>

            <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' }}>
                Demo accounts — Safety Agent: AGT001 / password123{'\n'}HOD: HOD001 / password123
              </Text>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
