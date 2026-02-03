export const questions = [
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

export const typeInfo = {
  explorer: { name: "発見だいすきタイプ", emoji: "🧭", color: "#007AFF" },
  chill: { name: "まったりタイプ", emoji: "🛋️", color: "#34C759" },
  gourmet: { name: "食いしん坊タイプ", emoji: "🍽️", color: "#FF9500" },
  active: { name: "アクティブタイプ", emoji: "⚡", color: "#FF3B30" },
  creative: { name: "感性みがきタイプ", emoji: "🎨", color: "#AF52DE" },
  culture: { name: "知的好奇心タイプ", emoji: "📚", color: "#5856D6" },
  healing: { name: "いやされたいタイプ", emoji: "🌿", color: "#30D158" },
  adventure: { name: "冒険タイプ", emoji: "🎲", color: "#FF9F0A" }
};

export const plans = [
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
