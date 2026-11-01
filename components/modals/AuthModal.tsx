'use client'

import React, { useState } from 'react'
import { Shield, Lock, X } from 'lucide-react'

export function AuthModal({
  onClose,
  onVerify,
  error
}: {
  onClose: () => void
  onVerify: (pin: string) => void
  error?: string
}) {
  const [pin, setPin] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onVerify(pin)
  }

  return (
    <div className="modal-backdrop">
      <div className="setup-modal" style={{ maxWidth: '380px' }}>
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--red)',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Shield size={18} />
            </div>
            <div>
              <span className="section-kicker" style={{ color: 'var(--red)' }}>SECURITY GATE</span>
              <h2 style={{ fontSize: '24px', margin: 0 }}>Auctioneer <em>PIN.</em></h2>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '14px 0 16px', lineHeight: 1.5 }}>
          Master auctioneer authorization required to award players, modify team budgets, flip tosses, and schedule fixtures. (Default PIN: <b>1234</b>)
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label>
            ENTER 4-DIGIT PIN
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="••••"
              autoFocus
              style={{
                fontSize: '24px',
                letterSpacing: '8px',
                textAlign: 'center',
                padding: '12px',
                marginTop: '6px'
              }}
              required
            />
          </label>

          {error && (
            <div style={{ color: 'var(--red)', fontSize: '11px', textAlign: 'center', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '8px' }}>
            <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">
              <Lock size={14} /> Unlock Console
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

