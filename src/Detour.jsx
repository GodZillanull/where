import React, { useState, useEffect } from 'react';

// ===== 計測ログ基盤 =====
// MVP検証用：後でGA4等に差し替え可能
const logEvent = (eventName, params = {}) => {
  const event = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...params
  };

  // コンソールログ（開発用）
  console.log('[Analytics]', event);

  // LocalStorageに蓄積（MVP検証用）
  try {
    const logs = JSON.parse(localStorage.getItem('where_analytics') || '[]');
    logs.push(event);
    // 最新500件のみ保持
    if (logs.length > 500) logs.shift();
    localStorage.setItem('where_analytics', JSON.stringify(logs));
  } catch (e) {
    console.warn('Analytics storage failed:', e);
  }

  // TODO: GA4送信（本番用）
  // gtag('event', eventName, params);
};

// 計測イベント定義（memo.txt準拠）
const Analytics = {
  // プラン閲覧
  planView: (planId, planTitle) =>
    logEvent('plan_view', { plan_id: planId, plan_title: planTitle }),

  // プラン開始（このプランで行く）
  startPlan: (planId, planTitle) =>
    logEvent('start_plan', { plan_id: planId, plan_title: planTitle }),

  // 地図を開く
  openMaps: (planId, spotIndex, spotName) =>
    logEvent('open_maps', { plan_id: planId, spot_index: spotIndex, spot_name: spotName }),

  // 目的地見つからない（Gate 0の重要指標）
  cantFindDestination: (planId, spotIndex, spotName) =>
    logEvent('cant_find_destination', { plan_id: planId, spot_index: spotIndex, spot_name: spotName }),

  // PlanB使用
  planBUsed: (planId, spotIndex, reason) =>
    logEvent('planb_used', { plan_id: planId, spot_index: spotIndex, reason }),

  // スポット完了（行った/やった）
  done: (planId, spotIndex, spotName) =>
    logEvent('done', { plan_id: planId, spot_index: spotIndex, spot_name: spotName }),

  // プラン完了
  complete: (planId, planTitle) =>
    logEvent('complete', { plan_id: planId, plan_title: planTitle }),

  // 評価
  rating: (planId, rating, mehReason = null) =>
    logEvent('rating', { plan_id: planId, rating, meh_reason: mehReason }),
};

// ===== 寄り道データ =====
const yorimichi = {
  // 効能タイプ
  effects: {
    recovery: { name: "気分の再起動", emoji: "🔄", color: "#34C759" },
    expansion: { name: "自分の拡張", emoji: "✨", color: "#AF52DE" },
    connection: { name: "つながりの接続", emoji: "🔗", color: "#007AFF" }
  },

  // ズレレベル
  zure: {
    safe: { name: "いつもの近く", emoji: "📍", desc: "確実に良い、駅から近い", color: "#34C759" },
    change: { name: "少し足をのばす", emoji: "👟", desc: "行ったことない場所へ", color: "#FF9500" },
    adventure: { name: "知らない場所へ", emoji: "🚀", desc: "新しい発見があるかも", color: "#FF3B30" }
  },

  // スポットデータ（1人で入りやすい：カフェ/書店/銭湯/ギャラリー）
  spots: [
    // === カフェ ===
    {
      id: "c1",
      name: "FUGLEN TOKYO",
      type: "cafe",
      emoji: "☕",
      area: "代々木公園",
      station: "代々木公園駅",
      line: "千代田線",
      zure: "safe",
      effects: ["recovery"],
      stayTime: 45,
      walkFromStation: 5,
      budget: "800円",
      soloFriendly: 5,
      crowdLevel: 2,
      noiseLevel: 1,
      reservation: 0,
      cashOnly: false,
      reason: "北欧デザインの空間で、静かにコーヒーを楽しめる。1人客が多く居心地◎",
      backup: "混んでたら→Little Nap COFFEE STAND（徒歩3分）",
      highlight: "ノルウェー発祥の名店",
      hours: "8:00-22:00"
    },
    {
      id: "c2",
      name: "ABOUT LIFE COFFEE BREWERS",
      type: "cafe",
      emoji: "☕",
      area: "渋谷",
      station: "渋谷駅",
      line: "各線",
      zure: "safe",
      effects: ["recovery"],
      stayTime: 30,
      walkFromStation: 3,
      budget: "600円",
      soloFriendly: 5,
      crowdLevel: 3,
      noiseLevel: 2,
      reservation: 0,
      cashOnly: false,
      reason: "駅近スタンディング。サッと寄れてサッと出れる。回転早い",
      backup: "並んでたら→道玄坂のスタバ（徒歩2分）",
      highlight: "スタンディングで気軽",
      hours: "9:00-20:00"
    },
    {
      id: "c3",
      name: "Sarutahiko Coffee",
      type: "cafe",
      emoji: "☕",
      area: "恵比寿",
      station: "恵比寿駅",
      line: "山手線",
      zure: "safe",
      effects: ["recovery"],
      stayTime: 40,
      walkFromStation: 2,
      budget: "700円",
      soloFriendly: 5,
      crowdLevel: 3,
      noiseLevel: 2,
      reservation: 0,
      cashOnly: false,
      reason: "本店の落ち着いた雰囲気。電源あり、作業もOK",
      backup: "満席なら→猿田彦珈琲 アトレ店（駅直結）",
      highlight: "こだわりのスペシャルティコーヒー",
      hours: "8:00-22:30"
    },
    {
      id: "c4",
      name: "STREAMER COFFEE",
      type: "cafe",
      emoji: "☕",
      area: "渋谷",
      station: "渋谷駅",
      line: "各線",
      zure: "change",
      effects: ["expansion"],
      stayTime: 45,
      walkFromStation: 8,
      budget: "800円",
      soloFriendly: 4,
      crowdLevel: 2,
      noiseLevel: 2,
      reservation: 0,
      cashOnly: false,
      reason: "ラテアート世界チャンプの店。路地裏の隠れ家感",
      backup: "閉まってたら→近くのFuglen渋谷",
      highlight: "世界一のラテアート",
      hours: "10:00-18:00"
    },
    {
      id: "c5",
      name: "珈琲 蕃",
      type: "cafe",
      emoji: "☕",
      area: "四ツ谷",
      station: "四ツ谷駅",
      line: "丸ノ内線",
      zure: "change",
      effects: ["expansion", "recovery"],
      stayTime: 50,
      walkFromStation: 4,
      budget: "700円",
      soloFriendly: 5,
      crowdLevel: 1,
      noiseLevel: 1,
      reservation: 0,
      cashOnly: true,
      reason: "昭和レトロ純喫茶。時間が止まったような空間で、自分と向き合える",
      backup: "混雑時は時間をずらして再訪",
      highlight: "タイムスリップ純喫茶",
      hours: "11:00-21:00"
    },
    {
      id: "c6",
      name: "茶亭 羽當",
      type: "cafe",
      emoji: "🍵",
      area: "渋谷",
      station: "渋谷駅",
      line: "各線",
      zure: "adventure",
      effects: ["expansion"],
      stayTime: 60,
      walkFromStation: 7,
      budget: "1200円",
      soloFriendly: 5,
      crowdLevel: 1,
      noiseLevel: 1,
      reservation: 0,
      cashOnly: true,
      reason: "古民家の茶房。一見入りにくいが、1人客がむしろ多い。別世界",
      backup: "席なければ30分後に再訪",
      highlight: "渋谷の隠れ古民家",
      hours: "11:30-23:00"
    },

    // === 書店 ===
    {
      id: "b1",
      name: "代官山 蔦屋書店",
      type: "bookstore",
      emoji: "📚",
      area: "代官山",
      station: "代官山駅",
      line: "東急東横線",
      zure: "safe",
      effects: ["expansion", "recovery"],
      stayTime: 60,
      walkFromStation: 5,
      budget: "0円〜",
      soloFriendly: 5,
      crowdLevel: 2,
      noiseLevel: 1,
      reservation: 0,
      cashOnly: false,
      reason: "本の森を散策。買わなくても居られる。スタバ併設",
      backup: "混んでたら→併設Anjinでコーヒー",
      highlight: "大人のための本屋",
      hours: "7:00-26:00"
    },
    {
      id: "b2",
      name: "本屋B&B",
      type: "bookstore",
      emoji: "📚",
      area: "下北沢",
      station: "下北沢駅",
      line: "小田急線",
      zure: "change",
      effects: ["expansion", "connection"],
      stayTime: 50,
      walkFromStation: 3,
      budget: "500円〜",
      soloFriendly: 4,
      crowdLevel: 2,
      noiseLevel: 2,
      reservation: 0,
      cashOnly: false,
      reason: "ビール飲みながら本を選べる。イベントやってることも",
      backup: "閉店近かったら→VILLAGE VANGUARD",
      highlight: "ビールが飲める本屋",
      hours: "12:00-22:00"
    },
    {
      id: "b3",
      name: "SHIBUYA PUBLISHING BOOKSELLERS",
      type: "bookstore",
      emoji: "📚",
      area: "神山町",
      station: "渋谷駅",
      line: "各線",
      zure: "change",
      effects: ["expansion"],
      stayTime: 40,
      walkFromStation: 10,
      budget: "0円〜",
      soloFriendly: 5,
      crowdLevel: 1,
      noiseLevel: 1,
      reservation: 0,
      cashOnly: false,
      reason: "渋谷の喧騒から離れた路地裏。こだわりのセレクト",
      backup: "閉まってたら→Shibuya Cheese Stand（すぐ近く）",
      highlight: "路地裏のセレクト本屋",
      hours: "11:00-21:00"
    },
    {
      id: "b4",
      name: "森岡書店",
      type: "bookstore",
      emoji: "📚",
      area: "銀座",
      station: "銀座一丁目駅",
      line: "有楽町線",
      zure: "adventure",
      effects: ["expansion"],
      stayTime: 30,
      walkFromStation: 3,
      budget: "0円〜",
      soloFriendly: 5,
      crowdLevel: 1,
      noiseLevel: 1,
      reservation: 0,
      cashOnly: false,
      reason: "一冊の本だけを売る書店。究極のキュレーション体験",
      backup: "展示替え中なら→近くの教文館書店",
      highlight: "一冊だけの書店",
      hours: "13:00-20:00"
    },

    // === 銭湯・サウナ ===
    {
      id: "s1",
      name: "改良湯",
      type: "sento",
      emoji: "♨️",
      area: "渋谷",
      station: "渋谷駅",
      line: "各線",
      zure: "safe",
      effects: ["recovery"],
      stayTime: 60,
      walkFromStation: 8,
      budget: "970円",
      soloFriendly: 5,
      crowdLevel: 3,
      noiseLevel: 2,
      reservation: 0,
      cashOnly: false,
      reason: "デザイナーズ銭湯。渋谷で整える。タオル貸出あり",
      backup: "混雑時は21時以降がおすすめ",
      highlight: "渋谷のデザイナーズ銭湯",
      hours: "13:00-24:00"
    },
    {
      id: "s2",
      name: "小杉湯",
      type: "sento",
      emoji: "♨️",
      area: "高円寺",
      station: "高円寺駅",
      line: "中央線",
      zure: "change",
      effects: ["recovery", "connection"],
      stayTime: 70,
      walkFromStation: 5,
      budget: "520円",
      soloFriendly: 5,
      crowdLevel: 3,
      noiseLevel: 2,
      reservation: 0,
      cashOnly: true,
      reason: "昭和7年創業の老舗。ミルク風呂が名物。地元民と一緒に",
      backup: "混雑時は開店直後か22時以降",
      highlight: "昭和レトロ銭湯の代表格",
      hours: "15:00-25:30"
    },
    {
      id: "s3",
      name: "黄金湯",
      type: "sento",
      emoji: "♨️",
      area: "錦糸町",
      station: "錦糸町駅",
      line: "総武線",
      zure: "change",
      effects: ["recovery"],
      stayTime: 80,
      walkFromStation: 5,
      budget: "520円",
      soloFriendly: 5,
      crowdLevel: 2,
      noiseLevel: 2,
      reservation: 0,
      cashOnly: true,
      reason: "リニューアルした下町銭湯。サウナ良し、水風呂冷たい",
      backup: "サウナ混雑時は待つか銭湯のみ利用",
      highlight: "下町のリニューアル銭湯",
      hours: "6:00-9:30, 11:00-24:30"
    },
    {
      id: "s4",
      name: "かるまる池袋",
      type: "sento",
      emoji: "🧖",
      area: "池袋",
      station: "池袋駅",
      line: "各線",
      zure: "adventure",
      effects: ["recovery", "expansion"],
      stayTime: 120,
      walkFromStation: 3,
      budget: "1980円〜",
      soloFriendly: 5,
      crowdLevel: 3,
      noiseLevel: 2,
      reservation: 1,
      cashOnly: false,
      reason: "都内最強クラスのサウナ施設。4種のサウナ、水風呂も複数",
      backup: "満員なら予約して別日に",
      highlight: "サウナーの聖地",
      hours: "11:00-翌10:00"
    },

    // === ギャラリー・アート ===
    {
      id: "g1",
      name: "WHAT CAFE",
      type: "gallery",
      emoji: "🎨",
      area: "天王洲",
      station: "天王洲アイル駅",
      line: "りんかい線",
      zure: "change",
      effects: ["expansion"],
      stayTime: 50,
      walkFromStation: 5,
      budget: "500円〜",
      soloFriendly: 5,
      crowdLevel: 1,
      noiseLevel: 1,
      reservation: 0,
      cashOnly: false,
      reason: "アートを見ながらコーヒー。購入可能な展示。夜景も",
      backup: "閉まってたら→TERRADA ART COMPLEX周辺散策",
      highlight: "倉庫街のアートカフェ",
      hours: "11:00-18:00"
    },
    {
      id: "g2",
      name: "GINZA SIX 蔦屋書店",
      type: "gallery",
      emoji: "🖼️",
      area: "銀座",
      station: "銀座駅",
      line: "各線",
      zure: "safe",
      effects: ["expansion", "recovery"],
      stayTime: 45,
      walkFromStation: 3,
      budget: "0円〜",
      soloFriendly: 5,
      crowdLevel: 2,
      noiseLevel: 1,
      reservation: 0,
      cashOnly: false,
      reason: "アートギャラリー併設の書店。無料で作品鑑賞可",
      backup: "混んでたら→屋上庭園で休憩",
      highlight: "銀座でアート×本",
      hours: "10:30-20:30"
    },
    {
      id: "g3",
      name: "GYRE GALLERY",
      type: "gallery",
      emoji: "🎨",
      area: "表参道",
      station: "表参道駅",
      line: "銀座線",
      zure: "change",
      effects: ["expansion"],
      stayTime: 40,
      walkFromStation: 3,
      budget: "0円",
      soloFriendly: 5,
      crowdLevel: 1,
      noiseLevel: 1,
      reservation: 0,
      cashOnly: false,
      reason: "無料で現代アート。ショッピングのついでに立ち寄れる",
      backup: "展示替え中なら→GYREの他フロア巡り",
      highlight: "表参道の無料ギャラリー",
      hours: "11:00-20:00"
    },
    {
      id: "g4",
      name: "21_21 DESIGN SIGHT",
      type: "gallery",
      emoji: "🏛️",
      area: "六本木",
      station: "六本木駅",
      line: "日比谷線",
      zure: "adventure",
      effects: ["expansion"],
      stayTime: 90,
      walkFromStation: 5,
      budget: "1400円",
      soloFriendly: 5,
      crowdLevel: 2,
      noiseLevel: 1,
      reservation: 0,
      cashOnly: false,
      reason: "安藤忠雄建築でデザイン展。思考が刺激される",
      backup: "閉館近かったら→ミッドタウンの庭を散策",
      highlight: "デザインの最前線",
      hours: "10:00-19:00"
    },
    {
      id: "g5",
      name: "東京都写真美術館",
      type: "gallery",
      emoji: "📷",
      area: "恵比寿",
      station: "恵比寿駅",
      line: "山手線",
      zure: "change",
      effects: ["expansion", "recovery"],
      stayTime: 90,
      walkFromStation: 7,
      budget: "700円〜",
      soloFriendly: 5,
      crowdLevel: 1,
      noiseLevel: 1,
      reservation: 0,
      cashOnly: false,
      reason: "写真・映像専門。静かに鑑賞できる。カフェ併設",
      backup: "展示見終わったら→ガーデンプレイス散策",
      highlight: "写真好きの聖地",
      hours: "10:00-18:00"
    }
  ]
};

