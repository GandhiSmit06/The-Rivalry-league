'use client'

import { RotateCcw, Trophy } from 'lucide-react'
import type { Player, Team } from '@/lib/server/db'
import { TeamBadge } from '@/components/common/TeamBadge'

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
  const sold = players.filter(p => p.status === 'Sold')
  const unsold = players.filter(p => p.status === 'Unsold')
  const best = [...sold].sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))[0]
  const totalSpent = sold.reduce((sum, p) => sum + (p.soldPrice || 0), 0)

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Auction <em>results</em></h2>
        </div>
        {isAuctioneer && (
          <button className="danger-btn btn-sm" onClick={onReset}>
            <RotateCcw size={14} /> Reset Auction
          </button>
        )}
      </div>

      <div className="marquee-card">
        <span className="tro"><Trophy size={28} /></span>
        <div className="info">
          <small className="lbl">Marquee buy</small>
          <h3>{best ? `#${best.number} ${best.name}` : 'Awaiting the first hammer'}</h3>
          <p>{best ? `Acquired by ${best.soldTo}` : 'No players have been sold yet.'}</p>
        </div>
        <div className="price">
          <small>Record bid</small>
          <b>₹{(best?.soldPrice || 0).toLocaleString()}</b>
        </div>
      </div>

      <div className="stat-grid four">
        <div className="stat-tile"><b>{sold.length}</b><small>Sold</small></div>
        <div className="stat-tile"><b>{unsold.length}</b><small>Unsold</small></div>
        <div className="stat-tile"><b>{players.length - sold.length - unsold.length}</b><small>Remaining</small></div>
        <div className="stat-tile"><b>₹{totalSpent.toLocaleString()}</b><small>Total spent</small></div>
      </div>

      <div className="subhead"><h3>Confirmed squads</h3></div>
      <div className="roster-grid">
        {teams.map(t => {
          const roster = sold.filter(p => p.soldTo === t.name)
          const fill = Math.min(100, Math.round((t.players / (maxSquadSize || 1)) * 100))
          return (
            <article className="roster-card" key={t.id}>
              <div className="roster-head">
                <TeamBadge team={t} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3>{t.name}</h3>
                  <small>Owner: {t.owner}</small>
                </div>
                <span className="pill sand">{t.players}/{maxSquadSize}</span>
              </div>
              <div className="roster-body">
                {roster.length === 0 ? (
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>No players acquired yet.</span>
                ) : (
                  <div className="roster-list">
                    {roster.map(p => (
                      <div className="roster-row" key={p.id}>
                        <span className="nm"><span className="num-badge">#{p.number}</span> {p.name}</span>
                        <b className="p">₹{(p.soldPrice || 0).toLocaleString()}</b>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="roster-foot">
                <div className="bar" style={{ margin: 0 }}><i style={{ width: `${fill}%` }} /></div>
                <div className="meta">
                  <span>Spent ₹{t.spent.toLocaleString()}</span>
                  <span>₹{t.purse.toLocaleString()} left</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {unsold.length > 0 && (
        <>
          <div className="subhead">
            <h3>Unsold players</h3>
            <span className="pill red">{unsold.length}</span>
          </div>
          <div className="unsold-grid">
            {unsold.map(p => (
              <div className="unsold-card" key={p.id}>
                <span><span className="num-badge">#{p.number}</span> {p.name}</span>
                <span className="mono">₹{(p.base || 500).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
