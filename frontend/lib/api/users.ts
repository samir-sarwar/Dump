import { api } from './client';
import type { UserProfileDto, EventResponseDto } from '../types';

export async function searchUsers(query: string, page = 0, size = 20) {
  return api.get<{ users: UserProfileDto[]; total: number }>(
    `/api/auth/users/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`,
  );
}

export async function getUser(userId: string) {
  return api.get<UserProfileDto>(`/api/auth/users/${userId}`);
}

export async function checkFollowStatus(targetUserId: string) {
  return api.get<{ following: boolean }>(
    `/api/auth/follow/check/${targetUserId}`,
  );
}

export async function getUserEvents(userId: string, page = 0, size = 20) {
  return api.get<{ events: EventResponseDto[]; total: number }>(
    `/api/events/user/${userId}?page=${page}&size=${size}`,
  );
}
