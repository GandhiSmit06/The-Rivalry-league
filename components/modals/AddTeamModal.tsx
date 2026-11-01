'use client'

import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'

export function AddTeamModal({
  defaultPurse,
  onClose,
  onAdd
}: {
  defaultPurse: number
  onClose: () => void
  onAdd: (team: { name: string; short: string; owner: string; color: string; purse: number; tagline: string }) => void
}) {
  const [name, setName] = useState('')
  const [short, setShort] = useState('')
  const [owner, setOwner] = useState('')
  const [color, setColor] = useState('#22D3EE')
  const [purse, setPurse] = useState<number>(defaultPurse)
  const [tagline, setTagline] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      short: short.trim() || name.slice(0, 2).toUpperCase(),
      owner: owner.trim() || 'Owner',
      color,
      purse,
      tagline: tagline.trim() || 'Ready to compete'
    })
  }

  return (
    <div className="modal-backdrop">
      <div className="setup-modal" style={{ maxWidth: '480px' }}>
        <div className="modal-head">
          <div>
            <span className="section-kicker">SUPERADMIN</span>
            <h2>Add <em>Franchise.</em></h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label>
            FRANCHISE NAME
            <input
              placeholder="e.g. Royal Challengers"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </label>
          <div className="field-row" style={{ marginTop: 0 }}>
            <label>
              SHORT CODE (2-3 LETTERS)
              <input
                placeholder="e.g. RCB"
                value={short}
                onChange={e => setShort(e.target.value.toUpperCase())}
                maxLength={3}
              />
            </label>
            <label>
              FRANCHISE COLOR
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{ padding: '4px', height: '42px', cursor: 'pointer' }}
              />
            </label>
          </div>
          <div className="field-row" style={{ marginTop: 0 }}>
            <label>
              CAPTAIN / OWNER
              <input
                placeholder="e.g. Virat"
                value={owner}
                onChange={e => setOwner(e.target.value)}
              />
            </label>
            <label>
              INITIAL PURSE BUDGET (₹)
              <input
                type="number"
                value={purse}
                onChange={e => setPurse(Number(e.target.value) || defaultPurse)}
                required
              />
            </label>
          </div>
          <label>
            TAGLINE / SLOGAN
            <input
              placeholder="e.g. Play Bold"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn"><Plus size={16} /> Register Franchise</button>
          </div>
        </form>
      </div>
    </div>
  )
}

