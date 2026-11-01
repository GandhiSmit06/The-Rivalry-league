'use client'

import React from 'react'
import { Plus, Trash2, DollarSign, Users } from 'lucide-react'
import type { Team, Player } from '@/lib/server/db'

export function TeamsView({
  teams,
  players,
  maxSquadSize,
  isAuctioneer,
  onAddTeam,
  onDeleteTeam,
  onAdjustBudget,
  onUpdateSquadLimit
}: {
  teams: Team[]
  players: Player[]
  maxSquadSize: number
  isAuctioneer: boolean
  onAddTeam: () => void
  onDeleteTeam: (name: string) => void
  onAdjustBudget: (t: Team) => void
  onUpdateSquadLimit: (limit: number) => void
}) {
  return (
    <div className="content-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">FRANCHISE ROSTER & PURSE CONTROL</span>
          <h2>The <em>Franchises.</em></h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--panel)', border: '1px solid var(--line)', padding: '6px 12px', borderRadius: '10px' }}>
            <Users size={14} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Squad Quota:</span>
            <select
              value={maxSquadSize}
              onChange={e => onUpdateSquadLimit(Number(e.target.value))}
              style={{ background: 'none', border: 0, color: 'var(--gold)', fontWeight: 800, fontSize: '12px', outline: 'none', cursor: 'pointer' }}
            >
              {[3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => (
                <option key={n} value={n} style={{ background: '#0e1626', color: '#fff' }}>
                  {n} Players/Team
                </option>
              ))}
            </select>
          </div>
          <button className="primary-btn" onClick={onAddTeam}>
            <Plus size={16} /> Add Franchise
          </button>
        </div>
      </div>

      {teams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--panel)', border: '1px dashed var(--line)', borderRadius: '16px' }}>
          <Users size={44} style={{ color: 'var(--gold)', marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '32px', margin: '0 0 8px' }}>No Franchises Registered</h3>
          <p style={{ color: 'var(--muted)', fontSize: '13px', maxWidth: '380px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            Auctioneer: Create teams to begin allocating purse budgets and assembling rosters.
          </p>
          <button className="primary-btn" onClick={onAddTeam}>
            <Plus size={16} /> Add First Franchise
          </button>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map(t => {
            const teamPlayers = players.filter(p => p.soldTo === t.name)
            const isFull = t.players >= maxSquadSize
            const spentPct = Math.min(100, Math.round(((t.spent || 0) / (t.purse + t.spent || 1)) * 100))
            return (
              <article className="team-card" key={t.id}>
                {/* Accent top border strip with franchise color */}
                <div style={{ height: '3px', width: '100%', background: t.color }} />

                <div className="team-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="team-logo" style={{ background: t.color, color: '#0A0F1F' }}>
                      {t.short}
                    </span>
                    <div>
                      <h3>{t.name}</h3>
                      <p>Owner: {t.owner}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className="budget-badge"
                      onClick={() => onAdjustBudget(t)}
                      title="Adjust franchise purse"
                    >
                      <DollarSign size={12} /> Purse
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => onDeleteTeam(t.name)}
                      title="Delete franchise"
                      style={{ width: '30px', height: '30px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="team-card-stats">
                  <div>
                    <small>PURSE LEFT</small>
                    <b style={{ color: 'var(--gold)' }}>₹{t.purse.toLocaleString()}</b>
                  </div>
                  <div>
                    <small>SQUAD</small>
                    <b>
                      {t.players} <i>/ {maxSquadSize}</i>
                    </b>
                  </div>
                  <div>
                    <small>TOTAL SPENT</small>
                    <b>₹{t.spent.toLocaleString()}</b>
                  </div>
                </div>

                <div className="team-progress">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '5px' }}>
                    <span>Budget Spent</span>
                    <span>{spentPct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                    <span
                      style={{
                        display: 'block',
                        height: '100%',
                        width: `${spentPct}%`,
                        background: t.color,
                        borderRadius: '999px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    Roster Slots ({t.players}/{maxSquadSize})
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: isFull ? 'var(--red)' : 'var(--green)',
                      fontWeight: 800,
                      letterSpacing: '0.5px'
                    }}
                  >
                    {isFull ? 'SQUAD FULL' : `${maxSquadSize - t.players} OPEN`}
                  </span>
                </div>

                <div className="squad-mini">
                  {teamPlayers.map(p => (
                    <span
                      key={p.id}
                      title={`#${p.number} ${p.name} (₹${p.soldPrice?.toLocaleString()}) · ${p.role}`}
                    >
                      #{p.number}
                    </span>
                  ))}
                  {Array.from({ length: Math.max(0, maxSquadSize - t.players) }).map((_, i) => (
                    <span
                      className="empty-slot"
                      key={i}
                      title={`Slot ${t.players + i + 1} Open`}
                    >
                      +
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
