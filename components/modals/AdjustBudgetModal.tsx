'use client'

import React, { useState } from 'react'
import { DollarSign, X } from 'lucide-react'
import type { Team } from '@/lib/server/db'

export function AdjustBudgetModal({
  team,
  onClose,
  onAdjust
}: {
  team: Team
  onClose: () => void
  onAdjust: (teamId: string, mode: 'add' | 'subtract' | 'set', amount: number) => void
}) {
  const [mode, setMode] = useState<'set' | 'add' | 'subtract'>('set')
  const [amount, setAmount] = useState<number>(team.purse)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdjust(team.id || team.name, mode, amount)
  }

  return (
    <div className="modal-backdrop">
      <div className="setup-modal" style={{ maxWidth: '420px' }}>
        <div className="modal-head">
          <div>
            <span className="section-kicker">SUPERADMIN · BUDGET</span>
            <h2>{team.name} <em>Purse.</em></h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>Current Balance</span>
            <b style={{ fontSize: '24px', color: 'var(--gold)', }}>₹{team.purse.toLocaleString()}</b>
          </div>

          <label>
            OPERATION
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
              {(['set', 'add', 'subtract'] as const).map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMode(m)}
                  className={mode === m ? 'primary-btn' : 'ghost-btn'}
                  style={{ textTransform: 'uppercase', padding: '8px 4px', fontSize: '11px' }}
                >
                  {m === 'set' ? 'Set Exactly' : m === 'add' ? '+ Add More' : '- Deduct'}
                </button>
              ))}
            </div>
          </label>

          <label>
            AMOUNT IN RUPEES (₹)
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value) || 0)}
              min="0"
              step="500"
              style={{ fontSize: '16px', fontWeight: 700, marginTop: '6px' }}
              required
            />
          </label>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[1000, 2500, 5000, 10000, 20000].map(val => (
              <button
                type="button"
                key={val}
                className="chip-btn"
                onClick={() => setAmount(val)}
              >
                ₹{val.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="modal-actions" style={{ marginTop: '8px' }}>
            <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">
              <DollarSign size={15} /> Confirm Purse Update
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

