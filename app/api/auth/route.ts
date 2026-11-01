import { NextResponse } from 'next/server'
import { serverError } from '@/lib/server/respond'
import { verifyAuctioneerPin, updateAuctioneerPin } from '@/lib/server/authService'
import { issueToken } from '@/lib/server/token'

export async function POST(req: Request) {
  try {
    const { action, pin, currentPin, newPin } = await req.json()

    if (action === 'change-pin') {
      const result = await updateAuctioneerPin(String(currentPin ?? ''), String(newPin ?? ''))
      return NextResponse.json(result, { status: result.success ? 200 : 400 })
    }

    const password = String(pin ?? '')
    const result = await verifyAuctioneerPin(password)
    if (!result.success) return NextResponse.json(result, { status: 401 })
    const issued = issueToken()
    if (!issued) {
      return NextResponse.json({ success: false, message: 'Server auth is not configured (AUTH_SECRET)' }, { status: 500 })
    }
    return NextResponse.json({ ...result, ...issued, defaultPin: password.trim() === '1234' })
  } catch (err) {
    return serverError(err)
  }
}
