import { api } from './client';
import type { EventResponseDto } from '../types';

export async function listUserEvents(page = 0, size = 20) {
  return api.get<{ events: EventResponseDto[]; total: number }>(
    `/api/events?page=${page}&size=${size}`,
  );
}

export async function getUpcomingEvents(page = 0, size = 20) {
  return api.get<{ events: EventResponseDto[]; total: number }>(
    `/api/events/upcoming?page=${page}&size=${size}`,
  );
}

export async function getEvent(eventId: string) {
  return api.get<EventResponseDto>(`/api/events/${eventId}`);
}

export async function createEvent(body: {
  title: string;
  date: string;
  location?: string;
  imageUrl?: string;
}) {
  return api.post<EventResponseDto>('/api/events', body);
}

export async function deleteEvent(eventId: string) {
  return api.delete<{ success: boolean }>(`/api/events/${eventId}`);
}

export async function joinEvent(eventId: string) {
  return api.post<{ success: boolean }>(`/api/events/${eventId}/join`);
}

export async function leaveEvent(eventId: string) {
  return api.delete<{ success: boolean }>(`/api/events/${eventId}/leave`);
}

export async function generateInviteCode(eventId: string) {
  return api.post<{ code: string; eventId: string }>(
    `/api/events/${eventId}/invite-code`,
  );
}

export async function joinByInviteCode(code: string) {
  return api.post<{ success: boolean }>('/api/events/join', { code });
}

export async function updateEvent(
  eventId: string,
  body: { title?: string; date?: string; location?: string; imageUrl?: string },
) {
  return api.put<EventResponseDto>(`/api/events/${eventId}`, body);
}

export async function getEventMembers(eventId: string) {
  return api.get<{ userIds: string[]; total: number }>(
    `/api/events/${eventId}/members`,
  );
}
