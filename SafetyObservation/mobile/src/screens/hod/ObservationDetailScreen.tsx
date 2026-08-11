import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Card, FadeSlideIn, Icon, KeyValueRow, PrimaryButton, Screen, Skeleton, StatusBadge } from '@/components';
import { useToast } from '@/components/Toast';
import { observationsApi } from '@/api';
import { apiErrorMessage, toAbsoluteUrl } from '@/api/client';
import type { Observation } from '@/types';
import type { HodStackParamList } from '@/navigation/types';
import { colors, spacing, fontSize, radius } from '@/theme';

type Props = NativeStackScreenProps<HodStackParamList, 'ObservationDetail'>;

export function ObservationDetailScreen({ route }: Props) {
  const { observationId } = route.params;
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [observation, setObservation] = useState<Observation | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState<'under_review' | 'closed' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    observationsApi
      .getObservation(observationId)
      .then(setObservation)
      .catch((e) => setError(apiErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [observationId]);

  const handleStatusChange = async (status: 'under_review' | 'closed') => {
    setSubmittingAction(status);
    setError(null);
    try {
      await observationsApi.updateStatus(observationId, status, note || undefined);
      showToast({ message: `Marked ${status.replace('_', ' ')}`, icon: 'checkCircle' });
      setNote('');
      load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSubmittingAction(null);
    }
  };

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

  const actionable = observation.status !== 'closed';

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
              {observation.observation_no}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
              {observation.category} · {observation.department ?? 'No department'}
            </Text>
          </View>
          <StatusBadge status={observation.status} pulse={observation.status === 'open'} />
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
                {observation.agent.name}
              </Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>
                {observation.agent.employee_id} · {observation.agent.department ?? 'No department'}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: spacing.md, gap: 2 }}>
            <KeyValueRow label="Phone" value={observation.agent.phone ?? '-'} />
            <KeyValueRow label="Email" value={observation.agent.email ?? '-'} last />
          </View>
        </Card>

        {observation.resolution_note ? (
          <Card style={{ backgroundColor: colors.infoLight, borderColor: colors.info }}>
            <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.info, marginBottom: 2 }}>
              RESOLUTION NOTE
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
          <KeyValueRow label="Filed On" value={new Date(observation.created_at).toLocaleString()} last />
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
              {observation.status === 'open' ? (
                <PrimaryButton
                  label="Mark Under Review"
                  variant="secondary"
                  onPress={() => handleStatusChange('under_review')}
                  loading={submittingAction === 'under_review'}
                  disabled={submittingAction !== null}
                />
              ) : null}
              <PrimaryButton
                label="Close Observation"
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
