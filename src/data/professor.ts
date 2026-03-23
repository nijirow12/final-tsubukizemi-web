export type ProfessorProfile = {
  name: string
  nameEn: string
  summary: string
  researchFields: string[]
}

export const professorProfile: ProfessorProfile = {
  name: '津吹 達也',
  nameEn: 'Tatsuya Tsubuki',
  summary:
    '海外営業・スタートアップ経営・海外事業立ち上げなどの豊富なビジネス経験を背景に、実務家教員として津吹ゼミ（グローバルゼミ）を率いる。海外フィールドでの挑戦を通じて、学生の起業家精神とリーダーシップを育成することに情熱を注いでいる。',
  researchFields: [
    '東南アジア領域のスタートアップ',
    '教育工学・アントレプレナーシップ教育',
    '実践コミュニティ・リーダーシップ学習',
  ],
}
