/**
 * reasonGenerator.ts
 *
 * Google Places API データを元に「おすすめ理由」を自動生成する
 *
 * 設計原則:
 * - 根拠のない断定をしない（人気/空いてる/穴場/最短 等は禁止）
 * - 取得できるデータだけを根拠に文章を生成
 * - "今行ける"感を重視（徒歩分/営業中/閉店まで を優先）
 */

// ============================================================
// 1. 型定義
// ============================================================

export type PlaceInput = {
  placeId: string;
  name: string;
  types: string[];                 // Google Places types
  rating?: number;                 // 0-5
  userRatingsTotal?: number;
  priceLevel?: 0 | 1 | 2 | 3 | 4;
  openNow?: boolean;               // opening_hours.open_now
  openUntil?: string;              // "22:00"
  closeInMin?: number;             // アプリ側で計算
  photosCount?: number;
  editorialSummary?: string;
  reviewSnippets?: string[];       // 上位数件（任意）
  walkMin: number;                 // アプリ側計算（必須）
};

export type ContextInput = {
  nowIso: string;                  // "2026-02-06T18:20:00+09:00"
  stationName?: string;
};

export type RecommendationOutput = {
  placeId: string;
  name: string;
  primaryAngle: Angle;
  headline: string;                // 12〜28文字目安
  body: string;                    // 本文（2〜4行相当）
  evidence: string[];              // 根拠（表示文に対応）
  tags: string[];                  // ["徒歩4分","営業中","★4.3"] 等
};

// ============================================================
// 2. 角度（切り口）定義とスコアリング
// ============================================================

type Angle =
  | 'near'
  | 'open'
  | 'closingSoon'
  | 'trustedStrong'
  | 'trusted'
  | 'price'
  | 'vibe'
  | 'quiet'
  | 'category';

type AngleScore = {
  angle: Angle;
  score: number;
  evidence: string[];
};

function scoreAngles(place: PlaceInput, ctx: ContextInput): AngleScore[] {
  const scores: AngleScore[] = [];

  // near: 徒歩が近い（walkMin <= 6 で高スコア）
  if (place.walkMin <= 3) {
    scores.push({ angle: 'near', score: 100, evidence: [`徒歩${place.walkMin}分`] });
  } else if (place.walkMin <= 6) {
    scores.push({ angle: 'near', score: 80, evidence: [`徒歩${place.walkMin}分`] });
  } else if (place.walkMin <= 10) {
    scores.push({ angle: 'near', score: 50, evidence: [`徒歩${place.walkMin}分`] });
  }

  // open: 営業中
  if (place.openNow === true) {
    scores.push({ angle: 'open', score: 70, evidence: ['営業中'] });
  }

  // closingSoon: 閉店まで45分以内
  if (place.closeInMin !== undefined && place.closeInMin > 0 && place.closeInMin <= 45) {
    scores.push({
      angle: 'closingSoon',
      score: 90,
      evidence: [`あと${place.closeInMin}分で閉店`]
    });
  }

  // trustedStrong: rating >= 4.2 かつ user_ratings_total >= 200
  if (place.rating !== undefined && place.userRatingsTotal !== undefined) {
    if (place.rating >= 4.2 && place.userRatingsTotal >= 200) {
      scores.push({
        angle: 'trustedStrong',
        score: 85,
        evidence: [`★${place.rating}（${place.userRatingsTotal}件）`]
      });
    } else if (place.rating >= 4.0 && place.userRatingsTotal >= 80) {
      scores.push({
        angle: 'trusted',
        score: 65,
        evidence: [`★${place.rating}（${place.userRatingsTotal}件）`]
      });
    }
  }

  // price: 価格帯がある
  if (place.priceLevel !== undefined) {
    const priceLabel = ['¥', '¥', '¥¥', '¥¥¥', '¥¥¥¥'][place.priceLevel];
    scores.push({
      angle: 'price',
      score: 55,
      evidence: [`価格帯 ${priceLabel}`]
    });
  }

  // vibe: 写真が多い or editorial_summary がある
  if ((place.photosCount && place.photosCount >= 5) || place.editorialSummary) {
    const vibeEvidence: string[] = [];
    if (place.photosCount && place.photosCount >= 5) {
      vibeEvidence.push(`写真${place.photosCount}枚`);
    }
    if (place.editorialSummary) {
      vibeEvidence.push('編集者コメントあり');
    }
    scores.push({ angle: 'vibe', score: 40, evidence: vibeEvidence });
  }

  // quiet: レビューに「静か」「落ち着く」があれば（オプショナル）
  if (place.reviewSnippets && place.reviewSnippets.length > 0) {
    const quietKeywords = ['静か', '落ち着', 'ゆっくり', '居心地'];
    const hasQuiet = place.reviewSnippets.some(
      snippet => quietKeywords.some(kw => snippet.includes(kw))
    );
    if (hasQuiet) {
      scores.push({ angle: 'quiet', score: 45, evidence: ['口コミに「静か/落ち着く」あり'] });
    }
  }

  // category: 業種タグ（フォールバック用）
  if (place.types && place.types.length > 0) {
    scores.push({ angle: 'category', score: 20, evidence: [place.types[0]] });
  }

  // スコア降順でソート
  return scores.sort((a, b) => b.score - a.score);
}

