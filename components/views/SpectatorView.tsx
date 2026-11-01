'use client'

import { Lock, Gavel } from 'lucide-react'
import type { Player, Team } from '@/lib/server/db'

export function SpectatorView({
  players,
  teams,
  current,
  bid,
  leader,
  maxSquadSize,
  onUnlock
}: {
  players: Player[]
  teams: Team[]
  current: Player | null
  bid: number
  leader: Team | null
  maxSquadSize: number
  onUnlock: () => void
}) {
  const upcoming = players.filter(p => p.status === 'Upcoming').length
  const unsold = players.filter(p => p.status === 'Unsold').length
  const sold = players.filter(p => p.status === 'Sold').length

  return (
    <div className="spectator">
      <div className="page-heading">
        <div>
          <span className="section-kicker"><span className="live-dot" /> LIVE AUCTION · SPECTATOR VIEW</span>
          <h2>On the <em>Block.</em></h2>
        </div>
        <button className="ghost-btn" onClick={onUnlock}>
          <Lock size={14} /> Auctioneer login
        </button>
      </div>

      <section className="spectator-stage">
        {current ? (
          <>
            <span className="spectator-num">PLAYER #{current.number}</span>
            <h3 className="spectator-name">{current.name}</h3>
            <div className="spectator-bid">
              <small>CURRENT BID</small>
              <b>₹{bid.toLocaleString()}</b>
            </div>
            <p className="spectator-leader">
              {leader ? (
                <>
                  Leading: <b style={{ color: leader.color }}>{leader.name}</b>
                </>
              ) : (
                <>Base price ₹{(current.base || 500).toLocaleString()} · no bids yet</>
              )}
            </p>
          </>
        ) : (
          <div className="spectator-idle">
            <Gavel size={34} />
            <p>
              {players.length === 0
                ? 'No players registered yet.'
                : upcoming + unsold === 0
                ? 'Auction complete - see Results for the final squads.'
                : 'Waiting for the auctioneer to draw the next player…'}
            </p>
          </div>
        )}
        <div className="spectator-counts">
          <span><b>{upcoming}</b> upcoming</span>
          <span><b>{sold}</b> sold</span>
          <span><b>{unsold}</b> unsold</span>
        </div>
      </section>

      <section className="spectator-teams">
        {teams.map(t => (
          <div
            key={t.id}
            className={leader?.id === t.id ? 'spectator-team leading' : 'spectator-team'}
            style={{ borderLeftColor: t.color }}
          >
            <b>{t.name}</b>
            <span>₹{t.purse.toLocaleString()} left</span>
            <small>{t.players}/{maxSquadSize} players</small>
          </div>
        ))}
      </section>
    </div>
  )
}
