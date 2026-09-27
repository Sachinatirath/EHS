import { getCurrentUser, updateCurrentUser } from './mockDb';
import type { User } from '@/types';

export async function fetchMe(): Promise<User> {
  return getCurrentUser();
}

export async function updateMe(payload: {
  name?: string;
  department?: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<User> {
  return updateCurrentUser(payload);
}