// ============================================================
// 3. テンプレートバンク（各角度10個以上）
// ============================================================

type Template = {
  headline: string;
  body: string;
};

const TEMPLATE_BANK: Record<Angle, Template[]> = {
  near: [
    { headline: '徒歩{walkMin}分の距離', body: '歩いて{walkMin}分。「帰る前にちょっと」がいちばん楽。' },
    { headline: 'すぐそこ、{walkMin}分', body: '徒歩{walkMin}分。思い立ったら即行ける距離。' },
    { headline: '{walkMin}分で着く', body: '駅から{walkMin}分。寄り道のハードルが低い。' },
    { headline: '近い。{walkMin}分。', body: '徒歩{walkMin}分。「また今度」にならない距離。' },
    { headline: '歩いて{walkMin}分', body: '近いから寄れる。遠かったら寄らない。それだけ。' },
    { headline: '{walkMin}分の寄り道', body: '徒歩{walkMin}分。今日の帰り道に組み込める。' },
    { headline: 'ほぼ駅前', body: '徒歩{walkMin}分。改札出たらすぐ。' },
    { headline: '{walkMin}分圏内', body: '歩いて{walkMin}分。「ちょっとだけ」が叶う距離。' },
    { headline: '駅チカ{walkMin}分', body: '徒歩{walkMin}分。帰り道の延長線上。' },
    { headline: 'あと{walkMin}分歩くだけ', body: '徒歩{walkMin}分。今日の寄り道にちょうどいい。' },
    { headline: '歩ける距離', body: '徒歩{walkMin}分。わざわざ感ゼロで寄れる。' },
  ],

  open: [
    { headline: 'いま営業中', body: '営業中。思い立ったこの瞬間に寄れる。' },
    { headline: '今すぐ行ける', body: '営業中。「行こうかな」と思った時が行き時。' },
    { headline: '開いてる', body: '営業中。今日行かない理由がない。' },
    { headline: 'やってます', body: '営業中。迷ってるなら、開いてるうちに。' },
    { headline: '営業中です', body: '今開いてる。「明日にしよう」はもったいない。' },
    { headline: 'オープン中', body: '営業中。今なら確実に入れる。' },
    { headline: '今日も開店中', body: '営業中。帰り道に寄るならちょうどいい。' },
    { headline: 'ちゃんと開いてる', body: '営業中。せっかくだから寄っていく？' },
    { headline: '今やってる', body: '営業中。行こうと思えばすぐ行ける。' },
    { headline: '開店してます', body: '営業中。今日の選択肢に入れていい。' },
  ],

  closingSoon: [
    { headline: 'あと{closeInMin}分で閉店', body: '閉店まで{closeInMin}分。「また今度」を今日で終わらせる。' },
    { headline: '{closeInMin}分後に閉まる', body: 'あと{closeInMin}分。行くなら今しかない。' },
    { headline: '閉店{closeInMin}分前', body: '残り{closeInMin}分。今日逃すと次いつ行ける？' },
    { headline: 'ラスト{closeInMin}分', body: '閉店まで{closeInMin}分。ギリギリ間に合う。' },
    { headline: 'あと{closeInMin}分', body: '閉店{closeInMin}分前。迷ってる暇はない。' },
    { headline: '間もなく閉店', body: 'あと{closeInMin}分で閉まる。行くなら今日。' },
    { headline: '残り{closeInMin}分', body: '閉店まで{closeInMin}分。明日に延ばさない。' },
    { headline: 'もうすぐ閉店', body: 'あと{closeInMin}分。決断のタイムリミット。' },
    { headline: '閉店間近', body: '残り{closeInMin}分。今日中に行ける最後のチャンス。' },
    { headline: 'タイムリミット{closeInMin}分', body: '閉店まで{closeInMin}分。後悔しない選択を。' },
  ],

  trustedStrong: [
    { headline: '★{rating}の実績', body: '★{rating}（{reviewCount}件）。多くの人が評価してる事実。' },
    { headline: '評価{rating}、{reviewCount}件', body: '★{rating}で{reviewCount}件のレビュー。初見でも外しにくい。' },
    { headline: '★{rating}（{reviewCount}件）', body: '{reviewCount}件のレビューで★{rating}。数字が信頼の証。' },
    { headline: '高評価{rating}点', body: '★{rating}、{reviewCount}件の評価。試す価値はある。' },
    { headline: '{reviewCount}人が評価', body: '★{rating}（{reviewCount}件）。これだけの人が認めてる。' },
    { headline: '実績★{rating}', body: '{reviewCount}件で★{rating}。データが語る安心感。' },
    { headline: '評価◎', body: '★{rating}（{reviewCount}件）。初めてでも安心して入れる。' },
    { headline: '{reviewCount}件の声', body: '★{rating}の評価が{reviewCount}件。期待して良さそう。' },
    { headline: '★{rating}の安心', body: '{reviewCount}人が★{rating}と評価。失敗しにくい選択。' },
    { headline: '信頼の{rating}点', body: '★{rating}（{reviewCount}件）。数字で選ぶなら間違いない。' },
  ],

  trusted: [
    { headline: '★{rating}の評価', body: '★{rating}（{reviewCount}件）。それなりに評価されてる。' },
    { headline: '評価★{rating}', body: '{reviewCount}件で★{rating}。悪くない数字。' },
    { headline: '★{rating}、{reviewCount}件', body: '★{rating}の評価が{reviewCount}件。参考になる数字。' },
    { headline: '{reviewCount}件のレビュー', body: '★{rating}（{reviewCount}件）。一定の評価はある。' },
    { headline: '★{rating}点', body: '{reviewCount}件で★{rating}。試してみる価値あり。' },
    { headline: '評価あり★{rating}', body: '★{rating}（{reviewCount}件）。判断材料にはなる。' },
    { headline: '★{rating}をキープ', body: '{reviewCount}件のレビューで★{rating}。まずまずの評価。' },
    { headline: '{reviewCount}件で{rating}点', body: '★{rating}（{reviewCount}件）。行ってみないとわからないけど。' },
    { headline: '★{rating}という数字', body: '{reviewCount}件で★{rating}。悪い数字じゃない。' },
    { headline: '評価{rating}', body: '★{rating}（{reviewCount}件）。期待しすぎず、でも期待して。' },
  ],

  price: [
    { headline: '価格帯{priceLabel}', body: '{priceLabel}の価格帯。気軽に寄って、ちゃんと満足。' },
    { headline: '{priceLabel}で収まる', body: '価格帯{priceLabel}。財布と相談しやすい。' },
    { headline: '予算{priceLabel}', body: '価格帯{priceLabel}。寄り道にちょうどいい価格感。' },
    { headline: '{priceLabel}の店', body: '価格帯{priceLabel}。想定内で楽しめる。' },
    { headline: '価格{priceLabel}', body: '{priceLabel}クラス。身構えずに入れる。' },
    { headline: 'お会計{priceLabel}目安', body: '価格帯{priceLabel}。事前に予算感がわかる安心。' },
    { headline: '{priceLabel}ライン', body: '価格帯{priceLabel}。お財布に優しい選択肢。' },
    { headline: '予算感{priceLabel}', body: '{priceLabel}の価格帯。気軽に寄れる。' },
    { headline: '{priceLabel}価格帯', body: '価格帯{priceLabel}。無理なく楽しめる範囲。' },
    { headline: '価格帯は{priceLabel}', body: '{priceLabel}クラス。寄り道の予算内。' },
  ],

  vibe: [
    { headline: '雰囲気が伝わる', body: '写真が多めで、どんな店か想像しやすい。' },
    { headline: '写真で確認できる', body: '写真が複数あるので、入る前に雰囲気がわかる。' },
    { headline: '事前に見れる', body: '写真で店内の様子が確認できる。初見でも入りやすい。' },
    { headline: '様子がわかる', body: '写真があるので、イメージを持って行ける。' },
    { headline: '雰囲気◎', body: '写真から良さそうな雰囲気が伝わってくる。' },
    { headline: '店の様子', body: '写真で確認できる。入る前の不安が減る。' },
    { headline: '写真あり', body: '写真が複数あって、どんな場所か想像できる。' },
    { headline: '内装が見える', body: '写真で店内が確認できる。事前情報があると安心。' },
    { headline: '雰囲気確認可', body: '写真があるので、自分に合うか判断しやすい。' },
    { headline: 'イメージできる', body: '写真が揃ってて、入店前に雰囲気がわかる。' },
  ],

  quiet: [
    { headline: '落ち着ける', body: '口コミに「静か」「落ち着く」の声あり。ゆっくりしたい時に。' },
    { headline: '静かめの評判', body: 'レビューで「静か」との声。一人時間に向いてそう。' },
    { headline: '落ち着く場所', body: '口コミで「落ち着く」と評価されてる。疲れた日に良さそう。' },
    { headline: 'ゆっくりできそう', body: 'レビューに「ゆっくりできる」の声。自分のペースで過ごせそう。' },
    { headline: '静かとの声', body: '口コミで「静か」との評価。騒がしいのが苦手なら。' },
    { headline: '居心地◎の声', body: 'レビューに「居心地がいい」の声。長居できそう。' },
    { headline: '落ち着くらしい', body: '口コミで「落ち着く」との評判。試してみる価値あり。' },
    { headline: '静かめ評価', body: 'レビューで「静か」と言われてる。一人で行きやすそう。' },
    { headline: 'ゆっくり派向け', body: '口コミに「ゆっくりできる」あり。急かされない空間かも。' },
    { headline: '居心地よさそう', body: 'レビューで居心地の良さに言及あり。期待できる。' },
  ],

  category: [
    { headline: '{categoryLabel}', body: '帰り道にふらっと寄れる{categoryLabel}。' },
    { headline: '{categoryLabel}で一息', body: '{categoryLabel}。今日の気分転換に。' },
    { headline: '寄り道{categoryLabel}', body: '{categoryLabel}という選択肢。たまにはいいかも。' },
    { headline: '{categoryLabel}があった', body: '近くに{categoryLabel}。選択肢として覚えておく。' },
    { headline: 'ここに{categoryLabel}', body: '{categoryLabel}を発見。寄り道候補に追加。' },
    { headline: '{categoryLabel}発見', body: 'この辺に{categoryLabel}があるのは知らなかった。' },
    { headline: '{categoryLabel}という手', body: '今日は{categoryLabel}に寄る、という選択。' },
    { headline: '気分で{categoryLabel}', body: '{categoryLabel}、気が向いたら寄ってみる。' },
    { headline: '帰り道の{categoryLabel}', body: '{categoryLabel}。帰り道にちょうどいい。' },
    { headline: '{categoryLabel}もあり', body: '{categoryLabel}で小休止、という手もある。' },
  ],
};

