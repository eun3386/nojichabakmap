import { createClient } from '@supabase/supabase-js';
import { env, isMockMode } from './env';
import { Place, Review, Report } from '../types';

export const supabase = !isMockMode
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : null;

// ===============================================================
// 사용자의 완벽한 디자인 매핑 데이터셋 (전체 10, 바다 5, 강변 2, 계곡 2, 숲속 1)
// ===============================================================
const INITIAL_PLACES: Place[] = [
  {
    id: 'p1',
    name: '양평 두물머리',
    address: '경기도 양평군 양서면 양수리',
    lat: 37.5562,
    lng: 127.3122,
    region: '수도권',
    tags: ['강변'],
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    image_url: null,
    distance: '57km',
    subtext: '경기도 양평 · 강가 · 언제든 가능',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: '화천 평화의 댐',
    address: '강원특별자치도 화천군 화천읍 동촌리',
    lat: 38.1982,
    lng: 127.7891,
    region: '강원',
    tags: ['계곡', '강변'],
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    image_url: null,
    distance: '105km',
    subtext: '강원도 화천 · 호수 근처 · 봄부터 가을까지',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: '태안 몽산포해변',
    address: '충청남도 태안군 남면 신장리',
    lat: 36.6789,
    lng: 126.2834,
    region: '충청',
    tags: ['바다'],
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    image_url: null,
    distance: '140km',
    subtext: '충청남도 태안 · 바다 · 상시 가능',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p4',
    name: '포천 지장산 계곡',
    address: '경기도 포천시 관인면 중리',
    lat: 38.1234,
    lng: 127.2345,
    region: '수도권',
    tags: ['계곡'],
    youtube_url: null,
    image_url: null,
    distance: '75km',
    subtext: '경기도 포천 · 깊은 계곡 · 여름 한정 가능',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p5',
    name: '인제 자작나무숲 노지',
    address: '강원특별자치도 인제군 인제읍 원대리',
    lat: 37.9892,
    lng: 128.2132,
    region: '강원',
    tags: ['숲속'],
    youtube_url: null,
    image_url: null,
    distance: '160km',
    subtext: '강원도 인제 · 자작나무 우거진 숲 · 가을 추천',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p6',
    name: '양양 죽도해변 공터',
    address: '강원특별자치도 양양군 현남면 창리',
    lat: 37.9712,
    lng: 128.7612,
    region: '강원',
    tags: ['바다'],
    youtube_url: null,
    image_url: null,
    distance: '185km',
    subtext: '강원도 양양 · 서핑 해변 앞 · 상시 가능',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p7',
    name: '강릉 안목해변 노지',
    address: '강원특별자치도 강릉시 창해로',
    lat: 37.7718,
    lng: 128.9482,
    region: '강원',
    tags: ['바다'],
    youtube_url: null,
    image_url: null,
    distance: '210km',
    subtext: '강원도 강릉 · 커피거리 인근 해변 · 언제든 가능',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p8',
    name: '여주 강천섬 노지',
    address: '경기도 여주시 강천면 강천리',
    lat: 37.2654,
    lng: 127.7123,
    region: '수도권',
    tags: ['강변'],
    youtube_url: null,
    image_url: null,
    distance: '72km',
    subtext: '경기도 여주 · 드넓은 잔디밭 · 봄/가을 추천',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p9',
    name: '영덕 고래불해변 솔밭',
    address: '경상북도 영덕군 병곡면 병곡리',
    lat: 36.5821,
    lng: 129.4123,
    region: '경상',
    tags: ['바다'],
    youtube_url: null,
    image_url: null,
    distance: '280km',
    subtext: '경상북도 영덕 · 맑은 동해안 해변 · 야영 가능',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'p10',
    name: '부산 송정해변 주차장',
    address: '부산광역시 해운대구 송정동',
    lat: 35.1782,
    lng: 129.2012,
    region: '경상',
    tags: ['바다'],
    youtube_url: null,
    image_url: null,
    distance: '320km',
    subtext: '부산 해운대 · 도심형 차박 명당 · 스텔스 추천',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    place_id: 'p1',
    nickname: '캠핑꿈나무',
    visited_at: '2026-05-15',
    status: '열림',
    content: '두물머리 강변 분위기 최고입니다. 새벽에 물안개 피어오르는 게 정말 장관이네요.',
    youtube_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'r2',
    place_id: 'p2',
    nickname: '오프로더',
    visited_at: '2026-05-20',
    status: '열림',
    content: '평화의 댐은 고요하고 차박하기 최적의 조용함을 선사합니다. 화장실도 근처에 있어 편해요.',
    youtube_url: null,
    created_at: new Date().toISOString(),
  },
];

const STORAGE_KEYS = {
  PLACES: 'noji_places_v2',
  REVIEWS: 'noji_reviews_v2',
  REPORTS: 'noji_reports_v2',
} as const;

export const mockDb = {
  getPlaces: (): Place[] => {
    if (typeof window === 'undefined') return INITIAL_PLACES;
    const stored = localStorage.getItem(STORAGE_KEYS.PLACES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(INITIAL_PLACES));
      return INITIAL_PLACES;
    }
    return JSON.parse(stored) as Place[];
  },

  getReviews: (placeId?: string): Review[] => {
    if (typeof window === 'undefined') return INITIAL_REVIEWS;
    const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    const reviews = stored ? (JSON.parse(stored) as Review[]) : INITIAL_REVIEWS;
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    }
    if (placeId) {
      return reviews.filter((review) => review.place_id === placeId);
    }
    return reviews;
  },

  addReview: (review: Omit<Review, 'id' | 'created_at'>): Review => {
    const reviews = mockDb.getReviews();
    const newReview: Review = {
      ...review,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const updated = [newReview, ...reviews];
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    return newReview;
  },

  addReport: (report: Omit<Report, 'id' | 'created_at' | 'status' | 'admin_note'>): Report => {
    const stored = localStorage.getItem(STORAGE_KEYS.REPORTS);
    const reports = stored ? (JSON.parse(stored) as Report[]) : [];
    const newReport: Report = {
      ...report,
      id: crypto.randomUUID(),
      status: 'pending',
      admin_note: null,
      created_at: new Date().toISOString(),
    };
    const updated = [newReport, ...reports];
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
    return newReport;
  },
};