// ===== 週末DATA =====
const questions = [
  {
    id: 1,
    emoji: "🛋️",
    question: "最近の週末、正直どうだった？",
    options: [
      { text: "ずっと家にいた", types: ["healing", "chill"], emoji: "🏠" },
      { text: "買い物とか用事で終わった", types: ["active", "gourmet"], emoji: "🛒" },
      { text: "友達と遊んだ", types: ["adventure", "explorer"], emoji: "👯" },
      { text: "覚えてない…", types: ["culture", "creative"], emoji: "🤔" }
    ]
  },
  {
    id: 2,
    emoji: "✨",
    question: "理想の休日って？",
    options: [
      { text: "カフェでまったり", types: ["chill", "culture"], emoji: "☕" },
      { text: "美味しいもの食べ歩き", types: ["gourmet", "explorer"], emoji: "🍽️" },
      { text: "体動かしてスッキリ", types: ["active", "healing"], emoji: "🏃" },
      { text: "行ったことない場所へ", types: ["adventure", "creative"], emoji: "🗺️" }
    ]
  },
  {
    id: 3,
    emoji: "👥",
    question: "誰と過ごすことが多い？",
    options: [
      { text: "基本ソロ", types: ["chill", "culture"], emoji: "🙋" },
      { text: "2人で", types: ["gourmet", "healing"], emoji: "👫" },
      { text: "グループで", types: ["active", "adventure"], emoji: "👨‍👩‍👧‍👦" },
      { text: "その時の気分", types: ["explorer", "creative"], emoji: "🎲" }
    ]
  },
  {
    id: 4,
    emoji: "🎯",
    question: "「いい休日だった〜」ってなるのは？",
    options: [
      { text: "新しい場所を見つけた", types: ["explorer", "adventure"], emoji: "🔍" },
      { text: "美味しいもの食べた", types: ["gourmet", "chill"], emoji: "😋" },
      { text: "リフレッシュできた", types: ["healing", "active"], emoji: "🌿" },
      { text: "いい写真撮れた", types: ["creative", "culture"], emoji: "📸" }
    ]
  },
  {
    id: 5,
    emoji: "💭",
    question: "週末に一番大事なのは？",
    options: [
      { text: "とにかく休む！", types: ["healing", "chill"], emoji: "😴" },
      { text: "いつもと違う体験", types: ["adventure", "creative"], emoji: "🎢" },
      { text: "おいしいご飯", types: ["gourmet", "explorer"], emoji: "🍜" },
      { text: "アクティブに動く", types: ["active", "culture"], emoji: "⚡" }
    ]
  }
];

const typeInfo = {
  explorer: { name: "発見だいすきタイプ", emoji: "🧭", color: "#007AFF" },
  chill: { name: "まったりタイプ", emoji: "🛋️", color: "#34C759" },
  gourmet: { name: "食いしん坊タイプ", emoji: "🍽️", color: "#FF9500" },
  active: { name: "アクティブタイプ", emoji: "⚡", color: "#FF3B30" },
  creative: { name: "感性みがきタイプ", emoji: "🎨", color: "#AF52DE" },
  culture: { name: "知的好奇心タイプ", emoji: "📚", color: "#5856D6" },
  healing: { name: "いやされたいタイプ", emoji: "🌿", color: "#30D158" },
  adventure: { name: "冒険タイプ", emoji: "🎲", color: "#FF9F0A" }
};

