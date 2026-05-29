'use client';

import React, { useState } from 'react';
import { supabase, mockDb } from '../../lib/supabase';
import { isMockMode } from '../../lib/env';
import { logger } from '../../lib/logger';

interface ReportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AVAILABLE_TAGS = ['초보OK', '솔로가능', '화장실有', '바다', '강', '산'] as const;

export default function ReportForm({ onSuccess, onCancel }: ReportFormProps): React.JSX.Element {
  const [placeName, setPlaceName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [lat, setLat] = useState<string>('37.5665'); // 서울 시청 기본값
  const [lng, setLng] = useState<string>('126.9780');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [reporterNickname, setReporterNickname] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePlaceNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPlaceName(e.target.value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAddress(e.target.value);
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLat(e.target.value);
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLng(e.target.value);
  };

  const handleReporterNicknameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setReporterNickname(e.target.value);
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setYoutubeUrl(e.target.value);
  };

  const handleToggleTag = (tag: string): void => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!placeName.trim()) {
      setErrorMsg('장소명을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      place_name: placeName,
      address: address.trim() || null,
      lat: parseFloat(lat) || 37.5665,
      lng: parseFloat(lng) || 126.9780,
      tags: selectedTags,
      youtube_url: youtubeUrl.trim() || null,
      reporter_nickname: reporterNickname.trim() || null,
    };

    try {
      if (isMockMode) {
        mockDb.addReport(payload);
        logger.info('Report submitted successfully via mock DB:', payload);
        onSuccess();
      } else if (supabase) {
        const { error } = await supabase.from('reports').insert([payload]);
        if (error) throw error;
        logger.info('Report submitted successfully via Supabase:', payload);
        onSuccess();
      }
    } catch (err: unknown) {
      logger.error('Failed to submit report:', err);
      setErrorMsg('제보 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-white w-full overflow-y-auto p-6 divide-y divide-slate-850 scrollbar-thin">
      <div className="flex justify-between items-center pb-4 border-b border-slate-850">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span>차박지 제보하기</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </h2>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95 border border-slate-700/50"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-5">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg font-medium">
            {errorMsg}
          </div>
        )}

        {/* 장소명 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold">장소명 *</label>
          <input
            type="text"
            required
            placeholder="예: 충주 비내섬 인근 공터"
            value={placeName}
            onChange={handlePlaceNameChange}
            className="bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none px-3.5 py-2.5 rounded-xl text-sm text-slate-200"
          />
        </div>

        {/* 주소 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold">상세 주소 (선택)</label>
          <input
            type="text"
            placeholder="예: 충청북도 충주시 소태면 조기암리 산1"
            value={address}
            onChange={handleAddressChange}
            className="bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none px-3.5 py-2.5 rounded-xl text-sm text-slate-200"
          />
        </div>

        {/* 위도 및 경도 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">위도 (Latitude) *</label>
            <input
              type="number"
              step="any"
              required
              value={lat}
              onChange={handleLatChange}
              className="bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none px-3.5 py-2.5 rounded-xl text-sm text-slate-200"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold">경도 (Longitude) *</label>
            <input
              type="number"
              step="any"
              required
              value={lng}
              onChange={handleLngChange}
              className="bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none px-3.5 py-2.5 rounded-xl text-sm text-slate-200"
            />
          </div>
        </div>

        {/* 태그 선택 */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400 font-bold">장소 태그 선택</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 관련 유튜브 링크 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold">참고 유튜브 URL (선택)</label>
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={handleYoutubeUrlChange}
            className="bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none px-3.5 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-650"
          />
        </div>

        {/* 제보자 닉네임 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold">제보자 닉네임 (선택)</label>
          <input
            type="text"
            placeholder="예: 방랑자"
            value={reporterNickname}
            onChange={handleReporterNicknameChange}
            className="bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none px-3.5 py-2.5 rounded-xl text-sm text-slate-200"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-emerald-500/10 active:scale-95 transition-all mt-4"
        >
          {isSubmitting ? '장소 제보 등록 중...' : '장소 제보 제출하기'}
        </button>
      </form>
    </div>
  );
}
