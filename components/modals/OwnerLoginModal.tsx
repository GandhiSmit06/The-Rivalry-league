'use client'

import { useEffect, useState } from 'react'
import { Check, KeyRound, X } from 'lucide-react'
import type { Team } from '@/lib/server/db'
import { apiOwner } from '@/lib/client/api'

function generatePin(): string {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join('')
}

/** Superadmin creates or resets the login an owner uses. PINs are hashed, so they can only be reset. */
export function OwnerLoginModal({
  team,
  onClose,
  onSave
}: {
  team: Team
  onClose: () => void
  onSave: (teamId: string, loginId: string, pin: string) => Promise<string | null>
}) {
  const [loginId, setLoginId] = useState('')
  const [hasLogin, setHasLogin] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    apiOwner.getLogin(team.id).then(res => {
      if (active && res.success && res.loginId) {
        setLoginId(res.loginId)
        setHasLogin(true)
      }
    })
    return () => {
      active = false
    }
  }, [team.id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const failure = await onSave(team.id, loginId, pin)
    if (failure) setError(failure)
    else setSaved(true)
  }

  return (
    <div className="modal-backdrop">
      <div className="setup-modal" style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <div>
            <span className="section-kicker">Superadmin · {team.name}</span>
            <h2>Owner <em>login</em></h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        {saved ? (
          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              Send these to {team.owner}. The PIN won&apos;t be shown again.
            </p>
            <div className="toss-line">
              <div>Login ID: <b>{loginId.trim().toLowerCase()}</b></div>
              <div>PIN: <b>{pin.trim()}</b></div>
            </div>
            <div className="modal-actions">
              <button className="primary-btn" onClick={onClose}><Check size={14} /> Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label>
              Login ID
              <input
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder={team.short.toLowerCase()}
                autoCapitalize="none"
                required
              />
            </label>
            <label>
              {hasLogin ? 'New PIN (replaces the old one)' : 'PIN (6+ characters)'}
              <input value={pin} onChange={e => setPin(e.target.value)} autoComplete="off" required />
            </label>
            <button type="button" className="text-btn" onClick={() => setPin(generatePin())}>
              <KeyRound size={13} /> Generate a strong PIN
            </button>
            {error && <div style={{ color: 'var(--red)', fontSize: 12, fontWeight: 600 }}>{error}</div>}
            <div className="modal-actions">
              <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="primary-btn"><Check size={14} /> Save Login</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
