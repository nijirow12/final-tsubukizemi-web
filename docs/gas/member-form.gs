// ─────────────────────────────────────────────────────────────
// 津吹ゼミ メンバー登録フォーム → microCMS 自動送信
// ─────────────────────────────────────────────────────────────
// 設定: スクリプトプロパティに以下を登録
//   MICROCMS_SERVICE_DOMAIN  例: "tsubukin"
//   MICROCMS_API_KEY         microCMS の Write 権限を含む API キー
//   MICROCMS_ENDPOINT        通常 "tsubukizemi"
//   NOTIFY_EMAIL             送信エラー / 写真通知の宛先メール
// ─────────────────────────────────────────────────────────────

// 日本語国名 → サイトで使う英語スラッグ
// 追加時: src/data/pin-coordinates.ts の labelJa / id と同じ対応を維持すること。
const COUNTRY_MAP = {
  // East Asia
  '日本': 'japan',
  '韓国': 'korea',
  '中国': 'china',
  '台湾': 'taiwan',
  '香港': 'hong-kong',
  'モンゴル': 'mongolia',
  // Southeast Asia
  'カンボジア': 'cambodia',
  'ベトナム': 'vietnam',
  'タイ': 'thailand',
  'ラオス': 'laos',
  'ミャンマー': 'myanmar',
  'マレーシア': 'malaysia',
  'シンガポール': 'singapore',
  'インドネシア': 'indonesia',
  'フィリピン': 'philippines',
  'ブルネイ': 'brunei',
  '東ティモール': 'timor-leste',
  // South Asia
  'インド': 'india',
  'パキスタン': 'pakistan',
  'バングラデシュ': 'bangladesh',
  'スリランカ': 'sri-lanka',
  'ネパール': 'nepal',
  'ブータン': 'bhutan',
  'モルディブ': 'maldives',
  // Central Asia
  'カザフスタン': 'kazakhstan',
  'ウズベキスタン': 'uzbekistan',
  // Middle East
  'アラブ首長国連邦': 'uae', 'UAE': 'uae',
  'サウジアラビア': 'saudi-arabia',
  'イスラエル': 'israel',
  'トルコ': 'turkey',
  'カタール': 'qatar',
  // Oceania
  'オーストラリア': 'australia',
  'ニュージーランド': 'new-zealand',
  'フィジー': 'fiji',
  // Americas
  'アメリカ': 'usa', '米国': 'usa',
  'カナダ': 'canada',
  'メキシコ': 'mexico',
  'ブラジル': 'brazil',
  'アルゼンチン': 'argentina',
  'ペルー': 'peru',
  'チリ': 'chile',
  'コロンビア': 'colombia',
  // Europe
  'イギリス': 'uk', '英国': 'uk',
  'フランス': 'france',
  'ドイツ': 'germany',
  'イタリア': 'italy',
  'スペイン': 'spain',
  'オランダ': 'netherlands',
  'スウェーデン': 'sweden',
  'スイス': 'switzerland',
  'ロシア': 'russia',
  // Africa
  'エジプト': 'egypt',
  'ケニア': 'kenya',
  '南アフリカ': 'south-africa',
  'モロッコ': 'morocco',
  'ナイジェリア': 'nigeria',
  'エチオピア': 'ethiopia',
  'タンザニア': 'tanzania',
  'ガーナ': 'ghana',
  'ルワンダ': 'rwanda',
};

// 上の日本語→英語マップに加え、英語国名（Cambodia 等）も受けつけるための逆引き
const COUNTRY_EN_SET = Object.keys(COUNTRY_MAP).reduce(function (acc, jp) {
  acc[COUNTRY_MAP[jp]] = true;
  return acc;
}, {});

// フォームの質問タイトル → microCMS フィールド
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
  'プロフィール写真':               '_photoFileIds',
};

/**
 * フォーム送信時のトリガー
 */
