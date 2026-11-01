'use client'

import { useEffect, useState } from 'react'
import { Check, KeyRound, X } from 'lucide-react'
import type { Team } from '@/lib/server/db'
import { apiOwner } from '@/lib/client/api'

const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'

function randomText(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('')
}

function generateLoginId(team: Team): string {
  return `${team.short.toLowerCase()}-${randomText(4)}`
}

/** Superadmin assigns a team's owner and generates or resets their login. PINs are hashed, so they can only be reset. */
export function OwnerLoginModal({
  team,
  onClose,
  onSave
}: {
  team: Team
  onClose: () => void
  onSave: (teamId: string, ownerName: string, loginId: string, pin: string) => Promise<string | null>
}) {
  const [ownerName, setOwnerName] = useState(team.owner)
  const [loginId, setLoginId] = useState('')
  const [hasLogin, setHasLogin] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    apiOwner.getLogin(team.id).then(res => {
      if (!active || !res.success) return
      if (res.loginId) {
        setLoginId(res.loginId)
        setHasLogin(true)
      } else {
        setLoginId(generateLoginId(team))
        setPin(randomText(8))
      }
    })
    return () => {
      active = false
    }
  }, [team])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const failure = await onSave(team.id, ownerName, loginId, pin)
    if (failure) setError(failure)
    else setSaved(true)
  }

  return (
    <div className="modal-backdrop">
      <div className="setup-modal" style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <div>
            <span className="section-kicker">Superadmin · {team.name}</span>
            <h2>Assign <em>owner</em></h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        {saved ? (
          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              Send these to {ownerName.trim() || 'the owner'}. The PIN won&apos;t be shown again.
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
              Owner name
              <input value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
            </label>
            <label>
              Login ID
              <input value={loginId} onChange={e => setLoginId(e.target.value)} autoCapitalize="none" required />
            </label>
            <label>
              {hasLogin ? 'New PIN (replaces the old one)' : 'PIN (6+ characters)'}
              <input value={pin} onChange={e => setPin(e.target.value)} autoComplete="off" required />
            </label>
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                setLoginId(generateLoginId(team))
                setPin(randomText(8))
              }}
            >
              <KeyRound size={13} /> Generate new ID and PIN
            </button>
            {error && <div style={{ color: 'var(--red)', fontSize: 12, fontWeight: 600 }}>{error}</div>}
            <div className="modal-actions">
              <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="primary-btn"><Check size={14} /> Save Owner</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
