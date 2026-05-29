'use client';

import React, { useState } from 'react';
import { supabase, mockDb } from '../../lib/supabase';
import { REVIEW_STATUS, ReviewStatus } from '../../types';
import { isMockMode } from '../../lib/env';
import { logger } from '../../lib/logger';

interface ReviewFormProps {
  placeId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewForm({
  placeId,
  onSuccess,
  onCancel,
}: ReviewFormProps): React.JSX.Element {
  const [nickname, setNickname] = useState<string>('');
  const [visitedAt, setVisitedAt] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ReviewStatus>('열림');
  const [content, setContent] = useState<string>('');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNickname(e.target.value);
  };

  const handleVisitedAtChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setVisitedAt(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setContent(e.target.value);
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setYoutubeUrl(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg('닉네임을 입력해 주세요.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('후기 내용을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      place_id: placeId,
      nickname,
      visited_at: visitedAt,
      status,
      content,
      youtube_url: youtubeUrl.trim() || null,
    };

    try {
      if (isMockMode) {
        // Mock 모드일 때는 LocalStorage에 저장
        mockDb.addReview(payload);
        logger.info('Review submitted successfully via mock DB:', payload);
        onSuccess();
      } else if (supabase) {
        // 실 Supabase 연동
        const { error } = await supabase.from('reviews').insert([payload]);
        if (error) throw error;
        logger.info('Review submitted successfully via Supabase:', payload);
        onSuccess();
      }
    } catch (err: unknown) {
      logger.error('Failed to submit review:', err);
      setErrorMsg('후기 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-center pb-2 border-b border-slate-850">
        <h4 className="font-bold text-slate-100 text-sm">익명 방문 후기 작성</h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white"
        >
          취소
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg font-medium">
          {errorMsg}
        </div>
      )}

      {/* 닉네임 / 방문일 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 font-semibold uppercase">닉네임</label>
          <input
            type="text"
            required
            placeholder="예: 캠핑대장"
            value={nickname}
            onChange={handleNicknameChange}
            className="bg-slate-900 border border-slate-800 focus:border-emerald-500 outline-none px-3 py-2 rounded-lg text-xs text-slate-200"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 font-semibold uppercase">방문일</label>
          <input
            type="date"
            required
            value={visitedAt}
            onChange={handleVisitedAtChange}
            className="bg-slate-900 border border-slate-800 focus:border-emerald-500 outline-none px-3 py-2 rounded-lg text-xs text-slate-200"
          />
        </div>
      </div>

      {/* 노지 이용 상황 상태선택 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-slate-400 font-semibold uppercase">이용 상황</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(REVIEW_STATUS).map((statusValue) => {
            const isCurrent = status === statusValue;
            return (
              <button
                key={statusValue}
                type="button"
                onClick={() => setStatus(statusValue)}
                className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isCurrent
                    ? statusValue === '열림'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : statusValue === '통제중'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {statusValue}
              </button>
            );
          })}
        </div>
      </div>

      {/* 후기 내용 */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-slate-400 font-semibold uppercase">방문 후기</label>
        <textarea
          required
          rows={3}
          placeholder="화장실 유무, 바닥 상태, 편의시설 등 상세한 이용 후기를 공유해 주세요!"
          value={content}
          onChange={handleContentChange}
          className="bg-slate-900 border border-slate-800 focus:border-emerald-500 outline-none px-3 py-2 rounded-lg text-xs text-slate-200 placeholder-slate-500 resize-none"
        />
      </div>

      {/* 유튜브 동영상 URL */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-slate-400 font-semibold uppercase">현장 유튜브 영상 (선택)</label>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={youtubeUrl}
          onChange={handleYoutubeUrlChange}
          className="bg-slate-900 border border-slate-800 focus:border-emerald-500 outline-none px-3 py-2 rounded-lg text-xs text-slate-200 placeholder-slate-600"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg active:scale-95 transition-all mt-2"
      >
        {isSubmitting ? '후기 등록 중...' : '후기 등록하기'}
      </button>
    </form>
  );
}
