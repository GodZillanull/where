# yorumichi - 週末おでかけ提案アプリ

## セットアップ

```bash
npm install
npm run dev
```

## 環境変数

### ローカル開発（Firebase）

`.env` ファイルを作成し、Firebase設定を追加:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Vercel環境変数（本番）

**重要**: Google Maps API キーはフロントエンドに露出しないよう、Vercel環境変数でのみ設定します。

#### 設定手順

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. プロジェクトを選択
3. **Settings** → **Environment Variables** に移動
4. 以下の環境変数を追加:

| Name | Value | Environment |
|------|-------|-------------|
| `GOOGLE_MAPS_API_KEY` | `AIzaSy...` (Google Cloud Console から取得) | Production, Preview, Development |

5. **Save** をクリック
6. 新しいデプロイを実行（環境変数の反映のため）

#### Google Maps API キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. **APIs & Services** → **Library** から **Places API (New)** を有効化
4. **APIs & Services** → **Credentials** で API キーを作成
5. 推奨: API キーに以下の制限を設定
   - **Application restrictions**: HTTP referrers (your Vercel domain)
   - **API restrictions**: Places API (New) のみ

## テスト

```bash
npm run test        # テスト実行
npm run test:watch  # ウォッチモード
```

### テスト内容

- **セキュリティテスト**: フロントエンドにAPIキーが露出していないことを確認
- **API課金テスト**:
  - Place Details を呼んでいないこと
  - FieldMask が最小限であること
  - レート制限（10 req/min, 100 req/day）が機能すること

## API エンドポイント

### POST /api/suggest

周辺スポットを提案します。

**リクエスト:**
```json
{
  "station": "yokohama",
  "radius": 800
}
```

**レスポンス:**
```json
{
  "items": [
    {
      "slot": "safe",
      "id": "...",
      "name": "スポット名",
      "typeLabel": "カフェ",
      "address": "住所",
      "mapsUrl": "https://maps.google.com/..."
    }
  ],
  "station": "横浜駅",
  "radius": 800,
  "totalFound": 20
}
```

**レート制限:**
- 10リクエスト/分
- 100リクエスト/日
- 超過時は `429 Too Many Requests` を返却

## 技術スタック

- React + Vite
- Tailwind CSS
- Firebase (Firestore)
- Vercel Serverless Functions
- Google Places API (New)
