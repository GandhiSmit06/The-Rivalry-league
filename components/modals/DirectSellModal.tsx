'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Gavel, X } from 'lucide-react'
import type { Player, Team } from '@/lib/server/db'

export function DirectSellModal({
  players,
  teams,
  maxSquadSize,
  initialPlayer,
  onClose,
  onSell
}: {
  players: Player[]
  teams: Team[]
  maxSquadSize: number
  initialPlayer?: Player | null
  onClose: () => void
  onSell: (playerId: number, teamName: string, price: number) => void
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(
    initialPlayer ? initialPlayer.id : (players[0]?.id || 0)
  )
  const selectedPlayer = useMemo(() => {
    return players.find(p => p.id === selectedPlayerId) || null
  }, [players, selectedPlayerId])

  const [selectedTeamName, setSelectedTeamName] = useState<string>(
    initialPlayer?.soldTo || (teams[0]?.name || '')
  )
  const selectedTeam = useMemo(() => {
    return teams.find(t => t.name === selectedTeamName) || null
  }, [teams, selectedTeamName])

  const [price, setPrice] = useState<number>(
    initialPlayer?.soldPrice || initialPlayer?.base || 500
  )

  useEffect(() => {
    if (selectedPlayer) {
      setPrice(selectedPlayer.soldPrice || selectedPlayer.base || 500)
      if (selectedPlayer.soldTo) {
        setSelectedTeamName(selectedPlayer.soldTo)
      }
    }
  }, [selectedPlayer])

  const isSquadFull = selectedTeam ? (selectedTeam.players >= maxSquadSize && selectedPlayer?.soldTo !== selectedTeam.name) : false
  const isPurseShort = selectedTeam ? (price > selectedTeam.purse + (selectedPlayer?.soldTo === selectedTeam.name ? (selectedPlayer.soldPrice || 0) : 0)) : false

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlayer || !selectedTeamName || price < 0) return
    onSell(selectedPlayer.id, selectedTeamName, price)
  }

  return (
    <div className="modal-backdrop">
      <div className="setup-modal" style={{ maxWidth: '520px' }}>
        <div className="modal-head">
          <div>
            <span className="section-kicker">AUCTIONEER DESK · DIRECT HAMMER</span>
            <h2>Sell <em>Player to Franchise.</em></h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label>
            1. CHOOSE PLAYER TO SELL
            <select
              value={selectedPlayerId}
              onChange={e => setSelectedPlayerId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '12px',
                fontWeight: 600,
                marginTop: '6px'
              }}
            >
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.number} {p.name} · Base ₹{p.base || 500} {p.status === 'Sold' ? `[Sold: ${p.soldTo} for ₹${p.soldPrice}]` : `[${p.status}]`}
                </option>
              ))}
            </select>
          </label>

          <label>
            2. CHOOSE WINNING FRANCHISE
            <select
              value={selectedTeamName}
              onChange={e => setSelectedTeamName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '12px',
                fontWeight: 600,
                marginTop: '6px'
              }}
              required
            >
              <option value="">-- Select Team --</option>
              {teams.map(t => {
                const full = t.players >= maxSquadSize && selectedPlayer?.soldTo !== t.name
                return (
                  <option key={t.id} value={t.name} disabled={full}>
                    {t.name} (Purse: ₹{t.purse.toLocaleString()} · Squad: {t.players}/{maxSquadSize}) {full ? '[FULL]' : ''}
                  </option>
                )
              })}
            </select>
          </label>

          <label>
            3. CUSTOM SOLD PRICE IN RUPEES (₹)
            <input
              type="number"
              value={price}
              onChange={e => setPrice(Number(e.target.value) || 0)}
              min="0"
              step="50"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                color: 'var(--gold)',
                fontSize: '14px',
                fontWeight: 800,
                marginTop: '6px'
              }}
              required
            />
          </label>

          {/* Quick preset price chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', color: 'var(--muted)', alignSelf: 'center', marginRight: '4px' }}>Quick Presets:</span>
            <button type="button" className="chip-btn" onClick={() => setPrice(selectedPlayer?.base || 500)}>
              Base ₹{selectedPlayer?.base || 500}
            </button>
            <button type="button" className="chip-btn" onClick={() => setPrice(500)}>₹500</button>
            <button type="button" className="chip-btn" onClick={() => setPrice(1000)}>₹1,000</button>
            <button type="button" className="chip-btn" onClick={() => setPrice(2500)}>₹2,500</button>
            <button type="button" className="chip-btn" onClick={() => setPrice(5000)}>₹5,000</button>
            <button type="button" className="chip-btn" onClick={() => setPrice(price + 100)}>+₹100</button>
            <button type="button" className="chip-btn" onClick={() => setPrice(price + 500)}>+₹500</button>
            <button type="button" className="chip-btn" onClick={() => setPrice(price + 1000)}>+₹1,000</button>
          </div>

          {/* Live Impact Preview */}
          {selectedPlayer && selectedTeam && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--line-strong)', padding: '12px 14px', borderRadius: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)' }}>
                <span>Player: <b>#{selectedPlayer.number} {selectedPlayer.name}</b></span>
                <span style={{ color: 'var(--gold)', fontWeight: 800 }}>Amount: ₹{price.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                <span>Franchise: <b>{selectedTeam.name}</b></span>
                <span>Remaining Purse: <b>₹{(selectedTeam.purse - price).toLocaleString()}</b></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                <span>Squad Slots: <b>{selectedTeam.players} / {maxSquadSize}</b> ➔ <b>{selectedPlayer.soldTo === selectedTeam.name ? selectedTeam.players : selectedTeam.players + 1} / {maxSquadSize}</b></span>
              </div>

              {isPurseShort && (
                <div style={{ color: 'var(--red)', fontWeight: 700, marginTop: '4px' }}>
                  ⚠️ Warning: {selectedTeam.name} only has ₹{selectedTeam.purse.toLocaleString()} purse left!
                </div>
              )}
              {isSquadFull && (
                <div style={{ color: 'var(--red)', fontWeight: 700, marginTop: '4px' }}>
                  ⚠️ Error: {selectedTeam.name} has already reached the maximum squad limit ({maxSquadSize} players)!
                </div>
              )}
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '8px' }}>
            <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="primary-btn"
              disabled={!selectedTeamName || isSquadFull || isPurseShort || price < 0}
            >
              <Gavel size={16} /> Hammer Down: Sell Player for ₹{price.toLocaleString()}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

