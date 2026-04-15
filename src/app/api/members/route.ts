import { NextResponse } from 'next/server'
import { demoMembers } from '@/data/members-demo'

// TODO: CMS連携時はここを差し替える
// import { getMembers } from '@/lib/microcms'

export async function GET() {
  // TODO: CMS連携時は下記に戻す
  // try {
  //   const members = await getMembers()
  //   return NextResponse.json(members)
  // } catch (err) {
  //   console.error('microCMS fetch error:', err)
  //   return NextResponse.json([], { status: 500 })
  // }
  return NextResponse.json(demoMembers)
}
