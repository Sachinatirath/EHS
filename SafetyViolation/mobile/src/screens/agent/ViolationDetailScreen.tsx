import React, { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, Text, View } from 'react-native';

import { Card, FadeSlideIn, KeyValueRow, Screen, Skeleton, StatusBadge } from '@/components';
import { parseSignature, SignaturePreview } from '@/components/SignaturePad';
import { violationsApi } from '@/api';
import { apiErrorMessage, toAbsoluteUrl } from '@/api/client';
import type { Violation } from '@/types';
import type { AgentStackParamList } from '@/navigation/types';
import { colors, spacing, fontSize, radius } from '@/theme';

type Props = NativeStackScreenProps<AgentStackParamList, 'ViolationDetail'>;

export function ViolationDetailScreen({ route }: Props) {
  const { violationId } = route.params;
  const [violation, setViolation] = useState<Violation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    violationsApi
      .getViolation(violationId)
      .then(setViolation)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [violationId]);

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

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
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
              HOD NOTE
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
          <KeyValueRow label="Filed By" value={violation.agent.name} />
          <KeyValueRow label="Filed On" value={new Date(violation.created_at).toLocaleString()} last />
        </Card>

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
      </ScrollView>
    </Screen>
  );
}
