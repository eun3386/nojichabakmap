'use client';

import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { mockDb, supabase } from '../lib/supabase';
import { isMockMode } from '../lib/env';
import { logger } from '../lib/logger';
import PlaceList from '../components/Place/PlaceList';
import KakaoMap from '../components/Map/KakaoMap';
import PlaceCard from '../components/Place/PlaceCard';
import ReportForm from '../components/Report/ReportForm';

type ActiveMenu = 'home' | 'save' | 'my-location';
type PanelType = 'list' | 'detail' | 'report';

export default function Home(): React.JSX.Element {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('home');
  const [panelType, setPanelType] = useState<PanelType>('list');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const fetchPlaces = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        setPlaces(mockDb.getPlaces());
      } else if (supabase) {
        const { data, error } = await supabase
          .from('places')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPlaces(data || []);
      }
    } catch (err: unknown) {
      logger.error('Failed to fetch places:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleSelectPlace = (place: Place): void => {
    setSelectedPlace(place);
    setPanelType('detail');
  };

  const handleCloseDetail = (): void => {
    setSelectedPlace(null);
    setPanelType('list');
  };

  const handleReportSuccess = (): void => {
    setPanelType('list');
    fetchPlaces();
  };

  const handleMenuClick = (menu: ActiveMenu): void => {
    setActiveMenu(menu);
    if (menu === 'my-location') {
      alert('현재 위치 정보가 제공되었습니다! (GPS 시뮬레이터)');
    }
  };

  const handleToggleMenu = (): void => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-zinc-800 font-sans select-none relative">
      {/* ===============================================================
          1. 플로팅 토글 로고 & 버티컬 메뉴 (리스트 컴포넌트 위에 절대 배치 z-50)
          =============================================================== */}
      <div className="absolute top-5 left-5 z-50 flex flex-col items-center gap-3">
        {/* 토글 버튼 (텐트 로고) */}
        <button
          onClick={handleToggleMenu}
          className={`w-11 h-11 rounded-full bg-[#00c756] hover:bg-[#00b34d] flex items-center justify-center text-white shadow-lg shadow-[#00c756]/20 transition-all duration-300 cursor-pointer active:scale-95 ${
            isMenuOpen ? 'ring-4 ring-emerald-500/20 rotate-90' : ''
          }`}
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M11.47 3.82a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06l-.94-.94V19.25a.75.75 0 01-.75.75H6.58a.75.75 0 01-.75-.75V12.63l-.94.94a.75.75 0 11-1.06-1.06l8.69-8.69z" />
            </svg>
          )}
        </button>

        {/* 수직 하위 메뉴 단추 (로고 바로 아래로 안착) */}
        {isMenuOpen && (
          <div className="flex flex-col gap-3 bg-[#181818]/95 backdrop-blur-md p-3 rounded-[24px] shadow-2xl border border-[#2b2b2b]/55 transition-all duration-300">
            <button
              onClick={() => handleMenuClick('home')}
              className={`w-10 h-10 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all hover:bg-zinc-805 ${
                activeMenu === 'home' ? 'text-[#00c756] font-bold' : 'text-zinc-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.009a12.482 12.482 0 001.634-.897c1.611-.99 3.51-2.58 3.51-5.328a6.5 6.5 0 00-13 0c0 2.748 1.898 4.337 3.51 5.328a12.482 12.482 0 001.634.897l.018.01.006.002zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-[7px] font-bold tracking-tight">지도 홈</span>
            </button>

            <button
              onClick={() => handleMenuClick('save')}
              className={`w-10 h-10 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all hover:bg-zinc-805 ${
                activeMenu === 'save' ? 'text-[#00c756] font-bold' : 'text-zinc-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.6 3.102-1.196 4.622c-.21.81.67 1.45 1.366 1.012L10 15.547l4.181 2.508c.696.438 1.577-.202 1.366-1.012l-1.196-4.622 3.6-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
              </svg>
              <span className="text-[7px] font-bold tracking-tight">저장</span>
            </button>

            <button
              onClick={() => handleMenuClick('my-location')}
              className={`w-10 h-10 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all hover:bg-zinc-805 ${
                activeMenu === 'my-location' ? 'text-[#00c756] font-bold' : 'text-zinc-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
              </svg>
              <span className="text-[7px] font-bold tracking-tight">내 위치</span>
            </button>

            <span className="text-[7.5px] text-zinc-600 font-extrabold tracking-wide mt-1 text-center">v1.2</span>
          </div>
        )}
      </div>

      {/* ===============================================================
          2. 메인 콘텐츠 작업 영역 (리스트 패널이 화면 왼쪽 끝(0px)부터 가득 채움)
          =============================================================== */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden h-full">
        
        {/* [차박지 리스트 패널]
            - 패킹용 여백(pl-20)을 완벽히 소멸시켜 화면 맨 왼쪽 구석부터 온전히 가득 차게 배치! */}
        <div
          className={`w-full md:w-[400px] shrink-0 transition-all duration-300 border-b md:border-b-0 md:border-r border-zinc-150 ${
            panelType === 'list' ? 'h-[48vh] md:h-full block' : 'hidden md:block md:h-full'
          }`}
        >
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3">
              <div className="w-8 h-8 border-4 border-t-[#00c756] border-r-transparent border-zinc-100 rounded-full animate-spin" />
              <p className="text-xs font-semibold">정보를 로딩 중...</p>
            </div>
          ) : (
            <PlaceList
              places={places}
              selectedPlace={selectedPlace}
              onSelectPlace={handleSelectPlace}
              onOpenReportForm={() => setPanelType('report')}
            />
          )}
        </div>

        {/* [지도 패널] */}
        <div className="flex-1 w-full h-full relative">
          <KakaoMap
            places={places}
            selectedPlace={selectedPlace}
            onSelectPlace={handleSelectPlace}
          />
        </div>

        {/* [우측 상세 패널 / 제보 폼] */}
        {panelType === 'detail' && selectedPlace && (
          <div className="w-full md:w-[420px] shrink-0 h-full fixed inset-0 md:relative z-30 md:z-auto bg-slate-900 border-l border-zinc-200 transition-all duration-300">
            <PlaceCard place={selectedPlace} onClose={handleCloseDetail} />
          </div>
        )}

        {panelType === 'report' && (
          <div className="w-full md:w-[420px] shrink-0 h-full fixed inset-0 md:relative z-30 md:z-auto bg-slate-900 border-l border-zinc-200 transition-all duration-300">
            <ReportForm onSuccess={handleReportSuccess} onCancel={() => setPanelType('list')} />
          </div>
        )}
      </div>
    </div>
  );
}
