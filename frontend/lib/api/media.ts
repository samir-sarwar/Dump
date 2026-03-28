import { api } from './client';
import type { MediaResponseDto, UploadResponseDto } from '../types';

export async function getEventMedia(
  eventId: string,
  filter = 'ALL',
  page = 0,
  size = 20,
) {
  return api.get<{ items: MediaResponseDto[]; total: number }>(
    `/api/media/event/${eventId}?filter=${filter}&page=${page}&size=${size}`,
  );
}

export async function getMediaFeed(eventId: string, page = 0, size = 20) {
  return api.get<{ items: MediaResponseDto[]; total: number }>(
    `/api/media/event/${eventId}/feed?page=${page}&size=${size}`,
  );
}

export async function getUserMedia(
  userId: string,
  filter = 'ALL',
  page = 0,
  size = 20,
) {
  return api.get<{ items: MediaResponseDto[]; total: number }>(
    `/api/media/user/${userId}?filter=${filter}&page=${page}&size=${size}`,
  );
}

export async function getMedia(mediaId: string) {
  return api.get<MediaResponseDto>(`/api/media/${mediaId}`);
}

export async function initiateUpload(body: {
  eventId: string;
  caption?: string;
  location?: string;
  type: 'VIDEO' | 'PHOTO';
  filename: string;
  aspectRatio: number;
  audioAttribution?: string;
}) {
  return api.post<UploadResponseDto>('/api/media/upload', body);
}

export async function confirmUpload(mediaId: string) {
  return api.post<MediaResponseDto>(`/api/media/${mediaId}/confirm`);
}

export async function uploadProfileImage(filename: string) {
  return api.post<{ presignedUploadUrl: string; publicUrl: string }>(
    '/api/media/upload-image',
    { filename },
  );
}
