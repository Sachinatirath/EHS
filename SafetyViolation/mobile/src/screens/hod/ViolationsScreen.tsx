import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { Card, EmptyState, FadeSlideIn, Screen, Skeleton, StaggeredItem, StatusBadge } from '@/components';
import { violationsApi } from '@/api';
import type { ViolationRecord, ViolationStatus } from '@/types';
import type { HodTabNavProp } from '@/navigation/types';
import { colors, spacing, fontSize, radius } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';

type Nav = HodTabNavProp<'Violations'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

const FILTERS: { key: ViolationStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'closed', label: 'Closed' },
  { key: 'rejected', label: 'Rejected' },
];

export function ViolationsScreen() {
  const navigation = useNavigation<Nav>();
  const { isTabletUp } = useBreakpoint();
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ViolationStatus | 'all'>('all');

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      violationsApi
        .allViolations()
        .then(setViolations)
        .finally(() => setLoading(false));
    }, []),
  );

  const filtered = useMemo(
    () => (filter === 'all' ? violations : violations.filter((v) => v.status === filter)),
    [violations, filter],
  );

  return (
    <Screen>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <FadeSlideIn>
          <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary }}>
            All Violations
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
            {filtered.length} notice{filtered.length === 1 ? '' : 's'} across all agents
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
        <EmptyState icon="clipboard" title="No violations found" message="Try a different filter." />
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
                <Pressable onPress={() => navigation.navigate('ViolationDetail', { violationId: item.id })}>
                  <Card>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary }}>
                          {item.violation_no}
                        </Text>
                        <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>
                          {item.agent.name} · {item.department} · filed {formatDate(item.created_at)}
                        </Text>
                      </View>
                      <StatusBadge status={item.status} pulse={item.status === 'open'} />
                    </View>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.sm }} numberOfLines={2}>
                      {item.violation_type} · {item.offence}
                      {item.employee_name ? ` · ${item.employee_name}` : ''}
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
