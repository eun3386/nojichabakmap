'use client';

import React, { useState } from 'react';
import { Place } from '../../types';

interface PlaceListProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onOpenReportForm: () => void;
}

const AVAILABLE_TAGS = ['전체', '바다', '강변', '계곡', '숲속'] as const;

export default function PlaceList({
  places,
  selectedPlace,
  onSelectPlace,
  onOpenReportForm,
}: PlaceListProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('전체');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleTagSelect = (tag: string): void => {
    setSelectedTag(tag);
  };

  const filteredPlaces = places.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (place.address && place.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag =
      selectedTag === '전체' || place.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const getTagCount = (tag: string): number => {
    if (tag === '전체') return places.length;
    return places.filter((place) => place.tags.includes(tag)).length;
  };

  return (
    <div className="flex flex-col h-full bg-white text-zinc-800 w-full font-sans">
      {/* ===============================================================
          리스트 자체는 화면 왼쪽 0px에서 시작!
          헤더 타이틀 라인만 플로팅 로고 버튼(top-5 left-5)과의 간섭을 방지하고자 pl-15 적용
          =============================================================== */}
      <div className="pt-5 px-5 pb-4 flex flex-col gap-4 bg-white border-b border-zinc-100">
        
        {/* 타이틀 행 (로고 버튼 우측으로 밀어주기 위해 pl-15 적용) */}
        <div className="flex items-center justify-between pl-15">
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              노지차박맵
            </h1>
            <span className="text-xs text-zinc-400 font-medium">
              차박하기 좋은 곳 모아봤어요
            </span>
          </div>
          <button
            onClick={onOpenReportForm}
            className="text-[11px] bg-[#00c756]/10 hover:bg-[#00c756]/20 text-[#00c756] font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 border border-[#00c756]/20"
          >
            제보
          </button>
        </div>

        {/* 검색창 (화면 왼쪽 끝까지 시원하게 100% 뻗어 나감) */}
        <div className="relative">
          <input
            type="text"
            placeholder="지역, 차박지 이름 검색"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-[#f4ece1] border-none focus:ring-2 focus:ring-[#00c756]/30 outline-none rounded-2xl py-3.5 pl-11 pr-4 text-xs text-zinc-700 placeholder-zinc-450 transition-all font-semibold"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3"
            stroke="currentColor"
            className="absolute left-4 top-4.5 w-4 h-4 text-zinc-400 pointer-events-none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        {/* 태그 필터 (가로 스크롤 영역 전체 활용) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
          {AVAILABLE_TAGS.map((tag) => {
            const isSelected = selectedTag === tag;
            const count = getTagCount(tag);

            return (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className={`text-xs font-bold px-3.5 py-2.5 rounded-full transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#00c756] text-white'
                    : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <span>{tag}</span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                    isSelected ? 'bg-white text-[#00c756]' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 차박지 리스트 (여백 없이 화면 좌측 끝에서 온전히 렌더링) */}
      <div className="flex-1 overflow-y-auto bg-white flex flex-col scrollbar-thin">
        {filteredPlaces.length > 0 ? (
          filteredPlaces.map((place) => {
            const isSelected = selectedPlace?.id === place.id;

            return (
              <div
                key={place.id}
                onClick={() => onSelectPlace(place)}
                className={`px-6 py-5 cursor-pointer transition-all border-b border-zinc-100/60 flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-[#fdf6ec]'
                    : 'bg-[#fdf7f0] hover:bg-[#fdf6ec]/60'
                }`}
              >
                <h3 className="font-extrabold text-zinc-950 text-base leading-tight">
                  {place.name}
                </h3>
                <div className="text-xs text-zinc-400 font-semibold leading-relaxed flex items-center flex-wrap gap-1">
                  <span>{place.subtext}</span>
                  <span className="text-[#ff5e2c] font-black ml-1">{place.distance}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-zinc-300 gap-2">
            <p className="text-xs font-bold">검색 결과가 존재하지 않습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
