'use client'

import React from 'react'
import {
  CalendarDays,
  Plus,
  Dices,
  Coins,
  Trash2
} from 'lucide-react'
import type { Match, Team } from '@/lib/server/db'

export function ScheduleView({
  matches,
  teams,
  filter,
  setFilter,
  isAuctioneer,
  onAddMatch,
  onGenerateRoundRobin,
  onDeleteMatch,
  onOpenToss,
  onQuickToss
}: {
  matches: Match[]
  teams: Team[]
  filter: string
  setFilter: (f: string) => void
  isAuctioneer: boolean
  onAddMatch: () => void
  onGenerateRoundRobin: () => void
  onDeleteMatch: (id: string) => void
  onOpenToss: (m: Match) => void
  onQuickToss: () => void
}) {
  const filtered = matches.filter(m => {
    if (filter === 'ALL') return true
    return m.status === filter
  })

  return (
    <div className="content-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">TOURNAMENT FIXTURES & TOSS DESK</span>
          <h2>Match <em>Schedules.</em></h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="ghost-btn" onClick={onQuickToss} title="Instant 3D coin toss simulator">
            <Coins size={16} /> Quick Coin Toss
          </button>
          <button
            className="ghost-btn"
            onClick={onGenerateRoundRobin}
            disabled={teams.length < 2}
            title="Auto-generates balanced fixtures between all teams"
          >
            <Dices size={16} /> Auto-Generate Round Robin
          </button>
          <button className="primary-btn" onClick={onAddMatch}>
            <Plus size={16} /> Schedule Single Match
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="filter-row" style={{ margin: 0 }}>
          <button className={filter === 'ALL' ? 'filter-active' : ''} onClick={() => setFilter('ALL')}>
            ALL FIXTURES <span>{matches.length}</span>
          </button>
          <button className={filter === 'Scheduled' ? 'filter-active' : ''} onClick={() => setFilter('Scheduled')}>
            UPCOMING ({matches.filter(m => m.status === 'Scheduled').length})
          </button>
          <button className={filter === 'Toss Done' ? 'filter-active' : ''} onClick={() => setFilter('Toss Done')}>
            TOSS COMPLETED ({matches.filter(m => m.status === 'Toss Done').length})
          </button>
        </div>
      </div>

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--panel)', border: '1px dashed var(--line)', borderRadius: '16px' }}>
          <CalendarDays size={44} style={{ color: 'var(--gold)', marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '32px', margin: '0 0 8px' }}>No Matches Scheduled Yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: '13px', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            Auctioneer: Click &quot;Auto-Generate Round Robin&quot; to automatically create fixtures between all your franchises, or create matches manually.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="primary-btn" onClick={onGenerateRoundRobin} disabled={teams.length < 2}>
              <Dices size={16} /> Auto-Generate Round Robin
            </button>
            <button className="ghost-btn" onClick={onAddMatch}>
              <Plus size={16} /> Schedule Match
            </button>
          </div>
        </div>
      ) : (
        <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {filtered.map(m => (
            <article
              key={m.id}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.5px', fontWeight: 800 }}>
                  MATCH #{m.matchNumber} · {m.stage.toUpperCase()}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className={`status ${m.status.toLowerCase().replace(/\s+/g, '-')}`}
                    style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}
                  >
                    {m.status}
                  </span>
                  <button
                    className="icon-btn"
                    onClick={() => onDeleteMatch(m.id)}
                    title="Delete match fixture"
                    style={{ width: '26px', height: '26px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Teams Matchup Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <h4 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', margin: 0, letterSpacing: '0.5px' }}>{m.teamA}</h4>
                  <small style={{ color: 'var(--muted)', fontSize: '11px' }}>Home</small>
                </div>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 200, 61, 0.1)',
                    border: '1px solid var(--line-strong)',
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: 'Bebas Neue',
                    fontSize: '15px',
                    color: 'var(--gold)'
                  }}
                >
                  VS
                </div>
                <div style={{ textAlign: 'right', flex: 1 }}>
                  <h4 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', margin: 0, letterSpacing: '0.5px' }}>{m.teamB}</h4>
                  <small style={{ color: 'var(--muted)', fontSize: '11px' }}>Away</small>
                </div>
              </div>

              {/* Toss Status Banner */}
              {m.tossWinner ? (
                <div
                  style={{
                    background: '#090e18',
                    border: '1px solid var(--line-strong)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: 'var(--text)'
                  }}
                >
                  <span style={{ color: 'var(--gold)', fontWeight: 800 }}>TOSS: </span>
                  <b>{m.tossWinner}</b> won toss &amp; chose to <b>{m.tossDecision}</b>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
                  Toss not conducted yet.
                </div>
              )}

              {/* Footer Meta & Toss Trigger */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                <div>
                  <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10px' }}>
                    📅 {m.date} · ⏰ {m.time}
                  </small>
                  <small style={{ display: 'block', color: '#64748b', fontSize: '10px' }}>
                    📍 {m.venue}
                  </small>
                </div>
                <button
                  className="primary-btn"
                  style={{ padding: '8px 12px', fontSize: '11px' }}
                  onClick={() => onOpenToss(m)}
                >
                  <Coins size={14} /> {m.tossWinner ? 'Re-flip Toss' : 'Run Coin Toss'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

