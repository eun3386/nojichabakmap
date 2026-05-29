'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Place } from '../../types';
import InteractiveMockMap from './InteractiveMockMap';
import { env } from '../../lib/env';
import { logger } from '../../lib/logger';

interface KakaoMapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

export default function KakaoMap({
  places,
  selectedPlace,
  onSelectPlace,
}: KakaoMapProps): React.JSX.Element {
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [isScriptError, setIsScriptError] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kakaoMapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  const apiKey = env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setIsScriptError(true);
      return;
    }

    const scriptId = 'kakao-map-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if (window.kakao && window.kakao.maps) {
        setIsScriptLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setIsScriptLoaded(true));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      setIsScriptLoaded(true);
    };

    script.onerror = () => {
      logger.error('Failed to load Kakao Map script.');
      setIsScriptError(true);
    };

    document.head.appendChild(script);
  }, [apiKey]);

  // 카카오 맵 초기화 및 업데이트
  useEffect(() => {
    if (!isScriptLoaded || !window.kakao || !mapContainerRef.current) return;

    const kakao = window.kakao;

    kakao.maps.load(() => {
      // 맵이 아직 생성되지 않았다면 최초 생성
      if (!kakaoMapRef.current) {
        const centerCoords = new kakao.maps.LatLng(36.5, 127.8);
        const options = {
          center: centerCoords,
          level: 11,
        };
        const map = new kakao.maps.Map(mapContainerRef.current, options);
        kakaoMapRef.current = map;
      }

      const map = kakaoMapRef.current;

      // 기존 마커 제거
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // 새로운 마커 생성 및 등록
      places.forEach((place) => {
        const markerPosition = new kakao.maps.LatLng(place.lat, place.lng);
        const marker = new kakao.maps.Marker({
          position: markerPosition,
          title: place.name,
        });

        marker.setMap(map);

        kakao.maps.event.addListener(marker, 'click', () => {
          onSelectPlace(place);
        });

        markersRef.current.push(marker);
      });
    });
  }, [isScriptLoaded, places, onSelectPlace]);

  // 선택된 마커가 있을 경우 해당 마커 위치로 맵 중심 이동
  useEffect(() => {
    if (!kakaoMapRef.current || !selectedPlace || !window.kakao) return;
    const kakao = window.kakao;
    const moveLatLon = new kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng);
    kakaoMapRef.current.panTo(moveLatLon);
  }, [selectedPlace]);

  // 스크립트 에러나 API 키가 없는 경우 InteractiveMockMap으로 폴백
  if (isScriptError || !apiKey) {
    return (
      <InteractiveMockMap
        places={places}
        selectedPlace={selectedPlace}
        onSelectPlace={onSelectPlace}
      />
    );
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
      {!isScriptLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-10 h-10 border-4 border-t-emerald-500 border-r-transparent border-slate-800 rounded-full animate-spin" />
          <p className="text-sm">카카오 지도를 로드하는 중...</p>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
