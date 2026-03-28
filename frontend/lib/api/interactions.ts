import { api } from './client';
import type { CommentResponseDto } from '../types';

export async function likeMedia(mediaId: string) {
  return api.post<{ success: boolean; newCount: number }>(
    `/api/media/${mediaId}/like`,
  );
}

export async function unlikeMedia(mediaId: string) {
  return api.delete<{ success: boolean; newCount: number }>(
    `/api/media/${mediaId}/like`,
  );
}

export async function commentOnMedia(mediaId: string, text: string) {
  return api.post<CommentResponseDto>(`/api/media/${mediaId}/comment`, {
    text,
  });
}

export async function getComments(mediaId: string, page = 0, size = 20) {
  return api.get<{ comments: CommentResponseDto[]; total: number }>(
    `/api/media/${mediaId}/comments?page=${page}&size=${size}`,
  );
}

export async function bookmarkMedia(mediaId: string) {
  return api.post<{ success: boolean }>(`/api/media/${mediaId}/bookmark`);
}

export async function removeBookmark(mediaId: string) {
  return api.delete<{ success: boolean }>(`/api/media/${mediaId}/bookmark`);
}

export async function clipMedia(mediaId: string) {
  return api.post<{ success: boolean }>(`/api/clippings/${mediaId}`);
}

export async function removeClip(mediaId: string) {
  return api.delete<{ success: boolean }>(`/api/clippings/${mediaId}`);
}

export async function followUser(userId: string) {
  return api.post<{ success: boolean }>(`/api/auth/follow/${userId}`);
}

export async function unfollowUser(userId: string) {
  return api.delete<{ success: boolean }>(`/api/auth/follow/${userId}`);
}
