import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { Card, EmptyState, FadeSlideIn, Screen, Skeleton, StaggeredItem, StatusBadge } from '@/components';
import { incidentsApi } from '@/api';
import type { IncidentRecord, IncidentStatus } from '@/types';
import type { HodTabNavProp } from '@/navigation/types';
import { colors, spacing, fontSize, radius } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

type Nav = HodTabNavProp<'Incidents'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

const FILTERS: { key: IncidentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'under_investigation', label: 'Under Investigation' },
  { key: 'closed', label: 'Closed' },
];

export function IncidentsScreen() {
  const navigation = useNavigation<Nav>();
  const { isTabletUp } = useBreakpoint();
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<IncidentStatus | 'all'>('all');

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      incidentsApi
        .allIncidents()
        .then(setIncidents)
        .finally(() => setLoading(false));
    }, []),
  );

  const filtered = useMemo(
    () => (filter === 'all' ? incidents : incidents.filter((i) => i.status === filter)),
    [incidents, filter],
  );

  return (
    <Screen>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <FadeSlideIn>
          <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary }}>
            All Incidents
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
            {filtered.length} incident{filtered.length === 1 ? '' : 's'} across all agents
          </Text>
        </FadeSlideIn>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          <Skeleton height={72} style={{ borderRadius: radius.md }} />
          <Skeleton height={72} style={{ borderRadius: radius.md }} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState icon="alertTriangle" title="No incidents found" message="Try a different filter." />
      ) : (
        <FlatList
          key={isTabletUp ? 'grid' : 'list'}
          data={filtered}
          numColumns={isTabletUp ? 2 : 1}
          columnWrapperStyle={isTabletUp ? { gap: spacing.md } : undefined}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item, index }) => (
            <View style={isTabletUp ? { flex: 1 } : undefined}>
              <StaggeredItem index={index}>
                <Pressable onPress={() => navigation.navigate('IncidentDetail', { incidentId: item.id })}>
                  <Card>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary }}>
                          {item.incident_no}
                        </Text>
                        <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>
                          {item.agent.name} · {item.department ?? 'No department'} · filed {formatDate(item.created_at)}
                        </Text>
                      </View>
                      <StatusBadge status={item.status} pulse={item.status === 'open'} />
                    </View>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.sm }} numberOfLines={2}>
                      {item.incident_type} · Severity: {item.severity}
                    </Text>
                  </Card>
                </Pressable>
              </StaggeredItem>
            </View>
          )}
        />
      )}
    </Screen>
  );
}
