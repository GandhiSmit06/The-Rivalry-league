'use client'

import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { Team } from '@/lib/server/db'
import { apiOwner, type OwnerDetails } from '@/lib/client/api'

/** Superadmin sets a team's name, its owner and the login they choose. Passwords are hashed, so they can only be replaced. */
export function OwnerLoginModal({
  team,
  onClose,
  onSave
}: {
  team: Team
  onClose: () => void
  onSave: (teamId: string, details: OwnerDetails) => Promise<string | null>
}) {
  const [teamName, setTeamName] = useState(team.name)
  const [ownerName, setOwnerName] = useState(team.owner)
  const [loginId, setLoginId] = useState('')
  const [hasLogin, setHasLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    apiOwner.getLogin(team.id).then(res => {
      if (!active || !res.loginId) return
      setLoginId(res.loginId)
      setHasLogin(true)
    })
    return () => {
      active = false
    }
  }, [team.id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const failure = await onSave(team.id, { teamName, ownerName, loginId, password })
    setSaving(false)
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
              {password.trim()
                ? `Send these to ${ownerName.trim() || 'the owner'}. The password won't be shown again.`
                : 'Saved. The owner keeps their current password.'}
            </p>
            <div className="toss-line">
              <div>Team: <b>{teamName.trim()}</b></div>
              <div>Login ID: <b>{loginId.trim().toLowerCase()}</b></div>
              {password.trim() && <div>Password: <b>{password.trim()}</b></div>}
            </div>
            <div className="modal-actions">
              <button className="primary-btn" onClick={onClose}><Check size={14} /> Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label>
              Team name
              <input value={teamName} onChange={e => setTeamName(e.target.value)} required />
            </label>
            <label>
              Owner name
              <input value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
            </label>
            <label>
              Login ID
              <input
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                required
              />
            </label>
            <label>
              {hasLogin ? 'New password (leave blank to keep it)' : 'Password (6+ characters)'}
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                required={!hasLogin}
              />
            </label>
            {error && <div style={{ color: 'var(--red)', fontSize: 12, fontWeight: 600 }}>{error}</div>}
            <div className="modal-actions">
              <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={saving}>
                <Check size={14} /> {saving ? 'Saving...' : 'Save Owner'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
