export type ProfessorProfile = {
  name: string
  nameEn: string
  nameZh: string
  summary: string
  summaryEn: string
  summaryZh: string
  researchFields: string[]
  researchFieldsEn: string[]
  researchFieldsZh: string[]
}

export const professorProfile: ProfessorProfile = {
  name: '津吹 達也',
  nameEn: 'Tatsuya Tsubuki',
  nameZh: '津吹 达也',
  summary:
    '海外営業・スタートアップ経営・海外事業立ち上げなどの豊富なビジネス経験を背景に、実務家教員として津吹ゼミ（グローバルゼミ）を率いる。海外フィールドでの挑戦を通じて、学生の起業家精神とリーダーシップを育成することに情熱を注いでいる。',
  summaryEn:
    'With extensive experience in international sales, startup management, and overseas business development, he leads the Tsubuki Seminar (Global Seminar) as a practitioner faculty member. He is passionate about nurturing entrepreneurial spirit and leadership in students through hands-on challenges in overseas fields.',
  summaryZh:
    '凭借在海外销售、初创企业管理及海外业务开拓方面的丰富经验，作为实务教员主导津吹研讨会（全球研讨会）。他热衷于通过海外实践挑战，培养学生的创业精神与领导力。',
  researchFields: [
    '東南アジア領域のスタートアップ',
    '教育工学・アントレプレナーシップ教育',
    '実践コミュニティ・リーダーシップ学習',
  ],
  researchFieldsEn: [
    'Southeast Asian Startups',
    'Educational Technology & Entrepreneurship Education',
    'Communities of Practice & Leadership Learning',
  ],
  researchFieldsZh: [
    '东南亚初创企业',
    '教育技术与创业教育',
    '实践社群与领导力学习',
  ],
}
