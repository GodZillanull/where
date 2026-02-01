import React, { useState, useEffect } from 'react';

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
    spots: [
      { name: "東京都現代美術館", note: "朝イチが空いてる", emoji: "🖼️", time: "90分" },
      { name: "ブルーボトルコーヒー", note: "ここが発祥の地！", emoji: "☕", time: "45分" },
      { name: "fukadaso cafe", note: "古アパートリノベ", emoji: "🏠", time: "45分" }
    ],
    tip: "企画展は事前チェックしてね"
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
    spots: [
      { name: "谷中銀座商店街", note: "食べ歩き天国", emoji: "🛒", time: "90分" },
      { name: "肉のすずき", note: "メンチカツ必食！", emoji: "🥩", time: "15分" },
      { name: "夕やけだんだん", note: "夕日スポット", emoji: "🌅", time: "30分" }
    ],
    tip: "土日は早めの時間がいいよ"
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
    spots: [
      { name: "高尾山口駅", note: "ここからスタート", emoji: "🚉", time: "—" },
      { name: "山頂", note: "富士山見えるかも", emoji: "🗻", time: "3時間" },
      { name: "極楽湯", note: "下山後の温泉最高", emoji: "♨️", time: "90分" }
    ],
    tip: "スニーカーでOK！"
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
    spots: [
      { name: "カキモリ", note: "自分だけのノート", emoji: "📓", time: "60分" },
      { name: "ダンデライオン", note: "ホットチョコ！", emoji: "🍫", time: "45分" },
      { name: "Nui. HOSTEL", note: "倉庫リノベカフェ", emoji: "🏭", time: "60分" }
    ],
    tip: "カキモリは予約してね"
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
    spots: [
      { name: "蔦屋書店", note: "本の森みたい", emoji: "📖", time: "90分" },
      { name: "併設スタバ", note: "本持ち込みOK", emoji: "☕", time: "45分" },
      { name: "LOG ROAD", note: "線路跡の散歩道", emoji: "🚶", time: "30分" }
    ],
    tip: "土日午後は混むよ"
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
    spots: [
      { name: "旧ヤム邸", note: "カレーの名店", emoji: "🍛", time: "60分" },
      { name: "古着屋街", note: "100軒以上！", emoji: "👕", time: "120分" },
      { name: "CITY COUNTRY CITY", note: "レコードカフェ", emoji: "🎵", time: "45分" }
    ],
    tip: "古着は土曜午前がベスト"
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
    spots: [
      { name: "チームラボプラネッツ", note: "要予約！", emoji: "✨", time: "2時間" },
      { name: "豊洲市場", note: "〆は寿司", emoji: "🍣", time: "60分" }
    ],
    tip: "膝まで水入る。服装注意"
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
    spots: [
      { name: "ル・ブルターニュ", note: "ガレット最高", emoji: "🥞", time: "60分" },
      { name: "兵庫横丁", note: "石畳の路地", emoji: "🌙", time: "30分" },
      { name: "隠れ家バー", note: "気になった店へ", emoji: "🍸", time: "60分" }
    ],
    tip: "ヒールはやめとこ"
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
    spots: [
      { name: "赤レンガ倉庫", note: "海見ながら歩く", emoji: "🧱", time: "60分" },
      { name: "山下公園", note: "ベンチで休憩", emoji: "🌳", time: "30分" },
      { name: "中華街", note: "食べ歩き！", emoji: "🥟", time: "90分" }
    ],
    tip: "中華街は現金あると安心"
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
    spots: [
      { name: "野毛小路", note: "昼飲みの聖地", emoji: "🏮", time: "90分" },
      { name: "ぴおシティ地下", note: "レトロ飲み屋街", emoji: "🍶", time: "60分" },
      { name: "伊勢佐木モール", note: "帰りに散歩", emoji: "🚶", time: "30分" }
    ],
    tip: "現金5,000円あると安心"
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
    spots: [
      { name: "江ノ島", note: "登らなくてもOK", emoji: "🏝️", time: "90分" },
      { name: "七里ヶ浜", note: "ただ海を見る", emoji: "🌅", time: "60分" },
      { name: "bills", note: "パンケーキ！", emoji: "🥞", time: "60分" }
    ],
    tip: "晴れの日限定プラン"
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
    spots: [
      { name: "鶴岡八幡宮", note: "まずは参拝", emoji: "⛩️", time: "45分" },
      { name: "小町通り", note: "食べ歩き天国", emoji: "🍡", time: "90分" },
      { name: "由比ヶ浜", note: "江ノ電で海へ", emoji: "🚃", time: "60分" }
    ],
    tip: "土日は早めに出発！"
  },
  {
    id: 13,
    title: "ロマンスカーミュージアムで鉄道体験",
    types: ["culture", "chill", "explorer"],
    area: "海老名",
    region: "kanagawa",
    budget: "1,500円",
    duration: "3〜4時間",
    vibe: "展示 → 体験 → 余韻カフェ",
    emoji: "🚃",
    color: "#E74C3C",
    hashtag: "ロマンスカーミュージアム",
    spots: [
      { name: "車両展示エリア", note: "歴代ロマンスカーが並ぶ", emoji: "🚃", time: "60分" },
      { name: "ジオラマ＆シアター", note: "巨大ジオラマ必見", emoji: "🎬", time: "40分" },
      { name: "シミュレータ系", note: "余裕あれば体験", emoji: "🎮", time: "30分" },
      { name: "駅周辺カフェ", note: "余韻でコーヒー", emoji: "☕", time: "40分" }
    ],
    tip: "火曜休館。展示だけでも十分成立する"
  },
  {
    id: 14,
    title: "シリウスで建築×本×静けさ",
    types: ["culture", "chill", "creative"],
    area: "大和",
    region: "kanagawa",
    budget: "500円",
    duration: "3〜4時間",
    vibe: "建築 → 本 → 静かに整う",
    emoji: "📖",
    color: "#5856D6",
    hashtag: "大和市シリウス",
    spots: [
      { name: "シリウス館内", note: "建築自体が見どころ", emoji: "🏛️", time: "30分" },
      { name: "図書館フロア", note: "本の森を回遊", emoji: "📚", time: "90分" },
      { name: "企画展示", note: "今日の1枚を決める", emoji: "🖼️", time: "20分" },
      { name: "近場のカフェ", note: "読んだ本のメモ3行", emoji: "☕", time: "40分" }
    ],
    tip: "休日は学習席混むがラウンジは空いてる"
  },
  {
    id: 15,
    title: "ビナウォークで当日イベント発見",
    types: ["adventure", "gourmet", "explorer"],
    area: "海老名",
    region: "kanagawa",
    budget: "3,000円",
    duration: "3〜4時間",
    vibe: "イベント発見 → うまいもの → 余韻",
    emoji: "🎪",
    color: "#FF9500",
    hashtag: "ビナウォーク",
    spots: [
      { name: "イベント/ワークショップ", note: "現地で選ぶ！", emoji: "🎯", time: "60分" },
      { name: "うまいもの1発", note: "予算内でガツンと", emoji: "🍜", time: "60分" },
      { name: "余韻スポット", note: "屋内で気ままに", emoji: "🚶", time: "60分" }
    ],
    tip: "当日朝に公式でイベント確認！当たればデカい"
  }
];

