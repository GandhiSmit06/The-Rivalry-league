import { NextResponse } from 'next/server'
import {
  getAllPlayers,
  createPlayer,
  bulkImportPlayers,
  updatePlayer,
  deletePlayer
} from '@/lib/server/playerService'

export async function GET() {
  try {
    const players = await getAllPlayers()
    return NextResponse.json({ success: true, players })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (body.bulk && Array.isArray(body.players)) {
      const result = await bulkImportPlayers(body.players)
      return NextResponse.json(result)
    }

    const result = await createPlayer(body)
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    const players = await getAllPlayers()
    return NextResponse.json({ success: true, player: result.player, players })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ success: false, message: 'Player id is required' }, { status: 400 })
    }
    const result = await updatePlayer(Number(id), updates)
    const players = await getAllPlayers()
    return NextResponse.json({ ...result, players }, { status: result.success ? 200 : 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'Player id is required' }, { status: 400 })
    }
    const result = await deletePlayer(Number(id))
    const players = await getAllPlayers()
    return NextResponse.json({ ...result, players }, { status: result.success ? 200 : 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
