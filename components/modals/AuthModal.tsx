'use client'

import { useState } from 'react'
import { Lock, X } from 'lucide-react'

type Mode = 'owner' | 'admin'

export function AuthModal({
  onClose,
  onVerify,
  onOwnerLogin,
  error
}: {
  onClose: () => void
  onVerify: (pin: string) => void
  onOwnerLogin: (loginId: string, pin: string) => void
  error?: string
}) {
  const [mode, setMode] = useState<Mode>('owner')
  const [loginId, setLoginId] = useState('')
  const [pin, setPin] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'admin') onVerify(pin)
    else onOwnerLogin(loginId, pin)
  }

  return (
    <div className="modal-backdrop">
      <div className="setup-modal" style={{ maxWidth: 400 }}>
        <div className="modal-head">
          <div>
            <span className="section-kicker">Secure sign in</span>
            <h2>{mode === 'admin' ? 'Superadmin' : 'Team owner'}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="segmented" style={{ marginTop: 14, maxWidth: 'none' }}>
          <button type="button" className={mode === 'owner' ? 'active' : ''} onClick={() => setMode('owner')}>
            Team owner
          </button>
          <button type="button" className={mode === 'admin' ? 'active' : ''} onClick={() => setMode('admin')}>
            Superadmin
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'owner' && (
            <label>
              Login ID
              <input
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                required
              />
            </label>
          )}
          <label>
            PIN
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <div style={{ color: 'var(--red)', fontSize: 12, fontWeight: 600 }}>{error}</div>}
          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn"><Lock size={14} /> Sign in</button>
          </div>
        </form>
      </div>
    </div>
  )
}
