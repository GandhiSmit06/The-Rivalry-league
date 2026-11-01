import { NextResponse } from 'next/server'
import { DbConflictError } from './db'

/** The JSON every API route returns when something throws, so the UI always has a reason to show. */
export function serverError(err: unknown): NextResponse {
  console.error('[api] request failed:', err)
  const conflict = err instanceof DbConflictError
  const message = conflict ? (err as Error).message : 'That did not go through - please try again'
  return NextResponse.json({ success: false, message }, { status: conflict ? 409 : 500 })
}
