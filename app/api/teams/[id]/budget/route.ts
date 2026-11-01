import { NextResponse } from 'next/server'
import { adjustTeamBudget, getAllTeams } from '@/lib/server/teamService'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { mode, amount } = await req.json()
    const result = await adjustTeamBudget(id, mode || 'set', amount)
    const teams = await getAllTeams()
    return NextResponse.json({ ...result, teams }, { status: result.success ? 200 : 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
