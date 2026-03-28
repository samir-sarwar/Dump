import { api } from './client';
import type { FeedPostDto, UserProfileDto } from '../types';

export async function getFeed(page = 0, size = 20) {
  return api.get<{ posts: FeedPostDto[]; total: number }>(
    `/api/feed?page=${page}&size=${size}`,
  );
}

export async function getFeedFriends() {
  return api.get<UserProfileDto[]>('/api/feed/friends');
}

export async function getBatchUsers(userIds: string[]) {
  return api.post<UserProfileDto[]>('/api/auth/users/batch', { userIds });
}
