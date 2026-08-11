import { useNavigation } from '@react-navigation/native';

import type { HodTabNavProp } from '@/navigation/types';
import { NotificationsListScreen } from '@/screens/shared/NotificationsListScreen';

type Nav = HodTabNavProp<'Notifications'>;

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <NotificationsListScreen
      onNotificationPress={(notification) => {
        if (notification.incident_id) {
          navigation.navigate('IncidentDetail', { incidentId: notification.incident_id });
        }
      }}
    />
  );
}
