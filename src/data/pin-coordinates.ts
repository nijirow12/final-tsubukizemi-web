export const PIN_COORDINATES = {
  japan: { lat: 36.2048, lng: 138.2529, label: 'Japan', labelJa: '日本' },
  cambodia: { lat: 11.5564, lng: 104.9282, label: 'Cambodia', labelJa: 'カンボジア' },
  vietnam: { lat: 14.0583, lng: 108.2772, label: 'Vietnam', labelJa: 'ベトナム' },
  thailand: { lat: 15.87, lng: 100.9925, label: 'Thailand', labelJa: 'タイ' },
  philippines: { lat: 12.8797, lng: 121.774, label: 'Philippines', labelJa: 'フィリピン' },
  indonesia: { lat: -0.7893, lng: 113.9213, label: 'Indonesia', labelJa: 'インドネシア' },
  malaysia: { lat: 4.2105, lng: 101.9758, label: 'Malaysia', labelJa: 'マレーシア' },
  singapore: { lat: 1.3521, lng: 103.8198, label: 'Singapore', labelJa: 'シンガポール' },
  myanmar: { lat: 21.9162, lng: 95.956, label: 'Myanmar', labelJa: 'ミャンマー' },
  laos: { lat: 19.8563, lng: 102.4955, label: 'Laos', labelJa: 'ラオス' },
  india: { lat: 20.5937, lng: 78.9629, label: 'India', labelJa: 'インド' },
} as const

export type CountryId = keyof typeof PIN_COORDINATES
