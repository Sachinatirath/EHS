import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Card, FadeSlideIn, Icon, KeyValueRow, PrimaryButton, Screen, Skeleton, StatusBadge } from '@/components';
import { parseSignature, SignaturePreview } from '@/components/SignaturePad';
import { useToast } from '@/components/Toast';
import { violationsApi } from '@/api';
import { apiErrorMessage, toAbsoluteUrl } from '@/api/client';
import type { Violation } from '@/types';
import type { HodStackParamList } from '@/navigation/types';
import { colors, spacing, fontSize, radius } from '@/theme';

type Props = NativeStackScreenProps<HodStackParamList, 'ViolationDetail'>;

export function ViolationDetailScreen({ route }: Props) {
  const { violationId } = route.params;
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [violation, setViolation] = useState<Violation | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState<'under_review' | 'closed' | 'rejected' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    violationsApi
      .getViolation(violationId)
      .then(setViolation)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [violationId]);

  const handleStatusChange = async (status: 'under_review' | 'closed' | 'rejected') => {
    setSubmittingAction(status);
    setError(null);
    try {
      await violationsApi.updateStatus(violationId, status, note || undefined);
      showToast({ message: `Marked ${status.replace('_', ' ')}`, icon: 'checkCircle' });
      setNote('');
      load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSubmittingAction(null);
    }
  };

  if (loading || !violation) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
          <Skeleton width="60%" height={20} />
          <Skeleton height={140} borderRadius={radius.lg} />
          <Skeleton height={140} borderRadius={radius.lg} />
        </ScrollView>
      </Screen>
    );
  }

  const actionable = violation.status === 'open' || violation.status === 'under_review';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Pressable
          onPress={() => (navigation.navigate as (name: string, params?: object) => void)('Tabs', { screen: 'Dashboard' })}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: -spacing.sm }}
        >
          <Icon name="chevronLeft" size={14} color={colors.primary} />
          <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.primary }}>Back to dashboard</Text>
        </Pressable>

        <FadeSlideIn style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSize.lg, fontWeight: '800', color: colors.textPrimary }}>
              {violation.violation_no}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
              {violation.violation_type} · {violation.department}
            </Text>
          </View>
          <StatusBadge status={violation.status} pulse={violation.status === 'open'} />
        </FadeSlideIn>

        {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{error}</Text> : null}

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
            Reported By
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: radius.lg,
                backgroundColor: colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="user" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary }}>
                {violation.agent.name}
              </Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>
                {violation.agent.employee_id} · {violation.agent.department ?? 'No department'}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: spacing.md, gap: 2 }}>
            <KeyValueRow label="Phone" value={violation.agent.phone ?? '-'} />
            <KeyValueRow label="Email" value={violation.agent.email ?? '-'} last />
          </View>
        </Card>

        {violation.resolution_note ? (
          <Card
            style={{
              backgroundColor: violation.status === 'rejected' ? colors.dangerLight : colors.infoLight,
              borderColor: violation.status === 'rejected' ? colors.danger : colors.info,
            }}
          >
            <Text
              style={{
                fontSize: fontSize.xs,
                fontWeight: '700',
                color: violation.status === 'rejected' ? colors.danger : colors.info,
                marginBottom: 2,
              }}
            >
              RESOLUTION NOTE
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary }}>{violation.resolution_note}</Text>
          </Card>
        ) : null}

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
            Violation Information
          </Text>
          <KeyValueRow label="Date" value={violation.violation_date ?? '-'} />
          <KeyValueRow label="Company / Contractor" value={violation.company ?? '-'} />
          <KeyValueRow label="Department" value={violation.department} />
          <KeyValueRow label="Supervisor" value={violation.supervisor ?? '-'} />
          <KeyValueRow label="Employee Name" value={violation.employee_name ?? '-'} />
          <KeyValueRow label="Employee Code" value={violation.employee_code ?? '-'} />
          <KeyValueRow label="Job Title" value={violation.job_title ?? '-'} last />
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
            Violation Details
          </Text>
          <KeyValueRow label="Violation Type" value={violation.violation_type} />
          <KeyValueRow label="Offence" value={violation.offence} last />
        </Card>

        {violation.corrective_actions.length > 0 ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
              Corrective Action
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {violation.corrective_actions.map((item) => (
                <View
                  key={item}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.full,
                    backgroundColor: colors.primaryLight,
                  }}
                >
                  <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.primaryDark }}>{item}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {violation.description ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
              Description
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{violation.description}</Text>
          </Card>
        ) : null}

        {violation.explanation ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
              Employee Explanation
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{violation.explanation}</Text>
          </Card>
        ) : null}

        {violation.photo_url ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
              Evidence Photo
            </Text>
            <Image
              source={{ uri: toAbsoluteUrl(violation.photo_url) }}
              style={{ width: '100%', height: 180, borderRadius: radius.sm }}
              resizeMode="cover"
            />
          </Card>
        ) : null}

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
            Digital Signature
          </Text>
          {(() => {
            const sig = parseSignature(violation.signature_data);
            return sig ? (
              <SignaturePreview value={sig} />
            ) : (
              <Text style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Not signed</Text>
            );
          })()}
        </Card>

        <Card>
          <KeyValueRow label="Filed On" value={new Date(violation.created_at).toLocaleString()} last />
        </Card>

        {actionable ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
              Review Decision
            </Text>
            <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 }}>
              Note (optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a resolution or rejection note..."
              placeholderTextColor={colors.textMuted}
              multiline
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.sm,
                paddingVertical: 10,
                paddingHorizontal: spacing.md,
                fontSize: fontSize.sm,
                color: colors.textPrimary,
                minHeight: 64,
                textAlignVertical: 'top',
                marginBottom: spacing.md,
              }}
            />
            <View style={{ gap: spacing.sm }}>
              {violation.status === 'open' ? (
                <PrimaryButton
                  label="Mark Under Review"
                  variant="secondary"
                  onPress={() => handleStatusChange('under_review')}
                  loading={submittingAction === 'under_review'}
                  disabled={submittingAction !== null}
                />
              ) : null}
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <PrimaryButton
                  label="Close"
                  variant="success"
                  onPress={() => handleStatusChange('closed')}
                  loading={submittingAction === 'closed'}
                  disabled={submittingAction !== null}
                  style={{ flex: 1 }}
                />
                <PrimaryButton
                  label="Reject"
                  variant="danger"
                  onPress={() => handleStatusChange('rejected')}
                  loading={submittingAction === 'rejected'}
                  disabled={submittingAction !== null}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
