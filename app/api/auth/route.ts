import { NextResponse } from 'next/server'
import { verifyAuctioneerPin, updateAuctioneerPin } from '@/lib/server/authService'

export async function POST(req: Request) {
  try {
    const { action, pin, currentPin, newPin } = await req.json()

    if (action === 'change-pin') {
      const result = await updateAuctioneerPin(currentPin || '', newPin || '')
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    const result = await verifyAuctioneerPin(pin || '')
    return NextResponse.json(result, { status: result.success ? 200 : 401 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
