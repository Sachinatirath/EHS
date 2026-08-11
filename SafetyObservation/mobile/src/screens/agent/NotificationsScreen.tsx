import { useNavigation } from '@react-navigation/native';

import type { AgentTabNavProp } from '@/navigation/types';
import { NotificationsListScreen } from '@/screens/shared/NotificationsListScreen';

type Nav = AgentTabNavProp<'Notifications'>;

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <NotificationsListScreen
      onNotificationPress={(notification) => {
        if (notification.observation_id) {
          navigation.navigate('ObservationDetail', { observationId: notification.observation_id });
        }
      }}
    />
  );
}
