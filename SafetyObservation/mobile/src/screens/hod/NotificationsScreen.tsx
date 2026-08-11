import { useNavigation } from '@react-navigation/native';

import type { HodTabNavProp } from '@/navigation/types';
import { NotificationsListScreen } from '@/screens/shared/NotificationsListScreen';

type Nav = HodTabNavProp<'Notifications'>;

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
