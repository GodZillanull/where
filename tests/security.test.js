/**
 * セキュリティテスト
 * - フロントエンドにAPIキーが露出していないことを確認
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

describe('セキュリティ: APIキー露出チェック', () => {
  it('.env に VITE_GOOGLE_MAPS_API_KEY が存在しないこと', () => {
    const envPath = join(rootDir, '.env');

    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf-8');
      // VITE_ プレフィックスの Google Maps API キーがあるとフロントに露出する
      expect(envContent).not.toMatch(/VITE_GOOGLE_MAPS_API_KEY/i);
      expect(envContent).not.toMatch(/VITE_GOOGLE_API_KEY/i);
      expect(envContent).not.toMatch(/VITE_PLACES_API_KEY/i);
    }
    // .envが無い場合もOK（Vercel環境変数のみで運用）
  });

  it('.env.example に VITE_GOOGLE_MAPS_API_KEY が存在しないこと', () => {
    const envExamplePath = join(rootDir, '.env.example');

    if (existsSync(envExamplePath)) {
      const envContent = readFileSync(envExamplePath, 'utf-8');
      expect(envContent).not.toMatch(/VITE_GOOGLE_MAPS_API_KEY/i);
      expect(envContent).not.toMatch(/VITE_GOOGLE_API_KEY/i);
      expect(envContent).not.toMatch(/VITE_PLACES_API_KEY/i);
    }
  });

  it('フロントエンドコード (placesApi.js) に API キーがハードコードされていないこと', () => {
    const placesApiPath = join(rootDir, 'src/services/placesApi.js');

    if (existsSync(placesApiPath)) {
      const content = readFileSync(placesApiPath, 'utf-8');
      // APIキーのパターン（AIzaSy...）がハードコードされていないこと
      expect(content).not.toMatch(/AIzaSy[a-zA-Z0-9_-]{30,}/);
      // import.meta.env.VITE_GOOGLE 経由でのアクセスがないこと
      expect(content).not.toMatch(/import\.meta\.env\.VITE_GOOGLE/i);
    }
  });

  it('PlacesSuggest.jsx に API キーがハードコードされていないこと', () => {
    const componentPath = join(rootDir, 'src/features/suggest/PlacesSuggest.jsx');

    if (existsSync(componentPath)) {
      const content = readFileSync(componentPath, 'utf-8');
      expect(content).not.toMatch(/AIzaSy[a-zA-Z0-9_-]{30,}/);
      expect(content).not.toMatch(/import\.meta\.env\.VITE_GOOGLE/i);
    }
  });
});
