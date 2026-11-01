'use client'

import {
  RotateCcw,
  Trophy,
  CircleDollarSign,
  Users,
  Medal,
  Zap,
  Sparkles,
  ShieldAlert
} from 'lucide-react'
import type { Player, Team } from '@/lib/server/db'
import { StatCard } from '@/components/common/StatCard'

export function ResultsView({
  players,
  teams,
  maxSquadSize,
  isAuctioneer,
  onReset
}: {
  players: Player[]
  teams: Team[]
  maxSquadSize: number
  isAuctioneer: boolean
  onReset: () => void
}) {
  const soldPlayers = players.filter(p => p.status === 'Sold')
  const best = [...soldPlayers].sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))[0]

  return (
    <div className="content-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">POST-AUCTION INTELLIGENCE & SQUADS</span>
          <h2>Tournament <em>Results.</em></h2>
        </div>
        <button
          className="ghost-btn"
          onClick={onReset}
          style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.08)' }}
          title="Reset all purchases and budgets back to initial state"
        >
          <RotateCcw size={15} /> Reset Entire Auction
        </button>
      </div>

      {/* Marquee Buy Banner */}
      <div className="marquee-card">
        <div className="marquee-trophy-wrap">
          <Trophy size={32} />
        </div>
        <div className="marquee-info">
          <span className="marquee-label">
            <Sparkles size={12} style={{ color: 'var(--gold)' }} />
            MARQUEE BUY OF THE TOURNAMENT
          </span>
          <h3>{best ? `#${best.number} ${best.name}` : 'Awaiting the first hammer strike'}</h3>
          <p>
            {best ? (
              <>
                Acquired by <strong style={{ color: '#fff' }}>{best.soldTo}</strong> for an exceptional{' '}
                <strong style={{ color: 'var(--gold)' }}>₹{(best.soldPrice || 0).toLocaleString()}</strong>
              </>
            ) : (
              'The Chief Auctioneer has not finalized any player sales yet. Spin the wheel to begin!'
            )}
          </p>
        </div>
        <div className="marquee-price-tag">
          <small>RECORD BID</small>
          <b>{best ? `₹${(best.soldPrice || 0).toLocaleString()}` : '₹0'}</b>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="stat-grid">
        <StatCard
          icon={<CircleDollarSign size={24} />}
          label="TOTAL SPEND"
          value={`₹${teams.reduce((a, t) => a + (t.spent || 0), 0).toLocaleString()}`}
          color="gold"
        />
        <StatCard
          icon={<Users size={24} />}
          label="PLAYERS DRAFTED"
          value={`${soldPlayers.length} / ${players.length}`}
          color="cyan"
        />
        <StatCard
          icon={<Medal size={24} />}
          label="SQUADS ACTIVE"
          value={`${teams.filter(t => t.players > 0).length} / ${teams.length}`}
          color="green"
        />
        <StatCard
          icon={<Zap size={24} />}
          label="AUCTION STATUS"
          value={
            players.length === 0
              ? 'EMPTY'
              : players.every(p => p.status !== 'Upcoming')
              ? 'COMPLETED'
              : 'IN PLAY'
          }
          color="red"
        />
      </div>

      {/* Confirmed Squads by Franchise */}
      <div className="rosters-section">
        <div className="rosters-title-bar">
          <div>
            <h3>CONFIRMED SQUADS & PLAYER ASSIGNMENTS</h3>
            <p>Official franchise rosters finalized under Auctioneer hammer</p>
          </div>
          <span className="rosters-total-pill">
            {teams.length} Franchises · Target {maxSquadSize} Players Each
          </span>
        </div>

        <div className="roster-grid">
          {teams.map(t => {
            const teamSquad = players.filter(p => p.soldTo === t.name)
            const count = teamSquad.length
            const isFull = count >= maxSquadSize
            const progressPct = Math.min(100, Math.round((count / (maxSquadSize || 1)) * 100))

            return (
              <div className="roster-card" key={t.id}>
                {/* Franchise Header Banner */}
                <div className="roster-head" style={{ borderLeftColor: t.color || 'var(--gold)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      className="team-monogram"
                      style={{ background: t.color || '#22D3EE', color: '#090e18' }}
                    >
                      {t.short || t.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <b className="team-title">{t.name}</b>
                      <small className="team-owner">Owner: {t.owner}</small>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="roster-count-badge" style={isFull ? { color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' } : undefined}>
                      {count}/{maxSquadSize} {isFull ? 'FULL' : 'PLAYERS'}
                    </span>
                    <span className="roster-spent-text">₹{(t.spent || 0).toLocaleString()} spent</span>
                  </div>
                </div>

                {/* Squad Capacity Bar */}
                <div className="roster-progress-track">
                  <div
                    className="roster-progress-fill"
                    style={{
                      width: `${progressPct}%`,
                      background: isFull
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : `linear-gradient(90deg, ${t.color || 'var(--gold)'}, var(--gold))`
                    }}
                  />
                </div>

                {/* Players List or Empty Placeholder */}
                <div className="roster-body">
                  {teamSquad.length === 0 ? (
                    <div className="roster-empty">
                      <Users size={20} style={{ opacity: 0.35, marginBottom: '6px' }} />
                      <p>No players acquired yet</p>
                      <small>₹{(t.purse || 0).toLocaleString()} remaining purse</small>
                    </div>
                  ) : (
                    <div className="roster-player-list">
                      {teamSquad.map(p => (
                        <div className="roster-player" key={p.id}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <span className="player-number-pill">#{p.number}</span>
                            <span className="roster-name">{p.name}</span>
                          </div>
                          <span className="roster-price">₹{(p.soldPrice || p.base || 500).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer with Remaining Purse */}
                <div className="roster-footer">
                  <span>Available Purse:</span>
                  <b style={{ color: 'var(--gold)', fontFamily: 'JetBrains Mono, monospace' }}>
                    ₹{(t.purse || 0).toLocaleString()}
                  </b>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Unsold Players Pool Section */}
      {players.some(p => p.status === 'Unsold') && (
        <div className="unsold-section">
          <div className="unsold-title-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: '#f87171' }} />
              <div>
                <h3>UNSOLD PLAYERS POOL</h3>
                <p>Eligible for Round 2 accelerated re-auction</p>
              </div>
            </div>
            <span className="unsold-count-pill">
              {players.filter(p => p.status === 'Unsold').length} Players Unsold
            </span>
          </div>

          <div className="unsold-grid">
            {players
              .filter(p => p.status === 'Unsold')
              .map(p => (
                <div className="unsold-card" key={p.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="player-number-pill">#{p.number}</span>
                    <b style={{ fontSize: '13px' }}>{p.name}</b>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="unsold-badge">UNSOLD</span>
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10px', marginTop: '2px' }}>
                      Base ₹{(p.base || 500).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
