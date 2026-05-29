'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import { Place } from '../../types';

interface InteractiveMockMapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
}

export default function InteractiveMockMap({
  places,
  selectedPlace,
  onSelectPlace,
}: InteractiveMockMapProps): React.JSX.Element {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>): void => {
    // 핀이나 버튼 클릭 시 드래그 동작 방지
    if ((e.target as HTMLElement).closest('.map-pin') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>): void => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = (): void => {
    setIsDragging(false);
  };

  const handleZoomIn = (): void => {
    setZoom((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = (): void => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleReset = (): void => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // 위도, 경도 좌표를 가상 지도(800x600) 비율로 매핑
  // 대한민국 경위도 범위: lat(33~39), lng(124~130)
  const getCoordinates = (lat: number, lng: number): { x: number; y: number } => {
    const minLat = 35.5;
    const maxLat = 38.5;
    const minLng = 126.0;
    const maxLng = 129.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * 600 + 100;
    // 위도는 아래로 갈수록 y값이 증가하므로 역산
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 400 + 100;

    return { x, y };
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-slate-900 select-none cursor-grab active:cursor-grabbing rounded-2xl border border-slate-800"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 백그라운드 그리드 패턴 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

      {/* 지도 캔버스 영역 */}
      <div
        className="absolute inset-0 transition-transform duration-75 ease-out origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* 가상 지형 가이드라인 (SVG 대한민국 형상 모사) */}
        <svg className="absolute w-[800px] h-[600px] pointer-events-none opacity-20" viewBox="0 0 800 600">
          <path
            d="M 250 50 Q 380 30 450 80 T 550 150 T 600 250 T 620 400 T 550 520 T 400 550 T 280 480 T 230 350 T 180 200 Z"
            fill="#334155"
            stroke="#475569"
            strokeWidth="3"
          />
          {/* 주요 권역 레이블 */}
          <text x="320" y="140" fill="#94a3b8" className="text-sm font-semibold select-none">수도권</text>
          <text x="460" y="160" fill="#94a3b8" className="text-sm font-semibold select-none">강원도</text>
          <text x="360" y="320" fill="#94a3b8" className="text-sm font-semibold select-none">충청도</text>
        </svg>

        {/* 차박지 핀 */}
        {places.map((place) => {
          const { x, y } = getCoordinates(place.lat, place.lng);
          const isSelected = selectedPlace?.id === place.id;

          return (
            <div
              key={place.id}
              className="map-pin absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={() => onSelectPlace(place)}
            >
              <div className="relative group">
                {/* 핀 마커 링 효과 */}
                <div
                  className={`absolute -inset-3 rounded-full bg-emerald-500 opacity-20 scale-150 animate-ping ${
                    isSelected ? 'block' : 'hidden group-hover:block'
                  }`}
                />
                {/* 실제 핀 물방울 */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${
                    isSelected
                      ? 'bg-emerald-500 scale-110 border-2 border-white text-white'
                      : 'bg-slate-800 border-2 border-emerald-500 hover:scale-110 text-emerald-400'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {/* 장소 이름 태그 팝업 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-950 text-white text-xs font-semibold px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-90 border border-slate-800 pointer-events-none">
                  {place.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 개발 모드 가이드 */}
      <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 backdrop-blur-md px-3 py-2 rounded-xl text-xs text-slate-300">
        <span className="font-semibold text-emerald-400">💡 시뮬레이터 맵 모드</span>
        <div className="mt-1 opacity-70">드래그로 이동, 휠이나 우측 버튼으로 확대/축소 가능</div>
      </div>

      {/* 컨트롤 패널 */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-20">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-slate-950/80 border border-slate-800 backdrop-blur-md hover:bg-slate-800 text-white rounded-xl flex items-center justify-center text-xl font-bold transition-all shadow-lg active:scale-95"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-slate-950/80 border border-slate-800 backdrop-blur-md hover:bg-slate-800 text-white rounded-xl flex items-center justify-center text-xl font-bold transition-all shadow-lg active:scale-95"
        >
          -
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 bg-slate-950/80 border border-slate-800 backdrop-blur-md hover:bg-slate-800 text-white rounded-xl flex items-center justify-center text-xs font-semibold transition-all shadow-lg active:scale-95"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
