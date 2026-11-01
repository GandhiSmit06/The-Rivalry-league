import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server/token'
import { getOwnerLoginId, setOwnerLogin } from '@/lib/server/ownerService'
import { DbConflictError } from '@/lib/server/db'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Ctx) {
  const denied = requireAuth(req)
  if (denied) return denied

  try {
    const { id } = await params
    return NextResponse.json({ success: true, loginId: await getOwnerLoginId(id) })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: Ctx) {
  const denied = requireAuth(req)
  if (denied) return denied

  try {
    const { id } = await params
    const { teamName, ownerName, loginId, password } = await req.json()
    const result = await setOwnerLogin(id, { teamName, ownerName, loginId, password })
    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (err) {
    console.error('[owner-login] save failed:', err)
    const message = err instanceof DbConflictError ? err.message : 'Could not save - the database did not respond'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