const plans = [
  {
    id: 1,
    title: "清澄白河でアート散歩",
    types: ["explorer", "culture", "chill"],
    area: "清澄白河",
    region: "tokyo",
    budget: "2,500円",
    duration: "3〜4時間",
    vibe: "美術館 → おしゃれカフェ → のんびり",
    emoji: "🎨",
    color: "#007AFF",
    hashtag: "清澄白河カフェ",
    catchcopy: "現代アートとコーヒーの街を歩く",
    hours: "10:00-18:00（美術館）",
    closed: "月曜（美術館）",
    spots: [
      {
        label: "現代美術館でアート鑑賞",
        emoji: "🖼️",
        time: "90分",
        anchor: {
          name: "東京都現代美術館",
          address: "東京都江東区三好4-1-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E7%8F%BE%E4%BB%A3%E7%BE%8E%E8%A1%93%E9%A4%A8",
          reason: "国内最大級の現代美術館。企画展は毎回攻めてる。朝イチが空いてて狙い目。",
          instagramUrl: "https://www.instagram.com/explore/tags/東京都現代美術館/"
        },
        mission: "チケット購入→企画展を1周→気になった作品を1つ決める",
        todo: ["企画展を見る", "常設展も余裕あれば", "ミュージアムショップをチェック"],
        lostTip: "清澄白河駅B2出口から徒歩9分。木場公園を抜ける"
      },
      {
        label: "発祥の地でコーヒー",
        emoji: "☕",
        time: "45分",
        anchor: {
          name: "ブルーボトルコーヒー 清澄白河フラッグシップカフェ",
          address: "東京都江東区平野1-4-8",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%96%E3%83%AB%E3%83%BC%E3%83%9C%E3%83%88%E3%83%AB%E3%82%B3%E3%83%BC%E3%83%92%E3%83%BC+%E6%B8%85%E6%BE%84%E7%99%BD%E6%B2%B3",
          reason: "日本1号店。倉庫をリノベした空間。ここから始まった。",
          instagramUrl: "https://www.instagram.com/explore/tags/ブルーボトルコーヒー清澄白河/"
        },
        mission: "席を確保→ドリップコーヒーを注文→美術館の余韻に浸る",
        todo: ["ドリップコーヒーがおすすめ", "2階席は穴場"],
        lostTip: "美術館から徒歩10分。清澄通り沿い"
      },
      {
        label: "古アパートカフェで締め",
        emoji: "🏠",
        time: "45分",
        anchor: {
          name: "fukadaso cafe",
          address: "東京都江東区平野1-9-7",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=fukadaso+cafe+%E6%B8%85%E6%BE%84%E7%99%BD%E6%B2%B3",
          reason: "築50年のアパートをリノベ。レトロな空間でゆっくりできる。",
          instagramUrl: "https://www.instagram.com/explore/tags/fukadaso/"
        },
        mission: "空いてる席へ→ケーキセットを注文→今日の振り返り",
        todo: ["チーズケーキが人気", "1人でも入りやすい"],
        lostTip: "ブルーボトルから徒歩3分"
      }
    ],
    tip: "企画展は事前チェックしてね",
    planB: "美術館混んでたら常設展だけ→カフェへ / 雨でも全行程OK"
  },
  {
    id: 2,
    title: "谷根千で食べ歩き",
    types: ["gourmet", "explorer", "chill"],
    area: "谷中・根津・千駄木",
    region: "tokyo",
    budget: "2,000円",
    duration: "3〜4時間",
    vibe: "レトロ商店街 → メンチカツ → 夕やけ",
    emoji: "🍡",
    color: "#FF9500",
    hashtag: "谷根千",
    catchcopy: "昭和レトロな商店街で食べ歩き",
    hours: "10:00-18:00（店による）",
    closed: "店による",
    spots: [
      {
        label: "谷中銀座で食べ歩き",
        emoji: "🛒",
        time: "90分",
        anchor: {
          name: "谷中銀座商店街",
          address: "東京都台東区谷中3-13-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E8%B0%B7%E4%B8%AD%E9%8A%80%E5%BA%A7%E5%95%86%E5%BA%97%E8%A1%97",
          reason: "約70店舗が並ぶ昭和レトロな商店街。食べ歩きの聖地。",
          instagramUrl: "https://www.instagram.com/explore/tags/谷中銀座/"
        },
        mission: "商店街入口から歩く→気になる店で食べ歩き→3品は食べる",
        todo: ["コロッケ、メンチカツは必食", "猫の街なので猫グッズも", "お惣菜屋も覗く"],
        lostTip: "日暮里駅西口から徒歩5分。夕やけだんだん方向へ"
      },
      {
        label: "名物メンチカツ",
        emoji: "🥩",
        time: "15分",
        anchor: {
          name: "肉のすずき",
          address: "東京都荒川区西日暮里3-15-5",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E8%82%89%E3%81%AE%E3%81%99%E3%81%9A%E3%81%8D+%E8%B0%B7%E4%B8%AD",
          reason: "谷中銀座の名物。揚げたてメンチカツは行列必至。"
        },
        mission: "並んで買う→その場で食べる→熱いうちに",
        todo: ["メンチカツ1個200円", "揚げたてが最高", "行列15分くらい覚悟"],
        lostTip: "谷中銀座の中ほど。行列が目印"
      },
      {
        label: "夕やけだんだんで締め",
        emoji: "🌅",
        time: "30分",
        anchor: {
          name: "夕やけだんだん",
          address: "東京都荒川区西日暮里3-14",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%A4%95%E3%82%84%E3%81%91%E3%81%A0%E3%82%93%E3%81%A0%E3%82%93",
          reason: "谷中銀座の入口にある階段。夕日が綺麗に見えるスポット。",
          instagramUrl: "https://www.instagram.com/explore/tags/夕やけだんだん/"
        },
        mission: "階段に座る→商店街を見下ろす→夕日を待つ（16時以降推奨）",
        todo: ["夕方が最高", "階段に座ってぼーっとする", "猫もいるかも"],
        lostTip: "谷中銀座の日暮里側入口にある階段"
      }
    ],
    tip: "土日は早めの時間がいいよ",
    planB: "混んでたら根津神社へ / 雨でもアーケード部分は歩ける"
  },
  {
    id: 3,
    title: "高尾山でリフレッシュ",
    types: ["active", "healing", "adventure"],
    area: "高尾山",
    region: "tokyo",
    budget: "2,500円",
    duration: "5〜6時間",
    vibe: "プチ登山 → 絶景 → 温泉",
    emoji: "⛰️",
    color: "#34C759",
    hashtag: "高尾山",
    catchcopy: "都心から1時間で大自然。下山後は温泉",
    hours: "ケーブルカー 8:00-17:45",
    closed: "なし",
    spots: [
      {
        label: "高尾山口からスタート",
        emoji: "🚉",
        time: "15分",
        anchor: {
          name: "高尾山口駅",
          address: "東京都八王子市高尾町2241",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E9%AB%98%E5%B0%BE%E5%B1%B1%E5%8F%A3%E9%A7%85",
          reason: "京王線の終点。ここから登山開始。駅自体も木のデザインでおしゃれ。"
        },
        mission: "駅を出る→ケーブルカー乗り場へ→往復チケット購入",
        todo: ["ケーブルカー往復950円", "リフトもあり", "トイレは駅で済ませる"],
        lostTip: "改札出て正面がケーブルカー乗り場方向"
      },
      {
        label: "山頂で絶景",
        emoji: "🗻",
        time: "3時間",
        anchor: {
          name: "高尾山山頂",
          address: "東京都八王子市高尾町",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E9%AB%98%E5%B0%BE%E5%B1%B1+%E5%B1%B1%E9%A0%82",
          reason: "標高599m。晴れてたら富士山が見える。ケーブルカー+徒歩40分で到着。",
          instagramUrl: "https://www.instagram.com/explore/tags/高尾山/"
        },
        mission: "ケーブルカーで中腹→1号路で山頂→富士山を探す",
        todo: ["1号路が初心者向け", "山頂で休憩", "天狗焼きを食べる"],
        lostTip: "ケーブルカー降りて看板に従う。1号路は舗装されてる"
      },
      {
        label: "下山後の温泉",
        emoji: "♨️",
        time: "90分",
        anchor: {
          name: "京王高尾山温泉 極楽湯",
          address: "東京都八王子市高尾町2229-7",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E4%BA%AC%E7%8E%8B%E9%AB%98%E5%B0%BE%E5%B1%B1%E6%B8%A9%E6%B3%89+%E6%A5%B5%E6%A5%BD%E6%B9%AF",
          reason: "高尾山口駅直結の温泉。登山の疲れを癒す。露天風呂あり。",
          instagramUrl: "https://www.instagram.com/explore/tags/極楽湯高尾山/"
        },
        mission: "受付でタオル借りる→露天風呂でぼーっと→食事処で一杯",
        todo: ["入館料1000円", "タオルレンタルあり", "食事処もある"],
        lostTip: "高尾山口駅のすぐ隣。改札出て右"
      }
    ],
    tip: "スニーカーでOK！",
    planB: "疲れたらケーブルカーで往復 / 雨の日は滑るので注意"
  },
  {
    id: 4,
    title: "蔵前でものづくり体験",
    types: ["creative", "chill", "explorer"],
    area: "蔵前",
    region: "tokyo",
    budget: "3,500円",
    duration: "3〜4時間",
    vibe: "ノート作り → チョコ → カフェ",
    emoji: "✂️",
    color: "#AF52DE",
    hashtag: "蔵前カフェ",
    catchcopy: "東京のブルックリン。ものづくりの街を歩く",
    hours: "11:00-19:00（店による）",
    closed: "店による",
    spots: [
      {
        label: "自分だけのノートを作る",
        emoji: "📓",
        time: "60分",
        anchor: {
          name: "カキモリ",
          address: "東京都台東区蔵前4-20-12",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%82%AB%E3%82%AD%E3%83%A2%E3%83%AA+%E8%94%B5%E5%89%8D",
          reason: "表紙・中紙・リングを選んで自分だけのノートを作れる。蔵前を代表する店。",
          instagramUrl: "https://www.instagram.com/explore/tags/カキモリ/"
        },
        mission: "入店→表紙・中紙・リングを選ぶ→その場で製本してもらう",
        todo: ["オーダーノート2000円〜", "インクも選べる", "予約推奨"],
        lostTip: "蔵前駅A0出口から徒歩3分"
      },
      {
        label: "チョコレート工房",
        emoji: "🍫",
        time: "45分",
        anchor: {
          name: "ダンデライオン・チョコレート ファクトリー&カフェ蔵前",
          address: "東京都台東区蔵前4-14-6",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%80%E3%83%B3%E3%83%87%E3%83%A9%E3%82%A4%E3%82%AA%E3%83%B3%E3%83%81%E3%83%A7%E3%82%B3%E3%83%AC%E3%83%BC%E3%83%88+%E8%94%B5%E5%89%8D",
          reason: "サンフランシスコ発のBean to Bar。工房を見ながらホットチョコを飲める。",
          instagramUrl: "https://www.instagram.com/explore/tags/ダンデライオンチョコレート/"
        },
        mission: "2階カフェへ→ホットチョコを注文→工房を眺める",
        todo: ["ホットチョコが絶品", "クッキーもおすすめ", "お土産にチョコバー"],
        lostTip: "カキモリから徒歩5分"
      },
      {
        label: "倉庫リノベカフェで締め",
        emoji: "🏭",
        time: "60分",
        anchor: {
          name: "Nui. HOSTEL & BAR LOUNGE",
          address: "東京都台東区蔵前2-14-13",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=Nui+HOSTEL+%E8%94%B5%E5%89%8D",
          reason: "倉庫をリノベしたホステル併設カフェ。天井高くて開放的。",
          instagramUrl: "https://www.instagram.com/explore/tags/nuihostel/"
        },
        mission: "1階ラウンジへ→コーヒーを注文→今日の振り返り",
        todo: ["1人でも入りやすい", "夜はバーになる", "外国人旅行者も多い"],
        lostTip: "隅田川沿い。駒形橋近く"
      }
    ],
    tip: "カキモリは予約してね",
    planB: "カキモリ混んでたら見学だけ→カフェへ / 雨でも全行程OK"
  },
  {
    id: 5,
    title: "代官山で読書の午後",
    types: ["culture", "chill", "creative"],
    area: "代官山",
    region: "tokyo",
    budget: "2,500円",
    duration: "3〜4時間",
    vibe: "本屋 → コーヒー → 散歩",
    emoji: "📚",
    color: "#5856D6",
    hashtag: "代官山蔦屋書店",
    catchcopy: "本の森で過ごす、静かな午後",
    hours: "7:00-26:00",
    closed: "なし",
    spots: [
      {
        label: "本の森を散策",
        emoji: "📖",
        time: "90分",
        anchor: {
          name: "代官山 蔦屋書店",
          address: "東京都渋谷区猿楽町17-5",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E4%BB%A3%E5%AE%98%E5%B1%B1+%E8%94%A6%E5%B1%8B%E6%9B%B8%E5%BA%97",
          reason: "本・映画・音楽が融合した空間。大人のための本屋。",
          instagramUrl: "https://www.instagram.com/explore/tags/代官山蔦屋書店/"
        },
        mission: "入店→気になるジャンルの棚へ→3冊手に取って1冊決める",
        todo: ["雑誌コーナーも充実", "アート・デザイン系が強い", "2階はラウンジ"],
        lostTip: "代官山駅正面口から徒歩5分"
      },
      {
        label: "本を読みながらコーヒー",
        emoji: "☕",
        time: "45分",
        anchor: {
          name: "スターバックス 代官山 蔦屋書店",
          address: "東京都渋谷区猿楽町17-5",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%90%E3%83%83%E3%82%AF%E3%82%B9+%E4%BB%A3%E5%AE%98%E5%B1%B1%E8%94%A6%E5%B1%8B%E6%9B%B8%E5%BA%97",
          reason: "購入前の本を持ち込めるスタバ。読書のための空間。"
        },
        mission: "席を確保→コーヒー注文→本を読む",
        todo: ["購入前の本も持ち込みOK", "電源席あり", "朝イチが空いてる"],
        lostTip: "蔦屋書店の中央棟1階"
      },
      {
        label: "線路跡を散歩",
        emoji: "🚶",
        time: "30分",
        anchor: {
          name: "LOG ROAD DAIKANYAMA",
          address: "東京都渋谷区代官山町13-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=LOG+ROAD+DAIKANYAMA",
          reason: "東横線の線路跡をリノベした遊歩道。おしゃれな店が並ぶ。",
          instagramUrl: "https://www.instagram.com/explore/tags/logroaddaikanyama/"
        },
        mission: "蔦屋書店から歩く→気になる店を覗く→ベンチで休憩",
        todo: ["スプリングバレーブルワリーでビールも", "ベンチでぼーっとする"],
        lostTip: "蔦屋書店から渋谷方面へ徒歩3分"
      }
    ],
    tip: "土日午後は混むよ",
    planB: "混んでたらLOG ROADのカフェへ / 雨でも全行程OK"
  },
  {
    id: 6,
    title: "下北沢でカレー&古着",
    types: ["gourmet", "adventure", "explorer"],
    area: "下北沢",
    region: "tokyo",
    budget: "3,500円",
    duration: "4時間",
    vibe: "スパイスカレー → 古着屋巡り",
    emoji: "🍛",
    color: "#FF9500",
    hashtag: "下北沢カレー",
    catchcopy: "カレーの聖地と古着の迷宮",
    hours: "11:00-21:00（店による）",
    closed: "店による",
    spots: [
      {
        label: "カレーの名店で腹ごしらえ",
        emoji: "🍛",
        time: "60分",
        anchor: {
          name: "旧ヤム邸 シモキタ荘",
          address: "東京都世田谷区北沢2-12-2",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%97%A7%E3%83%A4%E3%83%A0%E9%82%B8+%E4%B8%8B%E5%8C%97%E6%B2%A2",
          reason: "大阪発の人気店。スパイスカレーの聖地。あいがけが最高。",
          instagramUrl: "https://www.instagram.com/explore/tags/旧ヤム邸/"
        },
        mission: "開店前に並ぶ→あいがけカレーを注文→完食",
        todo: ["あいがけ（2種盛り）がおすすめ", "開店11:30前に並ぶと確実", "売り切れ注意"],
        lostTip: "下北沢駅南西口から徒歩3分"
      },
      {
        label: "古着屋巡り",
        emoji: "👕",
        time: "120分",
        anchor: {
          name: "下北沢古着屋街（一番街周辺）",
          address: "東京都世田谷区北沢2丁目",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E4%B8%8B%E5%8C%97%E6%B2%A2+%E4%B8%80%E7%95%AA%E8%A1%97",
          reason: "100軒以上の古着屋が密集。掘り出し物を探す楽しさ。",
          instagramUrl: "https://www.instagram.com/explore/tags/下北沢古着/"
        },
        mission: "一番街から歩く→気になる店に入る→1着見つける",
        todo: ["一番街・南口周辺に多い", "NEW YORKERは定番", "値段交渉できる店も"],
        lostTip: "駅周辺を歩けばいくらでも見つかる",
        skippable: true
      },
      {
        label: "レコードカフェで締め",
        emoji: "🎵",
        time: "45分",
        anchor: {
          name: "CITY COUNTRY CITY",
          address: "東京都世田谷区北沢2-12-13",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=CITY+COUNTRY+CITY+%E4%B8%8B%E5%8C%97%E6%B2%A2",
          reason: "下北沢の老舗カフェ。レコードと本に囲まれた空間。",
          instagramUrl: "https://www.instagram.com/explore/tags/citycountrycity/"
        },
        mission: "席を確保→コーヒーを注文→今日の戦利品を眺める",
        todo: ["2階席がおすすめ", "レコードが流れてる", "ケーキも美味しい"],
        lostTip: "旧ヤム邸の近く"
      }
    ],
    tip: "古着は土曜午前がベスト",
    planB: "カレー屋並んでたら別の店へ / 雨でも古着屋巡りOK"
  },
  {
    id: 7,
    title: "チームラボで異世界体験",
    types: ["creative", "adventure", "culture"],
    area: "豊洲",
    region: "tokyo",
    budget: "4,500円",
    duration: "3〜4時間",
    vibe: "光のアート → 寿司",
    emoji: "🌌",
    color: "#AF52DE",
    hashtag: "チームラボプラネッツ",
    catchcopy: "水に浸かる没入型アート体験",
    hours: "9:00-22:00",
    closed: "なし",
    spots: [
      {
        label: "光のアートに没入",
        emoji: "✨",
        time: "2時間",
        anchor: {
          name: "チームラボプラネッツ TOKYO DMM",
          address: "東京都江東区豊洲6-1-16",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%81%E3%83%BC%E3%83%A0%E3%83%A9%E3%83%9C%E3%83%97%E3%83%A9%E3%83%8D%E3%83%83%E3%83%84",
          reason: "水の中を歩くアート体験。膝まで水に浸かる。写真映え最強。",
          instagramUrl: "https://www.instagram.com/explore/tags/チームラボプラネッツ/"
        },
        mission: "入口で裸足になる→順路に沿って進む→好きな作品で写真を撮る",
        todo: ["事前予約必須", "膝下まで水に入る", "ロングスカート・白い服は注意", "タオル貸してくれる"],
        lostTip: "新豊洲駅から徒歩1分"
      },
      {
        label: "豊洲で寿司",
        emoji: "🍣",
        time: "60分",
        anchor: {
          name: "豊洲市場",
          address: "東京都江東区豊洲6-6-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E8%B1%8A%E6%B4%B2%E5%B8%82%E5%A0%B4",
          reason: "築地から移転した日本最大の市場。寿司・海鮮で締める。",
          instagramUrl: "https://www.instagram.com/explore/tags/豊洲市場/"
        },
        mission: "飲食棟へ→寿司屋に入る→お好みで握ってもらう",
        todo: ["寿司大・大和寿司が有名", "飲食棟は一般も入れる", "現金あると安心"],
        lostTip: "チームラボから徒歩10分 or ゆりかもめ1駅"
      }
    ],
    tip: "膝まで水入る。服装注意",
    planB: "予約取れなかったら豊洲市場だけでも / 雨でも全行程OK"
  },
  {
    id: 8,
    title: "神楽坂で夜さんぽ",
    types: ["gourmet", "culture", "adventure"],
    area: "神楽坂",
    region: "tokyo",
    budget: "5,000円",
    duration: "3〜4時間",
    vibe: "ガレット → 石畳の路地 → バー",
    emoji: "🏮",
    color: "#FF3B30",
    hashtag: "神楽坂",
    catchcopy: "フランスと江戸が混ざる大人の街",
    hours: "17:00-23:00（推奨）",
    closed: "店舗による",
    spots: [
      {
        label: "本格ガレットで腹ごしらえ",
        emoji: "🥞",
        time: "60分",
        anchor: {
          name: "ル・ブルターニュ 神楽坂店",
          address: "東京都新宿区神楽坂4-2",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%AB%E3%83%BB%E3%83%96%E3%83%AB%E3%82%BF%E3%83%BC%E3%83%8B%E3%83%A5+%E7%A5%9E%E6%A5%BD%E5%9D%82",
          reason: "フランス・ブルターニュ地方の本格ガレット。シードルと一緒に。予約推奨。",
          instagramUrl: "https://www.instagram.com/explore/tags/ルブルターニュ神楽坂/"
        },
        mission: "予約して入店→シードル＋ガレットを注文→デザートクレープも",
        todo: ["予約推奨（特に週末）", "シードルは甘口がおすすめ", "コンプレット（卵・ハム・チーズ）定番"],
        lostTip: "飯田橋駅B3出口から神楽坂を上がる。左手にある"
      },
      {
        label: "石畳の路地を探検",
        emoji: "🌙",
        time: "30分",
        anchor: {
          name: "兵庫横丁",
          address: "東京都新宿区神楽坂3-6付近",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%85%B5%E5%BA%AB%E6%A8%AA%E4%B8%81+%E7%A5%9E%E6%A5%BD%E5%9D%82",
          reason: "神楽坂一の風情ある路地。石畳と黒塀の料亭街。夜が雰囲気◎",
          instagramUrl: "https://www.instagram.com/explore/tags/兵庫横丁/"
        },
        mission: "路地に入る→突き当たりまで往復→写真を撮る",
        todo: ["静かに歩く（料亭街）", "狭いので譲り合い", "かくれんぼ横丁も近い"],
        lostTip: "神楽坂通りから「兵庫横丁」の看板を探す"
      },
      {
        label: "大人のバーで〆",
        emoji: "🍸",
        time: "60分",
        anchor: {
          name: "Bar K6",
          address: "東京都新宿区神楽坂6-8",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=Bar+K6+%E7%A5%9E%E6%A5%BD%E5%9D%82",
          reason: "神楽坂の老舗オーセンティックバー。1人でも入りやすい。静かに飲める。",
          instagramUrl: "https://www.instagram.com/explore/tags/神楽坂バー/"
        },
        mission: "席に着く→バーテンダーにおまかせ or 好みを伝える→2杯くらいで",
        todo: ["1人客歓迎の店", "予算は1杯1,500円〜", "ドレスコードなし"],
        lostTip: "神楽坂上交差点付近。地下にある"
      }
    ],
    tip: "ヒールはやめとこ（石畳）",
    planB: "ガレット混んでたら「カナルカフェ」/ バー入りにくかったら「神楽坂 茶寮」で甘味"
  },
  {
    id: 9,
    title: "横浜で海と中華街",
    types: ["explorer", "gourmet", "chill"],
    area: "横浜",
    region: "kanagawa",
    budget: "3,000円",
    duration: "4〜5時間",
    vibe: "赤レンガ → 海 → 中華",
    emoji: "🚢",
    color: "#007AFF",
    hashtag: "横浜赤レンガ",
    catchcopy: "港町の王道を歩く1日",
    hours: "11:00-21:00",
    closed: "なし",
    spots: [
      {
        label: "赤レンガで港を感じる",
        emoji: "🧱",
        time: "60分",
        anchor: {
          name: "横浜赤レンガ倉庫",
          address: "神奈川県横浜市中区新港1-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%A8%AA%E6%B5%9C%E8%B5%A4%E3%83%AC%E3%83%B3%E3%82%AC%E5%80%89%E5%BA%AB",
          reason: "明治の倉庫をリノベ。海を見ながら散歩。イベントもよくやってる。",
          instagramUrl: "https://www.instagram.com/explore/tags/横浜赤レンガ倉庫/"
        },
        mission: "1号館→2号館を回る→海沿いのデッキで写真",
        todo: ["1号館はイベントスペース", "2号館はショップ＆レストラン", "海側のベンチで休憩"],
        lostTip: "みなとみらい線「馬車道駅」or「日本大通り駅」から徒歩6分"
      },
      {
        label: "海を見ながらぼーっと",
        emoji: "🌳",
        time: "30分",
        anchor: {
          name: "山下公園",
          address: "神奈川県横浜市中区山下町279",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%B1%B1%E4%B8%8B%E5%85%AC%E5%9C%92+%E6%A8%AA%E6%B5%9C",
          reason: "横浜港を一望できる公園。氷川丸も見える。ベンチで海を眺める。",
          instagramUrl: "https://www.instagram.com/explore/tags/山下公園/"
        },
        mission: "ベンチに座る→海を見る→氷川丸の前で写真",
        todo: ["バラ園が有名（5月・10月）", "氷川丸は中も見学可", "夕方は夕日がきれい"],
        lostTip: "赤レンガから海沿いを歩いて15分"
      },
      {
        label: "中華街で食べ歩き",
        emoji: "🥟",
        time: "90分",
        anchor: {
          name: "横浜中華街 善隣門",
          address: "神奈川県横浜市中区山下町",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%A8%AA%E6%B5%9C%E4%B8%AD%E8%8F%AF%E8%A1%97+%E5%96%84%E9%9A%A3%E9%96%80",
          reason: "日本最大の中華街。食べ歩きの宝庫。小籠包、焼売、肉まん何でもあり。",
          instagramUrl: "https://www.instagram.com/explore/tags/横浜中華街/"
        },
        mission: "善隣門から入る→食べ歩き→お土産を買う",
        todo: ["鵬天閣の焼き小籠包が人気", "江戸清の肉まんも定番", "現金あると安心"],
        lostTip: "山下公園から徒歩5分。「善隣門」を目指す"
      }
    ],
    tip: "中華街は現金あると安心",
    planB: "雨なら赤レンガ→ワールドポーターズで映画 / 中華街混みすぎなら「萬珍樓」で座って食事"
  },
  {
    id: 10,
    title: "野毛で昼飲み",
    types: ["gourmet", "adventure", "chill"],
    area: "野毛",
    region: "kanagawa",
    budget: "3,500円",
    duration: "3〜4時間",
    vibe: "昼からビール → はしご酒",
    emoji: "🍺",
    color: "#FF9500",
    hashtag: "野毛飲み",
    catchcopy: "昼から飲める大人の遊び場",
    hours: "14:00-21:00（推奨）",
    closed: "店舗による（日曜休み多い）",
    spots: [
      {
        label: "野毛の路地で1軒目",
        emoji: "🏮",
        time: "90分",
        anchor: {
          name: "三陽",
          address: "神奈川県横浜市中区野毛町1-45",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E4%B8%89%E9%99%BD+%E9%87%8E%E6%AF%9B",
          reason: "野毛の超人気もつ焼き店。昼から行列。回転早いのですぐ入れる。",
          instagramUrl: "https://www.instagram.com/explore/tags/野毛三陽/"
        },
        mission: "並んで待つ→カウンターで注文→もつ焼きとホッピー",
        todo: ["シロ・レバー・ハツが人気", "ホッピーセット頼む", "2杯くらいでサッと出る"],
        lostTip: "桜木町駅南口から徒歩5分。野毛小路に入ってすぐ"
      },
      {
        label: "昭和レトロな地下街へ",
        emoji: "🍶",
        time: "60分",
        anchor: {
          name: "ぴおシティ 地下飲食街",
          address: "神奈川県横浜市中区桜木町1-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%81%B4%E3%81%8A%E3%82%B7%E3%83%86%E3%82%A3+%E6%A1%9C%E6%9C%A8%E7%94%BA",
          reason: "昭和の地下街がそのまま残る。激安居酒屋が並ぶ。タイムスリップ感。",
          instagramUrl: "https://www.instagram.com/explore/tags/ぴおシティ/"
        },
        mission: "地下に降りる→気になった店に入る→日本酒か焼酎",
        todo: ["「都橋」「関内」方面に歩く", "現金オンリーの店多い", "常連さんと話すのも楽しい"],
        lostTip: "桜木町駅直結。地下に降りる"
      },
      {
        label: "散歩でクールダウン",
        emoji: "🚶",
        time: "30分",
        anchor: {
          name: "伊勢佐木町商店街",
          address: "神奈川県横浜市中区伊勢佐木町",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E4%BC%8A%E5%8B%A2%E4%BD%90%E6%9C%A8%E7%94%BA%E5%95%86%E5%BA%97%E8%A1%97",
          reason: "レトロな商店街をぶらぶら。酔い覚ましにちょうどいい。",
          instagramUrl: "https://www.instagram.com/explore/tags/伊勢佐木町/"
        },
        mission: "商店街を歩く→気になる店を覗く→カフェで休憩",
        todo: ["ゆずスキーのオムライスも有名", "松坂屋跡地も見どころ", "夕方になると雰囲気変わる"],
        lostTip: "野毛から歩いて10分。「イセザキモール」の看板目指す"
      }
    ],
    tip: "現金5,000円あると安心（カード不可の店多い）",
    planB: "三陽混みすぎなら「武蔵屋」/ 飲み過ぎたら「横浜ブルース」でコーヒー"
  },
  {
    id: 11,
    title: "湘南で海を見る",
    types: ["healing", "chill", "creative"],
    area: "江ノ島・七里ヶ浜",
    region: "kanagawa",
    budget: "3,000円",
    duration: "4〜5時間",
    vibe: "海 → ぼーっとする → パンケーキ",
    emoji: "🌊",
    color: "#5AC8FA",
    hashtag: "七里ヶ浜カフェ",
    catchcopy: "海と空だけの贅沢な時間",
    hours: "9:00-17:00（日没まで）",
    closed: "なし（天気次第）",
    spots: [
      {
        label: "江ノ島を散策",
        emoji: "🏝️",
        time: "90分",
        anchor: {
          name: "江ノ島 弁財天仲見世通り",
          address: "神奈川県藤沢市江の島1丁目",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%B1%9F%E3%83%8E%E5%B3%B6+%E5%BC%81%E8%B2%A1%E5%A4%A9%E4%BB%B2%E8%A6%8B%E4%B8%96%E9%80%9A%E3%82%8A",
          reason: "島全体がパワースポット。登らず仲見世だけでもOK。しらす丼食べる。",
          instagramUrl: "https://www.instagram.com/explore/tags/江ノ島/"
        },
        mission: "橋を渡る→仲見世を歩く→しらす丼を食べる",
        todo: ["しらす問屋「とびっちょ」が有名", "たこせんべいも定番", "頂上まで行くなら+1時間"],
        lostTip: "小田急江ノ島線「片瀬江ノ島駅」から徒歩10分で島入口"
      },
      {
        label: "七里ヶ浜で海を見る",
        emoji: "🌅",
        time: "60分",
        anchor: {
          name: "七里ヶ浜海岸",
          address: "神奈川県鎌倉市七里ガ浜",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E4%B8%83%E9%87%8C%E3%83%B6%E6%B5%9C%E6%B5%B7%E5%B2%B8",
          reason: "江ノ電の車窓からも見える絶景ビーチ。波の音を聴きながらぼーっと。",
          instagramUrl: "https://www.instagram.com/explore/tags/七里ヶ浜/"
        },
        mission: "砂浜に降りる→波打ち際を歩く→座って海を見る",
        todo: ["江ノ電「七里ヶ浜駅」下車", "夕日が特にきれい", "サーファー多め"],
        lostTip: "江ノ島から江ノ電で3駅（約8分）"
      },
      {
        label: "世界一の朝食で締め",
        emoji: "🥞",
        time: "60分",
        anchor: {
          name: "bills 七里ヶ浜",
          address: "神奈川県鎌倉市七里ガ浜1-1-1 WEEKEND HOUSE ALLEY 2F",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=bills+%E4%B8%83%E9%87%8C%E3%83%B6%E6%B5%9C",
          reason: "「世界一の朝食」で有名。海を見ながらリコッタパンケーキ。",
          instagramUrl: "https://www.instagram.com/explore/tags/bills七里ヶ浜/"
        },
        mission: "テラス席をリクエスト→リコッタパンケーキ→コーヒー",
        todo: ["予約推奨（特に週末）", "リコッタパンケーキ with フレッシュバナナ", "テラス席は早い者勝ち"],
        lostTip: "七里ヶ浜駅から海側へ徒歩2分"
      }
    ],
    tip: "晴れの日限定プラン。曇りでも海は見える",
    planB: "bills混みすぎなら「Pacific DRIVE-IN」/ 雨なら江ノ島水族館（えのすい）"
  },
  {
    id: 12,
    title: "鎌倉でプチ旅行",
    types: ["healing", "explorer", "active"],
    area: "鎌倉",
    region: "kanagawa",
    budget: "3,000円",
    duration: "6〜7時間",
    vibe: "神社 → 食べ歩き → 海",
    emoji: "⛩️",
    color: "#34C759",
    hashtag: "鎌倉",
    catchcopy: "古都と海を1日で味わう王道プラン",
    hours: "9:00-18:00",
    closed: "なし",
    spots: [
      {
        label: "鶴岡八幡宮で参拝",
        emoji: "⛩️",
        time: "45分",
        anchor: {
          name: "鶴岡八幡宮",
          address: "神奈川県鎌倉市雪ノ下2-1-31",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E9%B6%B4%E5%B2%A1%E5%85%AB%E5%B9%A1%E5%AE%AE",
          reason: "鎌倉のシンボル。源頼朝が創建。階段を登って本殿へ。",
          instagramUrl: "https://www.instagram.com/explore/tags/鶴岡八幡宮/"
        },
        mission: "鳥居をくぐる→参道を歩く→本殿で参拝",
        todo: ["階段が急なので歩きやすい靴", "御朱印もらえる", "鳩サブレーは帰りに"],
        lostTip: "鎌倉駅東口から若宮大路をまっすぐ10分"
      },
      {
        label: "小町通りで食べ歩き",
        emoji: "🍡",
        time: "90分",
        anchor: {
          name: "小町通り",
          address: "神奈川県鎌倉市小町",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%B0%8F%E7%94%BA%E9%80%9A%E3%82%8A+%E9%8E%8C%E5%80%89",
          reason: "鎌倉最大の商店街。食べ歩きの宝庫。お土産もここで。",
          instagramUrl: "https://www.instagram.com/explore/tags/小町通り/"
        },
        mission: "通りを端まで歩く→食べ歩きを楽しむ→お土産を買う",
        todo: ["鎌倉コロッケ（鳥小屋）", "クレープ（コクリコ）", "抹茶スイーツ各種"],
        lostTip: "鎌倉駅東口を出てすぐ左。赤い鳥居が目印"
      },
      {
        label: "由比ヶ浜で海を見る",
        emoji: "🚃",
        time: "60分",
        anchor: {
          name: "由比ヶ浜海岸",
          address: "神奈川県鎌倉市由比ガ浜",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E7%94%B1%E6%AF%94%E3%83%B6%E6%B5%9C%E6%B5%B7%E5%B2%B8",
          reason: "鎌倉で一番アクセスしやすい海。江ノ電に乗って2駅。夕日がきれい。",
          instagramUrl: "https://www.instagram.com/explore/tags/由比ヶ浜/"
        },
        mission: "江ノ電に乗る→砂浜を歩く→波打ち際で写真",
        todo: ["江ノ電「由比ヶ浜駅」下車", "夕方は夕日スポット", "夏は海水浴客で混む"],
        lostTip: "鎌倉駅から江ノ電で2駅（約4分）"
      }
    ],
    tip: "土日は早めに出発！（10時前推奨）",
    planB: "八幡宮混みすぎなら銭洗弁財天へ / 雨なら長谷寺（あじさい有名）or 鎌倉文学館"
  },
  {
    id: 13,
    title: "ロマンスカーミュージアムで鉄道体験",
    types: ["culture", "chill", "explorer"],
    area: "海老名",
    region: "kanagawa",
    budget: "1,500円",
    duration: "3〜4時間（移動込み）",
    vibe: "展示 → 体験 → 余韻カフェ",
    emoji: "🚃",
    color: "#E74C3C",
    hashtag: "ロマンスカーミュージアム",
    catchcopy: "展示だけでも十分成立する",
    hours: "10:00-17:00",
    closed: "火曜",
    spots: [
      {
        label: "車両展示エリア",
        emoji: "🚃",
        time: "60分",
        anchor: {
          name: "ロマンスカーミュージアム",
          address: "神奈川県海老名市めぐみ町1-3",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%AD%E3%83%9E%E3%83%B3%E3%82%B9%E3%82%AB%E3%83%BC%E3%83%9F%E3%83%A5%E3%83%BC%E3%82%B8%E3%82%A2%E3%83%A0+%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C%E6%B5%B7%E8%80%81%E5%90%8D%E5%B8%82",
          floor: "1F",
          landmark: "海老名駅直結、改札出て左すぐ",
          reason: "歴代ロマンスカー11車両が実物展示。運転席にも座れる。鉄道好きじゃなくても圧倒される。",
          instagramUrl: "https://www.instagram.com/explore/tags/ロマンスカーミュージアム/"
        },
        mission: "入口で入館券購入→1F展示へ直行→歴代ロマンスカーを撮影",
        todo: ["SE・LSE・VSEの実車を見る", "運転席に座る", "車内も見学OK"],
        lostTip: "海老名駅の改札を出たら左へ。迷ったら駅員に聞けばOK"
      },
      {
        label: "ジオラマ＆シアター",
        emoji: "🎬",
        time: "40分",
        anchor: {
          name: "ロマンスカーミュージアム",
          address: "神奈川県海老名市めぐみ町1-3",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%AD%E3%83%9E%E3%83%B3%E3%82%B9%E3%82%AB%E3%83%BC%E3%83%9F%E3%83%A5%E3%83%BC%E3%82%B8%E3%82%A2%E3%83%A0+%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C%E6%B5%B7%E8%80%81%E5%90%8D%E5%B8%82",
          floor: "2F",
          landmark: "1Fから階段またはエレベーターで2Fへ",
          reason: "箱根の街並みを再現した巨大ジオラマ。電車が走る様子を眺めるだけで時間が溶ける。"
        },
        mission: "2Fへ移動→巨大ジオラマを鑑賞→シアター上映を1回見る",
        todo: ["ジオラマの電車運行を見る", "シアター上映時間をチェック"],
        lostTip: "2Fはジオラマとシアターだけなので迷わない"
      },
      {
        label: "シミュレータ体験",
        emoji: "🎮",
        time: "30分",
        anchor: {
          name: "ロマンスカーミュージアム",
          address: "神奈川県海老名市めぐみ町1-3",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%AD%E3%83%9E%E3%83%B3%E3%82%B9%E3%82%AB%E3%83%BC%E3%83%9F%E3%83%A5%E3%83%BC%E3%82%B8%E3%82%A2%E3%83%A0+%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C%E6%B5%B7%E8%80%81%E5%90%8D%E5%B8%82",
          floor: "1F",
          landmark: "1F奥のシミュレータコーナー",
          reason: "本物の運転台で運転体験。子ども向けに見えて大人もハマる。"
        },
        mission: "混んでなければ体験→混んでたらスキップでOK",
        todo: ["運転シミュレータを体験", "待ち時間15分以上ならスキップ"],
        lostTip: "スタッフに『シミュレータはどこ？』でOK",
        skippable: true
      },
      {
        label: "余韻カフェ",
        emoji: "☕",
        time: "40分",
        anchor: {
          name: "CAFE NICO（ロマンスカーミュージアム併設）",
          address: "神奈川県海老名市めぐみ町1-3",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=CAFE+NICO+%E3%83%AD%E3%83%9E%E3%83%B3%E3%82%B9%E3%82%AB%E3%83%BC%E3%83%9F%E3%83%A5%E3%83%BC%E3%82%B8%E3%82%A2%E3%83%A0+%E6%B5%B7%E8%80%81%E5%90%8D",
          floor: "1F",
          landmark: "ミュージアム1F出口付近",
          reason: "窓際席からロマンスカーを眺められる。鉄道体験の余韻に浸れる穴場カフェ。",
          instagramUrl: "https://www.instagram.com/explore/tags/cafenico/"
        },
        mission: "席を確保→コーヒー1杯→今日の振り返り10分",
        todo: ["ロマンスカーが見える席がおすすめ", "限定グッズもチェック"],
        lostTip: "ミュージアム出口から見える",
        backup: {
          name: "タリーズコーヒー ビナウォーク店",
          address: "神奈川県海老名市中央1-4-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%82%BF%E3%83%AA%E3%83%BC%E3%82%BA%E3%82%B3%E3%83%BC%E3%83%92%E3%83%BC+%E3%83%93%E3%83%8A%E3%82%A6%E3%82%A9%E3%83%BC%E3%82%AF%E6%B5%B7%E8%80%81%E5%90%8D"
        }
      }
    ],
    tip: "シミュレータは人気で並ぶことも。展示だけで十分楽しめる",
    planB: "混んでたら展示→カフェに短縮OK / 雨でも全行程OK"
  },
  {
    id: 14,
    title: "シリウスで建築×本×静けさ",
    types: ["culture", "chill", "creative"],
    area: "大和",
    region: "kanagawa",
    budget: "500円",
    duration: "3〜4時間（移動込み）",
    vibe: "建築 → 本 → 静かに整う",
    emoji: "📖",
    color: "#5856D6",
    hashtag: "大和市シリウス",
    catchcopy: "混雑でも耐えやすい、頭がスッと整う系",
    hours: "9:00-21:00（日祝20:00）",
    closed: "年末年始",
    spots: [
      {
        label: "建築鑑賞",
        emoji: "🏛️",
        time: "30分",
        anchor: {
          name: "大和市文化創造拠点シリウス",
          address: "神奈川県大和市大和南1-8-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E5%92%8C%E5%B8%82%E6%96%87%E5%8C%96%E5%89%B5%E9%80%A0%E6%8B%A0%E7%82%B9%E3%82%B7%E3%83%AA%E3%82%A6%E3%82%B9",
          floor: "1F〜6F",
          landmark: "大和駅東口から徒歩3分、大きなガラス張りの建物",
          reason: "6層吹き抜けの圧倒的な開放感。公共施設とは思えない美しさ。",
          instagramUrl: "https://www.instagram.com/explore/tags/シリウス大和/"
        },
        mission: "正面から入館→吹き抜けを見上げる→各フロアを軽く回遊",
        todo: ["1Fエントランスの開放感を体感", "エスカレーターで上へ移動しながら建築を楽しむ"],
        lostTip: "大和駅東口を出て右、徒歩3分で到着"
      },
      {
        label: "図書館で本の森を回遊",
        emoji: "📚",
        time: "90分",
        anchor: {
          name: "大和市文化創造拠点シリウス",
          address: "神奈川県大和市大和南1-8-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E5%92%8C%E5%B8%82%E6%96%87%E5%8C%96%E5%89%B5%E9%80%A0%E6%8B%A0%E7%82%B9%E3%82%B7%E3%83%AA%E3%82%A6%E3%82%B9",
          floor: "4F・5F",
          landmark: "エスカレーターで4Fへ",
          reason: "蔵書数40万冊。窓際の閲覧席は外の緑を見ながら読書できる。"
        },
        mission: "4F/5Fの図書館へ→気になる棚を3つ回る→1冊手に取って読む",
        todo: ["4F一般書エリアを散策", "5Fの静かな閲覧席で読書", "窓際席がおすすめ"],
        lostTip: "4Fに上がれば図書館エリア。案内表示に従えばOK"
      },
      {
        label: "企画展示を見る",
        emoji: "🖼️",
        time: "20分",
        anchor: {
          name: "大和市文化創造拠点シリウス",
          address: "神奈川県大和市大和南1-8-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E5%92%8C%E5%B8%82%E6%96%87%E5%8C%96%E5%89%B5%E9%80%A0%E6%8B%A0%E7%82%B9%E3%82%B7%E3%83%AA%E3%82%A6%E3%82%B9",
          floor: "3F",
          landmark: "3Fギャラリー",
          reason: "地元アーティストの企画展が無料で見れる。当たり外れも含めて面白い。"
        },
        mission: "3Fへ移動→企画展示をさっと見る→気に入った1点を決める",
        todo: ["今日の1枚を決める", "なければスキップOK"],
        lostTip: "3Fのギャラリースペース。開催中の展示は入口で確認",
        skippable: true
      },
      {
        label: "読書メモカフェ",
        emoji: "☕",
        time: "40分",
        anchor: {
          name: "スターバックス 大和市シリウス店",
          address: "神奈川県大和市大和南1-8-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%90%E3%83%83%E3%82%AF%E3%82%B9+%E5%A4%A7%E5%92%8C%E5%B8%82%E3%82%B7%E3%83%AA%E3%82%A6%E3%82%B9%E5%BA%97",
          floor: "3F",
          landmark: "シリウス3F、図書館と同フロア",
          reason: "図書館の本を持ち込める稀有なスタバ。読書の余韻を整理するのに最適。"
        },
        mission: "席を確保→飲み物を注文→読んだ本のメモ3行書く",
        todo: ["今日読んだ本の感想を3行でメモ", "図書館の本を持ち込んでもOK"],
        lostTip: "3Fのスタバ。混んでたら1Fカフェスペースでもよい",
        backup: {
          name: "ドトールコーヒー 大和駅前店",
          address: "神奈川県大和市大和南1-2-6",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%89%E3%83%88%E3%83%BC%E3%83%AB%E3%82%B3%E3%83%BC%E3%83%92%E3%83%BC+%E5%A4%A7%E5%92%8C%E9%A7%85%E5%89%8D"
        }
      }
    ],
    tip: "休日は学習席混むがラウンジ・カフェ席は空いてる",
    planB: "混んでたらカフェ席で本読むだけでOK / 雨でも全行程OK"
  },
  {
    id: 15,
    title: "ビナウォークで当日イベント発見",
    types: ["adventure", "gourmet", "explorer"],
    area: "海老名",
    region: "kanagawa",
    budget: "3,000円",
    duration: "3〜4時間（移動込み）",
    vibe: "イベント発見 → うまいもの → 余韻",
    emoji: "🎪",
    color: "#FF9500",
    hashtag: "ビナウォーク",
    catchcopy: "当たればデカい、その日の出会いに賭ける",
    hours: "10:00-21:00",
    closed: "不定休",
    spots: [
      {
        label: "イベント/ワークショップ発見",
        emoji: "🎯",
        time: "60分",
        anchor: {
          name: "ビナウォーク（センターコート）",
          address: "神奈川県海老名市中央1-4-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%93%E3%83%8A%E3%82%A6%E3%82%A9%E3%83%BC%E3%82%AF+%E6%B5%B7%E8%80%81%E5%90%8D",
          floor: "1F",
          landmark: "海老名駅西口直結、メインエントランスから入ってすぐ",
          reason: "週末は高確率でイベント開催。当日の偶然の出会いを楽しむ。",
          instagramUrl: "https://www.instagram.com/explore/tags/ビナウォーク/"
        },
        mission: "センターコートでイベント確認→参加 or 見学→なければ②へ",
        todo: ["当日のイベント掲示をチェック", "ワークショップは予約不要のものを狙う", "なければスキップOK"],
        lostTip: "海老名駅西口を出て正面がビナウォーク。センターコートは1Fメイン通路",
        skippable: true,
        note: "事前に公式サイトでイベント確認推奨: https://www.vinawalk.com/event/"
      },
      {
        label: "うまいもの1発",
        emoji: "🍜",
        time: "60分",
        anchor: {
          name: "ビナウォーク（レストラン街）",
          address: "神奈川県海老名市中央1-4-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%93%E3%83%8A%E3%82%A6%E3%82%A9%E3%83%BC%E3%82%AF+%E3%83%AC%E3%82%B9%E3%83%88%E3%83%A9%E3%83%B3%E8%A1%97+%E6%B5%B7%E8%80%81%E5%90%8D",
          floor: "5F・6F",
          landmark: "エスカレーターで5F/6Fへ",
          reason: "和洋中30店舗以上。迷ったら目の前の店に入る。それが今日の正解。"
        },
        mission: "5F/6Fのレストラン街へ→予算2,000円以内で1食→満足したら次へ",
        todo: ["5F/6Fのレストランフロアで選ぶ", "混んでたらフードコート（3F）へ"],
        lostTip: "レストランは5F/6F。3Fにフードコートもあり",
        backup: {
          name: "ビナウォーク フードコート",
          address: "神奈川県海老名市中央1-4-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%93%E3%83%8A%E3%82%A6%E3%82%A9%E3%83%BC%E3%82%AF+%E3%83%95%E3%83%BC%E3%83%89%E3%82%B3%E3%83%BC%E3%83%88+%E6%B5%B7%E8%80%81%E5%90%8D",
          floor: "3F"
        }
      },
      {
        label: "余韻スポット",
        emoji: "🚶",
        time: "60分",
        anchor: {
          name: "ビナウォーク（屋上庭園・TSUTAYA）",
          address: "神奈川県海老名市中央1-4-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%83%93%E3%83%8A%E3%82%A6%E3%82%A9%E3%83%BC%E3%82%AF+%E5%B1%8B%E4%B8%8A%E5%BA%AD%E5%9C%92+%E6%B5%B7%E8%80%81%E5%90%8D",
          floor: "屋上 or 4F",
          landmark: "エレベーターで屋上へ or 4F TSUTAYA",
          reason: "屋上庭園は穴場。晴れてたらベンチで空を見る。雨ならTSUTAYAで雑誌。"
        },
        mission: "天気良ければ屋上庭園→そうでなければTSUTAYAで本を見る→余韻を楽しむ",
        todo: ["晴れ: 屋上庭園でベンチ休憩", "曇り/雨: 4F TSUTAYAで雑誌チェック"],
        lostTip: "屋上は直通エレベーターで。TSUTAYAは4F",
        backup: {
          name: "スターバックス ビナウォーク海老名店",
          address: "神奈川県海老名市中央1-4-1",
          mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%90%E3%83%83%E3%82%AF%E3%82%B9+%E3%83%93%E3%83%8A%E3%82%A6%E3%82%A9%E3%83%BC%E3%82%AF%E6%B5%B7%E8%80%81%E5%90%8D",
          floor: "1F"
        }
      }
    ],
    tip: "当日朝に公式サイトでイベント確認必須！",
    planB: "イベントなければ②→③で成立 / 雨でも屋内で完結"
  }
];

