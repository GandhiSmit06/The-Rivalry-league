import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server/token'
import { getOwnerLoginId, setOwnerLogin } from '@/lib/server/ownerService'

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
    const { loginId, pin, ownerName } = await req.json()
    const result = await setOwnerLogin(id, loginId, pin, ownerName)
    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
