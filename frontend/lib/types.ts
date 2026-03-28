// --- Auth ---

export interface UserStatsDto {
  clippings: number;
  followers: number;
  events: number;
}

export interface UserProfileDto {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  stats: UserStatsDto;
  createdAt: string;
}

export interface UserSummaryDto {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserProfileDto;
}

// --- Events ---

export interface EventResponseDto {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  creatorId: string;
  memberCount: number;
  mediaCount: number;
  inviteCode: string;
  createdAt: string;
}

// --- Media ---

export interface MediaResponseDto {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  eventId: string;
  userId: string;
  caption: string;
  location: string;
  type: 'VIDEO' | 'PHOTO';
  aspectRatio: number;
  audioAttribution: string;
  likeCount: number;
  commentCount: number;
  isHighlight: boolean;
  createdAt: string;
  user: UserSummaryDto;
}

export interface UploadResponseDto {
  presignedUploadUrl: string;
  mediaId: string;
}

// --- Feed ---

export interface FeedPostDto {
  id: string;
  eventId: string;
  title: string;
  date: string;
  imageUrl: string;
  likes: number;
  comments: number;
}

// --- Clippings ---

export interface ClippingDto {
  id: string;
  imageUrl: string;
  date: string;
  mediaId: string;
}

// --- Collections ---

export interface CollectionResponseDto {
  id: string;
  title: string;
  thumbnailUrl: string;
  itemCount: number;
}

export interface CollectionDetailResponseDto {
  id: string;
  title: string;
  thumbnailUrl: string;
  itemCount: number;
  items: MediaResponseDto[];
  total: number;
}

// --- Comments ---

export interface CommentResponseDto {
  id: string;
  mediaId: string;
  userId: string;
  text: string;
  createdAt: string;
  user?: UserSummaryDto;
}

// --- Error ---

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}
