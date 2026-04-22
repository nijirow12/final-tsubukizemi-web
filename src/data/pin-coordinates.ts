// 国ピン座標。Drive に国フォルダが追加されたら対応するキーをここに足せば
// 自動でピンが表示される（ピンの実体はフォルダが見つかった国だけ見えるようになる）。
// 新規追加時は id をサイトで使う英語スラッグ（小文字）で統一すること。
export const PIN_COORDINATES = {
  // --- East Asia ---
  japan:       { lat: 36.2048,  lng: 138.2529,  label: 'Japan',        labelJa: '日本' },
  korea:       { lat: 35.9078,  lng: 127.7669,  label: 'South Korea',  labelJa: '韓国' },
  china:       { lat: 35.8617,  lng: 104.1954,  label: 'China',        labelJa: '中国' },
  taiwan:      { lat: 23.6978,  lng: 120.9605,  label: 'Taiwan',       labelJa: '台湾' },
  'hong-kong': { lat: 22.3193,  lng: 114.1694,  label: 'Hong Kong',    labelJa: '香港' },
  mongolia:    { lat: 46.8625,  lng: 103.8467,  label: 'Mongolia',     labelJa: 'モンゴル' },

  // --- Southeast Asia ---
  cambodia:    { lat: 11.5564,  lng: 104.9282,  label: 'Cambodia',     labelJa: 'カンボジア' },
  vietnam:     { lat: 14.0583,  lng: 108.2772,  label: 'Vietnam',      labelJa: 'ベトナム' },
  thailand:    { lat: 15.87,    lng: 100.9925,  label: 'Thailand',     labelJa: 'タイ' },
  laos:        { lat: 19.8563,  lng: 102.4955,  label: 'Laos',         labelJa: 'ラオス' },
  myanmar:     { lat: 21.9162,  lng: 95.956,    label: 'Myanmar',      labelJa: 'ミャンマー' },
  malaysia:    { lat: 4.2105,   lng: 101.9758,  label: 'Malaysia',     labelJa: 'マレーシア' },
  singapore:   { lat: 1.3521,   lng: 103.8198,  label: 'Singapore',    labelJa: 'シンガポール' },
  indonesia:   { lat: -0.7893,  lng: 113.9213,  label: 'Indonesia',    labelJa: 'インドネシア' },
  philippines: { lat: 12.8797,  lng: 121.774,   label: 'Philippines',  labelJa: 'フィリピン' },
  brunei:      { lat: 4.5353,   lng: 114.7277,  label: 'Brunei',       labelJa: 'ブルネイ' },
  'timor-leste': { lat: -8.8742, lng: 125.7275, label: 'Timor-Leste',  labelJa: '東ティモール' },

  // --- South Asia ---
  india:       { lat: 20.5937,  lng: 78.9629,   label: 'India',        labelJa: 'インド' },
  pakistan:    { lat: 30.3753,  lng: 69.3451,   label: 'Pakistan',     labelJa: 'パキスタン' },
  bangladesh:  { lat: 23.685,   lng: 90.3563,   label: 'Bangladesh',   labelJa: 'バングラデシュ' },
  'sri-lanka': { lat: 7.8731,   lng: 80.7718,   label: 'Sri Lanka',    labelJa: 'スリランカ' },
  nepal:       { lat: 28.3949,  lng: 84.124,    label: 'Nepal',        labelJa: 'ネパール' },
  bhutan:      { lat: 27.5142,  lng: 90.4336,   label: 'Bhutan',       labelJa: 'ブータン' },
  maldives:    { lat: 3.2028,   lng: 73.2207,   label: 'Maldives',     labelJa: 'モルディブ' },

  // --- Central Asia ---
  kazakhstan:  { lat: 48.0196,  lng: 66.9237,   label: 'Kazakhstan',   labelJa: 'カザフスタン' },
  uzbekistan:  { lat: 41.3775,  lng: 64.5853,   label: 'Uzbekistan',   labelJa: 'ウズベキスタン' },

  // --- Middle East ---
  uae:         { lat: 23.4241,  lng: 53.8478,   label: 'UAE',          labelJa: 'アラブ首長国連邦' },
  'saudi-arabia': { lat: 23.8859, lng: 45.0792, label: 'Saudi Arabia', labelJa: 'サウジアラビア' },
  israel:      { lat: 31.0461,  lng: 34.8516,   label: 'Israel',       labelJa: 'イスラエル' },
  turkey:      { lat: 38.9637,  lng: 35.2433,   label: 'Turkey',       labelJa: 'トルコ' },
  qatar:       { lat: 25.3548,  lng: 51.1839,   label: 'Qatar',        labelJa: 'カタール' },

  // --- Oceania ---
  australia:   { lat: -25.2744, lng: 133.7751,  label: 'Australia',    labelJa: 'オーストラリア' },
  'new-zealand': { lat: -40.9006, lng: 174.886, label: 'New Zealand',  labelJa: 'ニュージーランド' },
  fiji:        { lat: -17.7134, lng: 178.065,   label: 'Fiji',         labelJa: 'フィジー' },

  // --- North America ---
  usa:         { lat: 37.0902,  lng: -95.7129,  label: 'USA',          labelJa: 'アメリカ' },
  canada:      { lat: 56.1304,  lng: -106.3468, label: 'Canada',       labelJa: 'カナダ' },
  mexico:      { lat: 23.6345,  lng: -102.5528, label: 'Mexico',       labelJa: 'メキシコ' },

  // --- South America ---
  brazil:      { lat: -14.235,  lng: -51.9253,  label: 'Brazil',       labelJa: 'ブラジル' },
  argentina:   { lat: -38.4161, lng: -63.6167,  label: 'Argentina',    labelJa: 'アルゼンチン' },
  peru:        { lat: -9.19,    lng: -75.0152,  label: 'Peru',         labelJa: 'ペルー' },
  chile:       { lat: -35.6751, lng: -71.543,   label: 'Chile',        labelJa: 'チリ' },
  colombia:    { lat: 4.5709,   lng: -74.2973,  label: 'Colombia',     labelJa: 'コロンビア' },

  // --- Europe ---
  uk:          { lat: 55.3781,  lng: -3.436,    label: 'UK',           labelJa: 'イギリス' },
  france:      { lat: 46.2276,  lng: 2.2137,    label: 'France',       labelJa: 'フランス' },
  germany:     { lat: 51.1657,  lng: 10.4515,   label: 'Germany',      labelJa: 'ドイツ' },
  italy:       { lat: 41.8719,  lng: 12.5674,   label: 'Italy',        labelJa: 'イタリア' },
  spain:       { lat: 40.4637,  lng: -3.7492,   label: 'Spain',        labelJa: 'スペイン' },
  netherlands: { lat: 52.1326,  lng: 5.2913,    label: 'Netherlands',  labelJa: 'オランダ' },
  sweden:      { lat: 60.1282,  lng: 18.6435,   label: 'Sweden',       labelJa: 'スウェーデン' },
  switzerland: { lat: 46.8182,  lng: 8.2275,    label: 'Switzerland',  labelJa: 'スイス' },
  russia:      { lat: 61.524,   lng: 105.3188,  label: 'Russia',       labelJa: 'ロシア' },

  // --- Africa ---
  egypt:       { lat: 26.8206,  lng: 30.8025,   label: 'Egypt',        labelJa: 'エジプト' },
  kenya:       { lat: -0.0236,  lng: 37.9062,   label: 'Kenya',        labelJa: 'ケニア' },
  'south-africa': { lat: -30.5595, lng: 22.9375, label: 'South Africa', labelJa: '南アフリカ' },
  morocco:     { lat: 31.7917,  lng: -7.0926,   label: 'Morocco',      labelJa: 'モロッコ' },
  nigeria:     { lat: 9.082,    lng: 8.6753,    label: 'Nigeria',      labelJa: 'ナイジェリア' },
  ethiopia:    { lat: 9.145,    lng: 40.4897,   label: 'Ethiopia',     labelJa: 'エチオピア' },
  tanzania:    { lat: -6.369,   lng: 34.8888,   label: 'Tanzania',     labelJa: 'タンザニア' },
  ghana:       { lat: 7.9465,   lng: -1.0232,   label: 'Ghana',        labelJa: 'ガーナ' },
  rwanda:      { lat: -1.9403,  lng: 29.8739,   label: 'Rwanda',       labelJa: 'ルワンダ' },
} as const

export type CountryId = keyof typeof PIN_COORDINATES
