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
  fullName: string
  photo: MicroCMSImage | null
  role: string
  snsUrl: string | null
}

export async function getMembers() {
  const res = await client.getList<Member>({
    endpoint: 'members',
    queries: {
      fields: ['id', 'fullName', 'photo', 'role', 'snsUrl'],
      limit: 100,
      orders: '-createdAt',
    },
  })
  return res.contents
}
