import { NextResponse } from 'next/server'
import { getMembers } from '@/lib/microcms'
import { demoMembers } from '@/data/members-demo'

export const revalidate = 300

export async function GET() {
  if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
    return NextResponse.json(demoMembers)
  }

  try {
    const members = await getMembers()
    return NextResponse.json(members)
  } catch (err) {
    console.error('microCMS fetch error — falling back to demo data:', err)
    return NextResponse.json(demoMembers)
  }
}
