import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { DimensionValue, FlatList, LayoutChangeEvent, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';

import { Card, EmptyState, FadeSlideIn, Icon, Screen, Skeleton, StaggeredItem, StatusBadge } from '@/components';
import { dashboardApi, violationsApi } from '@/api';
import type { HodSummary, ViolationRecord } from '@/types';
import type { HodTabNavProp } from '@/navigation/types';
import { colors, spacing, fontSize, radius, shadow } from '@/theme';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { buildDepartmentBreakdown, buildMonthlyTrend, buildTypeBreakdown } from '@/utils/violationCharts';

type Nav = HodTabNavProp<'Dashboard'>;

interface StatDef {
  key: keyof HodSummary;
  label: string;
  icon: 'clipboard' | 'alertTriangle' | 'clock' | 'checkCircle';
  accent: string;
}

const STAT_DEFS: StatDef[] = [
  { key: 'total_violations', label: 'Total Violations', icon: 'clipboard', accent: colors.primary },
  { key: 'open_count', label: 'Open', icon: 'alertTriangle', accent: colors.warning },
  { key: 'under_review_count', label: 'Under Review', icon: 'clock', accent: colors.info },
  { key: 'reported_this_month', label: 'Reported This Month', icon: 'checkCircle', accent: colors.success },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { isTabletUp, width } = useBreakpoint();
  const [summary, setSummary] = useState<HodSummary | null>(null);
  const [allViolations, setAllViolations] = useState<ViolationRecord[]>([]);
  const [active, setActive] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [barPanelWidth, setBarPanelWidth] = useState(0);
  const [linePanelWidth, setLinePanelWidth] = useState(0);
  // react-native-gifted-charts' PieChart only plays its entry animation on mount —
  // unlike Bar/Line it doesn't replay when the `data` prop changes reference, and
  // since this screen stays mounted across tab switches (React Navigation keeps
  // tab screens alive), isAnimated alone never fires again after the first visit.
  // Bumping this into the chart's `key` forces a real remount on every focus/refresh.
  const [chartCycle, setChartCycle] = useState(0);

  const load = useCallback(async () => {
    const [s, all] = await Promise.all([dashboardApi.hodDashboardSummary(), violationsApi.allViolations()]);
    setSummary(s);
    setAllViolations(all);
    setActive(all.filter((v) => v.status === 'open' || v.status === 'under_review').slice(0, 8));
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setChartCycle((c) => c + 1);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setChartCycle((c) => c + 1);
    setRefreshing(false);
  };

  const statWidth = (isTabletUp ? `${100 / STAT_DEFS.length - 1.5}%` : '47%') as DimensionValue;

  const { departments, series } = buildDepartmentBreakdown(allViolations);
  const typeSlices = buildTypeBreakdown(allViolations);
  const monthlyTrend = buildMonthlyTrend(allViolations);

  const barChartWidth = Math.max(200, (barPanelWidth || width) - spacing.lg * 2);
  const lineChartWidth = Math.max(200, (linePanelWidth || width) - spacing.lg * 2);
  const onBarPanelLayout = (e: LayoutChangeEvent) => setBarPanelWidth(e.nativeEvent.layout.width);
  const onLinePanelLayout = (e: LayoutChangeEvent) => setLinePanelWidth(e.nativeEvent.layout.width);

  const barData = departments.flatMap((dept, deptIdx) =>
    series.map((s, seriesIdx) => ({
      value: s.values[deptIdx],
      frontColor: s.color,
      spacing: seriesIdx === series.length - 1 ? 18 : 2,
      label: seriesIdx === series.length - 1 ? dept : undefined,
    })),
  );
  const pieData = typeSlices.map((s) => ({ value: s.value, color: s.color, text: '' }));
  const lineData = monthlyTrend.map((p) => ({ value: p.value, label: p.month }));
  const lineInitialSpacing = 16;
  const lineEndSpacing = 16;
  const lineSpacing =
    lineData.length > 1
      ? Math.max(30, (lineChartWidth - lineInitialSpacing - lineEndSpacing) / (lineData.length - 1))
      : lineChartWidth;

  return (
    <Screen centered={false}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <FadeSlideIn>
          <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary }}>
            HOD Dashboard
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
            Plant-wide safety violation reporting
          </Text>
        </FadeSlideIn>

        {loading || !summary ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={100} style={{ width: statWidth, borderRadius: radius.lg }} />
            ))}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {STAT_DEFS.map((def, i) => (
              <View key={def.key} style={{ width: statWidth }}>
                <StaggeredItem index={i}>
                  <View
                    style={[
                      {
                        width: '100%',
                        backgroundColor: colors.surface,
                        borderRadius: radius.lg,
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: spacing.lg,
                      },
                      shadow.card,
                    ]}
                  >
                    <Icon name={def.icon} size={16} color={def.accent} />
                    <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.sm }}>
                      {summary[def.key] as number}
                    </Text>
                    <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>{def.label}</Text>
                  </View>
                </StaggeredItem>
              </View>
            ))}
          </View>
        )}

        <View style={{ flexDirection: isTabletUp ? 'row' : 'column', gap: spacing.md }}>
          <View onLayout={onBarPanelLayout} style={[{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }, shadow.card]}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary }}>Violations by Department</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, marginBottom: spacing.md }}>By review status</Text>
            {loading ? (
              <Skeleton height={180} borderRadius={radius.md} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={barData}
                  width={barChartWidth}
                  height={180}
                  barWidth={isTabletUp ? 10 : 8}
                  noOfSections={4}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor={colors.border}
                  rulesColor={colors.border}
                  rulesType="dashed"
                  yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 9 }}
                  isAnimated
                />
              </ScrollView>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md }}>
              {series.map((s) => (
                <View key={s.status} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: s.color }} />
                  <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '600' }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center' }, shadow.card]}>
            <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary, alignSelf: 'flex-start' }}>Violations by Type</Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, marginBottom: spacing.md, alignSelf: 'flex-start' }}>All departments</Text>
            {loading ? (
              <Skeleton width={isTabletUp ? 160 : 136} height={isTabletUp ? 160 : 136} borderRadius={999} />
            ) : pieData.length === 0 ? (
              <EmptyState icon="clipboard" title="No data yet" />
            ) : (
              <PieChart
                key={`pie-${chartCycle}`}
                data={pieData}
                donut
                radius={isTabletUp ? 80 : 68}
                innerRadius={isTabletUp ? 52 : 44}
                innerCircleColor={colors.surface}
                isAnimated
                animationDuration={700}
              />
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md, justifyContent: 'center' }}>
              {typeSlices.map((s) => (
                <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: s.color }} />
                  <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '600' }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View onLayout={onLinePanelLayout} style={[{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }, shadow.card]}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary }}>Violations Reported</Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, marginBottom: spacing.md }}>Last 6 months</Text>
          {loading ? (
            <Skeleton height={180} borderRadius={radius.md} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={lineData}
                width={lineChartWidth}
                initialSpacing={lineInitialSpacing}
                endSpacing={lineEndSpacing}
                spacing={lineSpacing}
                height={180}
                curved
                thickness={3}
                color={colors.primary}
                dataPointsColor={colors.primary}
                dataPointsRadius={4}
                noOfSections={4}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={colors.border}
                rulesColor={colors.border}
                rulesType="dashed"
                yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                startFillColor={colors.primary}
                endFillColor={colors.primary}
                startOpacity={0.18}
                endOpacity={0.02}
                areaChart
                isAnimated
              />
            </ScrollView>
          )}
        </View>

        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary }}>
              Active Violations
            </Text>
            <Pressable onPress={() => navigation.navigate('Violations')}>
              <Text style={{ fontSize: fontSize.xs, color: colors.primary, fontWeight: '700' }}>View All</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={{ gap: spacing.sm }}>
              <Skeleton height={72} style={{ borderRadius: radius.md }} />
              <Skeleton height={72} style={{ borderRadius: radius.md }} />
            </View>
          ) : active.length === 0 ? (
            <EmptyState icon="checkCircle" title="No active violations" message="Everything is up to date." />
          ) : isTabletUp ? (
            <View
              style={[
                { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
                shadow.card,
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.background,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={[tableStyles.th, { flex: 1.3 }]}>VIOLATION NO</Text>
                <Text style={[tableStyles.th, { flex: 1 }]}>AGENT</Text>
                <Text style={[tableStyles.th, { flex: 1.1 }]}>DEPARTMENT</Text>
                <Text style={[tableStyles.th, { flex: 1.3 }]}>TYPE</Text>
                <Text style={[tableStyles.th, { flex: 0.9 }]}>STATUS</Text>
                <Text style={[tableStyles.th, { flex: 0.9 }]}>FILED</Text>
                <Text style={[tableStyles.th, { width: 70, textAlign: 'right' }]}> </Text>
              </View>
              {active.map((item, index) => (
                <StaggeredItem key={item.id} index={index}>
                  <Pressable onPress={() => navigation.navigate('ViolationDetail', { violationId: item.id })}>
                    {({ pressed }) => (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: spacing.sm + 2,
                          paddingHorizontal: spacing.md,
                          borderTopWidth: index === 0 ? 0 : 1,
                          borderTopColor: colors.border,
                          backgroundColor: pressed ? colors.background : 'transparent',
                        }}
                      >
                        <Text style={[tableStyles.td, { flex: 1.3, fontWeight: '700', color: colors.textPrimary }]}>
                          {item.violation_no}
                        </Text>
                        <Text style={[tableStyles.td, { flex: 1 }]} numberOfLines={1}>{item.agent.name}</Text>
                        <Text style={[tableStyles.td, { flex: 1.1 }]}>{item.department}</Text>
                        <Text style={[tableStyles.td, { flex: 1.3 }]} numberOfLines={1}>{item.violation_type}</Text>
                        <View style={{ flex: 0.9 }}>
                          <StatusBadge status={item.status} pulse={item.status === 'open'} />
                        </View>
                        <Text style={[tableStyles.td, { flex: 0.9 }]}>{formatDate(item.created_at)}</Text>
                        <View style={{ width: 70, alignItems: 'flex-end' }}>
                          <Icon name="chevronRight" size={16} color={colors.textMuted} />
                        </View>
                      </View>
                    )}
                  </Pressable>
                </StaggeredItem>
              ))}
            </View>
          ) : (
            <FlatList
              data={active}
              scrollEnabled={false}
              keyExtractor={(item) => String(item.id)}
              ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
              renderItem={({ item, index }) => (
                <StaggeredItem index={index}>
                  <Pressable onPress={() => navigation.navigate('ViolationDetail', { violationId: item.id })}>
                    {({ pressed }) => (
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
                            borderLeftWidth: 3,
                            borderLeftColor: item.status === 'open' ? colors.warning : colors.info,
                            padding: spacing.md,
                            opacity: pressed ? 0.85 : 1,
                          },
                          shadow.card,
                        ]}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: radius.md,
                            backgroundColor: colors.primaryLight,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon name="alertTriangle" size={18} color={colors.primaryDark} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: fontSize.sm, fontWeight: '700', color: colors.textPrimary }}>
                            {item.violation_no}
                          </Text>
                          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }} numberOfLines={1}>
                            {item.agent.name} · {item.department} · {item.violation_type}
                          </Text>
                        </View>
                        <StatusBadge status={item.status} pulse={item.status === 'open'} />
                        <Icon name="chevronRight" size={16} color={colors.textMuted} />
                      </View>
                    )}
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

const tableStyles = {
  th: { fontSize: 11, fontWeight: '700' as const, color: colors.textMuted, letterSpacing: 0.4 },
  td: { fontSize: fontSize.xs, color: colors.textSecondary },
};