// 業種ラベル変換
const CATEGORY_LABELS: Record<string, string> = {
  cafe: 'カフェ',
  coffee_shop: 'コーヒーショップ',
  bakery: 'ベーカリー',
  book_store: '本屋',
  restaurant: 'レストラン',
  ramen_restaurant: 'ラーメン屋',
  japanese_restaurant: '和食店',
  bar: 'バー',
  spa: '銭湯・スパ',
  park: '公園',
  museum: '美術館・博物館',
  art_gallery: 'ギャラリー',
  movie_theater: '映画館',
};

// ============================================================
// 4. 禁止語フィルタ
// ============================================================

const FORBIDDEN_WORDS = [
  '人気', '空いてる', '空いている', '穴場', '最短', '最速',
  '絶対', '必ず', '間違いなく', '確実に', '一番', 'No.1',
  '混んでない', '混雑しない', '待たない', '並ばない',
  '静か', // 根拠なしで使う場合のみ禁止（quietアングルでは根拠ありで使う）
];

function containsForbiddenWords(text: string, allowedExceptions: string[] = []): boolean {
  const filtered = FORBIDDEN_WORDS.filter(w => !allowedExceptions.includes(w));
  return filtered.some(word => text.includes(word));
}

function sanitizeOutput(text: string, allowedExceptions: string[] = []): string {
  let result = text;
  const filtered = FORBIDDEN_WORDS.filter(w => !allowedExceptions.includes(w));
  for (const word of filtered) {
    result = result.replace(new RegExp(word, 'g'), '');
  }
  return result.replace(/\s+/g, ' ').trim();
}

