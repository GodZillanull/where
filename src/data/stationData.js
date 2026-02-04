// 東京都・神奈川県の主要駅名データ（読みがな付き）
export const stations = [
  // === 東京都 JR山手線 ===
  { name: "東京", kana: "とうきょう" },
  { name: "有楽町", kana: "ゆうらくちょう" },
  { name: "新橋", kana: "しんばし" },
  { name: "浜松町", kana: "はままつちょう" },
  { name: "田町", kana: "たまち" },
  { name: "品川", kana: "しながわ" },
  { name: "大崎", kana: "おおさき" },
  { name: "五反田", kana: "ごたんだ" },
  { name: "目黒", kana: "めぐろ" },
  { name: "恵比寿", kana: "えびす" },
  { name: "渋谷", kana: "しぶや" },
  { name: "原宿", kana: "はらじゅく" },
  { name: "代々木", kana: "よよぎ" },
  { name: "新宿", kana: "しんじゅく" },
  { name: "新大久保", kana: "しんおおくぼ" },
  { name: "高田馬場", kana: "たかだのばば" },
  { name: "目白", kana: "めじろ" },
  { name: "池袋", kana: "いけぶくろ" },
  { name: "大塚", kana: "おおつか" },
  { name: "巣鴨", kana: "すがも" },
  { name: "駒込", kana: "こまごめ" },
  { name: "田端", kana: "たばた" },
  { name: "西日暮里", kana: "にしにっぽり" },
  { name: "日暮里", kana: "にっぽり" },
  { name: "鶯谷", kana: "うぐいすだに" },
  { name: "上野", kana: "うえの" },
  { name: "御徒町", kana: "おかちまち" },
  { name: "秋葉原", kana: "あきはばら" },
  { name: "神田", kana: "かんだ" },

  // === 東京都 JR中央線 ===
  { name: "御茶ノ水", kana: "おちゃのみず" },
  { name: "水道橋", kana: "すいどうばし" },
  { name: "飯田橋", kana: "いいだばし" },
  { name: "市ケ谷", kana: "いちがや" },
  { name: "四ツ谷", kana: "よつや" },
  { name: "信濃町", kana: "しなのまち" },
  { name: "千駄ケ谷", kana: "せんだがや" },
  { name: "中野", kana: "なかの" },
  { name: "高円寺", kana: "こうえんじ" },
  { name: "阿佐ケ谷", kana: "あさがや" },
  { name: "荻窪", kana: "おぎくぼ" },
  { name: "西荻窪", kana: "にしおぎくぼ" },
  { name: "吉祥寺", kana: "きちじょうじ" },
  { name: "三鷹", kana: "みたか" },
  { name: "武蔵境", kana: "むさしさかい" },
  { name: "東小金井", kana: "ひがしこがねい" },
  { name: "武蔵小金井", kana: "むさしこがねい" },
  { name: "国分寺", kana: "こくぶんじ" },
  { name: "西国分寺", kana: "にしこくぶんじ" },
  { name: "国立", kana: "くにたち" },
  { name: "立川", kana: "たちかわ" },
  { name: "八王子", kana: "はちおうじ" },

  // === 東京都 私鉄・地下鉄 ===
  { name: "表参道", kana: "おもてさんどう" },
  { name: "青山一丁目", kana: "あおやまいっちょうめ" },
  { name: "赤坂", kana: "あかさか" },
  { name: "六本木", kana: "ろっぽんぎ" },
  { name: "麻布十番", kana: "あざぶじゅうばん" },
  { name: "白金高輪", kana: "しろかねたかなわ" },
  { name: "銀座", kana: "ぎんざ" },
  { name: "日本橋", kana: "にほんばし" },
  { name: "大手町", kana: "おおてまち" },
  { name: "霞ケ関", kana: "かすみがせき" },
  { name: "虎ノ門", kana: "とらのもん" },
  { name: "溜池山王", kana: "ためいけさんのう" },
  { name: "下北沢", kana: "しもきたざわ" },
  { name: "三軒茶屋", kana: "さんげんぢゃや" },
  { name: "二子玉川", kana: "ふたこたまがわ" },
  { name: "自由が丘", kana: "じゆうがおか" },
  { name: "中目黒", kana: "なかめぐろ" },
  { name: "代官山", kana: "だいかんやま" },
  { name: "明大前", kana: "めいだいまえ" },
  { name: "笹塚", kana: "ささづか" },
  { name: "初台", kana: "はつだい" },
  { name: "幡ヶ谷", kana: "はたがや" },
  { name: "代々木上原", kana: "よよぎうえはら" },
  { name: "練馬", kana: "ねりま" },
  { name: "光が丘", kana: "ひかりがおか" },
  { name: "石神井公園", kana: "しゃくじいこうえん" },
  { name: "大泉学園", kana: "おおいずみがくえん" },
  { name: "北千住", kana: "きたせんじゅ" },
  { name: "綾瀬", kana: "あやせ" },
  { name: "亀有", kana: "かめあり" },
  { name: "金町", kana: "かなまち" },
  { name: "錦糸町", kana: "きんしちょう" },
  { name: "両国", kana: "りょうごく" },
  { name: "押上", kana: "おしあげ" },
  { name: "浅草", kana: "あさくさ" },
  { name: "蒲田", kana: "かまた" },
  { name: "大森", kana: "おおもり" },
  { name: "大井町", kana: "おおいまち" },
  { name: "赤羽", kana: "あかばね" },
  { name: "王子", kana: "おうじ" },
  { name: "十条", kana: "じゅうじょう" },
  { name: "府中", kana: "ふちゅう" },
  { name: "調布", kana: "ちょうふ" },
  { name: "仙川", kana: "せんがわ" },
  { name: "成城学園前", kana: "せいじょうがくえんまえ" },
  { name: "経堂", kana: "きょうどう" },
  { name: "豪徳寺", kana: "ごうとくじ" },
  { name: "町田", kana: "まちだ" },
  { name: "多摩センター", kana: "たませんたー" },

  // === 神奈川県 JR ===
  { name: "川崎", kana: "かわさき" },
  { name: "鶴見", kana: "つるみ" },
  { name: "新子安", kana: "しんこやす" },
  { name: "東神奈川", kana: "ひがしかながわ" },
  { name: "横浜", kana: "よこはま" },
  { name: "保土ケ谷", kana: "ほどがや" },
  { name: "東戸塚", kana: "ひがしとつか" },
  { name: "戸塚", kana: "とつか" },
  { name: "大船", kana: "おおふな" },
  { name: "北鎌倉", kana: "きたかまくら" },
  { name: "鎌倉", kana: "かまくら" },
  { name: "逗子", kana: "ずし" },
  { name: "横須賀", kana: "よこすか" },
  { name: "武蔵小杉", kana: "むさしこすぎ" },
  { name: "武蔵溝ノ口", kana: "むさしみぞのくち" },
  { name: "登戸", kana: "のぼりと" },
  { name: "稲田堤", kana: "いなだづつみ" },
  { name: "新横浜", kana: "しんよこはま" },
  { name: "菊名", kana: "きくな" },
  { name: "大口", kana: "おおぐち" },
  { name: "東白楽", kana: "ひがしはくらく" },
  { name: "藤沢", kana: "ふじさわ" },
  { name: "辻堂", kana: "つじどう" },
  { name: "茅ヶ崎", kana: "ちがさき" },
  { name: "平塚", kana: "ひらつか" },
  { name: "大磯", kana: "おおいそ" },
  { name: "二宮", kana: "にのみや" },
  { name: "国府津", kana: "こうづ" },
  { name: "小田原", kana: "おだわら" },

  // === 神奈川県 東急・横浜市営 ===
  { name: "日吉", kana: "ひよし" },
  { name: "綱島", kana: "つなしま" },
  { name: "大倉山", kana: "おおくらやま" },
  { name: "元住吉", kana: "もとすみよし" },
  { name: "武蔵新城", kana: "むさししんじょう" },
  { name: "センター北", kana: "せんたーきた" },
  { name: "センター南", kana: "せんたーみなみ" },
  { name: "あざみ野", kana: "あざみの" },
  { name: "たまプラーザ", kana: "たまぷらーざ" },
  { name: "青葉台", kana: "あおばだい" },
  { name: "長津田", kana: "ながつた" },
  { name: "中山", kana: "なかやま" },
  { name: "鴨居", kana: "かもい" },
  { name: "小机", kana: "こづくえ" },

  // === 神奈川県 小田急・相鉄 ===
  { name: "本厚木", kana: "ほんあつぎ" },
  { name: "海老名", kana: "えびな" },
  { name: "相模大野", kana: "さがみおおの" },
  { name: "中央林間", kana: "ちゅうおうりんかん" },
  { name: "大和", kana: "やまと" },
  { name: "湘南台", kana: "しょうなんだい" },

  // === 相鉄線 ===
  { name: "横浜", kana: "よこはま" },
  { name: "平沼橋", kana: "ひらぬまばし" },
  { name: "西横浜", kana: "にしよこはま" },
  { name: "天王町", kana: "てんのうちょう" },
  { name: "星川", kana: "ほしかわ" },
  { name: "和田町", kana: "わだまち" },
  { name: "上星川", kana: "かみほしかわ" },
  { name: "西谷", kana: "にしや" },
  { name: "鶴ヶ峰", kana: "つるがみね" },
  { name: "二俣川", kana: "ふたまたがわ" },
  { name: "希望ヶ丘", kana: "きぼうがおか" },
  { name: "三ツ境", kana: "みつきょう" },
  { name: "瀬谷", kana: "せや" },
  { name: "さがみ野", kana: "さがみの" },
  { name: "かしわ台", kana: "かしわだい" },
  { name: "いずみ野", kana: "いずみの" },
  { name: "いずみ中央", kana: "いずみちゅうおう" },
  { name: "ゆめが丘", kana: "ゆめがおか" },
  { name: "羽沢横浜国大", kana: "はざわよこはまこくだい" },
  { name: "新横浜", kana: "しんよこはま" },

  // === 神奈川県 京急・その他 ===
  { name: "上大岡", kana: "かみおおおか" },
  { name: "弘明寺", kana: "ぐみょうじ" },
  { name: "井土ヶ谷", kana: "いどがや" },
  { name: "黄金町", kana: "こがねちょう" },
  { name: "関内", kana: "かんない" },
  { name: "桜木町", kana: "さくらぎちょう" },
  { name: "みなとみらい", kana: "みなとみらい" },
  { name: "元町・中華街", kana: "もとまちちゅうかがい" },
  { name: "石川町", kana: "いしかわちょう" },
  { name: "山手", kana: "やまて" },
  { name: "根岸", kana: "ねぎし" },
  { name: "磯子", kana: "いそご" },
  { name: "新杉田", kana: "しんすぎた" },
  { name: "金沢文庫", kana: "かなざわぶんこ" },
  { name: "金沢八景", kana: "かなざわはっけい" },

  // === 茨城県（大甕〜日立エリア） ===
  { name: "大甕", kana: "おおみか" },
  { name: "常陸多賀", kana: "ひたちたが" },
  { name: "日立", kana: "ひたち" },
  { name: "水戸", kana: "みと" },
  { name: "勝田", kana: "かつた" },
  { name: "東海", kana: "とうかい" }
];

// 駅名検索（漢字・ひらがな両対応）
export const searchStations = (query, limit = 10) => {
  if (!query || query.length === 0) return [];

  const normalizedQuery = query.replace(/駅$/, '').toLowerCase();

  // 前方一致を優先（駅名 or 読みがな）
  const prefixMatches = stations.filter(s =>
    s.name.toLowerCase().startsWith(normalizedQuery) ||
    s.kana.startsWith(normalizedQuery)
  );

  // 部分一致（前方一致に含まれないもの）
  const partialMatches = stations.filter(s =>
    (s.name.toLowerCase().includes(normalizedQuery) ||
     s.kana.includes(normalizedQuery)) &&
    !s.name.toLowerCase().startsWith(normalizedQuery) &&
    !s.kana.startsWith(normalizedQuery)
  );

  // 重複を除去（駅名で）
  const seen = new Set();
  const results = [];
  for (const s of [...prefixMatches, ...partialMatches]) {
    if (!seen.has(s.name)) {
      seen.add(s.name);
      results.push(s.name);
    }
    if (results.length >= limit) break;
  }

  return results;
};
