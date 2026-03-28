import { api } from './client';
import type {
  ClippingDto,
  CollectionDetailResponseDto,
  CollectionResponseDto,
  MediaResponseDto,
  UserProfileDto,
} from '../types';

export async function getClippings(page = 0, size = 20) {
  return api.get<{ clippings: ClippingDto[]; total: number }>(
    `/api/clippings?page=${page}&size=${size}`,
  );
}

export async function getCollections() {
  return api.get<CollectionResponseDto[]>('/api/collections');
}

export async function getCollectionItems(collectionId: string, page = 0, size = 20) {
  return api.get<CollectionDetailResponseDto>(
    `/api/collections/${collectionId}?page=${page}&size=${size}`,
  );
}

export async function createCollection(title: string) {
  return api.post<CollectionResponseDto>('/api/collections', { title });
}

export async function addToCollection(collectionId: string, mediaId: string) {
  return api.post<CollectionResponseDto>(
    `/api/collections/${collectionId}/items`,
    { mediaId },
  );
}

export async function removeFromCollection(
  collectionId: string,
  mediaId: string,
) {
  return api.delete<CollectionResponseDto>(
    `/api/collections/${collectionId}/items/${mediaId}`,
  );
}

export async function getBookmarks(page = 0, size = 20) {
  return api.get<{ items: MediaResponseDto[]; total: number }>(
    `/api/media/bookmarks?page=${page}&size=${size}`,
  );
}

export async function updateProfile(body: {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
}) {
  return api.put<UserProfileDto>('/api/auth/profile', body);
}