// ============================================================
// 5. テンプレート展開
// ============================================================

function fillTemplate(
  template: Template,
  place: PlaceInput,
  ctx: ContextInput
): { headline: string; body: string } {
  const priceLabel = place.priceLevel !== undefined
    ? ['¥', '¥', '¥¥', '¥¥¥', '¥¥¥¥'][place.priceLevel]
    : '';

  const categoryLabel = place.types?.[0]
    ? (CATEGORY_LABELS[place.types[0]] || place.types[0])
    : 'スポット';

  const replacements: Record<string, string> = {
    '{name}': place.name,
    '{walkMin}': String(place.walkMin),
    '{rating}': place.rating !== undefined ? String(place.rating) : '',
    '{reviewCount}': place.userRatingsTotal !== undefined ? String(place.userRatingsTotal) : '',
    '{priceLabel}': priceLabel,
    '{openUntil}': place.openUntil || '',
    '{closeInMin}': place.closeInMin !== undefined ? String(place.closeInMin) : '',
    '{categoryLabel}': categoryLabel,
    '{stationName}': ctx.stationName || '駅',
  };

  let headline = template.headline;
  let body = template.body;

  for (const [key, value] of Object.entries(replacements)) {
    headline = headline.replace(new RegExp(key, 'g'), value);
    body = body.replace(new RegExp(key, 'g'), value);
  }

  return { headline, body };
}

