import React, { useState } from 'react';
import { KeyboardTypeOptions, Pressable, Text, TextInput, View } from 'react-native';

import { Card, FadeSlideIn, Icon, KeyValueRow, PrimaryButton, Screen } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api';
import { apiErrorMessage } from '@/api/client';
import { useToast } from '@/components/Toast';
import { colors, spacing, fontSize, radius, shadow } from '@/theme';

interface FieldDef {
  key: 'name' | 'phone' | 'email' | 'address' | 'department';
  label: string;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
}

const FIELDS: FieldDef[] = [
  { key: 'name', label: 'Name', placeholder: 'Full name' },
  { key: 'phone', label: 'Mobile Number', placeholder: 'e.g. +91 98765 43210', keyboardType: 'phone-pad' },
  { key: 'email', label: 'Email', placeholder: 'e.g. you@example.com', keyboardType: 'email-address' },
  { key: 'department', label: 'Department', placeholder: 'Department' },
  { key: 'address', label: 'Address', placeholder: 'Street, city, state', multiline: true },
];

const emptyValues = (user: { name: string; phone: string | null; email: string | null; address: string | null; department: string | null } | null) => ({
  name: user?.name ?? '',
  phone: user?.phone ?? '',
  email: user?.email ?? '',
  department: user?.department ?? '',
  address: user?.address ?? '',
});

export function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(emptyValues(user));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setValues(emptyValues(user));
    setError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setError(null);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!values.name.trim()) {
      setError('Name cannot be empty');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await authApi.updateMe({
        name: values.name.trim(),
        department: values.department.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        address: values.address.trim(),
      });
      updateUser(updated);
      showToast({ message: 'Profile updated', icon: 'checkCircle' });
      setEditing(false);
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not update profile. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={{ padding: spacing.lg, gap: spacing.lg }}>
        <FadeSlideIn>
          <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary }}>
            Profile
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
            Account settings
          </Text>
        </FadeSlideIn>

        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.lg,
            },
            shadow.card,
          ]}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radius.lg,
              backgroundColor: colors.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="user" size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary }}>
              {user?.name}
            </Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>
              {user?.employee_id} · {user?.department}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: colors.primaryDark,
              backgroundColor: colors.primaryLight,
              paddingVertical: 4,
              paddingHorizontal: spacing.sm,
              borderRadius: radius.full,
            }}
          >
            {user?.role === 'hod' ? 'HOD' : 'Safety Agent'}
          </Text>
        </View>

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary }}>
              Account Details
            </Text>
            {!editing ? (
              <Pressable
                onPress={startEditing}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8 }}
              >
                <Icon name="edit" size={13} color={colors.primary} />
                <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.primary }}>Edit</Text>
              </Pressable>
            ) : null}
          </View>

          {editing ? (
            <View style={{ gap: spacing.md }}>
              {FIELDS.map((f) => (
                <View key={f.key} style={{ gap: 6 }}>
                  <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.textSecondary }}>
                    {f.label}
                  </Text>
                  <TextInput
                    value={values[f.key]}
                    onChangeText={(t) => setValues((v) => ({ ...v, [f.key]: t }))}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.textMuted}
                    keyboardType={f.keyboardType}
                    autoCapitalize={f.key === 'email' ? 'none' : 'words'}
                    multiline={f.multiline}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: radius.sm,
                      paddingVertical: 10,
                      paddingHorizontal: spacing.md,
                      fontSize: fontSize.sm,
                      color: colors.textPrimary,
                      minHeight: f.multiline ? 64 : undefined,
                      textAlignVertical: f.multiline ? 'top' : undefined,
                    }}
                  />
                </View>
              ))}

              <View style={{ gap: 2, opacity: 0.6 }}>
                <KeyValueRow label="Employee ID" value={user?.employee_id ?? '-'} />
                <KeyValueRow label="Role" value={user?.role === 'hod' ? 'HOD' : 'Safety Agent'} last />
              </View>

              {error ? (
                <Text style={{ fontSize: fontSize.xs, color: colors.danger }}>{error}</Text>
              ) : null}

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <PrimaryButton label="Cancel" variant="outline" onPress={cancelEditing} style={{ flex: 1 }} disabled={saving} />
                <PrimaryButton label="Save Changes" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
              </View>
            </View>
          ) : (
            <View>
              <KeyValueRow label="Employee ID" value={user?.employee_id ?? '-'} />
              <KeyValueRow label="Role" value={user?.role === 'hod' ? 'HOD' : 'Safety Agent'} />
              <KeyValueRow label="Name" value={user?.name ?? '-'} />
              <KeyValueRow label="Mobile Number" value={user?.phone ?? '-'} />
              <KeyValueRow label="Email" value={user?.email ?? '-'} />
              <KeyValueRow label="Department" value={user?.department ?? '-'} />
              <KeyValueRow label="Address" value={user?.address ?? '-'} last />
            </View>
          )}
        </Card>

        <PrimaryButton
          label="Log Out"
          variant="outline"
          onPress={logout}
          icon={<Icon name="logout" size={18} color={colors.primary} />}
        />
      </View>
    </Screen>
  );
}
