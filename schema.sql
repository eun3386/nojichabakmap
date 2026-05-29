-- ================================================
-- 노지차박맵 (노지로) 통합 Database Schema & Seed Data
-- ================================================

-- ------------------------------------------------
-- 1. 기존 테이블 및 트리거 정리 (초기화용)
-- ------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
drop table if exists saved_places cascade;
drop table if exists users cascade;
drop table if exists youtube_videos cascade;
drop table if exists reports cascade;
drop table if exists reviews cascade;
drop table if exists places cascade;

-- ------------------------------------------------
-- 2. 테이블 생성 (v0 MVP 핵심 테이블)
-- ------------------------------------------------

-- [places] 차박지 테이블
create table places (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  lat         float8 not null,
  lng         float8 not null,
  region      text,
  tags        text[] default '{}',
  youtube_url text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- [reviews] 방문 후기 테이블
create table reviews (
  id           uuid primary key default gen_random_uuid(),
  place_id     uuid references places(id) on delete cascade,
  nickname     text not null,
  visited_at   date,
  status       text check (status in ('열림', '통제중', '비추')),
  content      text,
  youtube_url  text,
  created_at   timestamptz default now()
);

-- [reports] 장소 제보 테이블
create table reports (
  id                uuid primary key default gen_random_uuid(),
  place_name        text not null,
  address           text,
  lat               float8,
  lng               float8,
  tags              text[] default '{}',
  youtube_url       text,
  reporter_nickname text,
  status            text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note        text,
  created_at        timestamptz default now()
);

-- [youtube_videos] 유튜브 영상 수집 테이블
create table youtube_videos (
  id            uuid primary key default gen_random_uuid(),
  video_id      text unique not null,
  title         text not null,
  description   text,
  channel_id    text,
  channel_name  text,
  thumbnail_url text,
  published_at  timestamptz,
  place_id      uuid references places(id) on delete set null,
  status        text default 'pending' check (status in ('pending', 'linked', 'rejected')),
  created_at    timestamptz default now()
);

-- ------------------------------------------------
-- 3. 테이블 생성 (v1 확장 테이블 - Supabase Auth 연동)
-- ------------------------------------------------

-- [users] 유저 프로필 테이블 (auth.users와 1:1 대응)
create table users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  nickname   text,
  provider   text,
  created_at timestamptz default now()
);

-- [saved_places] 장소 북마크 테이블
create table saved_places (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade,
  place_id   uuid references places(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, place_id)
);

-- ------------------------------------------------
-- 4. 인덱스 설정 (조회 성능 최적화)
-- ------------------------------------------------
create index idx_places_lat_lng   on places (lat, lng);
create index idx_places_region    on places (region);
create index idx_reviews_place_id on reviews (place_id);
create index idx_youtube_place_id on youtube_videos (place_id);
create index idx_reports_status   on reports (status);

-- ------------------------------------------------
-- 5. Supabase Auth 가입 시 public.users 자동 연동 트리거
-- ------------------------------------------------
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, nickname, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    new.raw_app_meta_data->>'provider'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ------------------------------------------------
-- 6. 초기 테스트 데이터 (Seed Data)
-- ------------------------------------------------

-- 6-1. 대표적인 노지차박지 데이터 삽입
insert into places (id, name, address, lat, lng, region, tags, youtube_url) values
(
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  '충주 비내섬',
  '충청북도 충주시 소태면 조기암리 산1',
  37.168531, 127.771234,
  '충청',
  array['초보OK', '화장실有', '강', '솔로가능'],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
),
(
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  '강릉 안반데기',
  '강원특별자치도 강릉시 왕산면 안반덕길 428',
  37.625345, 128.987654,
  '강원',
  array['산', '솔로가능'],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
),
(
  'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
  '여주 강천섬 유원지',
  '경기도 여주시 강천면 강천리 627',
  37.265432, 127.712345,
  '수도권',
  array['초보OK', '화장실有', '강'],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
),
(
  'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
  '태안 몽산포 해변 인근 노지',
  '충청남도 태안군 남면 신장리 산113-9',
  36.678901, 126.283456,
  '충청',
  array['바다', '화장실有', '초보OK'],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
),
(
  'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
  '춘천 지암계곡 노지',
  '강원특별자치도 춘천시 사북면 지암리 산5',
  37.954321, 127.632145,
  '강원',
  array['산', '강', '솔로가능'],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
);

-- 6-2. 테스트 방문 후기 데이터 삽입
insert into reviews (place_id, nickname, visited_at, status, content, youtube_url) values
(
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  '캠핑꿈나무',
  '2026-05-15',
  '열림',
  '화장실도 비교적 깨끗하고 강바람이 시원해서 너무 좋았습니다. 주말엔 사람이 좀 몰리니 일찍 가시는 걸 추천해요!',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
),
(
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  '차박마스터',
  '2026-05-20',
  '열림',
  '비내섬은 언제 와도 최고네요. 바닥이 자갈밭이라 에어매트는 필수입니다.',
  null
),
(
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  '별헤는밤',
  '2026-05-22',
  '통제중',
  '안반데기 전망대 부근 주차장 야영 및 취사 단속이 강화되었습니다. 스텔스 차박만 겨우 가능하거나 일부 구역은 진입 통제 중이니 참고하세요.',
  null
),
(
  'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
  '여주매니아',
  '2026-05-10',
  '열림',
  '잔디밭이 넓어서 아이들과 피크닉 하기 너무 좋아요. 화장실도 관리가 잘 되고 있습니다.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
),
(
  'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
  '솔캠러',
  '2026-05-25',
  '비추',
  '최근 쓰레기 무단 투기 때문에 지역 주민들과 마찰이 심한 것 같습니다. 분위기가 삼엄해서 당분간은 피하시는 게 좋을 것 같아요.',
  null
);

-- 6-3. 테스트 제보 데이터 삽입
insert into reports (place_name, address, lat, lng, tags, youtube_url, reporter_nickname, status) values
(
  '원주 섬강 자갈밭 노지',
  '강원특별자치도 원주시 지정면 안창리 산10',
  37.382145, 127.854321,
  array['초보OK', '강'],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '프로제보러',
  'pending'
),
(
  '포천 지장산 계곡 입구',
  '경기도 포천시 관인면 중리 산14',
  38.123456, 127.234567,
  array['산', '강', '솔로가능'],
  null,
  '산신령캠퍼',
  'approved'
);

-- 6-4. 유튜브 비디오 수집 데이터 삽입
insert into youtube_videos (video_id, title, description, channel_id, channel_name, thumbnail_url, published_at, place_id, status) values
(
  'vid_001',
  '[충주 비내섬] 초보 차박러들을 위한 성지 리뷰! 화장실 위치 정보 포함',
  '비내섬에서 1박 2일 캠핑을 하며 촬영한 영상입니다. 꿀팁 가득 담았으니 재밌게 봐주세요!',
  'ch_001',
  '차박TV',
  'https://images.unsplash.com/photo-1510312305653-8ed496efae75',
  '2026-04-10T12:00:00Z',
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'linked'
),
(
  'vid_002',
  '은하수 쏟아지는 안반데기 차박 일기 (명당 자리 & 실시간 상황)',
  '국내에서 은하수를 가장 잘 볼 수 있는 안반데기 차박 현장 생생 리뷰입니다.',
  'ch_002',
  '별밤캠퍼',
  'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e',
  '2026-05-01T15:30:00Z',
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  'linked'
);