// 横浜3プラン（瀬谷起点）- 現在未使用だが将来使用予定
// const yokohamaPlans = plans.filter(p => [13, 14, 15].includes(p.id));

// ===== MAIN APP =====
export default function Detour() {
  // 共通state
  const [screen, setScreen] = useState('home');
  const [_mode, setMode] = useState(null); // 'weekend' or 'yorimichi'
  const [animate, setAnimate] = useState(false);

  // 週末プラン用state
  const [region, setRegion] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [userType, setUserType] = useState(null);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showOthers, setShowOthers] = useState(false); // 「他も見る」の展開状態
  const [showSpotDetails, setShowSpotDetails] = useState(false); // 深津流：詳細展開状態

  // 寄り道用state
  const [yorimichiInput, setYorimichiInput] = useState({
    time: 60,        // 60/90/120分
    range: 'walk',   // walk/1station/2station
    zure: 'safe',    // safe/change/adventure
    ngQueue: false,  // 行列NG
    ngNoisy: false,  // うるさいNG
    ngReserve: false,// 予約NG
    ngCash: false    // 現金NG
  });
  const [yorimichiResults, setYorimichiResults] = useState([]);
  const [selectedYorimichi, setSelectedYorimichi] = useState(null);
  const [showYorimichiGo, setShowYorimichiGo] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showMehReasons, setShowMehReasons] = useState(false); // 微妙理由選択表示

  // 微妙理由（memo.txt準拠）
  const mehReasons = [
    { id: 'crowded', label: '混んでた', emoji: '👥' },
    { id: 'expensive', label: '高かった', emoji: '💸' },
    { id: 'far', label: '遠かった', emoji: '🚶' },
    { id: 'intimidating', label: '入りづらかった', emoji: '😰' },
    { id: 'mood', label: '気分と違った', emoji: '🤔' },
  ];

  // スポット進行状態: 'ready'(出発前) | 'arrived'(到着) | 'done'(完了)
  const [spotProgress, setSpotProgress] = useState({});

  // スポット進行状態をリセット
  const resetSpotProgress = () => setSpotProgress({});

  // 現在のスポット状態を取得
  const getSpotStatus = (index) => spotProgress[index] || 'ready';

  /* eslint-disable react-hooks/set-state-in-effect */
  // 画面遷移時のアニメーションリセット用
  useEffect(() => {
    setAnimate(true);
  }, [screen, qIdx, selected, showMap, selectedYorimichi, showYorimichiGo, showRating]);

  // 深津流: スポット切り替え時に展開状態をリセット
  useEffect(() => {
    setShowSpotDetails(false);
  }, [showMap]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 計測: plan_view（プラン詳細表示時）
  useEffect(() => {
    if (selected) {
      Analytics.planView(selected.id, selected.title);
    }
  }, [selected]);

  // 計測: plan_view（寄り道詳細表示時）
  useEffect(() => {
    if (selectedYorimichi) {
      Analytics.planView(selectedYorimichi.id, selectedYorimichi.name);
    }
  }, [selectedYorimichi]);

  // ===== 週末プラン用ロジック =====
  const calcType = (ans) => {
    const s = {};
    ans.forEach(a => a.types.forEach(t => s[t] = (s[t] || 0) + 1));
    return Object.entries(s).sort((a, b) => b[1] - a[1])[0][0];
  };

  const getPlans = (type, reg) => {
    // 新構造のプランのみを対象（anchorを持つもの）
    const newStructurePlans = plans.filter(p => p.spots?.[0]?.anchor);
    const match = newStructurePlans.filter(p => p.region === reg && p.types.includes(type));
    const other = newStructurePlans.filter(p => p.region === reg && !p.types.includes(type));
    return [...match.sort(() => Math.random() - 0.5).slice(0, 2), other.sort(() => Math.random() - 0.5)[0]].filter(Boolean);
  };

  const answer = (opt) => {
    const newAns = [...answers, opt];
    setAnswers(newAns);
    setAnimate(false);
    setTimeout(() => {
      if (qIdx < questions.length - 1) {
        setQIdx(qIdx + 1);
      } else {
        const type = calcType(newAns);
        setUserType(type);
        setResults(getPlans(type, region));
        setScreen('result');
      }
    }, 200);
  };

  // ===== 寄り道用ロジック =====
  const getYorimichiSpots = () => {
    const { time, range: _range, zure, ngQueue, ngNoisy, ngCash } = yorimichiInput;

    let spots = [...yorimichi.spots];

    // ズレレベルでフィルタリング
    if (zure === 'safe') {
      spots = spots.filter(s => s.zure === 'safe');
    } else if (zure === 'change') {
      spots = spots.filter(s => s.zure === 'safe' || s.zure === 'change');
    }
    // adventureは全部OK

    // 時間フィルタリング（移動+滞在が収まるもの）
    const maxTime = time;
    spots = spots.filter(s => (s.walkFromStation + s.stayTime) <= maxTime + 15);

    // 地雷フィルタリング
    if (ngQueue) spots = spots.filter(s => s.crowdLevel <= 2);
    if (ngNoisy) spots = spots.filter(s => s.noiseLevel <= 1);
    if (ngCash) spots = spots.filter(s => !s.cashOnly);

    // シャッフルして3つ選ぶ（安牌・変化・冒険から1つずつ優先）
    const safeSpots = spots.filter(s => s.zure === 'safe').sort(() => Math.random() - 0.5);
    const changeSpots = spots.filter(s => s.zure === 'change').sort(() => Math.random() - 0.5);
    const adventureSpots = spots.filter(s => s.zure === 'adventure').sort(() => Math.random() - 0.5);

    const result = [];
    if (safeSpots[0]) result.push(safeSpots[0]);
    if (changeSpots[0]) result.push(changeSpots[0]);
    if (adventureSpots[0]) result.push(adventureSpots[0]);

    // 足りなければ残りから補充
    const remaining = [...safeSpots.slice(1), ...changeSpots.slice(1), ...adventureSpots.slice(1)]
      .sort(() => Math.random() - 0.5);
    while (result.length < 3 && remaining.length > 0) {
      result.push(remaining.shift());
    }

    return result;
  };

  const submitYorimichi = () => {
    const spots = getYorimichiSpots();
    setYorimichiResults(spots);
    setScreen('yorimichi-result');
    setAnimate(false);
  };

  // ===== 共通ロジック =====
  const reset = () => {
    setScreen('home');
    setMode(null);
    setRegion(null);
    setQIdx(0);
    setAnswers([]);
    setUserType(null);
    setResults([]);
    setSelected(null);
    setShowMap(false);
    setShowOthers(false);
    setShowSpotDetails(false);
    setYorimichiResults([]);
    setSelectedYorimichi(null);
    setShowYorimichiGo(false);
    setShowRating(false);
    setShowMehReasons(false);
    setYorimichiInput({
      time: 60, range: 'walk', zure: 'safe',
      ngQueue: false, ngNoisy: false, ngReserve: false, ngCash: false
    });
    resetSpotProgress();
  };

  const openUrl = (url) => window.open(url, '_blank');

  // ========== MAP BOTTOM SHEET (オーバーレイ) ==========
  const renderMapSheet = () => {
    if (!selected || !showMap) return null;

    const plan = selected;
    const currentSpot = showMap.spot;
    const currentIndex = showMap.index;

    // アンカー目的地のマップURL（到達保証）
    const mapUrl = currentSpot.anchor?.mapUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentSpot.anchor?.name || currentSpot.label || currentSpot.name)}`;
    const mapQuery = encodeURIComponent(currentSpot.anchor?.name || currentSpot.label || currentSpot.name);

    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        onClick={() => setShowMap(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" />

        {/* Sheet */}
        <div
          className="relative w-full max-w-lg bg-white rounded-t-3xl overflow-hidden transition-transform duration-300 ease-out"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-[#E5E5EA] rounded-full" />
          </div>

          {/* Spot Switcher */}
          {plan.spots.length > 1 && (
            <div className="flex gap-2 px-6 pb-4 overflow-x-auto">
              {plan.spots.map((spot, i) => {
                const spotLabel = spot.label || spot.name;
                return (
                  <button
                    key={i}
                    onClick={() => setShowMap({ spot, index: i })}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-200 ${
                      i === currentIndex
                        ? 'text-white'
                        : getSpotStatus(i) === 'done'
                          ? 'bg-[#34C759]/20 text-[#34C759]'
                          : 'bg-[#F2F2F7] text-[#1D1D1F]'
                    }`}
                    style={i === currentIndex ? { backgroundColor: plan.color } : {}}
                  >
                    {getSpotStatus(i) === 'done' ? '✓' : i + 1}. {spotLabel.length > 5 ? spotLabel.slice(0, 5) + '…' : spotLabel}
                  </button>
                );
              })}
            </div>
          )}

          {/* Map */}
          <div className="relative bg-[#E5E5EA]" style={{ height: '200px' }}>
            <iframe
              title="map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed&z=15`}
            />
          </div>

          {/* Spot Info */}
          <div className="p-6">
            {/* ヘッダー */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${plan.color}15` }}
              >
                {currentSpot.emoji || (currentIndex + 1)}
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-[#86868B] mb-1">Step {currentIndex + 1}/{plan.spots.length}</p>
                <h2 className="text-[20px] font-bold text-[#1D1D1F]">{currentSpot.label || currentSpot.name}</h2>
              </div>
            </div>

            {/* 深津流：reason（なぜここか）を最初に見せる */}
            {currentSpot.anchor && (
              <div className="mb-4">
                {/* 店名 + reason */}
                <p className="text-[15px] font-semibold text-[#1D1D1F] mb-2">📍 {currentSpot.anchor.name}</p>
                {currentSpot.anchor.reason && (
                  <p className="text-[14px] text-[#3D3D3D] leading-relaxed mb-3">{currentSpot.anchor.reason}</p>
                )}

                {/* 滞在時間（コンパクトに） */}
                <div className="flex items-center gap-3 text-[13px] text-[#86868B] mb-4">
                  <span>⏱ {currentSpot.time}</span>
                  {currentSpot.skippable && <span className="text-[#FF9500]">スキップ可</span>}
                </div>

                {/* 深津流：詳しく見る（段階的開示） */}
                {!showSpotDetails ? (
                  <button
                    onClick={() => setShowSpotDetails(true)}
                    className="w-full py-2 text-[13px] text-[#007AFF] border border-[#E5E5E7] rounded-lg transition-all active:bg-[#F5F5F7]"
                  >
                    詳しく見る ↓
                  </button>
                ) : (
                  <div className="bg-[#F8F8F8] rounded-xl p-4 space-y-3">
                    {/* 住所 */}
                    <div>
                      <p className="text-[12px] text-[#86868B] mb-1">住所</p>
                      <p className="text-[13px] text-[#1D1D1F]">{currentSpot.anchor.address}</p>
                    </div>

                    {/* フロア・目印 */}
                    {(currentSpot.anchor.floor || currentSpot.anchor.landmark) && (
                      <div className="flex flex-wrap gap-2">
                        {currentSpot.anchor.floor && <span className="text-[12px] bg-white px-2 py-1 rounded text-[#86868B]">{currentSpot.anchor.floor}</span>}
                        {currentSpot.anchor.landmark && <span className="text-[12px] bg-white px-2 py-1 rounded text-[#86868B]">{currentSpot.anchor.landmark}</span>}
                      </div>
                    )}

                    {/* Instagramで見る */}
                    {currentSpot.anchor.instagramUrl && (
                      <button
                        onClick={() => openUrl(currentSpot.anchor.instagramUrl)}
                        className="w-full py-2 text-[13px] text-[#E4405F] bg-white rounded-lg border border-[#E5E5E7] transition-all active:bg-[#FFF0F3]"
                      >
                        📸 Instagramで雰囲気を見る
                      </button>
                    )}

                    {/* コピーボタン */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentSpot.anchor.address);
                          alert('住所をコピーしました');
                        }}
                        className="flex-1 py-2 text-[12px] text-[#86868B] bg-white rounded-lg border border-[#E5E5E7] transition-all active:bg-[#F5F5F7]"
                      >
                        住所コピー
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentSpot.anchor.name);
                          alert('検索ワードをコピーしました');
                        }}
                        className="flex-1 py-2 text-[12px] text-[#86868B] bg-white rounded-lg border border-[#E5E5E7] transition-all active:bg-[#F5F5F7]"
                      >
                        検索ワードコピー
                      </button>
                    </div>

                    {/* 迷ったら */}
                    {currentSpot.lostTip && (
                      <div className="pt-2 border-t border-[#E5E5E7]">
                        <p className="text-[12px] text-[#86868B]">😵 迷ったら: {currentSpot.lostTip}</p>
                      </div>
                    )}

                    {/* 閉じる */}
                    <button
                      onClick={() => setShowSpotDetails(false)}
                      className="w-full py-2 text-[12px] text-[#86868B] transition-all active:opacity-60"
                    >
                      ↑ 閉じる
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 現地ミッション（常時表示だが目立たせない） */}
            {currentSpot.mission && (
              <div className="bg-[#FFF8E7] rounded-xl p-4 mb-4">
                <p className="text-[13px] font-medium text-[#1D1D1F] mb-2">🎯 やること</p>
                <p className="text-[14px] text-[#1D1D1F] leading-relaxed">{currentSpot.mission}</p>
                {currentSpot.todo && currentSpot.todo.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {currentSpot.todo.map((item, i) => (
                      <li key={i} className="text-[13px] text-[#86868B] flex items-start gap-2">
                        <span className="text-[#34C759]">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* 旧：迷ったら - 深津流では「詳しく見る」内に移動 */}
            {!currentSpot.anchor && currentSpot.lostTip && (
              <div className="bg-[#F2F2F7] rounded-xl p-3 mb-4">
                <p className="text-[13px] text-[#86868B]">
                  <span className="font-medium">迷ったら:</span> {currentSpot.lostTip}
                </p>
              </div>
            )}

            {/* PlanBチップ - 困った時の救済 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentSpot.backup && (
                <button
                  onClick={() => {
                    openUrl(currentSpot.backup.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentSpot.backup.name)}`);
                  }}
                  className="px-3 py-2 rounded-full text-[13px] font-medium bg-[#FFF0F0] text-[#FF3B30] transition-all active:scale-[0.98]"
                >
                  😵 混んでる → {currentSpot.backup.name}
                </button>
              )}
              {currentSpot.skippable && currentIndex < plan.spots.length - 1 && (
                <button
                  onClick={() => {
                    setSpotProgress(prev => ({ ...prev, [currentIndex]: 'done' }));
                    setShowMap({ spot: plan.spots[currentIndex + 1], index: currentIndex + 1 });
                  }}
                  className="px-3 py-2 rounded-full text-[13px] font-medium bg-[#FFF8E7] text-[#FF9500] transition-all active:scale-[0.98]"
                >
                  ⏭️ スキップして次へ
                </button>
              )}
            </div>

            {/* 状態別CTA */}
            {getSpotStatus(currentIndex) === 'ready' ? (
              /* 出発前: ナビ開始（到達保証） */
              <div className="space-y-3">
                <button
                  onClick={() => {
                    Analytics.openMaps(plan.id, currentIndex, currentSpot.label || currentSpot.name);
                    openUrl(mapUrl);
                    setSpotProgress(prev => ({ ...prev, [currentIndex]: 'arrived' }));
                    setShowSpotDetails(false);
                  }}
                  className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                  style={{ backgroundColor: '#007AFF' }}
                >
                  📍 ナビを開始する
                </button>
                {/* 目的地見つからない報告（Gate 0計測用） */}
                <button
                  onClick={() => {
                    Analytics.cantFindDestination(plan.id, currentIndex, currentSpot.label || currentSpot.name);
                    setShowSpotDetails(true);
                    alert('住所をコピーして、Google Mapsで直接検索してみてください。');
                    navigator.clipboard.writeText(currentSpot.anchor?.address || currentSpot.anchor?.name || '');
                  }}
                  className="w-full py-2 rounded-lg text-[13px] font-medium text-[#FF6B6B] bg-[#FFF0F0] transition-all active:scale-[0.98]"
                >
                  📍 目的地が見つからない
                </button>
              </div>
            ) : getSpotStatus(currentIndex) === 'arrived' ? (
              /* 到着後: 次へ or 完了 */
              <div className="space-y-3">
                {currentIndex < plan.spots.length - 1 ? (
                  <button
                    onClick={() => {
                      Analytics.done(plan.id, currentIndex, currentSpot.label || currentSpot.name);
                      setSpotProgress(prev => ({ ...prev, [currentIndex]: 'done' }));
                      setShowMap({ spot: plan.spots[currentIndex + 1], index: currentIndex + 1 });
                    }}
                    className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                    style={{ backgroundColor: plan.color }}
                  >
                    ✓ 次へ（{currentIndex + 2}へ）
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      Analytics.done(plan.id, currentIndex, currentSpot.label || currentSpot.name);
                      Analytics.complete(plan.id, plan.title);
                      setSpotProgress(prev => ({ ...prev, [currentIndex]: 'done' }));
                      setShowMap(false);
                    }}
                    className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                    style={{ backgroundColor: '#34C759' }}
                  >
                    🎉 プラン完了！
                  </button>
                )}
                <button
                  onClick={() => openUrl(mapUrl)}
                  className="w-full py-3 rounded-xl text-[15px] font-medium text-[#007AFF] bg-[#F2F2F7] transition-all duration-200 active:scale-[0.98]"
                >
                  もう一度地図を見る
                </button>
              </div>
            ) : (
              /* 完了済み: 次へ表示 */
              currentIndex < plan.spots.length - 1 && (
                <button
                  onClick={() => setShowMap({ spot: plan.spots[currentIndex + 1], index: currentIndex + 1 })}
                  className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                  style={{ backgroundColor: plan.color }}
                >
                  次へ（{currentIndex + 2}へ）
                </button>
              )
            )}

            {/* 今日は省略 - 罪悪感を軽減 */}
            {getSpotStatus(currentIndex) !== 'done' && currentIndex < plan.spots.length - 1 && (
              <button
                onClick={() => {
                  setSpotProgress(prev => ({ ...prev, [currentIndex]: 'done' }));
                  setShowMap({ spot: plan.spots[currentIndex + 1], index: currentIndex + 1 });
                }}
                className="w-full mt-3 py-2 text-[14px] text-[#86868B] transition-all active:opacity-60"
              >
                今日は省略して次へ
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========== HOME ==========
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-[#0A0A0B] p-6">
        <div className="max-w-lg mx-auto pt-16">
          {/* Header */}
          <div className={`text-center mb-12 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-[36px] font-bold tracking-tight text-white mb-3">
              where
            </h1>
            <p className="text-[15px] text-[#8E8E93]">
              決めて、動く。週末おでかけ提案
            </p>
          </div>

          {/* 深津流: シンプルな2択 */}
          <div className={`space-y-4 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* 寄り道カード */}
            <button
              onClick={() => { setMode('yorimichi'); setScreen('yorimichi-input'); setAnimate(false); }}
              className="w-full text-left p-6 rounded-2xl transition-all duration-300 ease-out active:scale-[0.98] bg-[#1C1C1E]"
            >
              <h2 className="text-[20px] font-bold text-white mb-2">帰り道に寄る</h2>
              <p className="text-[14px] text-[#8E8E93] leading-relaxed">
                1時間くらい、どこかに寄って帰る
              </p>
            </button>

            {/* 週末プランカード */}
            <button
              onClick={() => { setMode('weekend'); setScreen('weekend-select'); setAnimate(false); }}
              className="w-full text-left p-6 rounded-2xl transition-all duration-300 ease-out active:scale-[0.98] bg-[#1C1C1E]"
            >
              <h2 className="text-[20px] font-bold text-white mb-2">週末の予定を決める</h2>
              <p className="text-[14px] text-[#8E8E93] leading-relaxed">
                5つの質問で、あなたに合うプランを提案
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== WEEKEND SELECT (エリア選択) ==========
  if (screen === 'weekend-select') {
    return (
      <div className="min-h-screen bg-[#F2F2F7] p-6">
        <div className="max-w-lg mx-auto pt-8">
          {/* Back */}
          <button
            onClick={() => { setScreen('home'); setAnimate(false); }}
            className="text-[17px] text-[#007AFF] font-medium mb-8 transition-all duration-300 active:opacity-60"
          >
            ← 戻る
          </button>

          {/* 深津流: 1画面1メッセージ */}
          <div className={`mb-10 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-2">
              週末どこいく？
            </h1>
            <p className="text-[15px] text-[#86868B]">
              エリアを選んでください
            </p>
          </div>

          {/* 深津流: シンプルなリスト */}
          <div className={`space-y-3 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* 東京 */}
            <button
              onClick={() => {
                setRegion('tokyo');
                setScreen('quiz');
                setAnimate(false);
              }}
              className="w-full flex items-center justify-between p-5 bg-white rounded-2xl transition-all active:scale-[0.98] text-left"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <div className="text-left">
                <p className="text-[17px] font-semibold text-[#1D1D1F]">東京</p>
                <p className="text-[14px] text-[#86868B]">清澄白河・谷中・高尾山など</p>
              </div>
              <span className="text-[#C7C7CC]">→</span>
            </button>

            {/* 神奈川 */}
            <button
              onClick={() => {
                setRegion('kanagawa');
                setScreen('quiz');
                setAnimate(false);
              }}
              className="w-full flex items-center justify-between p-5 bg-white rounded-2xl transition-all active:scale-[0.98] text-left"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <div className="text-left">
                <p className="text-[17px] font-semibold text-[#1D1D1F]">神奈川</p>
                <p className="text-[14px] text-[#86868B]">横浜・鎌倉・湘南など</p>
              </div>
              <span className="text-[#C7C7CC]">→</span>
            </button>
          </div>

          {/* Footer */}
          <p className={`text-center text-[13px] text-[#86868B] mt-16 transition-all duration-700 delay-200 ${animate ? 'opacity-100' : 'opacity-0'}`}>
            5つの質問に答えるだけ
          </p>
        </div>
      </div>
    );
  }

  // ========== YORIMICHI INPUT ==========
  if (screen === 'yorimichi-input') {
    return (
      <div className="min-h-screen bg-[#F2F2F7]">
        <div className="px-6 pb-12">
          <div className="max-w-lg mx-auto pt-12">
            {/* Back */}
            <button
              onClick={() => { setScreen('home'); setAnimate(false); }}
              className="text-[15px] text-[#86868B] mb-8 transition-all duration-300 active:opacity-60"
            >
              ← 戻る
            </button>

            {/* Header */}
            <div className={`mb-10 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-[28px] font-bold text-[#1D1D1F]">どこに寄る？</h1>
            </div>

            {/* Time Selection */}
            <div className={`mb-8 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-4">使える時間</p>
              <div className="flex gap-3">
                {[
                  { value: 60, label: '60分' },
                  { value: 90, label: '90分' },
                  { value: 120, label: '120分' }
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setYorimichiInput(prev => ({ ...prev, time: t.value }))}
                    className="flex-1 py-4 rounded-xl text-[15px] font-semibold transition-all duration-300"
                    style={{
                      backgroundColor: yorimichiInput.time === t.value ? '#1D1D1F' : '#FFFFFF',
                      color: yorimichiInput.time === t.value ? '#FFFFFF' : '#1D1D1F',
                      border: yorimichiInput.time === t.value ? 'none' : '1px solid #E5E5E7',
                      boxShadow: yorimichiInput.time !== t.value ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zure Level */}
            <div className={`mb-8 transition-all duration-700 delay-150 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-4">どこまで行く？</p>
              <div className="space-y-3">
                {Object.entries(yorimichi.zure).map(([key, z]) => (
                  <button
                    key={key}
                    onClick={() => setYorimichiInput(prev => ({ ...prev, zure: key }))}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 ${
                      yorimichiInput.zure === key
                        ? 'ring-2'
                        : 'bg-white border border-[#E5E5E7]'
                    }`}
                    style={{
                      backgroundColor: yorimichiInput.zure === key ? `${z.color}10` : undefined,
                      boxShadow: yorimichiInput.zure !== key ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      '--tw-ring-color': z.color
                    }}
                  >
                    <span className="text-2xl">{z.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className={`text-[16px] font-semibold ${yorimichiInput.zure === key ? 'text-[#1D1D1F]' : 'text-[#1D1D1F]'}`}>
                        {z.name}
                      </p>
                      <p className="text-[13px] text-[#86868B]">{z.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* NG Filters */}
            <div className={`mb-10 transition-all duration-700 delay-200 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-4">避けたい</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'ngQueue', label: '行列' },
                  { key: 'ngNoisy', label: 'うるさい' },
                  { key: 'ngCash', label: '現金のみ' }
                ].map((ng) => (
                  <button
                    key={ng.key}
                    onClick={() => setYorimichiInput(prev => ({ ...prev, [ng.key]: !prev[ng.key] }))}
                    className="px-5 py-3 rounded-full text-[14px] font-medium transition-all duration-300"
                    style={{
                      backgroundColor: yorimichiInput[ng.key] ? '#FF3B30' : '#FFFFFF',
                      color: yorimichiInput[ng.key] ? '#FFFFFF' : '#1D1D1F',
                      border: yorimichiInput[ng.key] ? 'none' : '1px solid #E5E5E7',
                      boxShadow: !yorimichiInput[ng.key] ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    {ng.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={submitYorimichi}
              className={`w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-500 delay-250 ease-out active:scale-[0.98] ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ backgroundColor: '#1D1D1F' }}
            >
              探す
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== YORIMICHI RESULT (3択) ==========
  if (screen === 'yorimichi-result' && !selectedYorimichi) {
    const mainSpot = yorimichiResults && yorimichiResults.length > 0 ? yorimichiResults[0] : null;
    const otherSpots = yorimichiResults && yorimichiResults.length > 1 ? yorimichiResults.slice(1) : [];
    const mainZure = mainSpot ? yorimichi.zure[mainSpot.zure] : null;

    // 時間帯メッセージ
    const hour = new Date().getHours();
    const timeMessage = hour < 18 ? '今から寄れる' : hour < 21 ? '夜でも楽しめる' : '遅い時間でもOK';

    return (
      <div className="min-h-screen bg-[#F2F2F7]">
        <div className="px-6 pb-24">
          <div className="max-w-lg mx-auto pt-12">

            {/* Back */}
            <button
              onClick={() => { setScreen('yorimichi-input'); setAnimate(false); }}
              className="text-[15px] text-[#86868B] mb-8 transition-all duration-300 active:opacity-60"
            >
              ← 条件を変える
            </button>

            {/* 時間帯メッセージ */}
            <p className={`text-[14px] text-[#86868B] mb-6 transition-all duration-700 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
              {timeMessage}
            </p>

            {/* メイン推しスポット（1つ） */}
            {mainSpot && mainZure && (
              <div className={`transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div
                  className="bg-white rounded-3xl overflow-hidden mb-6"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                >
                  <div className="p-6 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ backgroundColor: `${mainZure.color}15` }}
                      >
                        {mainSpot.emoji}
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-[12px] font-semibold text-white"
                        style={{ backgroundColor: mainZure.color }}
                      >
                        {mainZure.name}
                      </span>
                    </div>

                    <h2 className="text-[24px] font-bold text-[#1D1D1F] leading-tight mb-3">
                      {mainSpot.name}
                    </h2>

                    <p className="text-[16px] text-[#3D3D3D] leading-relaxed mb-4">
                      {mainSpot.reason}
                    </p>

                    <div className="flex flex-wrap gap-3 text-[14px] text-[#86868B]">
                      <span>📍 {mainSpot.area}</span>
                      <span>🚶 {mainSpot.walkFromStation}分</span>
                      <span>⏱ {mainSpot.stayTime}分</span>
                      <span>💰 {mainSpot.budget}</span>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2">
                    <button
                      onClick={() => { setSelectedYorimichi(mainSpot); setAnimate(false); }}
                      className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-300 active:scale-[0.98]"
                      style={{ backgroundColor: mainZure.color }}
                    >
                      ここに寄る →
                    </button>
                  </div>
                </div>

                {/* 他の選択肢を見る */}
                {otherSpots.length > 0 && (
                  <div className="text-center">
                    {!showOthers ? (
                      <button
                        onClick={() => setShowOthers(true)}
                        className="text-[15px] text-[#86868B] py-3 transition-all duration-300 active:opacity-60"
                      >
                        他の選択肢を見る（{otherSpots.length}）
                      </button>
                    ) : (
                      <div className="space-y-3 mt-2">
                        {otherSpots.map((spot) => {
                          const zureInfo = yorimichi.zure[spot.zure];
                          return (
                            <button
                              key={spot.id}
                              onClick={() => { setSelectedYorimichi(spot); setAnimate(false); }}
                              className="w-full text-left bg-white rounded-2xl overflow-hidden transition-all duration-300 ease-out active:scale-[0.98]"
                              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                            >
                              <div className="p-4">
                                <div className="flex items-center gap-4">
                                  <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                    style={{ backgroundColor: `${zureInfo.color}15` }}
                                  >
                                    {spot.emoji}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-1">{spot.name}</h3>
                                    <p className="text-[13px] text-[#86868B]">{spot.area} · {spot.stayTime}分</p>
                                  </div>
                                  <svg className="w-5 h-5 text-[#C7C7CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setShowOthers(false)}
                          className="text-[14px] text-[#86868B] py-2 transition-all duration-300 active:opacity-60"
                        >
                          閉じる
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 別の候補 */}
                <button
                  onClick={() => {
                    const newSpots = getYorimichiSpots();
                    setYorimichiResults(newSpots);
                    setShowOthers(false);
                    setAnimate(false);
                    setTimeout(() => setAnimate(true), 50);
                  }}
                  className="w-full mt-6 py-3 text-[15px] font-medium text-[#007AFF] transition-all duration-300 active:opacity-60"
                >
                  🔄 別の候補を見る
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== YORIMICHI DETAIL (深津流) ==========
  if (selectedYorimichi && !showYorimichiGo) {
    const spot = selectedYorimichi;
    const totalTime = spot.walkFromStation + spot.stayTime;

    // スポットタイプの日本語マッピング
    const typeLabels = { cafe: 'カフェ', bookstore: '書店', sento: '銭湯', gallery: 'ギャラリー' };
    const typeLabel = typeLabels[spot.type] || spot.type;

    // タイプ別カラー（デザインガイドライン準拠）
    const typeColors = {
      cafe: { main: '#8B7355', bg: '#F5F0EB', text: '#5C4A3A' },
      bookstore: { main: '#5D5D5D', bg: '#F0F0F0', text: '#3D3D3D' },
      sento: { main: '#4A90A4', bg: '#EBF4F7', text: '#2D5A6A' },
      gallery: { main: '#1D1D1F', bg: '#F0F0F2', text: '#1D1D1F' }
    };
    const typeColor = typeColors[spot.type] || typeColors.cafe;

    // タイプ別絵文字
    const typeEmojis = { cafe: '☕', bookstore: '📚', sento: '♨️', gallery: '🎨' };
    const typeEmoji = typeEmojis[spot.type] || '📍';

    // 駅名の「駅」重複を防ぐ
    const stationName = spot.station.endsWith('駅') ? spot.station : `${spot.station}駅`;

    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => { setSelectedYorimichi(null); setAnimate(false); }}
              className="text-[15px] text-[#86868B] transition-all active:opacity-60"
            >
              ← 戻る
            </button>
          </div>
        </div>

        {/* 深津流: reasonをヒーローに、タイプカラーで雰囲気を作る */}
        <div className="flex-1 px-6">
          <div className="max-w-lg mx-auto">
            <div className={`transition-all duration-500 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

              {/* ヒーローカード: タイプカラー背景でreasonを強調 */}
              <div
                className="rounded-3xl p-6 mb-6"
                style={{ backgroundColor: typeColor.bg }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{typeEmoji}</span>
                  <span
                    className="text-[13px] font-medium px-3 py-1 rounded-full"
                    style={{ backgroundColor: typeColor.main, color: '#FFFFFF' }}
                  >
                    {typeLabel}
                  </span>
                </div>

                <p
                  className="text-[17px] leading-relaxed font-medium"
                  style={{ color: typeColor.text }}
                >
                  「{spot.reason}」
                </p>
              </div>

              {/* 店名 */}
              <h1 className="text-[22px] font-bold text-[#1D1D1F] leading-tight mb-3">{spot.name}</h1>

              {/* メタ情報 */}
              <p className="text-[14px] text-[#86868B] mb-6">
                {stationName} 徒歩{spot.walkFromStation}分 · {totalTime}分 · {spot.budget}{spot.cashOnly && ' · 現金のみ'}
              </p>

              {/* 補助リンク */}
              <div className="flex gap-4 text-[14px]">
                <button
                  onClick={() => openUrl(`https://www.instagram.com/explore/tags/${encodeURIComponent(spot.name.replace(/[\s.・]/g, ''))}/`)}
                  className="transition-all active:opacity-60"
                  style={{ color: typeColor.main }}
                >
                  写真を見る
                </button>
                <button
                  onClick={() => openUrl(`https://www.google.com/maps/search/${encodeURIComponent(spot.name + ' ' + spot.area)}`)}
                  className="transition-all active:opacity-60"
                  style={{ color: typeColor.main }}
                >
                  地図を見る
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 深津流: CTAは下部に固定 */}
        <div className="px-6 pb-8 pt-4">
          <div className="max-w-lg mx-auto space-y-3">
            <button
              onClick={() => { setShowYorimichiGo(true); setAnimate(false); }}
              className="w-full py-4 rounded-2xl text-[16px] font-semibold text-white transition-all active:scale-[0.98]"
              style={{ backgroundColor: typeColor.main }}
            >
              ここに寄る
            </button>
            <button
              onClick={() => openUrl(`https://www.google.com/maps/search/${encodeURIComponent(typeLabel + ' ' + stationName)}`)}
              className="w-full py-3 text-[14px] text-[#86868B] transition-all active:opacity-60"
            >
              近くの別の{typeLabel}を探す
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== YORIMICHI GO (Map + Rating) ==========
  if (selectedYorimichi && showYorimichiGo) {
    const spot = selectedYorimichi;
    const mapQuery = encodeURIComponent(`${spot.name} ${spot.area}`);

    // 深津流: 完了画面はシンプルに
    if (showRating) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] p-6 flex items-center justify-center">
          <div className="max-w-lg mx-auto text-center">
            <div className={`transition-all duration-700 ease-out ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <h1 className="text-[28px] font-bold text-white mb-2">お疲れさまでした</h1>
              <p className="text-[15px] text-[#8E8E93] mb-8">
                {spot.name}はどうでしたか？
              </p>

              {!showMehReasons ? (
                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => {
                      Analytics.rating(spot.id, 'great');
                      reset();
                    }}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#34C759] text-white transition-all active:scale-[0.98]"
                  >
                    よかった
                  </button>
                  <button
                    onClick={() => {
                      Analytics.rating(spot.id, 'ok');
                      reset();
                    }}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#1C1C1E] text-[#8E8E93] transition-all active:scale-[0.98]"
                  >
                    ふつう
                  </button>
                  <button
                    onClick={() => setShowMehReasons(true)}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#1C1C1E] text-[#FF6B6B] transition-all active:scale-[0.98]"
                  >
                    いまいち
                  </button>
                </div>
              ) : (
                <div className="mb-8">
                  <p className="text-[13px] text-[#8E8E93] mb-4">何が合わなかった？</p>
                  <div className="grid grid-cols-2 gap-2">
                    {mehReasons.map((reason) => (
                      <button
                        key={reason.id}
                        onClick={() => {
                          Analytics.rating(spot.id, 'meh', reason.id);
                          reset();
                        }}
                        className="py-3 px-4 rounded-xl text-[14px] bg-[#1C1C1E] text-[#8E8E93] transition-all active:scale-[0.98]"
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowMehReasons(false)}
                    className="mt-4 text-[14px] text-[#636366] transition-all active:opacity-60"
                  >
                    ← 戻る
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0A0A0B]">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0A0A0B]/80 border-b border-[#1C1C1E]">
          <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => { setShowYorimichiGo(false); setAnimate(false); }}
              className="text-[17px] text-[#FF9500] font-medium transition-all duration-300 active:opacity-60"
            >
              ← 戻る
            </button>
            <span className="text-[15px] font-semibold text-white">{spot.name}</span>
            <div className="w-12" />
          </div>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Map */}
          <div className={`transition-all duration-500 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative bg-[#1C1C1E]" style={{ height: '300px' }}>
              <iframe
                title="map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed&z=16`}
              />
            </div>
          </div>

          {/* Quick Info */}
          <div className="px-6 py-6">
            <div className={`transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {/* Station Info */}
              <div className="p-4 rounded-2xl bg-[#1C1C1E] mb-4">
                <p className="text-[15px] font-semibold text-white">{spot.station}駅</p>
                <p className="text-[13px] text-[#636366]">{spot.line} · 徒歩{spot.walkFromStation}分</p>
              </div>

              {/* Open Map */}
              <button
                onClick={() => openUrl(`https://www.google.com/maps/search/?api=1&query=${mapQuery}`)}
                className="w-full py-4 rounded-2xl text-[17px] font-semibold text-white flex items-center justify-center gap-2 mb-4 transition-all duration-300 active:scale-[0.98]"
                style={{ backgroundColor: '#007AFF' }}
              >
                Google Mapsで開く
              </button>

              {/* Arrived Button */}
              <button
                onClick={() => { setShowRating(true); setAnimate(false); }}
                className="w-full py-4 rounded-2xl text-[17px] font-bold text-white transition-all duration-300 active:scale-[0.98]"
                style={{ backgroundColor: '#FF9500' }}
              >
                行ってきた
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== QUIZ ==========
  if (screen === 'quiz') {
    const q = questions[qIdx];
    const progress = ((qIdx + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-[#F2F2F7] p-6">
        <div className="max-w-lg mx-auto">
          {/* Back */}
          <button
            onClick={() => {
              setAnimate(false);
              if (qIdx > 0) {
                setAnswers(answers.slice(0, -1));
                setQIdx(qIdx - 1);
              } else {
                setScreen('weekend-select');
              }
            }}
            className="text-[15px] text-[#86868B] mb-4 pt-4 transition-all duration-300 active:opacity-60"
          >
            ← {qIdx > 0 ? '前の質問' : 'エリア選択に戻る'}
          </button>

          {/* Progress */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] font-medium text-[#86868B]">質問 {qIdx + 1}</span>
              <span className="text-[13px] text-[#86868B]">{qIdx + 1} / {questions.length}</span>
            </div>
            <div className="h-1 bg-[#E5E5EA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#007AFF] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 深津流: 質問に集中 */}
          <div className={`transition-all duration-500 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h2 className="text-[22px] font-bold text-[#1D1D1F] leading-tight mb-8">
              {q.question}
            </h2>

            {/* 深津流: シンプルな選択肢 */}
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answer(opt)}
                  className="w-full text-left p-4 bg-white rounded-2xl transition-all active:scale-[0.98]"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                >
                  <span className="text-[16px] text-[#1D1D1F]">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== RESULT ==========
  if (screen === 'result' && !selected) {
    const _type = userType ? typeInfo[userType] : null;
    const mainPlan = results && results.length > 0 ? results[0] : null;
    const otherPlans = results && results.length > 1 ? results.slice(1) : [];

    // 時間帯に応じたメッセージ
    const hour = new Date().getHours();
    const timeMessage = hour < 12 ? '午前中から楽しめる' : hour < 15 ? '午後からでも間に合う' : '今からでも行ける';

    return (
      <div className="min-h-screen bg-[#F2F2F7]">
        <div className="px-6 pb-24">
          <div className="max-w-lg mx-auto pt-12">

            {/* Back */}
            <button
              onClick={() => {
                setScreen('weekend-select');
                setQIdx(0);
                setAnswers([]);
                setUserType(null);
                setResults([]);
                setAnimate(false);
              }}
              className="text-[15px] text-[#86868B] mb-6 transition-all duration-300 active:opacity-60"
            >
              ← 別のエリアで探す
            </button>

            {/* 時間帯メッセージ */}
            <p className={`text-[14px] text-[#86868B] mb-6 transition-all duration-700 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
              {timeMessage}
            </p>

            {/* 深津流: メインプランをシンプルに */}
            {mainPlan && (
              <div className={`transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div
                  className="bg-white rounded-2xl overflow-hidden mb-6"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                >
                  <div className="p-6">
                    <p className="text-[12px] font-medium text-[#86868B] mb-3">おすすめ</p>

                    <h2 className="text-[22px] font-bold text-[#1D1D1F] leading-tight mb-2">
                      {mainPlan.title}
                    </h2>

                    {mainPlan.catchcopy && (
                      <p className="text-[15px] text-[#3D3D3D] leading-relaxed mb-4">
                        {mainPlan.catchcopy}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-[13px] text-[#86868B] mb-5">
                      <span>{mainPlan.area}</span>
                      <span>{mainPlan.duration}</span>
                      <span>{mainPlan.budget}</span>
                    </div>

                    <button
                      onClick={() => { setSelected(mainPlan); setAnimate(false); }}
                      className="w-full py-4 rounded-xl text-[16px] font-semibold text-white transition-all active:scale-[0.98]"
                      style={{ backgroundColor: '#007AFF' }}
                    >
                      詳細を見る
                    </button>
                  </div>
                </div>

                {/* 他の選択肢を見る */}
                {otherPlans.length > 0 && (
                  <div className="text-center">
                    {!showOthers ? (
                      <button
                        onClick={() => setShowOthers(true)}
                        className="text-[15px] text-[#86868B] py-3 transition-all duration-300 active:opacity-60"
                      >
                        他の選択肢を見る（{otherPlans.length}）
                      </button>
                    ) : (
                      <div className={`space-y-3 mt-2 transition-all duration-500 ease-out`}>
                        {otherPlans.map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => { setSelected(plan); setAnimate(false); }}
                            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl transition-all active:scale-[0.99] text-left"
                            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                          >
                            <div className="text-left">
                              <h3 className="text-[15px] font-semibold text-[#1D1D1F] mb-1">{plan.title}</h3>
                              <p className="text-[13px] text-[#86868B]">{plan.area} · {plan.duration}</p>
                            </div>
                            <span className="text-[#C7C7CC]">→</span>
                          </button>
                        ))}

                        <button
                          onClick={() => setShowOthers(false)}
                          className="text-[14px] text-[#86868B] py-2 transition-all duration-300 active:opacity-60"
                        >
                          閉じる
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* Reset */}
          <button
            onClick={reset}
            className="w-full mt-8 py-4 text-[17px] font-medium text-[#007AFF] transition-all duration-300 active:opacity-60"
          >
            もう一度診断する
          </button>
        </div>
      </div>
      </div>
    );
  }

  // ========== DETAIL ==========
  if (selected) {
    const plan = selected;

    // 全スポット完了チェック
    const allSpotsDone = plan.spots.every((_, i) => spotProgress[i] === 'done');

    // 深津流: 完了画面はシンプルに
    if (allSpotsDone && !showMap) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] p-6 flex items-center justify-center">
          <div className="max-w-lg mx-auto text-center">
            <div className={`transition-all duration-700 ease-out ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <h1 className="text-[28px] font-bold text-white mb-2">お疲れさまでした</h1>
              <p className="text-[15px] text-[#8E8E93] mb-8">
                {plan.title}を完走しました
              </p>

              <p className="text-[13px] text-[#636366] mb-4">今日のプランはどうでしたか？</p>

              {!showMehReasons ? (
                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => {
                      Analytics.rating(plan.id, 'great');
                      reset();
                    }}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#34C759] text-white transition-all active:scale-[0.98]"
                  >
                    よかった
                  </button>
                  <button
                    onClick={() => {
                      Analytics.rating(plan.id, 'ok');
                      reset();
                    }}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#1C1C1E] text-[#8E8E93] transition-all active:scale-[0.98]"
                  >
                    ふつう
                  </button>
                  <button
                    onClick={() => setShowMehReasons(true)}
                    className="w-full py-4 rounded-2xl text-[16px] font-semibold bg-[#1C1C1E] text-[#FF6B6B] transition-all active:scale-[0.98]"
                  >
                    いまいち
                  </button>
                </div>
              ) : (
                <div className="mb-8">
                  <p className="text-[13px] text-[#8E8E93] mb-4">何が合わなかった？</p>
                  <div className="grid grid-cols-2 gap-2">
                    {mehReasons.map((reason) => (
                      <button
                        key={reason.id}
                        onClick={() => {
                          Analytics.rating(plan.id, 'meh', reason.id);
                          reset();
                        }}
                        className="py-3 px-4 rounded-xl text-[14px] bg-[#1C1C1E] text-[#8E8E93] transition-all active:scale-[0.98]"
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowMehReasons(false)}
                    className="mt-4 text-[14px] text-[#636366] transition-all active:opacity-60"
                  >
                    ← 戻る
                  </button>
                </div>
              )}

              {/* 次のアクション */}
              {!showMehReasons && (
                <div className="pt-4 border-t border-[#2C2C2E]">
                  <p className="text-[13px] text-[#636366] mb-3">次の週末は？</p>
                  <button
                    onClick={reset}
                    className="text-[15px] text-[#FF9500] font-medium transition-all duration-300 active:opacity-60"
                  >
                    別のプランを探す →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F2F2F7]">
        {/* Map Bottom Sheet */}
        {renderMapSheet()}

        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#F2F2F7]/90">
          <div className="max-w-lg mx-auto px-6 py-4">
            <button
              onClick={() => { setSelected(null); setAnimate(false); }}
              className="text-[15px] text-[#86868B] transition-all duration-300 active:opacity-60"
            >
              ← 戻る
            </button>
          </div>
        </div>

        <div className="px-6 pb-24">
          <div className="max-w-lg mx-auto">

            {/* 深津流: 勝ち筋を最初に */}
            <div className={`pt-4 pb-8 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-[26px] font-bold text-[#1D1D1F] leading-tight mb-3">{plan.title}</h1>

              {plan.catchcopy && (
                <p className="text-[16px] text-[#3D3D3D] leading-relaxed mb-4">
                  {plan.catchcopy}
                </p>
              )}

              {/* 深津流: 必要最小限のメタ情報 */}
              <div className="flex flex-wrap gap-4 text-[14px] text-[#86868B]">
                <span>{plan.area}</span>
                <span>{plan.duration}</span>
                <span>{plan.budget}</span>
              </div>
            </div>

            {/* Spots - スクショで完走できるように情報充実 */}
            <div className={`mb-8 transition-all duration-700 delay-150 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <p className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-5">プランの流れ</p>
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {plan.spots.map((spot, i) => (
                  <div key={i}>
                    <div
                      onClick={() => { setShowMap({ spot, index: i }); setAnimate(false); }}
                      className="cursor-pointer transition-all duration-200 active:bg-[#F5F5F7]"
                    >
                      <div className="flex gap-4 p-5">
                        {/* 番号 + 完了状態 */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold text-white flex-shrink-0"
                          style={{ backgroundColor: getSpotStatus(i) === 'done' ? '#34C759' : plan.color }}
                        >
                          {getSpotStatus(i) === 'done' ? '✓' : i + 1}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-3 mb-1">
                            <p className="text-[16px] font-semibold text-[#1D1D1F]">{spot.label || spot.name}</p>
                            <span className="text-[13px] text-[#86868B] flex-shrink-0">{spot.time}</span>
                          </div>
                          {/* ミッション1行 */}
                          {spot.mission && (
                            <p className="text-[14px] text-[#1D1D1F] leading-relaxed mb-2">{spot.mission}</p>
                          )}
                          {/* 目的地（アンカー） */}
                          {spot.anchor && (
                            <div className="flex items-center gap-2 text-[13px] text-[#86868B]">
                              <span>📍 {spot.anchor.name}</span>
                              {spot.anchor.floor && <span className="bg-[#F2F2F7] px-1.5 py-0.5 rounded text-[11px]">{spot.anchor.floor}</span>}
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <svg className="w-5 h-5 text-[#C7C7CC] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    {/* 移動時間 */}
                    {i < plan.spots.length - 1 && (
                      <div className="flex items-center gap-2 px-5 py-2 bg-[#F8F8F8] border-t border-b border-[#F0F0F0]">
                        <span className="text-[12px] text-[#86868B]">↓ 施設内移動 or 徒歩5分</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 主CTA - このプランで行く */}
              <button
                onClick={() => {
                  Analytics.startPlan(plan.id, plan.title);
                  setShowMap({ spot: plan.spots[0], index: 0 });
                  setAnimate(false);
                }}
                className="w-full mt-5 py-4 rounded-xl text-[16px] font-semibold text-white transition-all duration-300 active:scale-[0.98]"
                style={{ backgroundColor: plan.color }}
              >
                このプランで行く（まずは①へ）
              </button>
            </div>

            {/* Tip - 成功のコツに寄せる */}
            {plan.tip && (
              <div className={`mb-8 p-5 bg-[#FFF8E7] rounded-2xl transition-all duration-700 delay-200 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-[14px] text-[#1D1D1F] leading-relaxed">
                  <span className="font-medium">💡 成功のコツ:</span> {plan.tip}
                </p>
              </div>
            )}

            {/* もっと知る - アコーディオンで隠す */}
            <details className={`mb-10 transition-all duration-700 delay-250 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
              <summary className="text-[14px] text-[#86868B] cursor-pointer list-none">
                もっと見る（SNS投稿）
              </summary>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => openUrl(`https://www.instagram.com/explore/tags/${plan.hashtag.replace(/\s/g, '')}/`)}
                  className="flex-1 py-3 bg-white rounded-xl text-[14px] font-medium text-[#1D1D1F] transition-all duration-300 active:scale-[0.98]"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  📷 Instagram
                </button>
                <button
                  onClick={() => openUrl(`https://www.tiktok.com/search?q=${encodeURIComponent(plan.hashtag)}`)}
                  className="flex-1 py-3 bg-white rounded-xl text-[14px] font-medium text-[#1D1D1F] transition-all duration-300 active:scale-[0.98]"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  🎵 TikTok
                </button>
              </div>
            </details>
          </div>
        </div>

        {/* 固定CTA - 行動を強く促す */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#F0F0F0] px-6 py-4 z-20">
          <div className="max-w-lg mx-auto flex gap-3">
            <button
              onClick={() => openUrl(`https://www.google.com/maps/search/${encodeURIComponent(plan.title + ' ' + plan.area)}`)}
              className="flex-1 py-4 bg-[#F5F5F7] rounded-xl text-[15px] font-semibold text-[#1D1D1F] transition-all duration-300 active:scale-[0.98]"
            >
              📍 地図
            </button>
            <button
              onClick={() => {
                const text = `今週末、${plan.title}行かない？ ${plan.emoji}\n\n📍 ${plan.area}\n⏱ ${plan.duration}\n💰 ${plan.budget}`;
                openUrl(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`);
              }}
              className="flex-[2] py-4 rounded-xl text-[15px] font-semibold text-white transition-all duration-300 active:scale-[0.98]"
              style={{ backgroundColor: '#06C755' }}
            >
              友達をLINEで誘う
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
