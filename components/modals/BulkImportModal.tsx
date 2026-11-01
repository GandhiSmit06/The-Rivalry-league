'use client'

import React, { useState } from 'react'
import { Upload, X } from 'lucide-react'

export function BulkImportModal({
  onClose,
  onImport,
  nextNumber
}: {
  onClose: () => void
  onImport: (text: string) => void
  nextNumber: number
}) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    onImport(text)
  }

  return (
    <div className="modal-backdrop">
      <div className="setup-modal" style={{ maxWidth: '520px' }}>
        <div className="modal-head">
          <div>
            <span className="section-kicker">ROSTER INGESTION · STARTING AT #{nextNumber}</span>
            <h2>Bulk <em>Import.</em></h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label>
            PASTE PLAYER NAMES (ONE PER LINE OR &quot;Name, BasePrice&quot;)
            <textarea
              placeholder="Rohit Sharma&#10;Jasprit Bumrah&#10;Virat Kohli&#10;Hardik Pandya"
              value={text}
              onChange={e => setText(e.target.value)}
              style={{
                width: '100%',
                height: '160px',
                marginTop: '8px',
                background: '#090e18',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                color: 'var(--text)',
                padding: '12px',
                fontSize: '11px',
                fontFamily: 'monospace',
                outline: 'none'
              }}
              required
            />
          </label>
          <p style={{ color: 'var(--muted)', fontSize: '11px', margin: 0, lineHeight: 1.4 }}>
            💡 Players will automatically be assigned sequential numbers starting from <b>#{nextNumber}</b>, with default base price ₹500.
          </p>
          <div className="modal-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn"><Upload size={16} /> Import Players (₹500 Base)</button>
          </div>
        </form>
      </div>
    </div>
  )
}