// ============================================================
// 6. 文字数調整
// ============================================================

function truncateToLength(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  // 句点で区切って収まるまで削る
  const sentences = text.split('。').filter(s => s.trim());
  let result = '';
  for (const sentence of sentences) {
    const candidate = result ? result + '。' + sentence : sentence;
    if (candidate.length + 1 <= maxLen) {
      result = candidate;
    } else {
      break;
    }
  }
  return result ? result + '。' : text.slice(0, maxLen - 1) + '…';
}

// ============================================================
// 7. 単一スポットの推薦文生成
// ============================================================

function generateSingleRecommendation(
  place: PlaceInput,
  ctx: ContextInput
): RecommendationOutput {
  const angleScores = scoreAngles(place, ctx);

  // 上位2〜3角度を採用
  const topAngles = angleScores.slice(0, 3);

  if (topAngles.length === 0) {
    // フォールバック: category
    topAngles.push({ angle: 'category', score: 10, evidence: [] });
  }

  const primaryAngle = topAngles[0].angle;
  const templates = TEMPLATE_BANK[primaryAngle];
  const template = templates[Math.floor(Math.random() * templates.length)];

  // quiet角度の場合は「静か」を許可
  const allowedExceptions = primaryAngle === 'quiet' ? ['静か'] : [];

  let { headline, body } = fillTemplate(template, place, ctx);

  // 禁止語チェック（ヒットしたら別テンプレで再試行、最大3回）
  let attempts = 0;
  while (containsForbiddenWords(headline + body, allowedExceptions) && attempts < 3) {
    const altTemplate = templates[(Math.floor(Math.random() * templates.length))];
    const filled = fillTemplate(altTemplate, place, ctx);
    headline = filled.headline;
    body = filled.body;
    attempts++;
  }

  // それでもダメなら強制サニタイズ
  headline = sanitizeOutput(headline, allowedExceptions);
  body = sanitizeOutput(body, allowedExceptions);

  // 文字数調整
  headline = truncateToLength(headline, 28);
  body = truncateToLength(body, 140);

  // 根拠とタグを収集
  const evidence: string[] = [];
  const tags: string[] = [];

  for (const as of topAngles) {
    evidence.push(...as.evidence);
  }

  // タグ生成（主要情報のみ）
  if (place.walkMin <= 10) {
    tags.push(`徒歩${place.walkMin}分`);
  }
  if (place.openNow === true) {
    tags.push('営業中');
  }
  if (place.rating !== undefined && place.userRatingsTotal !== undefined && place.userRatingsTotal >= 50) {
    tags.push(`★${place.rating}`);
  }
  if (place.priceLevel !== undefined) {
    tags.push(['¥', '¥', '¥¥', '¥¥¥', '¥¥¥¥'][place.priceLevel]);
  }

  return {
    placeId: place.placeId,
    name: place.name,
    primaryAngle,
    headline,
    body,
    evidence: [...new Set(evidence)], // 重複除去
    tags: tags.slice(0, 4), // 最大4つ
  };
}

