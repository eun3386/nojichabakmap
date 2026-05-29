export interface Place {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  region: string | null;
  tags: string[];
  youtube_url: string | null;
  image_url: string | null;
  distance: string; // 이미지 시안에 매칭되는 거리 (예: "57km")
  subtext: string; // 이미지 시안에 매칭되는 상세 서브텍스트 (예: "경기도 양평 · 강가 · 언제든 가능")
  is_active: boolean;
  created_at: string;
}

export const REVIEW_STATUS = {
  OPEN: '열림',
  CONTROLLED: '통제중',
  NOT_RECOMMENDED: '비추',
} as const;

export type ReviewStatus = typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS];

export interface Review {
  id: string;
  place_id: string;
  nickname: string;
  visited_at: string | null;
  status: ReviewStatus | null;
  content: string | null;
  youtube_url: string | null;
  created_at: string;
}

export const REPORT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ReportStatus = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];

export interface Report {
  id: string;
  place_name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  tags: string[];
  youtube_url: string | null;
  reporter_nickname: string | null;
  status: ReportStatus;
  admin_note: string | null;
  created_at: string;
}

export const YOUTUBE_VIDEO_STATUS = {
  PENDING: 'pending',
  LINKED: 'linked',
  REJECTED: 'rejected',
} as const;

export type YoutubeVideoStatus = typeof YOUTUBE_VIDEO_STATUS[keyof typeof YOUTUBE_VIDEO_STATUS];

export interface YoutubeVideo {
  id: string;
  video_id: string;
  title: string;
  description: string | null;
  channel_id: string | null;
  channel_name: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  place_id: string | null;
  status: YoutubeVideoStatus;
  created_at: string;
}
