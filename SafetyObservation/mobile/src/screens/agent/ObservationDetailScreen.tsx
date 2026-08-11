import React, { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, Text, View } from 'react-native';

import { Card, FadeSlideIn, KeyValueRow, Screen, Skeleton, StatusBadge } from '@/components';
import { observationsApi } from '@/api';
import { apiErrorMessage, toAbsoluteUrl } from '@/api/client';
import type { Observation } from '@/types';
import type { AgentStackParamList } from '@/navigation/types';
import { colors, spacing, fontSize, radius } from '@/theme';

type Props = NativeStackScreenProps<AgentStackParamList, 'ObservationDetail'>;

export function ObservationDetailScreen({ route }: Props) {
  const { observationId } = route.params;
  const [observation, setObservation] = useState<Observation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    observationsApi
      .getObservation(observationId)
      .then(setObservation)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [observationId]);

  if (loading || !observation) {
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
              {observation.observation_no}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
              {observation.category} · {observation.department ?? 'No department'}
            </Text>
          </View>
          <StatusBadge status={observation.status} pulse={observation.status === 'open'} />
        </FadeSlideIn>

        {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{error}</Text> : null}

        {observation.resolution_note ? (
          <Card style={{ backgroundColor: colors.infoLight, borderColor: colors.info }}>
            <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.info, marginBottom: 2 }}>
              HOD NOTE
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary }}>{observation.resolution_note}</Text>
          </Card>
        ) : null}

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
            Reporter Information
          </Text>
          <KeyValueRow label="Observer Name" value={observation.observer_name ?? '-'} />
          <KeyValueRow label="Employee ID" value={observation.observer_employee_code ?? '-'} />
          <KeyValueRow label="Department" value={observation.department ?? '-'} />
          <KeyValueRow label="Date" value={observation.observation_date ?? '-'} last />
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
            Observation Details
          </Text>
          <KeyValueRow label="Plant / Site" value={observation.plant ?? '-'} />
          <KeyValueRow label="Area" value={observation.area ?? '-'} />
          <KeyValueRow label="Location" value={observation.location ?? '-'} />
          <KeyValueRow label="Observation Time" value={observation.observation_time ?? '-'} last />
        </Card>

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
            Observation Information
          </Text>
          <KeyValueRow label="Category" value={observation.category} />
          <KeyValueRow label="Severity" value={observation.severity} last />
        </Card>

        {observation.description ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
              Description
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{observation.description}</Text>
          </Card>
        ) : null}

        {observation.corrective_action ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
              Immediate Corrective Action
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{observation.corrective_action}</Text>
          </Card>
        ) : null}

        {observation.photo_url ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
              Evidence Photo
            </Text>
            <Image
              source={{ uri: toAbsoluteUrl(observation.photo_url) }}
              style={{ width: '100%', height: 180, borderRadius: radius.sm }}
              resizeMode="cover"
            />
          </Card>
        ) : null}

        <Card>
          <KeyValueRow label="Filed By" value={observation.agent.name} />
          <KeyValueRow label="Filed On" value={new Date(observation.created_at).toLocaleString()} last />
        </Card>
      </ScrollView>
    </Screen>
  );
}
