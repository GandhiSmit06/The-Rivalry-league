import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/server/db'

export async function GET() {
  try {
    const db = await readDb()
    return NextResponse.json({
      league: db.league,
      teamsCount: db.teams.length,
      playersCount: db.players.length,
      soldCount: db.players.filter(p => p.status === 'Sold').length,
      upcomingCount: db.players.filter(p => p.status === 'Upcoming').length
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const db = await readDb()

    db.league = {
      ...db.league,
      name: body.name || db.league.name,
      season: body.season || db.league.season,
      defaultPurse: Number(body.defaultPurse) || db.league.defaultPurse,
      maxSquadSize: Number(body.maxSquadSize) || db.league.maxSquadSize
    }

    await writeDb(db)
    return NextResponse.json({ success: true, league: db.league })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

