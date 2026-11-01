'use client'

import React, { useState } from 'react'
import { Settings2, KeyRound, Check, X } from 'lucide-react'

export function SetupModal({
  leagueName,
  season,
  defaultPurse,
  maxSquadSize,
  onClose,
  onSave,
  onChangePin
}: {
  leagueName: string
  season: string
  defaultPurse: number
  maxSquadSize: number
  onClose: () => void
  onSave: (settings: { name: string; season: string; defaultPurse: number; maxSquadSize: number }) => void
  onChangePin: (currentPin: string, newPin: string) => Promise<boolean>
}) {
  const [name, setName] = useState(leagueName)
  const [sea, setSea] = useState(season)
  const [purse, setPurse] = useState(defaultPurse)
  const [squad, setSquad] = useState(maxSquadSize)

  // PIN Changer State
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [pinMsg, setPinMsg] = useState('')

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: name.trim() || 'Sunday Premier Auction',
      season: sea.trim() || '01',
      defaultPurse: purse || 20000,
      maxSquadSize: squad || 11
    })
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinMsg('')
    const ok = await onChangePin(currentPin, newPin)
    if (ok) {
      setPinMsg('PIN successfully updated!')
      setCurrentPin('')
      setNewPin('')
    } else {
      setPinMsg('Failed to update PIN. Check current PIN.')
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="setup-modal" style={{ maxWidth: '520px' }}>
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings2 size={20} style={{ color: 'var(--gold)' }} />
            <div>
              <span className="section-kicker">MASTER CONFIGURATION</span>
              <h2 style={{ fontSize: '24px', margin: 0 }}>League <em>Settings.</em></h2>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSaveSettings} style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="field-row" style={{ marginTop: 0 }}>
            <label>
              LEAGUE NAME
              <input value={name} onChange={e => setName(e.target.value)} required />
            </label>
            <label>
              SEASON #
              <input value={sea} onChange={e => setSea(e.target.value)} required />
            </label>
          </div>

          <div className="field-row" style={{ marginTop: 0 }}>
            <label>
              DEFAULT PURSE / TEAM (₹)
              <input
                type="number"
                value={purse}
                onChange={e => setPurse(Number(e.target.value) || 20000)}
                required
              />
            </label>
            <label>
              TARGET SQUAD SIZE / TEAM
              <select value={squad} onChange={e => setSquad(Number(e.target.value))}>
                {[3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => (
                  <option key={n} value={n}>{n} Players / Team</option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" className="primary-btn" style={{ marginTop: '4px' }}>
            <Check size={16} /> Save League Settings
          </button>
        </form>

        {/* Change Auctioneer PIN Form */}
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
          <span className="section-kicker" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <KeyRound size={12} /> CHANGE AUCTIONEER PIN
          </span>
          <form onSubmit={handlePinSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginTop: '10px', alignItems: 'end' }}>
            <label style={{ margin: 0 }}>
              CURRENT PIN
              <input
                type="password"
                maxLength={6}
                value={currentPin}
                onChange={e => setCurrentPin(e.target.value)}
                placeholder="••••"
                required
              />
            </label>
            <label style={{ margin: 0 }}>
              NEW PIN
              <input
                type="password"
                maxLength={6}
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                placeholder="••••"
                required
              />
            </label>
            <button type="submit" className="ghost-btn" style={{ padding: '10px 14px', height: '40px' }}>
              Update
            </button>
          </form>
          {pinMsg && (
            <small style={{ display: 'block', marginTop: '6px', color: pinMsg.includes('success') ? 'var(--green)' : 'var(--red)', fontSize: '11px', fontWeight: 600 }}>
              {pinMsg}
            </small>
          )}
        </div>
      </div>
    </div>
  )
}

