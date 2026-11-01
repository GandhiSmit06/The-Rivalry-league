import { NextResponse } from 'next/server'
import { serverError } from '@/lib/server/respond'
import { verifyOwnerLogin } from '@/lib/server/ownerService'
import { issueToken } from '@/lib/server/token'

export async function POST(req: Request) {
  try {
    const { loginId, pin } = await req.json()
    const team = await verifyOwnerLogin(String(loginId ?? ''), String(pin ?? ''))
    if (!team) {
      return NextResponse.json({ success: false, message: 'Wrong login ID or password' }, { status: 401 })
    }
    const issued = issueToken('owner', team.id)
    if (!issued) {
      return NextResponse.json(
        { success: false, message: 'Server auth is not configured (AUTH_SECRET)' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true, teamId: team.id, ...issued })
  } catch (err) {
    return serverError(err)
  }
}