// ============================================================
// 8. メイン生成関数
// ============================================================

export function generateRecommendations(
  places: PlaceInput[],
  ctx: ContextInput
): RecommendationOutput[] {
  return places.map(place => generateSingleRecommendation(place, ctx));
}

// ============================================================
// 9. 多様性を考慮した3択選出
// ============================================================

export function pickTop3Diverse(outputs: RecommendationOutput[]): RecommendationOutput[] {
  if (outputs.length <= 3) return outputs;

  const result: RecommendationOutput[] = [];
  const usedAngles = new Set<Angle>();

  // 1st: 最初の1つは無条件で採用
  result.push(outputs[0]);
  usedAngles.add(outputs[0].primaryAngle);

  // 2nd, 3rd: 角度が被らないように選ぶ
  for (const output of outputs.slice(1)) {
    if (result.length >= 3) break;

    if (!usedAngles.has(output.primaryAngle)) {
      result.push(output);
      usedAngles.add(output.primaryAngle);
    }
  }

  // 3つ揃わなければ、残りから順に追加
  for (const output of outputs.slice(1)) {
    if (result.length >= 3) break;
    if (!result.includes(output)) {
      result.push(output);
    }
  }

  return result;
}

// ============================================================
// 10. 簡易テスト
// ============================================================