// ===== MAIN APP =====
export default function Detour() {
  // 共通state
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState(null); // 'weekend' or 'yorimichi'
  const [animate, setAnimate] = useState(false);

  // 週末プラン用state
  const [region, setRegion] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [userType, setUserType] = useState(null);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showMap, setShowMap] = useState(false);

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

  useEffect(() => {
    setAnimate(true);
  }, [screen, qIdx, selected, showMap, selectedYorimichi, showYorimichiGo, showRating]);

  // ===== 週末プラン用ロジック =====
  const calcType = (ans) => {
    const s = {};
    ans.forEach(a => a.types.forEach(t => s[t] = (s[t] || 0) + 1));
    return Object.entries(s).sort((a, b) => b[1] - a[1])[0][0];
  };

  const getPlans = (type, reg) => {
    const match = plans.filter(p => p.region === reg && p.types.includes(type));
    const other = plans.filter(p => p.region === reg && !p.types.includes(type));
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
    const { time, range, zure, ngQueue, ngNoisy, ngCash } = yorimichiInput;

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
    setYorimichiResults([]);
    setSelectedYorimichi(null);
    setShowYorimichiGo(false);
    setShowRating(false);
    setYorimichiInput({
      time: 60, range: 'walk', zure: 'safe',
      ngQueue: false, ngNoisy: false, ngReserve: false, ngCash: false
    });
  };

  const openUrl = (url) => window.open(url, '_blank');

  // ========== MAP BOTTOM SHEET (オーバーレイ) ==========
  const renderMapSheet = () => {
    if (!selected || !showMap) return null;

    const plan = selected;
    const currentSpot = showMap.spot;
    const currentIndex = showMap.index;
    const mapQuery = encodeURIComponent(currentSpot.name);

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
          style={{ maxHeight: '85vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-[#E5E5EA] rounded-full" />
          </div>

          {/* Spot Switcher */}
          {plan.spots.length > 1 && (
            <div className="flex gap-2 px-6 pb-4 overflow-x-auto">
              {plan.spots.map((spot, i) => (
                <button
                  key={i}
                  onClick={() => setShowMap({ spot, index: i })}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-200 ${
                    i === currentIndex
                      ? 'text-white'
                      : 'bg-[#F2F2F7] text-[#1D1D1F]'
                  }`}
                  style={i === currentIndex ? { backgroundColor: plan.color } : {}}
                >
                  {i + 1}. {spot.name.length > 6 ? spot.name.slice(0, 6) + '…' : spot.name}
                </button>
              ))}
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
            <h2 className="text-[20px] font-bold text-[#1D1D1F] mb-1">{currentSpot.name}</h2>
            <p className="text-[15px] text-[#86868B] mb-4">{currentSpot.note}</p>

            <div className="flex gap-3">
              <button
                onClick={() => openUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentSpot.name)}`)}
                className="flex-1 py-3.5 rounded-xl text-[15px] font-semibold text-white transition-all duration-200 active:scale-[0.98]"
                style={{ backgroundColor: '#007AFF' }}
              >
                Google Mapsで開く
              </button>
              <button
                onClick={() => openUrl(`https://www.instagram.com/explore/tags/${encodeURIComponent(currentSpot.name.replace(/[\s\.・]/g, ''))}/`)}
                className="px-4 py-3.5 rounded-xl text-[15px] font-medium text-[#1D1D1F] bg-[#F2F2F7] transition-all duration-200 active:scale-[0.98]"
              >
                写真
              </button>
            </div>
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
            <h1 className="text-[36px] font-bold tracking-tight text-white">
              where
            </h1>
          </div>

          {/* Mode Select */}
          <div className={`space-y-4 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* 寄り道カード */}
            <button
              onClick={() => { setMode('yorimichi'); setScreen('yorimichi-input'); setAnimate(false); }}
              className="w-full text-left p-6 rounded-3xl transition-all duration-300 ease-out active:scale-[0.98] relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🌙</span>
                </div>
                <h2 className="text-[22px] font-bold text-white mb-2">帰り道に寄る</h2>
                <p className="text-[14px] text-[#8E8E93] leading-relaxed mb-4">
                  1時間くらい、どこかに寄って帰る
                </p>
                <div className="flex flex-wrap gap-2">
                  {['カフェ', '書店', '銭湯', 'ギャラリー'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-[12px] text-[#636366] bg-[#2C2C2E]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>

            {/* 週末プランカード */}
            <button
              onClick={() => { setMode('weekend'); setScreen('weekend-select'); setAnimate(false); }}
              className="w-full text-left p-6 rounded-3xl transition-all duration-300 ease-out active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🗺️</span>
              </div>
              <h2 className="text-[22px] font-bold text-white mb-2">週末の予定を決める</h2>
              <p className="text-[14px] text-[#8E8E93] leading-relaxed">
                5つの質問で、あなたに合う場所を提案
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

          {/* Header */}
          <div className={`text-center mb-10 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-5xl mb-4">🗺️</div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-2">
              週末どこいく？
            </h1>
            <p className="text-[15px] text-[#86868B] leading-relaxed">
              いつもの休日を、ちょっと変えてみない？
            </p>
          </div>

          {/* Area Select */}
          <div className={`space-y-3 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[13px] font-medium text-[#86868B] uppercase tracking-wide px-1 mb-4">
              エリアを選択
            </p>
            {[
              { id: 'tokyo', label: '東京', emoji: '🗼', sub: '8つのプラン' },
              { id: 'kanagawa', label: '神奈川', emoji: '🌊', sub: '7つのプラン' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => { setRegion(r.id); setScreen('quiz'); setAnimate(false); }}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl transition-all duration-300 ease-out active:scale-[0.98] hover:bg-[#F5F5F7]"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
              >
                <div className="w-12 h-12 rounded-full bg-[#F2F2F7] flex items-center justify-center text-2xl">
                  {r.emoji}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[17px] font-semibold text-[#1D1D1F]">{r.label}</p>
                  <p className="text-[15px] text-[#86868B]">{r.sub}</p>
                </div>
                <svg className="w-5 h-5 text-[#C7C7CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
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
      <div className="min-h-screen bg-[#0A0A0B] p-6">
        <div className="max-w-lg mx-auto pt-4">
          {/* Back */}
          <button
            onClick={() => { setScreen('home'); setAnimate(false); }}
            className="text-[17px] text-[#FF9500] font-medium mb-6 transition-all duration-300 active:opacity-60"
          >
            ← 戻る
          </button>

          {/* Header */}
          <div className={`mb-8 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-[24px] font-bold text-white">どこに寄る？</h1>
          </div>

          {/* Time Selection */}
          <div className={`mb-6 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[13px] font-medium text-[#8E8E93] mb-3">使える時間</p>
            <div className="flex gap-2">
              {[
                { value: 60, label: '60分' },
                { value: 90, label: '90分' },
                { value: 120, label: '120分' }
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setYorimichiInput(prev => ({ ...prev, time: t.value }))}
                  className={`flex-1 py-3 rounded-xl text-[15px] font-semibold transition-all duration-300 ${
                    yorimichiInput.time === t.value
                      ? 'bg-[#FF9500] text-white'
                      : 'bg-[#1C1C1E] text-[#8E8E93]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zure Level */}
          <div className={`mb-6 transition-all duration-700 delay-150 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[13px] font-medium text-[#8E8E93] mb-3">どこまで行く？</p>
            <div className="space-y-2">
              {Object.entries(yorimichi.zure).map(([key, z]) => (
                <button
                  key={key}
                  onClick={() => setYorimichiInput(prev => ({ ...prev, zure: key }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    yorimichiInput.zure === key
                      ? 'ring-2'
                      : 'bg-[#1C1C1E]'
                  }`}
                  style={{
                    backgroundColor: yorimichiInput.zure === key ? `${z.color}15` : undefined,
                    ringColor: yorimichiInput.zure === key ? z.color : undefined
                  }}
                >
                  <span className="text-2xl">{z.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className={`text-[16px] font-semibold ${yorimichiInput.zure === key ? 'text-white' : 'text-[#8E8E93]'}`}>
                      {z.name}
                    </p>
                    <p className="text-[13px] text-[#636366]">{z.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* NG Filters */}
          <div className={`mb-8 transition-all duration-700 delay-200 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[13px] font-medium text-[#8E8E93] mb-3">避けたい</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'ngQueue', label: '行列' },
                { key: 'ngNoisy', label: 'うるさい' },
                { key: 'ngCash', label: '現金のみ' }
              ].map((ng) => (
                <button
                  key={ng.key}
                  onClick={() => setYorimichiInput(prev => ({ ...prev, [ng.key]: !prev[ng.key] }))}
                  className={`px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-300 ${
                    yorimichiInput[ng.key]
                      ? 'bg-[#FF3B30] text-white'
                      : 'bg-[#1C1C1E] text-[#8E8E93]'
                  }`}
                >
                  {ng.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={submitYorimichi}
            className={`w-full py-4 rounded-2xl text-[17px] font-bold text-white transition-all duration-500 delay-250 ease-out active:scale-[0.98] ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ backgroundColor: '#FF9500' }}
          >
            探す
          </button>
        </div>
      </div>
    );
  }

  // ========== YORIMICHI RESULT (3択) ==========
  if (screen === 'yorimichi-result' && !selectedYorimichi) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] p-6">
        <div className="max-w-lg mx-auto pt-4">
          {/* Back */}
          <button
            onClick={() => { setScreen('yorimichi-input'); setAnimate(false); }}
            className="text-[17px] text-[#FF9500] font-medium mb-6 transition-all duration-300 active:opacity-60"
          >
            ← 条件を変える
          </button>

          {/* Header */}
          <div className={`mb-6 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-[22px] font-bold text-white">3つの候補</h1>
          </div>

          {/* 3 Cards */}
          <div className={`space-y-3 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {yorimichiResults.map((spot) => {
              const zureInfo = yorimichi.zure[spot.zure];
              return (
                <button
                  key={spot.id}
                  onClick={() => { setSelectedYorimichi(spot); setAnimate(false); }}
                  className="w-full text-left p-5 rounded-2xl transition-all duration-300 ease-out active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${zureInfo.color}15 0%, #1C1C1E 100%)`,
                    border: `1px solid ${zureInfo.color}30`
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: `${zureInfo.color}20` }}
                    >
                      {spot.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{ backgroundColor: zureInfo.color, color: 'white' }}
                        >
                          {zureInfo.name}
                        </span>
                      </div>
                      <h3 className="text-[17px] font-semibold text-white mb-1">{spot.name}</h3>
                      <p className="text-[14px] text-[#8E8E93] mb-2">{spot.highlight}</p>
                      <div className="flex flex-wrap gap-2 text-[12px] text-[#636366]">
                        <span>📍 {spot.area}</span>
                        <span>·</span>
                        <span>🚶 {spot.walkFromStation}分</span>
                        <span>·</span>
                        <span>⏱ {spot.stayTime}分</span>
                        <span>·</span>
                        <span>💰 {spot.budget}</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-[#48484A] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Refresh */}
          <button
            onClick={() => {
              const newSpots = getYorimichiSpots();
              setYorimichiResults(newSpots);
              setAnimate(false);
              setTimeout(() => setAnimate(true), 50);
            }}
            className="w-full mt-6 py-3 text-[15px] font-medium text-[#FF9500] transition-all duration-300 active:opacity-60"
          >
            🔄 別の候補を見る
          </button>
        </div>
      </div>
    );
  }

  // ========== YORIMICHI DETAIL ==========
  if (selectedYorimichi && !showYorimichiGo) {
    const spot = selectedYorimichi;
    const zureInfo = yorimichi.zure[spot.zure];
    const totalTime = spot.walkFromStation + spot.stayTime;

    // 現在時刻から営業状況を判定（簡易版）
    const now = new Date();
    const currentHour = now.getHours();
    const isLikelyOpen = currentHour >= 10 && currentHour < 21;

    return (
      <div className="min-h-screen bg-[#0A0A0B]">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0A0A0B]/80 border-b border-[#1C1C1E]">
          <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => { setSelectedYorimichi(null); setAnimate(false); }}
              className="text-[17px] text-[#FF9500] font-medium transition-all duration-300 active:opacity-60"
            >
              ← 戻る
            </button>
          </div>
        </div>

        <div className="px-6 pb-8">
          <div className="max-w-lg mx-auto">
            {/* Hero: 店名 + なぜここ？ */}
            <div className={`py-6 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-2.5 py-1 rounded-full text-[12px] font-semibold"
                  style={{ backgroundColor: zureInfo.color, color: 'white' }}
                >
                  {zureInfo.emoji} {zureInfo.name}
                </span>
                <span className="text-2xl">{spot.emoji}</span>
              </div>
              <h1 className="text-[28px] font-bold text-white mb-3">{spot.name}</h1>
              <p className="text-[16px] text-white leading-relaxed mb-4">{spot.reason}</p>

              {/* SNSで雰囲気チェック */}
              <div className="flex gap-2">
                <button
                  onClick={() => openUrl(`https://www.tiktok.com/search?q=${encodeURIComponent(spot.name)}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1C1C1E] text-[14px] font-medium text-white transition-all duration-300 active:scale-[0.98] hover:bg-[#2C2C2E]"
                >
                  <span>📹</span> TikTokで見る
                </button>
                <button
                  onClick={() => openUrl(`https://www.instagram.com/explore/tags/${encodeURIComponent(spot.name.replace(/[\s\.・]/g, ''))}/`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1C1C1E] text-[14px] font-medium text-white transition-all duration-300 active:scale-[0.98] hover:bg-[#2C2C2E]"
                >
                  <span>📸</span> Instagramで見る
                </button>
              </div>
            </div>

            {/* 今行ける？（最重要情報） */}
            <div className={`p-4 rounded-2xl bg-[#1C1C1E] mb-4 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isLikelyOpen ? 'bg-[#34C759]' : 'bg-[#FF9500]'}`} />
                  <div>
                    <p className="text-[15px] font-semibold text-white">
                      {isLikelyOpen ? '営業中' : '要確認'}
                    </p>
                    <p className="text-[13px] text-[#8E8E93]">{spot.hours}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[13px] text-[#8E8E93]">駅から</p>
                  <p className="text-[20px] font-bold text-white">{spot.walkFromStation}<span className="text-[14px]">分</span></p>
                </div>
              </div>
            </div>

            {/* クイック情報 */}
            <div className={`flex gap-2 mb-4 transition-all duration-700 delay-150 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex-1 p-3 rounded-xl bg-[#1C1C1E] text-center">
                <p className="text-[12px] text-[#8E8E93] mb-1">予算</p>
                <p className="text-[15px] font-semibold text-white">{spot.budget}</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-[#1C1C1E] text-center">
                <p className="text-[12px] text-[#8E8E93] mb-1">滞在目安</p>
                <p className="text-[15px] font-semibold text-white">{spot.stayTime}分</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-[#1C1C1E] text-center">
                <p className="text-[12px] text-[#8E8E93] mb-1">合計</p>
                <p className="text-[15px] font-semibold" style={{ color: zureInfo.color }}>{totalTime}分</p>
              </div>
            </div>

            {/* アクセス */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl bg-[#1C1C1E] mb-4 transition-all duration-700 delay-200 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <span className="text-xl">🚉</span>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-white">{spot.station}</p>
                <p className="text-[13px] text-[#8E8E93]">{spot.line}</p>
              </div>
              {spot.cashOnly && (
                <span className="px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#FF3B3020] text-[#FF3B30]">
                  現金のみ
                </span>
              )}
            </div>

            {/* 撤退条件 */}
            <div className={`p-4 rounded-2xl mb-6 transition-all duration-700 delay-250 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ backgroundColor: '#FF950010', border: '1px solid #FF950030' }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">↩️</span>
                <div>
                  <p className="text-[14px] font-medium text-[#FF9500] mb-1">混んでたら</p>
                  <p className="text-[15px] text-white">{spot.backup}</p>
                </div>
              </div>
            </div>

            {/* GO Button */}
            <button
              onClick={() => { setShowYorimichiGo(true); setAnimate(false); }}
              className={`w-full py-4 rounded-2xl text-[17px] font-bold text-white transition-all duration-500 delay-300 ease-out active:scale-[0.98] ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ backgroundColor: '#FF9500' }}
            >
              ここに行く
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

    if (showRating) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] p-6 flex items-center justify-center">
          <div className="max-w-lg mx-auto text-center">
            <div className={`transition-all duration-700 ease-out ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <h1 className="text-[24px] font-bold text-white mb-8">どうだった？</h1>

              <div className="space-y-3 mb-8">
                <button
                  onClick={() => {
                    reset();
                  }}
                  className="w-full py-4 rounded-2xl text-[17px] font-semibold bg-[#34C759] text-white transition-all duration-300 active:scale-[0.98]"
                >
                  よかった
                </button>
                <button
                  onClick={() => {
                    reset();
                  }}
                  className="w-full py-4 rounded-2xl text-[17px] font-semibold bg-[#1C1C1E] text-[#8E8E93] transition-all duration-300 active:scale-[0.98]"
                >
                  いまいち
                </button>
              </div>

              <button
                onClick={reset}
                className="text-[15px] text-[#636366] transition-all duration-300 active:opacity-60"
              >
                スキップ
              </button>
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
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1C1C1E] mb-4">
                <span className="text-2xl">🚉</span>
                <div>
                  <p className="text-[15px] font-semibold text-white">{spot.station}</p>
                  <p className="text-[13px] text-[#636366]">{spot.line} → 徒歩{spot.walkFromStation}分</p>
                </div>
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
          {/* Progress */}
          <div className="mb-12 pt-4">
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

          {/* Question */}
          <div className={`transition-all duration-500 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="text-center mb-10">
              <span className="text-5xl mb-6 block">{q.emoji}</span>
              <h2 className="text-[22px] font-bold text-[#1D1D1F] leading-tight">
                {q.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answer(opt)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl transition-all duration-300 ease-out active:scale-[0.98] hover:bg-[#F5F5F7]"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="flex-1 text-left text-[17px] font-medium text-[#1D1D1F]">{opt.text}</span>
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
    const type = typeInfo[userType];

    return (
      <div className="min-h-screen bg-[#F2F2F7] p-6">
        <div className="max-w-lg mx-auto pt-8">
          {/* Type Result */}
          <div className={`text-center mb-10 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 text-4xl"
              style={{ backgroundColor: `${type.color}15` }}
            >
              {type.emoji}
            </div>
            <p className="text-[13px] text-[#86868B] mb-2">あなたは</p>
            <h2 className="text-[28px] font-bold text-[#1D1D1F]">
              {type.name}
            </h2>
          </div>

          {/* Plans */}
          <div className={`transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[13px] font-medium text-[#86868B] uppercase tracking-wide px-1 mb-4">
              おすすめプラン
            </p>
            <div className="space-y-3">
              {results.map((plan, i) => (
                <button
                  key={plan.id}
                  onClick={() => { setSelected(plan); setAnimate(false); }}
                  className="w-full text-left bg-white rounded-2xl overflow-hidden transition-all duration-300 ease-out active:scale-[0.98] hover:bg-[#F5F5F7]"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: `${plan.color}15` }}
                      >
                        {plan.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        {i === 0 && (
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold mb-2 text-white"
                            style={{ backgroundColor: plan.color }}
                          >
                            おすすめ
                          </span>
                        )}
                        <h3 className="text-[17px] font-semibold text-[#1D1D1F] mb-1">{plan.title}</h3>
                        <p className="text-[15px] text-[#86868B] mb-2">{plan.vibe}</p>
                        <div className="flex flex-wrap gap-3 text-[13px] text-[#86868B]">
                          <span>{plan.area}</span>
                          <span>·</span>
                          <span>{plan.duration}</span>
                          <span>·</span>
                          <span>{plan.budget}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={reset}
            className="w-full mt-8 py-4 text-[17px] font-medium text-[#007AFF] transition-all duration-300 active:opacity-60"
          >
            もう一度診断する
          </button>
        </div>
      </div>
    );
  }

  // ========== DETAIL ==========
  if (selected) {
    const plan = selected;

    return (
      <div className="min-h-screen bg-[#F2F2F7]">
        {/* Map Bottom Sheet */}
        {renderMapSheet()}
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#F2F2F7]/80 border-b border-[#C6C6C8]/30">
          <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => { setSelected(null); setAnimate(false); }}
              className="text-[17px] text-[#007AFF] font-medium transition-all duration-300 active:opacity-60"
            >
              ← 戻る
            </button>
            <button
              onClick={() => {
                const text = `今週末、${plan.title}行かない？ ${plan.emoji}\n\n📍 ${plan.area}\n⏱ ${plan.duration}\n💰 ${plan.budget}`;
                openUrl(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`);
              }}
              className="px-4 py-2 rounded-full text-[15px] font-semibold text-white transition-all duration-300 active:scale-95"
              style={{ backgroundColor: '#06C755' }}
            >
              LINEで誘う
            </button>
          </div>
        </div>

        <div className="px-6 pb-12">
          <div className="max-w-lg mx-auto">
            {/* Title */}
            <div className={`text-center py-10 transition-all duration-700 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 text-4xl"
                style={{ backgroundColor: `${plan.color}15` }}
              >
                {plan.emoji}
              </div>
              <h1 className="text-[28px] font-bold text-[#1D1D1F] mb-2">{plan.title}</h1>
              <p className="text-[17px] text-[#86868B]">{plan.vibe}</p>
            </div>

            {/* Info Pills */}
            <div className={`flex justify-center gap-2 mb-8 transition-all duration-700 delay-100 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
              {[
                { icon: '📍', text: plan.area },
                { icon: '⏱', text: plan.duration },
                { icon: '💰', text: plan.budget }
              ].map((item, i) => (
                <span key={i} className="px-3 py-1.5 bg-white rounded-full text-[13px] text-[#1D1D1F]" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                  {item.icon} {item.text}
                </span>
              ))}
            </div>

            {/* SNS */}
            <div className={`mb-8 transition-all duration-700 delay-150 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <p className="text-[13px] font-medium text-[#86868B] uppercase tracking-wide px-1 mb-3">
                みんなの投稿をチェック
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => openUrl(`https://www.instagram.com/explore/tags/${plan.hashtag.replace(/\s/g, '')}/`)}
                  className="flex-1 py-3.5 bg-white rounded-xl text-[15px] font-medium text-[#1D1D1F] transition-all duration-300 active:scale-[0.98]"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                >
                  Instagram
                </button>
                <button
                  onClick={() => openUrl(`https://www.tiktok.com/search?q=${encodeURIComponent(plan.hashtag)}`)}
                  className="flex-1 py-3.5 bg-white rounded-xl text-[15px] font-medium text-[#1D1D1F] transition-all duration-300 active:scale-[0.98]"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                >
                  TikTok
                </button>
              </div>
            </div>

            {/* Spots - Timeline (カードタップで地図表示) */}
            <div className={`mb-8 transition-all duration-700 delay-200 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <p className="text-[13px] font-medium text-[#86868B] uppercase tracking-wide px-1 mb-3">
                立ち寄りスポット<span className="font-normal ml-2">タップで地図</span>
              </p>
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                {plan.spots.map((spot, i) => (
                  <div
                    key={i}
                    onClick={() => { setShowMap({ spot, index: i }); setAnimate(false); }}
                    className={`relative cursor-pointer transition-all duration-200 active:bg-[#F2F2F7] ${i !== plan.spots.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                          style={{ backgroundColor: plan.color }}
                        >
                          {i + 1}
                        </div>
                        {i !== plan.spots.length - 1 && (
                          <div className="w-0.5 flex-1 mt-2 rounded-full" style={{ backgroundColor: `${plan.color}30`, minHeight: '24px' }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-[17px] font-semibold text-[#1D1D1F]">{spot.name}</p>
                          <span className="text-[13px] text-[#86868B] bg-[#F2F2F7] px-2 py-0.5 rounded-full flex-shrink-0">
                            {spot.time}
                          </span>
                        </div>
                        <p className="text-[15px] text-[#86868B] mb-2">{spot.note}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); openUrl(`https://www.instagram.com/explore/tags/${encodeURIComponent(spot.name.replace(/[\s\.・]/g, ''))}/`); }}
                          className="text-[13px] text-[#007AFF] transition-all duration-200 active:opacity-60"
                        >
                          Instagramで見る →
                        </button>
                      </div>

                      {/* Arrow */}
                      <svg className="w-5 h-5 text-[#C7C7CC] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip */}
            {plan.tip && (
              <div className={`p-4 bg-[#FFF9E6] rounded-2xl mb-8 transition-all duration-700 delay-250 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-[15px] text-[#1D1D1F]">
                  <span className="mr-2">💡</span>{plan.tip}
                </p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => {
                const text = `今週末、${plan.title}行かない？ ${plan.emoji}\n\n📍 ${plan.area}\n⏱ ${plan.duration}\n💰 ${plan.budget}`;
                openUrl(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`);
              }}
              className={`w-full py-4 rounded-2xl text-[17px] font-semibold text-white transition-all duration-500 delay-300 ease-out active:scale-[0.98] ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
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
