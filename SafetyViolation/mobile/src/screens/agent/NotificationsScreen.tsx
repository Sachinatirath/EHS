import { useNavigation } from '@react-navigation/native';

import type { AgentTabNavProp } from '@/navigation/types';
import { NotificationsListScreen } from '@/screens/shared/NotificationsListScreen';

type Nav = AgentTabNavProp<'Notifications'>;

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
