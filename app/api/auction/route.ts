import { NextResponse } from 'next/server'
import {
  getAuctionSnapshot,
  spinWheel,
  nominatePlayer,
  placeBid,
  sellPlayer,
  markUnsold,
  resetAuction,
  reopenAllUnsold
} from '@/lib/server/auctionService'

export async function GET() {
  try {
    const data = await getAuctionSnapshot()
    return NextResponse.json({ success: true, ...data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { action, playerId, teamName, amount, price } = await req.json()

    if (action === 'spin') {
      const result = await spinWheel()
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    if (action === 'nominate') {
      const result = await nominatePlayer(Number(playerId))
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    if (action === 'bid') {
      const result = await placeBid(teamName, Number(amount))
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    if (action === 'sell') {
      const result = await sellPlayer(teamName, price, playerId)
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    if (action === 'unsold') {
      const result = await markUnsold()
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    if (action === 'reopen-unsold') {
      const result = await reopenAllUnsold()
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    if (action === 'reset') {
      const result = await resetAuction()
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    return NextResponse.json({ success: false, message: 'Invalid auction action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
