import AsyncStorage from '@react-native-async-storage/async-storage';

import { USER_STORAGE_KEY } from './demoUsers';
import type { User } from '@/types';

export async function fetchMe(): Promise<User> {
  const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
  if (!raw) throw new Error('Not logged in');
  return JSON.parse(raw) as User;
}

export async function updateMe(payload: {
  name?: string;
  department?: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<User> {
  const current = await fetchMe();
  const updated: User = { ...current, ...payload };
  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
