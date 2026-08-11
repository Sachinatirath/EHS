import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Card, FadeSlideIn, Icon, KeyValueRow, PrimaryButton, Screen, Skeleton, StatusBadge } from '@/components';
import { useToast } from '@/components/Toast';
import { incidentsApi } from '@/api';
import { apiErrorMessage, toAbsoluteUrl } from '@/api/client';
import type { Incident } from '@/types';
import type { HodStackParamList } from '@/navigation/types';
import { colors, spacing, fontSize, radius } from '@/theme';

type Props = NativeStackScreenProps<HodStackParamList, 'IncidentDetail'>;

export function IncidentDetailScreen({ route }: Props) {
  const { incidentId } = route.params;
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState<'under_investigation' | 'closed' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    incidentsApi
      .getIncident(incidentId)
      .then(setIncident)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [incidentId]);

  const handleStatusChange = async (status: 'under_investigation' | 'closed') => {
    setSubmittingAction(status);
    setError(null);
    try {
      await incidentsApi.updateStatus(incidentId, status, note || undefined);
      showToast({ message: `Marked ${status.replace('_', ' ')}`, icon: 'checkCircle' });
      setNote('');
      load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSubmittingAction(null);
    }
  };

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

  const actionable = incident.status !== 'closed';

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
              {incident.incident_no}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
              {incident.incident_type} · {incident.department ?? 'No department'}
            </Text>
          </View>
          <StatusBadge status={incident.status} pulse={incident.status === 'open'} />
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
                {incident.agent.name}
              </Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>
                {incident.agent.employee_id} · {incident.agent.department ?? 'No department'}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: spacing.md, gap: 2 }}>
            <KeyValueRow label="Phone" value={incident.agent.phone ?? '-'} />
            <KeyValueRow label="Email" value={incident.agent.email ?? '-'} last />
          </View>
        </Card>

        {incident.resolution_note ? (
          <Card style={{ backgroundColor: colors.infoLight, borderColor: colors.info }}>
            <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.info, marginBottom: 2 }}>
              RESOLUTION NOTE
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
          <KeyValueRow label="Filed On" value={new Date(incident.created_at).toLocaleString()} last />
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
              placeholder="Add a resolution note..."
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
              {incident.status === 'open' ? (
                <PrimaryButton
                  label="Mark Under Investigation"
                  variant="secondary"
                  onPress={() => handleStatusChange('under_investigation')}
                  loading={submittingAction === 'under_investigation'}
                  disabled={submittingAction !== null}
                />
              ) : null}
              <PrimaryButton
                label="Close Incident"
                variant="success"
                onPress={() => handleStatusChange('closed')}
                loading={submittingAction === 'closed'}
                disabled={submittingAction !== null}
              />
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
