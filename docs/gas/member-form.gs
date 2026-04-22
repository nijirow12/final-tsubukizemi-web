// ─────────────────────────────────────────────────────────────
// 津吹ゼミ メンバー登録フォーム → スプレッドシート格納
// ─────────────────────────────────────────────────────────────
// 設定: スクリプトプロパティに以下を登録
//   SPREADSHEET_ID  格納先スプレッドシートの ID
//                   (例: https://docs.google.com/spreadsheets/d/【ここ】/edit の【ここ】)
//   SHEET_NAME      シート名。省略時は "Members"
// ─────────────────────────────────────────────────────────────
// 挙動:
// - フォーム送信のたびに 1 行追記
// - 写真は Drive の URL として保存（フォーム送信時に自動で Drive に
//   保存されるので、GAS はその URL を列に並べるだけ）
// - エラー時は throw → Apps Script が既定でスクリプト所有者にメール通知
// ─────────────────────────────────────────────────────────────

// スプレッドシートの列順（1 行目のヘッダとして書き込まれる）
const HEADERS = [
  'timestamp',
  '名前（日本語）',
  'Name (English)',
  '自己紹介（日本語）',
  'Self-introduction (English)',
  '携わったプロジェクト（日本語）',
  'Projects (English)',
  '活動国',
  '学年',
  'SNS URL',
  'プロフィール写真',
];

/**
 * フォーム送信時のトリガー
 */
function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty('SPREADSHEET_ID');
  const sheetName = props.getProperty('SHEET_NAME') || 'Members';

  if (!sheetId) {
    throw new Error('スクリプトプロパティ SPREADSHEET_ID が未設定です。');
  }

  const ss = SpreadsheetApp.openById(sheetId);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // 1 行目にヘッダが未書き込みなら書く
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  // フォーム回答を質問タイトルでインデックス化
  const responses = e.response.getItemResponses();
  const byTitle = {};
  for (let i = 0; i < responses.length; i++) {
    const r = responses[i];
    byTitle[r.getItem().getTitle()] = r.getResponse();
  }

  // HEADERS の順にセル値を組み立て
  const row = HEADERS.map(function (key) {
    if (key === 'timestamp') return new Date();
    const val = byTitle[key];
    if (val == null) return '';
    // プロフィール写真だけ特別扱い: file ID 配列 → Drive URL の列挙
    if (key === 'プロフィール写真') return toPhotoLinks(val);
    if (Array.isArray(val)) return val.join(', ');
    return val;
  });

  sheet.appendRow(row);
}

/**
 * 写真（file ID の配列 or 単一 ID）を、閲覧可能な Drive URL の
 * カンマ区切り文字列に変換する。
 */
function toPhotoLinks(value) {
  if (!value) return '';
  const ids = Array.isArray(value) ? value : [value];
  return ids
    .map(function (id) {
      try {
        return DriveApp.getFileById(id).getUrl();
      } catch (err) {
        return '(id=' + id + ' 取得失敗)';
      }
    })
    .join(', ');
}

/**
 * 動作確認用: スクリプトエディタから手動実行
 * スプレッドシートにテスト行を書き込めるか確認する
 */
function testSheetAccess() {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty('SPREADSHEET_ID');
  const sheetName = props.getProperty('SHEET_NAME') || 'Members';

  if (!sheetId) {
    throw new Error('スクリプトプロパティ SPREADSHEET_ID が未設定です。');
  }

  const ss = SpreadsheetApp.openById(sheetId);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  const testRow = HEADERS.map(function (h) {
    return h === 'timestamp' ? new Date() : '(test) ' + h;
  });
  sheet.appendRow(testRow);
  Logger.log('テスト行を追記しました: ' + ss.getUrl());
}