function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const domain   = props.getProperty('MICROCMS_SERVICE_DOMAIN');
  const apiKey   = props.getProperty('MICROCMS_API_KEY');
  const endpoint = props.getProperty('MICROCMS_ENDPOINT') || 'tsubukizemi';
  const notifyTo = props.getProperty('NOTIFY_EMAIL');

  if (!domain || !apiKey) {
    throw new Error('スクリプトプロパティ MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です。');
  }

  // フォーム回答 → オブジェクト
  const responses = e.response.getItemResponses();
  const raw = {};
  for (let i = 0; i < responses.length; i++) {
    const r = responses[i];
    const key = FIELD_MAP[r.getItem().getTitle()];
    if (key) raw[key] = r.getResponse();
  }

  // microCMS へ送るペイロードに整形
  const payload = {
    nameJP:          raw.nameJP || '',
    nameEN:          raw.nameEN || '',
    introductionJP:  raw.introductionJP || '',
    introductionEN:  raw.introductionEN || '',
    projectsJP:      raw.projectsJP || '',
    projectsEN:      raw.projectsEN || '',
    countries:       toCountrySlugs(raw.countries),
    grade:           raw.grade ? [raw.grade] : [],
    socialurl:       raw.socialurl || null,
  };

  // microCMS POST
  const url = 'https://' + domain + '.microcms.io/api/v1/' + endpoint;
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-MICROCMS-API-KEY': apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const code = res.getResponseCode();
  const body = res.getContentText();
  Logger.log('microCMS [' + code + '] ' + body);

  // 写真が添付されていれば、管理者に Drive リンクを通知
  const photoLinks = toDriveLinks(raw._photoFileIds);

  if (code >= 400) {
    if (notifyTo) {
      MailApp.sendEmail({
        to: notifyTo,
        subject: '[津吹ゼミ] メンバー登録フォーム: microCMS 送信エラー',
        body: [
          'microCMS への送信に失敗しました (HTTP ' + code + ')',
          '',
          'レスポンス:',
          body,
          '',
          '送信データ:',
          JSON.stringify(payload, null, 2),
        ].join('\n'),
      });
    }
    throw new Error('microCMS POST failed: ' + code);
  }

  if (photoLinks.length && notifyTo) {
    let createdId = '';
    try { createdId = (JSON.parse(body) || {}).id || ''; } catch (_) {}
    MailApp.sendEmail({
      to: notifyTo,
      subject: '[津吹ゼミ] メンバー「' + payload.nameJP + '」の写真を紐付けてください',
      body: [
        '新しいメンバーが登録されました: ' + payload.nameJP + ' (' + payload.nameEN + ')',
        createdId ? 'microCMS コンテンツ ID: ' + createdId : '',
        '',
        '以下の Drive 上の写真を、microCMS 管理画面で該当メンバーの photo フィールドに設定してください。',
        '',
        photoLinks.map(function (link) { return '  - ' + link; }).join('\n'),
        '',
        '管理画面: https://' + domain + '.microcms.io/apis/' + endpoint,
      ].filter(Boolean).join('\n'),
    });
  }
}

/**
 * 活動国フィールドを正規化する。自由記述フォーム想定で、カンマ/読点/改行/空白で
 * 区切られた入力をパースし、日本語国名は英語スラッグへ、英語入力は小文字化、
 * 未知の国名はスラッグ化（空白→ハイフン）して返す。
 */
function toCountrySlugs(value) {
  if (!value) return [];
  const parts = [];
  const pushParts = function (s) {
    String(s).split(/[,、\n\r\t]+|\s*\/\s*/).forEach(function (p) {
      const trimmed = p.trim();
      if (trimmed) parts.push(trimmed);
    });
  };
  if (Array.isArray(value)) {
    value.forEach(pushParts);
  } else {
    pushParts(value);
  }

  const seen = {};
  const result = [];
  for (const raw of parts) {
    // まず日本語→英語マップを試す
    let slug = COUNTRY_MAP[raw];
    if (!slug) {
      // 英語/スラッグ直接入力のケース
      const lower = raw.toLowerCase().replace(/\s+/g, '-');
      slug = COUNTRY_EN_SET[lower] ? lower : lower;
    }
    if (slug && !seen[slug]) {
      seen[slug] = true;
      result.push(slug);
    }
  }
  return result;
}

function toDriveLinks(value) {
  if (!value) return [];
  const ids = Array.isArray(value) ? value : [value];
  return ids
    .map(function (id) {
      try {
        const file = DriveApp.getFileById(id);
        return file.getName() + ': ' + file.getUrl();
      } catch (err) {
        return '(ID=' + id + ' を取得できませんでした)';
      }
    })
    .filter(Boolean);
}

/**
 * 動作確認用: スクリプトエディタで手動実行
 */
function testMicroCMSConnection() {
  const props = PropertiesService.getScriptProperties();
  const domain   = props.getProperty('MICROCMS_SERVICE_DOMAIN');
  const apiKey   = props.getProperty('MICROCMS_API_KEY');
  const endpoint = props.getProperty('MICROCMS_ENDPOINT') || 'tsubukizemi';

  const res = UrlFetchApp.fetch(
    'https://' + domain + '.microcms.io/api/v1/' + endpoint + '?limit=1',
    {
      headers: { 'X-MICROCMS-API-KEY': apiKey },
      muteHttpExceptions: true,
    }
  );
  Logger.log('[' + res.getResponseCode() + '] ' + res.getContentText());
}
