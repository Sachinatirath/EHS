import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Animated, FlatList, Pressable, Text, View } from 'react-native';

import { EmptyState, FadeSlideIn, Icon, Screen, Skeleton, StaggeredItem } from '@/components';
import { notificationsApi } from '@/api';
import type { Notification } from '@/types';
import { colors, spacing, fontSize, radius } from '@/theme';

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function NotificationRow({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress: () => void;
}) {
  const dotOpacity = React.useRef(new Animated.Value(notification.is_read ? 0 : 1)).current;

  useFocusEffect(
    useCallback(() => {
      Animated.timing(dotOpacity, {
        toValue: notification.is_read ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [notification.is_read, dotOpacity]),
  );

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: spacing.sm,
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: notification.is_read ? colors.surface : colors.primaryLight,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ width: 22, alignItems: 'center', paddingTop: 4 }}>
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.primary,
              opacity: dotOpacity,
            }}
          />
        </View>
        <Icon name="bell" size={18} color={colors.textSecondary} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: notification.is_read ? '500' : '700' }}>
            {notification.message}
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 }}>
            {timeAgo(notification.created_at)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

interface NotificationsListScreenProps {
  onNotificationPress: (notification: Notification) => void;
}

export function NotificationsListScreen({ onNotificationPress }: NotificationsListScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    return notificationsApi.listNotifications().then(setNotifications);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const handlePress = async (notification: Notification) => {
    if (!notification.is_read) {
      setNotifications((list) =>
        list.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)),
      );
      notificationsApi.markNotificationRead(notification.id).catch(() => {});
    }
    onNotificationPress(notification);
  };

  const handleMarkAllRead = () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    setNotifications((list) => list.map((n) => ({ ...n, is_read: true })));
    Promise.all(unread.map((n) => notificationsApi.markNotificationRead(n.id))).catch(() => {});
  };

  return (
    <Screen>
      <FadeSlideIn
        style={{
          padding: spacing.lg,
          paddingBottom: spacing.sm,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View>
          <Text style={{ fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary }}>
            Notifications
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>
            {unreadCount} unread
          </Text>
        </View>
        {unreadCount > 0 ? (
          <Pressable
            onPress={handleMarkAllRead}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 7,
              paddingHorizontal: spacing.md,
              borderRadius: radius.full,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Icon name="check" size={13} color={colors.textSecondary} />
            <Text style={{ fontSize: fontSize.xs, fontWeight: '700', color: colors.textSecondary }}>Mark all read</Text>
          </Pressable>
        ) : null}
      </FadeSlideIn>

      {loading ? (
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          <Skeleton height={64} style={{ borderRadius: radius.md }} />
          <Skeleton height={64} style={{ borderRadius: radius.md }} />
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="bell"
          title="You're all caught up"
          message="New incident reports and status updates will appear here."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item, index }) => (
            <StaggeredItem index={index}>
              <NotificationRow notification={item} onPress={() => handlePress(item)} />
            </StaggeredItem>
          )}
        />
      )}
    </Screen>
  );
}
