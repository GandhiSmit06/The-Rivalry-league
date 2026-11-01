import { createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

function getSecret(): string | null {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET
  // Dev convenience only; production must set AUTH_SECRET
  return process.env.NODE_ENV === 'production' ? null : 'dev-only-insecure-secret'
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function issueToken(): { token: string; expiresAt: number } | null {
  const secret = getSecret()
  if (!secret) return null
  const expiresAt = Date.now() + TOKEN_TTL_MS
  const payload = Buffer.from(JSON.stringify({ exp: expiresAt })).toString('base64url')
  return { token: `${payload}.${sign(payload, secret)}`, expiresAt }
}

function isValid(token: string): boolean {
  const secret = getSecret()
  if (!secret) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = sign(payload, secret)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof exp === 'number' && exp > Date.now()
  } catch {
    return false
  }
}

/** Returns a 401 response when the request lacks a valid auctioneer token, otherwise null. */
export function requireAuth(req: Request): NextResponse | null {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (token && isValid(token)) return null
  return NextResponse.json(
    { success: false, message: 'Auctioneer authorization required' },
    { status: 401 }
  )
}
