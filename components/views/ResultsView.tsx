'use client'

import React from 'react'
import {
  RotateCcw,
  Trophy,
  CircleDollarSign,
  Users,
  Medal,
  Zap
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
  const best = soldPlayers.sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))[0]

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
          style={{ color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
          title="Reset all purchases and budgets back to initial state"
        >
          <RotateCcw size={15} /> Reset Entire Auction
        </button>
      </div>

      {/* Marquee Buy Banner */}
      <div className="marquee-card">
        <span className="marquee-trophy">
          <Trophy size={28} />
        </span>
        <div>
          <span className="section-kicker">MARQUEE BUY OF THE SEASON</span>
          <h3>{best ? `#${best.number} ${best.name}` : 'Awaiting the first hammer strike'}</h3>
          <p>
            {best
              ? `Awarded to ${best.soldTo} for ₹${best.soldPrice?.toLocaleString()}`
              : 'The Auctioneer has not finalized any sales yet.'}
          </p>
        </div>
        <strong>{best ? `₹${best.soldPrice?.toLocaleString()}` : '—'}</strong>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<CircleDollarSign size={24} />}
          label="TOTAL SPEND"
          value={`₹${teams.reduce((a, t) => a + t.spent, 0).toLocaleString()}`}
          color="gold"
        />
        <StatCard
          icon={<Users size={24} />}
          label="PLAYERS SOLD"
          value={`${soldPlayers.length} / ${players.length}`}
          color="cyan"
        />
        <StatCard
          icon={<Medal size={24} />}
          label="TEAMS READY"
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
              ? 'COMPLETE'
              : 'IN PLAY'
          }
          color="red"
        />
      </div>

      <div className="rosters-section">
        <h3>CONFIRMED SQUADS & PLAYER ASSIGNMENTS</h3>
        <div className="roster-grid">
          {teams.map(t => {
            const teamSquad = players.filter(p => p.soldTo === t.name)
            return (
              <div className="roster-card" key={t.id}>
                <div className="roster-head" style={{ borderLeftColor: t.color }}>
                  <b>{t.name}</b>
                  <span>₹{t.spent.toLocaleString()} spent · {t.players}/{maxSquadSize}</span>
                </div>
                {teamSquad.length === 0 ? (
                  <p className="roster-empty">No players acquired yet</p>
                ) : (
                  teamSquad.map(p => (
                    <div className="roster-player" key={p.id}>
                      <span className="player-number-pill" style={{ padding: '2px 5px', fontSize: '11px' }}>
                        #{p.number}
                      </span>
                      <span className="roster-name">{p.name}</span>
                      <span className="roster-price">₹{p.soldPrice?.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      </div>

      {players.some(p => p.status === 'Unsold') && (
        <div className="rosters-section" style={{ marginTop: '30px' }}>
          <h3 style={{ color: 'var(--muted)' }}>UNSOLD PLAYER POOL</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {players
              .filter(p => p.status === 'Unsold')
              .map(p => (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <b style={{ display: 'block', fontSize: '12px' }}>#{p.number} {p.name}</b>
                    <small style={{ color: 'var(--muted)', fontSize: '10px' }}>Base ₹{p.base || 500}</small>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 700 }}>UNSOLD</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
