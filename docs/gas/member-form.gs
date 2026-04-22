// ─────────────────────────────────────────────────────────────
// 津吹ゼミ メンバー登録フォーム - 項目収集
// ─────────────────────────────────────────────────────────────
// スプレッドシートへの保存は Google フォームの純正機能
// (「回答」タブ → スプレッドシート連携) で設定するため、この GAS は
// 以下に徹する:
//   1. フォーム送信時に回答項目を構造化オブジェクトに整形
//   2. 実行ログに書き出す
// 将来、外部 API への送信 / Slack 通知 などが必要になったら、
// onFormSubmit の末尾の拡張ポイントに処理を追記する。
// ─────────────────────────────────────────────────────────────

// 質問タイトル → 出力オブジェクトのキー
// フォームの質問タイトルを編集したら、ここのキー側も合わせて修正すること。
const FIELD_MAP = {
  '名前（日本語）':                 'nameJP',
  'Name (English)':                 'nameEN',
  '自己紹介（日本語）':             'introductionJP',
  'Self-introduction (English)':    'introductionEN',
  '携わったプロジェクト（日本語）': 'projectsJP',
  'Projects (English)':             'projectsEN',
  '活動国':                         'countries',
  '学年':                           'grade',
  'SNS URL':                        'socialurl',
  'プロフィール写真':               'photo',
};

/**
 * フォーム送信時のトリガー
 */
function onFormSubmit(e) {
  const data = collectFormItems(e.response);
  Logger.log('member submission:\n' + JSON.stringify(data, null, 2));

  // ─── 拡張ポイント ──────────────────────────────────────
  // 必要になったらここに処理を足す。data は下記のような形:
  //   {
  //     timestamp: '2026-04-22T05:23:45.000Z',
  //     nameJP: '山田 太郎',
  //     nameEN: 'Taro Yamada',
  //     introductionJP: '...',
  //     introductionEN: '...',
  //     projectsJP: '...',
  //     projectsEN: '...',
  //     countries: ['カンボジア', 'ベトナム'],  // 配列化済み
  //     grade: '3年',
  //     socialurl: 'https://...',
  //     photo: ['https://drive.google.com/...'],  // Drive URL 配列
  //   }
  //
  // 例:
  //   postToMicrocms(data);
  //   notifySlack(data);
  // ───────────────────────────────────────────────────
}

/**
 * フォーム回答を「FIELD_MAP のキー → 値」のオブジェクトに整形する。
 * - 活動国（自由記述）はカンマ/読点/スラッシュ/改行で分割して配列化
 * - 写真（file ID 配列）は Drive URL の配列に変換
 */
function collectFormItems(response) {
  const byTitle = {};
  const responses = response.getItemResponses();
  for (let i = 0; i < responses.length; i++) {
    const r = responses[i];
    byTitle[r.getItem().getTitle()] = r.getResponse();
  }

  const out = { timestamp: new Date().toISOString() };
  for (const title in FIELD_MAP) {
    const key = FIELD_MAP[title];
    const val = byTitle[title];
    if (val == null || val === '') continue;
    if (key === 'photo') {
      const links = toPhotoLinks(val);
      if (links.length) out.photo = links;
    } else if (key === 'countries') {
      const list = splitList(val);
      if (list.length) out.countries = list;
    } else {
      out[key] = val;
    }
  }
  return out;
}

/**
 * 自由記述のリスト値を配列化する。
 * カンマ（,）/ 読点（、）/ スラッシュ（/）/ 改行 で区切り。
 */
function splitList(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.slice();
  return String(value)
    .split(/[,、\n\r\t]+|\s*\/\s*/)
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}

/**
 * プロフィール写真の file ID 配列を Drive URL 配列に変換する。
 */
function toPhotoLinks(value) {
  if (value == null) return [];
  const ids = Array.isArray(value) ? value : [value];
  return ids
    .map(function (id) {
      try {
        return DriveApp.getFileById(id).getUrl();
      } catch (err) {
        return null;
      }
    })
    .filter(Boolean);
}
