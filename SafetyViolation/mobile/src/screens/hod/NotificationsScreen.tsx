import { useNavigation } from '@react-navigation/native';

import type { HodTabNavProp } from '@/navigation/types';
import { NotificationsListScreen } from '@/screens/shared/NotificationsListScreen';

type Nav = HodTabNavProp<'Notifications'>;

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <NotificationsListScreen
      onNotificationPress={(notification) => {
        if (notification.violation_id) {
          navigation.navigate('ViolationDetail', { violationId: notification.violation_id });
        }
      }}
    />
  );
}
