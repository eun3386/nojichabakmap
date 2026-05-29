import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

// Zod 스키마 검증 유틸리티 테스트
describe('Environment Variable Validation', () => {
  const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal('')),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal('')),
    NEXT_PUBLIC_KAKAO_MAP_API_KEY: z.string().optional().or(z.literal('')),
  });

  it('올바른 Supabase URL 형식이 전달되면 검증에 성공해야 한다.', () => {
    // Arrange (준비)
    const validData = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://xyzcompany.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'some-anon-key-123',
      NEXT_PUBLIC_KAKAO_MAP_API_KEY: 'kakao-key-456',
    };

    // Act (실행)
    const result = envSchema.safeParse(validData);

    // Assert (검증)
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_SUPABASE_URL).toBe('https://xyzcompany.supabase.co');
    }
  });

  it('잘못된 Supabase URL 형식이 전달되면 검증에 실패해야 한다.', () => {
    // Arrange (준비)
    const invalidData = {
      NEXT_PUBLIC_SUPABASE_URL: 'not-a-valid-url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'some-anon-key-123',
    };

    // Act (실행)
    const result = envSchema.safeParse(invalidData);

    // Assert (검증)
    expect(result.success).toBe(false);
  });

  it('Supabase URL 환경변수가 비어있어도 mock-fallback을 위해 검증 통과를 허용해야 한다.', () => {
    // Arrange (준비)
    const emptyData = {
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
    };

    // Act (실행)
    const result = envSchema.safeParse(emptyData);

    // Assert (검증)
    expect(result.success).toBe(true);
  });
});
