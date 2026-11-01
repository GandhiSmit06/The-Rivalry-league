import { NextResponse } from 'next/server'
import {
  getAllMatches,
  createMatch,
  deleteMatch,
  generateRoundRobinSchedule
} from '@/lib/server/matchService'

export async function GET() {
  try {
    const matches = await getAllMatches()
    return NextResponse.json({ success: true, matches })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body.action === 'generate-round-robin') {
      const result = await generateRoundRobinSchedule()
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    const result = await createMatch(body)
    const matches = await getAllMatches()
    return NextResponse.json({ ...result, matches }, { status: result.success ? 200 : 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'Match id is required' }, { status: 400 })
    }
    const result = await deleteMatch(id)
    const matches = await getAllMatches()
    return NextResponse.json({ ...result, matches }, { status: result.success ? 200 : 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
