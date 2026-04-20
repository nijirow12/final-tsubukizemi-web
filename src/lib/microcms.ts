import { createClient } from 'microcms-js-sdk'

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
})

export type MicroCMSImage = {
  url: string
  height: number
  width: number
}

export type Member = {
  id: string
  name: string
  nameEn: string
  introduction: string
  introductionEn: string
  projects: string
  projectsEn: string
  countries: string[]
  photo: MicroCMSImage | null
  isOB: boolean
  /** "1年"〜"7年"。alumni（OB/OG）の場合 null */
  grade: string | null
  socialUrl: string | null
}

type RawMember = {
  id: string
  nameJP: string
  nameEN: string
  introductionJP: string
  introductionEN: string
  projectsJP: string
  projectsEN: string
  countries: string | string[]
  grade: string[]
  photo?: MicroCMSImage | null
  socialurl: string | null
}

function normalizeCountries(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String)
  if (typeof raw === 'string' && raw.trim()) return raw.split(/[,、]\s*/)
  return []
}

export async function getMembers(): Promise<Member[]> {
  const res = await client.getList<RawMember>({
    endpoint: 'tsubukizemi',
    queries: {
      fields: [
        'id', 'nameJP', 'nameEN',
        'introductionJP', 'introductionEN',
        'projectsJP', 'projectsEN',
        'countries', 'photo', 'grade', 'socialurl',
      ],
      limit: 100,
      orders: '-createdAt',
    },
  })
  return res.contents.map((m) => {
    const gradeArr = Array.isArray(m.grade) ? m.grade : []
    const isAlumni = gradeArr.includes('alumni')
    return {
      id: m.id,
      name: m.nameJP ?? '',
      nameEn: m.nameEN ?? '',
      introduction: m.introductionJP ?? '',
      introductionEn: m.introductionEN ?? '',
      projects: m.projectsJP ?? '',
      projectsEn: m.projectsEN ?? '',
      countries: normalizeCountries(m.countries),
      photo: m.photo ?? null,
      isOB: isAlumni,
      grade: isAlumni ? null : (gradeArr[0] ?? null),
      socialUrl: m.socialurl ?? null,
    }
  })
}
