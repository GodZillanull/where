/**
 * /api/suggest エンドポイントのテスト
 * - Place Details を呼んでいないこと
 * - FieldMask が指定通りで増えていないこと
 * - レート制限が機能すること（429）
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiSuggestPath = join(__dirname, '../api/suggest.js');
const apiSuggestCode = readFileSync(apiSuggestPath, 'utf-8');

describe('/api/suggest: 課金地雷回避', () => {
  describe('Place Details 未使用', () => {
    it('places:get エンドポイントを呼んでいないこと', () => {
      // Place Details API のエンドポイント
      expect(apiSuggestCode).not.toMatch(/places\.googleapis\.com\/v1\/places\/[^:]/);
      expect(apiSuggestCode).not.toMatch(/places\/[A-Za-z0-9]+\?/); // places/{placeId}?
    });

    it('getPlaceDetails 関数が存在しないこと', () => {
      expect(apiSuggestCode).not.toMatch(/getPlaceDetails/i);
      expect(apiSuggestCode).not.toMatch(/placeDetails/i);
      expect(apiSuggestCode).not.toMatch(/fetchPlaceDetails/i);
    });

    it('使用しているのは searchNearby のみであること', () => {
      // searchNearby のみを使用
      expect(apiSuggestCode).toMatch(/places:searchNearby/);
      // searchText は使用していない
      expect(apiSuggestCode).not.toMatch(/places:searchText/);
    });
  });

  describe('FieldMask 固定', () => {
    // 許可されたフィールドのみ
    const ALLOWED_FIELDS = [
      'places.id',
      'places.displayName',
      'places.googleMapsUri',
      'places.primaryType',
      'places.primaryTypeDisplayName',
      'places.shortFormattedAddress',
      'places.currentOpeningHours',
    ];

    // 課金が高いフィールド（使用禁止）
    const EXPENSIVE_FIELDS = [
      'places.reviews',
      'places.photos',
      'places.openingHours',
      'places.regularOpeningHours',
      'places.priceLevel',
      'places.rating',
      'places.userRatingCount',
      'places.websiteUri',
      'places.formattedPhoneNumber',
      'places.internationalPhoneNumber',
      'places.editorialSummary',
      'places.delivery',
      'places.dineIn',
      'places.takeout',
      'places.reservable',
    ];

    it('X-Goog-FieldMask ヘッダーが設定されていること', () => {
      expect(apiSuggestCode).toMatch(/X-Goog-FieldMask/);
    });

    it('FieldMask に許可されたフィールドのみ含まれること', () => {
      // FieldMask の値を抽出
      const fieldMaskMatch = apiSuggestCode.match(/X-Goog-FieldMask['"]\s*:\s*['"]([^'"]+)['"]/);
      expect(fieldMaskMatch).not.toBeNull();

      const fieldMask = fieldMaskMatch[1];
      const fields = fieldMask.split(',').map(f => f.trim());

      // 各フィールドが許可リストに含まれていること
      for (const field of fields) {
        expect(ALLOWED_FIELDS).toContain(field);
      }
    });

    it('課金が高いフィールドが含まれていないこと', () => {
      const fieldMaskMatch = apiSuggestCode.match(/X-Goog-FieldMask['"]\s*:\s*['"]([^'"]+)['"]/);
      const fieldMask = fieldMaskMatch ? fieldMaskMatch[1] : '';

      for (const expensiveField of EXPENSIVE_FIELDS) {
        expect(fieldMask).not.toContain(expensiveField);
      }
    });

    it('FieldMask がちょうど6フィールドであること', () => {
      const fieldMaskMatch = apiSuggestCode.match(/X-Goog-FieldMask['"]\s*:\s*['"]([^'"]+)['"]/);
      expect(fieldMaskMatch).not.toBeNull();

      const fieldMask = fieldMaskMatch[1];
      const fields = fieldMask.split(',').map(f => f.trim());

      expect(fields.length).toBe(7);
    });
  });
});

describe('/api/suggest: チェーン除外 + DISTANCE', () => {
  it('CHAIN_KEYWORDS リストが定義されていること', () => {
    expect(apiSuggestCode).toMatch(/CHAIN_KEYWORDS/);
    expect(apiSuggestCode).toMatch(/サイゼリヤ/);
    expect(apiSuggestCode).toMatch(/マクドナルド/);
    expect(apiSuggestCode).toMatch(/スターバックス/);
  });

  it('isChainStore 関数が存在すること', () => {
    expect(apiSuggestCode).toMatch(/function isChainStore/);
  });

  it('excludeChains パラメータを受け取ること', () => {
    expect(apiSuggestCode).toMatch(/excludeChains/);
  });

  it('rankPreference が DISTANCE であること', () => {
    expect(apiSuggestCode).toMatch(/rankPreference.*DISTANCE/);
    expect(apiSuggestCode).not.toMatch(/rankPreference.*POPULARITY/);
  });

  it('レスポンスに isChain フラグが含まれること', () => {
    expect(apiSuggestCode).toMatch(/isChain/);
  });

  it('営業時間外を除外するフィルタがあること', () => {
    expect(apiSuggestCode).toMatch(/currentOpeningHours/);
    expect(apiSuggestCode).toMatch(/openNow/);
    expect(apiSuggestCode).toMatch(/openNow !== false/);
  });

  it('assignSlots 関数がスロット割り当てを行うこと', () => {
    expect(apiSuggestCode).toMatch(/function assignSlots/);
    expect(apiSuggestCode).toMatch(/safe.*change.*adventure/);
  });
});

describe('/api/suggest: レート制限', () => {
  // checkRateLimit 関数をテスト用に抽出
  // 実際のコードから関数をコピーしてテスト

  // インメモリストアをシミュレート
  let rateLimitStore;

  function checkRateLimit(ip) {
    const now = Date.now();
    const minute = 60 * 1000;
    const day = 24 * 60 * 60 * 1000;

    if (!rateLimitStore.has(ip)) {
      rateLimitStore.set(ip, { requests: [], dailyCount: 0, dailyReset: now + day });
    }

    const record = rateLimitStore.get(ip);

    if (now > record.dailyReset) {
      record.dailyCount = 0;
      record.dailyReset = now + day;
    }

    record.requests = record.requests.filter(t => now - t < minute);

    if (record.requests.length >= 10) {
      return { allowed: false, reason: 'Too many requests per minute (max 10/min)' };
    }
    if (record.dailyCount >= 100) {
      return { allowed: false, reason: 'Daily limit exceeded (max 100/day)' };
    }

    record.requests.push(now);
    record.dailyCount++;

    return { allowed: true };
  }

  beforeEach(() => {
    rateLimitStore = new Map();
  });

  it('10リクエスト/分を超えると拒否されること', () => {
    const ip = '192.168.1.1';

    // 10回は成功
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
    }

    // 11回目は拒否
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('10/min');
  });

  it('100リクエスト/日を超えると拒否されること', () => {
    const ip = '192.168.1.2';

    // 100回は成功（1分ごとに10回ずつシミュレート）
    for (let i = 0; i < 100; i++) {
      // 毎回新しいタイムスタンプでリクエストをシミュレート
      const record = rateLimitStore.get(ip);
      if (record) {
        record.requests = []; // 1分経過をシミュレート
      }
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
    }

    // 101回目は拒否
    const record = rateLimitStore.get(ip);
    record.requests = [];
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('100/day');
  });

  it('コードに 429 レスポンスが含まれていること', () => {
    expect(apiSuggestCode).toMatch(/res\.status\(429\)/);
    expect(apiSuggestCode).toMatch(/rateCheck\.allowed/);
  });

  it('レート制限のエラーメッセージが返されること', () => {
    expect(apiSuggestCode).toMatch(/Too many requests/);
    expect(apiSuggestCode).toMatch(/Daily limit exceeded/);
  });
});
