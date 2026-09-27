import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * Shared outside the NavigationContainer so the global role/screen dropdown
 * bar (rendered as a sibling of the active Agent/HOD stack, not one of its
 * screens) can still drive navigation inside whichever stack is mounted.
 */
export const navigationRef = createNavigationContainerRef();
