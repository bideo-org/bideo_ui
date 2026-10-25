export type VideoCategory =
  | 'TECH'
  | 'EDUCATION'
  | 'GAMING'
  | 'ENTERTAINMENT'
  | 'MUSIC'
  | 'NEWS'
  | 'SPORTS'
  | 'LIFESTYLE'
  | 'OTHER';

export type VideoVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';

export type VideoStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SeoMetadataDTO {
  title: string;
  description: string;
  canonicalUrl: string;
  jsonLdVideoObject: Record<string, unknown>;
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
}

import type { UserDTO } from "./user";
export type { UserDTO } from "./user";
export * from "./user";

export interface VideoDTO {
  videoId: number;
  video_title: string;
  slug?: string;
  description?: string;
  tags?: string[];
  category?: VideoCategory;
  visibility?: VideoVisibility;
  video_uploadDate: string;
  video_views: number;
  m3u8Url?: string;
  video_duration?: string;
  iso_duration?: string;
  thumbnail_url?: string;
  storyboard_url?: string;
  vtt_url?: string;
  videoStatus?: VideoStatus;
  video_uploader?: UserDTO;
  seo?: SeoMetadataDTO;
}

export interface VideoMetadataUpdateRequest {
  videoTitle?: string;
  description?: string;
  tags?: string[];
  category?: VideoCategory;
  visibility?: VideoVisibility;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements?: number;
  size?: number;
  number: number;
  first?: boolean;
  last: boolean;
  empty?: boolean;
}

export type PaginatedVideoResponse = PageResponse<VideoDTO>;

export interface EngagementDTO {
  videoId: number;
  likesCount: number;
  dislikesCount: number;
  userReaction: 'LIKE' | 'DISLIKE' | 'NONE';
}

export interface CommentDTO {
  commentId: number;
  videoId: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  timestampInSeconds?: number;
  isPinned?: boolean;
  user?: UserDTO;
  parentCommentId?: number;
  repliesCount?: number;
}

export interface ProgressDTO {
  videoId: number;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
}

export interface SubscriptionStatusDTO {
  channelUserId: string;
  subscriberCount: number;
  isSubscribed?: boolean;
  subscribed?: boolean;
}

export interface WatchProgressDTO {
  videoId: number;
  videoTitle: string;
  slug?: string;
  thumbnailUrl?: string;
  channelName?: string;
  channelHandle?: string;
  channelAvatar?: string;
  progressSeconds: number;
  durationSeconds?: number;
  completed: boolean;
  lastWatchedAt?: string;
}

export interface PlaylistDTO {
  playlistId: number;
  title: string;
  description?: string;
  userId: string;
  visibility: string;
  isSystem?: boolean;
  system?: boolean;
  videoCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PlaylistDetailDTO extends PlaylistDTO {
  videos: VideoDTO[];
}

export interface PresignedUploadRequestDTO {
  fileName: string;
  contentType: string;
}

export interface PresignedUploadResponseDTO {
  uploadUrl: string;
  s3Key: string;
  processId?: string;
  publicS3Url?: string;
  expiresInSeconds?: number;
}

export interface CompletePresignedUploadDTO {
  s3Key: string;
  processId?: string;
  videoTitle: string;
  description?: string;
  tags?: string[];
  category?: VideoCategory;
  visibility?: VideoVisibility;
}

export interface TranscodeProgress {
  videoId?: number;
  processId?: string;
  stage: string;
  percent: number;
  status: string;
}