export function runTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      passed++;
      results.push(`✓ ${message}`);
    } else {
      failed++;
      results.push(`✗ ${message}`);
    }
  }

  const ctx: ContextInput = { nowIso: '2026-02-06T19:00:00+09:00', stationName: '渋谷' };

  // Test 1: rating/reviewCount が無い場合、信頼系テンプレに入らない
  const placeNoRating: PlaceInput = {
    placeId: 'test1',
    name: 'テスト店A',
    types: ['cafe'],
    walkMin: 5,
    openNow: true,
  };
  const result1 = generateSingleRecommendation(placeNoRating, ctx);
  assert(
    !['trustedStrong', 'trusted'].includes(result1.primaryAngle),
    'rating/reviewCount無しで信頼系アングルにならない'
  );

  // Test 2: openNow が false なら「営業中」を書かない
  const placeClosed: PlaceInput = {
    placeId: 'test2',
    name: 'テスト店B',
    types: ['restaurant'],
    walkMin: 3,
    openNow: false,
  };
  const result2 = generateSingleRecommendation(placeClosed, ctx);
  assert(
    !result2.body.includes('営業中') && !result2.headline.includes('営業中'),
    'openNow=falseで「営業中」が出ない'
  );
  assert(
    !result2.tags.includes('営業中'),
    'openNow=falseでタグに「営業中」が出ない'
  );

  // Test 3: closeInMin が無いのに「あと◯分」を書かない
  const placeNoClose: PlaceInput = {
    placeId: 'test3',
    name: 'テスト店C',
    types: ['bar'],
    walkMin: 8,
    openNow: true,
  };
  const result3 = generateSingleRecommendation(placeNoClose, ctx);
  assert(
    !result3.body.includes('あと') || !result3.body.includes('分で閉'),
    'closeInMin無しで「あと◯分で閉店」が出ない'
  );

  // Test 4: 禁止語が出力に含まれない
  const placeNormal: PlaceInput = {
    placeId: 'test4',
    name: 'テスト店D',
    types: ['cafe'],
    walkMin: 4,
    openNow: true,
    rating: 4.3,
    userRatingsTotal: 250,
    priceLevel: 2,
  };
  const result4 = generateSingleRecommendation(placeNormal, ctx);
  const fullText4 = result4.headline + result4.body;
  const hasForbidden = FORBIDDEN_WORDS.some(w => fullText4.includes(w));
  assert(!hasForbidden, '禁止語（人気/空いてる/穴場等）が出力に含まれない');

  // Test 5: 多様性選出が機能する
  const outputs = [
    { ...result4, primaryAngle: 'near' as Angle },
    { ...result4, primaryAngle: 'near' as Angle, placeId: 'x1' },
    { ...result4, primaryAngle: 'trusted' as Angle, placeId: 'x2' },
    { ...result4, primaryAngle: 'open' as Angle, placeId: 'x3' },
    { ...result4, primaryAngle: 'near' as Angle, placeId: 'x4' },
  ];
  const diverse = pickTop3Diverse(outputs);
  const diverseAngles = Array.from(new Set(diverse.map(o => o.primaryAngle)));
  assert(
    diverseAngles.length >= 2,
    'pickTop3Diverseで角度が分散する'
  );

  // Test 6: evidenceが空でない
  assert(
    result4.evidence.length > 0,
    '根拠(evidence)が生成される'
  );

  // Test 7: tagsが適切
  assert(
    result4.tags.length > 0 && result4.tags.length <= 4,
    'タグが1〜4個生成される'
  );

  return { passed, failed, results };
}

// ============================================================
// 11. 使用例
// ============================================================

export function exampleUsage() {
  const places: PlaceInput[] = [
    {
      placeId: 'place_001',
      name: '珈琲館 渋谷店',
      types: ['cafe', 'coffee_shop'],
      rating: 4.3,
      userRatingsTotal: 280,
      priceLevel: 2,
      openNow: true,
      openUntil: '22:00',
      closeInMin: 35,
      photosCount: 12,
      walkMin: 3,
    },
    {
      placeId: 'place_002',
      name: '麺屋 一番',
      types: ['ramen_restaurant', 'restaurant'],
      rating: 4.1,
      userRatingsTotal: 150,
      priceLevel: 1,
      openNow: true,
      walkMin: 6,
    },
    {
      placeId: 'place_003',
      name: 'BAR MOON',
      types: ['bar'],
      rating: 4.5,
      userRatingsTotal: 420,
      priceLevel: 3,
      openNow: true,
      walkMin: 8,
      reviewSnippets: ['静かで落ち着く', '一人でも入りやすい'],
    },
    {
      placeId: 'place_004',
      name: '本屋 B&B',
      types: ['book_store'],
      openNow: true,
      walkMin: 5,
      photosCount: 8,
    },
  ];

  const ctx: ContextInput = {
    nowIso: '2026-02-06T19:25:00+09:00',
    stationName: '渋谷',
  };

  console.log('=== 推薦文生成例 ===\n');

  const recommendations = generateRecommendations(places, ctx);
  const top3 = pickTop3Diverse(recommendations);

  for (const rec of top3) {
    console.log(`【${rec.name}】`);
    console.log(`  角度: ${rec.primaryAngle}`);
    console.log(`  見出し: ${rec.headline}`);
    console.log(`  本文: ${rec.body}`);
    console.log(`  根拠: ${rec.evidence.join(' / ')}`);
    console.log(`  タグ: ${rec.tags.join(', ')}`);
    console.log('');
  }

  console.log('=== テスト実行 ===\n');
  const testResults = runTests();
  for (const r of testResults.results) {
    console.log(r);
  }
  console.log(`\n結果: ${testResults.passed} passed, ${testResults.failed} failed`);
}

// Node.js環境で直接実行された場合
// if (typeof require !== 'undefined' && require.main === module) {
//   exampleUsage();
// }
