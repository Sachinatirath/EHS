import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { DimensionValue, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { Card, EmptyState, FadeSlideIn, Icon, Screen, Skeleton, StaggeredItem, StatChip, StatusBadge } from '@/components';
import { dashboardApi, observationsApi } from '@/api';
import type { AgentSummary, ObservationStatus, ObservationSummary } from '@/types';
import type { AgentTabNavProp } from '@/navigation/types';
import { colors, spacing, fontSize, radius } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

type Nav = AgentTabNavProp<'Home'>;

const FILTERS: { key: ObservationStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'closed', label: 'Closed' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { isTabletUp } = useBreakpoint();
  const [summary, setSummary] = useState<AgentSummary | null>(null);
  const [observations, setObservations] = useState<ObservationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ObservationStatus | 'all'>('all');

  const load = useCallback(async () => {
    const [s, list] = await Promise.all([
      dashboardApi.myDashboardSummary(),
      observationsApi.myObservations(),
    ]);
    setSummary(s);
    setObservations(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = useMemo(
    () => (filter === 'all' ? observations : observations.filter((o) => o.status === filter)),
    [observations, filter],
  );

  const statWidth = (isTabletUp ? '23%' : '47%') as DimensionValue;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <FadeSlideIn
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: spacing.md,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary }}>
              My Safety Observations
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
              {loading ? 'Loading…' : `${observations.length} observation${observations.length === 1 ? '' : 's'} filed`}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('CreateObservation')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 10,
              paddingHorizontal: spacing.md,
              borderRadius: radius.md,
              backgroundColor: colors.primary,
            }}
          >
            <Icon name="plus" size={16} color={colors.textOnPrimary} />
            <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.textOnPrimary }}>New</Text>
          </Pressable>
        </FadeSlideIn>

        {loading || !summary ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={90} style={{ width: statWidth, borderRadius: radius.lg }} />
            ))}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <View style={{ width: statWidth }}>
              <StatChip label="Total Filed" value={summary.total_created} />
            </View>
            <View style={{ width: statWidth }}>
              <StatChip label="Open" value={summary.open_count} accent={colors.warning} />
            </View>
            <View style={{ width: statWidth }}>
              <StatChip label="Under Review" value={summary.under_review_count} accent={colors.info} />
            </View>
            <View style={{ width: statWidth }}>
              <StatChip label="Closed This Month" value={summary.closed_this_month} accent={colors.success} />
            </View>
          </View>
        )}

        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={{
                      paddingVertical: spacing.xs,
                      paddingHorizontal: spacing.md,
                      borderRadius: radius.full,
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: active ? colors.primary : colors.border,
                    }}
                  >
                    <Text style={{ color: active ? colors.textOnPrimary : colors.textSecondary, fontSize: fontSize.xs, fontWeight: '700' }}>
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {loading ? (
            <View style={{ gap: spacing.sm }}>
              <Skeleton height={72} style={{ borderRadius: radius.md }} />
              <Skeleton height={72} style={{ borderRadius: radius.md }} />
            </View>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="eye"
              title="No observations found"
              message={
                observations.length === 0
                  ? 'Tap "New" above to file your first safety observation.'
                  : 'Try a different filter.'
              }
            />
          ) : (
            <FlatList
              data={filtered}
              scrollEnabled={false}
              keyExtractor={(item) => String(item.id)}
              ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
              renderItem={({ item, index }) => (
                <StaggeredItem index={index}>
                  <Pressable onPress={() => navigation.navigate('ObservationDetail', { observationId: item.id })}>
                    <Card>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary }}>
                            {item.observation_no}
                          </Text>
                          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>
                            {item.category} · {item.department ?? 'No department'} · {formatDate(item.created_at)}
                          </Text>
                          <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
                            Severity: {item.severity}
                          </Text>
                        </View>
                        <StatusBadge status={item.status} pulse={item.status === 'open'} />
                      </View>
                    </Card>
                  </Pressable>
                </StaggeredItem>
              )}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
