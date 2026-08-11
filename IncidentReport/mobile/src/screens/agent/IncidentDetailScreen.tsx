import React, { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, Text, View } from 'react-native';

import { Card, FadeSlideIn, KeyValueRow, Screen, Skeleton, StatusBadge } from '@/components';
import { incidentsApi } from '@/api';
import { apiErrorMessage, toAbsoluteUrl } from '@/api/client';
import type { Incident } from '@/types';
import type { AgentStackParamList } from '@/navigation/types';
import { colors, spacing, fontSize, radius } from '@/theme';

type Props = NativeStackScreenProps<AgentStackParamList, 'IncidentDetail'>;

export function IncidentDetailScreen({ route }: Props) {
  const { incidentId } = route.params;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    incidentsApi
      .getIncident(incidentId)
      .then(setIncident)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [incidentId]);

  if (loading || !incident) {
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
              {incident.incident_no}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
              {incident.incident_type} · {incident.department ?? 'No department'}
            </Text>
          </View>
          <StatusBadge status={incident.status} pulse={incident.status === 'open'} />
        </FadeSlideIn>

        {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{error}</Text> : null}

        {incident.resolution_note ? (
          <Card style={{ backgroundColor: colors.infoLight, borderColor: colors.info }}>
            <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.info, marginBottom: 2 }}>
              HOD NOTE
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary }}>{incident.resolution_note}</Text>
          </Card>
        ) : null}

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
            Incident Details
          </Text>
          <KeyValueRow label="Date" value={incident.incident_date ?? '-'} />
          <KeyValueRow label="Time" value={incident.incident_time ?? '-'} />
          <KeyValueRow label="Reported By" value={incident.reported_by ?? '-'} />
          <KeyValueRow label="Department" value={incident.department ?? '-'} />
          <KeyValueRow label="Location" value={incident.location ?? '-'} last />
        </Card>

        {incident.description ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
              Incident Description
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{incident.description}</Text>
          </Card>
        ) : null}

        <Card>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
            Classification
          </Text>
          <KeyValueRow label="Incident Type" value={incident.incident_type} />
          <KeyValueRow label="Severity" value={incident.severity} last />
        </Card>

        {incident.corrective_action ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
              Immediate Corrective Action
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{incident.corrective_action}</Text>
          </Card>
        ) : null}

        {incident.root_cause || incident.preventive_action ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
              Investigation
            </Text>
            {incident.root_cause ? (
              <View style={{ marginBottom: incident.preventive_action ? spacing.sm : 0 }}>
                <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.textSecondary, marginBottom: 2 }}>
                  Root Cause
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{incident.root_cause}</Text>
              </View>
            ) : null}
            {incident.preventive_action ? (
              <View>
                <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.textSecondary, marginBottom: 2 }}>
                  Corrective &amp; Preventive Action
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>{incident.preventive_action}</Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {incident.photo_url ? (
          <Card>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm }}>
              Attachment
            </Text>
            <Image
              source={{ uri: toAbsoluteUrl(incident.photo_url) }}
              style={{ width: '100%', height: 180, borderRadius: radius.sm }}
              resizeMode="cover"
            />
          </Card>
        ) : null}

        <Card>
          <KeyValueRow label="Filed By" value={incident.agent.name} />
          <KeyValueRow label="Filed On" value={new Date(incident.created_at).toLocaleString()} last />
        </Card>
      </ScrollView>
    </Screen>
  );
}
