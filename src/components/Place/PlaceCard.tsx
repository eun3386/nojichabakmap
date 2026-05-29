'use client';

import React, { useState, useEffect } from 'react';
import { Place, Review } from '../../types';
import { mockDb, supabase } from '../../lib/supabase';
import { isMockMode } from '../../lib/env';
import { logger } from '../../lib/logger';
import ReviewForm from './ReviewForm';

interface PlaceCardProps {
  place: Place;
  onClose: () => void;
}

export default function PlaceCard({ place, onClose }: PlaceCardProps): React.JSX.Element {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWriteReview, setIsWriteReview] = useState<boolean>(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);

  // 유튜브 URL에서 비디오 ID 추출 유틸리티
  const getYoutubeVideoId = (url: string | null): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // 해당 장소의 리뷰 로드
  const fetchReviews = async (): Promise<void> => {
    setIsLoadingReviews(true);
    try {
      if (isMockMode) {
        const data = mockDb.getReviews(place.id);
        setReviews(data);
      } else if (supabase) {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('place_id', place.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setReviews(data || []);
      }
    } catch (err: unknown) {
      logger.error('Failed to load reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    setIsWriteReview(false);
  }, [place]);

  const handleReviewSuccess = (): void => {
    setIsWriteReview(false);
    fetchReviews();
  };

  const handleToggleReviewForm = (): void => {
    setIsWriteReview((prev) => !prev);
  };

  const videoId = getYoutubeVideoId(place.youtube_url);

  // 길찾기 링크
  const kakaoNaviUrl = `https://map.kakao.com/link/to/${place.name},${place.lat},${place.lng}`;
  const naverNaviUrl = `https://map.naver.com/v5/search/${encodeURIComponent(place.name)}`;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-white w-full overflow-y-auto divide-y divide-slate-850 scrollbar-thin">
      {/* 1. 기본 장소 헤더 정보 */}
      <div className="p-6 flex flex-col gap-4 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95 border border-slate-700/50"
        >
          ✕
        </button>

        <div className="flex flex-col gap-1.5 pr-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              {place.region || '전국'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">{place.name}</h2>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-3.5 h-3.5 text-slate-500"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{place.address}</span>
          </p>
        </div>

        {/* 태그 모음 */}
        <div className="flex flex-wrap gap-1.5">
          {place.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-800 border border-slate-750 text-emerald-400 font-semibold px-2.5 py-1 rounded-lg"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 길찾기 네비게이션 연동 버튼 */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <a
            href={kakaoNaviUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95"
          >
            <span>카카오맵 길찾기</span>
          </a>
          <a
            href={naverNaviUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95"
          >
            <span>네이버지도 길찾기</span>
          </a>
        </div>
      </div>

      {/* 2. 유튜브 대표 영상 플레이어 */}
      {videoId && (
        <div className="p-6 flex flex-col gap-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            대표 현장 영상
          </h3>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`${place.name} 유튜브 리뷰`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* 3. 최근 방문 후기 */}
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
            <span>방문 후기</span>
            <span className="text-xs text-slate-500 font-semibold">({reviews.length})</span>
          </h3>
          {!isWriteReview && (
            <button
              onClick={handleToggleReviewForm}
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-md"
            >
              후기 남기기
            </button>
          )}
        </div>

        {/* 후기 작성 폼 활성화 */}
        {isWriteReview && (
          <ReviewForm
            placeId={place.id}
            onSuccess={handleReviewSuccess}
            onCancel={handleToggleReviewForm}
          />
        )}

        {/* 후기 리스트 */}
        <div className="flex flex-col gap-3">
          {isLoadingReviews ? (
            <div className="text-center py-8 text-slate-500 text-xs">후기를 로드하는 중...</div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-slate-850/50 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-2.5"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-200">{review.nickname}</span>
                    <span className="text-[10px] text-slate-500">{review.visited_at}</span>
                  </div>
                  {review.status && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        review.status === '열림'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : review.status === '통제중'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {review.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
                {review.youtube_url && (
                  <a
                    href={review.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 px-2 py-1 rounded w-max transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    현장 영상 보기
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="bg-slate-850/20 border border-slate-800/40 border-dashed py-8 text-center rounded-xl text-slate-500 text-xs flex flex-col items-center justify-center gap-1.5">
              <span>아직 등록된 방문 후기가 없습니다.</span>
              <span>첫 번째 후기를 작성해 보세요!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
