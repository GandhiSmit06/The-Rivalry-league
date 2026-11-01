'use client'

import { useEffect, useMemo, useState } from 'react'
import { Shuffle, Gavel, Plus, Search, X, Zap, RotateCcw } from 'lucide-react'
import type { Player, Team } from '@/lib/server/db'
import { TeamBadge } from '@/components/common/TeamBadge'

export type WheelScope = 'auto' | 'unsold' | 'all'
type PoolFilter = 'ALL' | 'Upcoming' | 'Sold' | 'Unsold'

const WEDGE_COLORS = ['#6e472b', '#a9834a', '#543117', '#8c5e3c', '#3f2a1a', '#c5a880', '#725b38', '#94704a']
const UNSOLD_COLORS = ['#7a2e24', '#a8553f']
const INCREMENTS = [
  { value: 100, label: 'Increment', tone: '' },
  { value: 250, label: 'Standard', tone: 'mid' },
  { value: 500, label: 'Power bid', tone: 'mid' },
  { value: 1000, label: 'Mega bid', tone: 'hot' }
]

export const WHEEL_SPIN_MS = 3200

const CX = 160
const CY = 160
const R = 146

function buildWedges(list: Player[], unsoldRound: boolean) {
  const n = list.length
  if (n === 0) return []
  const step = 360 / n
  const textRadius = n > 14 ? 112 : n > 8 ? 106 : 98

  return list.map((p, i) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const start = toRad(i * step - 90)
    const end = toRad((i + 1) * step - 90)
    const midDeg = (i + 0.5) * step - 90
    const mid = toRad(midDeg)
    const point = (rad: number, r: number) =>
      `${(CX + r * Math.cos(rad)).toFixed(2)} ${(CY + r * Math.sin(rad)).toFixed(2)}`

    return {
      id: p.id,
      number: p.number,
      color: unsoldRound ? UNSOLD_COLORS[i % 2] : WEDGE_COLORS[i % WEDGE_COLORS.length],
      path:
        n === 1
          ? `M ${CX} ${CY - R} A ${R} ${R} 0 1 0 ${CX} ${CY + R} A ${R} ${R} 0 1 0 ${CX} ${CY - R} Z`
          : `M ${CX} ${CY} L ${point(start, R)} A ${R} ${R} 0 ${step > 180 ? 1 : 0} 1 ${point(end, R)} Z`,
      tx: (CX + textRadius * Math.cos(mid)).toFixed(2),
      ty: (CY + textRadius * Math.sin(mid)).toFixed(2),
      rotate: (midDeg + 90).toFixed(2)
    }
  })
}

export function AuctionView({
  players,
  teams,
  current,
  bid,
  leader,
  spinning,
  drawnPlayerId,
  wheelScope,
  setWheelScope,
  awardTeam,
  setAwardTeam,
  awardPrice,
  setAwardPrice,
  maxSquadSize,
  spin,
  nominate,
  makeBid,
  awardSell,
  unsold,
  onAddPlayer,
  onAddTeam,
  onAdjustBudget,
  onDirectSell,
  onReopenAllUnsold
}: {
  players: Player[]
  teams: Team[]
  current: Player | null
  bid: number
  leader: Team | null
  spinning: boolean
  drawnPlayerId: number | null
  wheelScope: WheelScope
  setWheelScope: (scope: WheelScope) => void
  awardTeam: string
  setAwardTeam: (team: string) => void
  awardPrice: number
  setAwardPrice: (p: number) => void
  maxSquadSize: number
  spin: () => void
  nominate: (id: number) => void
  makeBid: (t: Team, increment?: number) => void
  awardSell: () => void
  unsold: () => void
  onAddPlayer: () => void
  onAddTeam: () => void
  onAdjustBudget: (t: Team) => void
  onDirectSell: (player?: Player) => void
  onReopenAllUnsold: () => void
}) {
  const [tab, setTab] = useState<'stage' | 'pool'>('stage')
  const [poolFilter, setPoolFilter] = useState<PoolFilter>('ALL')
  const [poolSearch, setPoolSearch] = useState('')
  const [wheelAngle, setWheelAngle] = useState(0)

  const counts = useMemo(() => {
    const by = (status: Player['status']) => players.filter(p => p.status === status)
    return { upcoming: by('Upcoming'), unsold: by('Unsold'), sold: by('Sold') }
  }, [players])

  const isUnsoldRound =
    wheelScope === 'unsold' ||
    (wheelScope === 'auto' && counts.upcoming.length === 0 && counts.unsold.length > 0)

  const wheelPlayers =
    wheelScope === 'all' ? players : isUnsoldRound ? counts.unsold : counts.upcoming

  const wedges = useMemo(() => buildWedges(wheelPlayers, isUnsoldRound), [wheelPlayers, isUnsoldRound])
  const n = wheelPlayers.length

  const filteredPool = useMemo(() => {
    const q = poolSearch.toLowerCase().replace('#', '').trim()
    return players.filter(p => {
      if (poolFilter !== 'ALL' && p.status !== poolFilter) return false
      return !q || p.name.toLowerCase().includes(q) || String(p.number || '').includes(q)
    })
  }, [players, poolFilter, poolSearch])

  useEffect(() => {
    if (current) setTab('stage')
  }, [current])

  // Turn so the drawn player's wedge stops under the pointer at 12 o'clock
  useEffect(() => {
    if (drawnPlayerId === null) return
    const index = wheelPlayers.findIndex(p => p.id === drawnPlayerId)
    if (index < 0) return
    const stop = 360 - ((index + 0.5) * 360) / wheelPlayers.length
    setWheelAngle(prev => prev - (prev % 360) + 6 * 360 + stop)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a new draw starts a spin
  }, [drawnPlayerId])

  const selectedTeam = teams.find(t => t.name === awardTeam) || null
  const selectedFull = !!selectedTeam && selectedTeam.players >= maxSquadSize

  const filters: Array<{ id: PoolFilter; label: string; count: number }> = [
    { id: 'ALL', label: 'All', count: players.length },
    { id: 'Upcoming', label: 'Available', count: counts.upcoming.length },
    { id: 'Sold', label: 'Sold', count: counts.sold.length },
    { id: 'Unsold', label: 'Unsold', count: counts.unsold.length }
  ]

  const scopes: Array<{ id: WheelScope; label: string }> = [
    { id: 'auto', label: `Available (${counts.upcoming.length || counts.unsold.length})` },
    { id: 'unsold', label: `Unsold (${counts.unsold.length})` },
    { id: 'all', label: `Everyone (${players.length})` }
  ]

  const idleMessage =
    players.length === 0
      ? { title: 'No players registered', text: 'Add players to the league pool to begin.' }
      : n === 0
      ? { title: 'Nothing left on this wheel', text: 'Switch the wheel to Everyone, or see the final squads under Schedule → Results.' }
      : { title: 'Spin or nominate a player', text: 'Spin the wheel, or open Pool and nominate any player.' }

  return (
    <div>
      <div className="segmented mobile-auction-switcher">
        <button className={tab === 'stage' ? 'active' : ''} onClick={() => setTab('stage')}>
          Auction {current ? `(#${current.number})` : ''}
        </button>
        <button className={tab === 'pool' ? 'active' : ''} onClick={() => setTab('pool')}>
          Pool ({players.length})
        </button>
      </div>

      <div className={tab === 'stage' ? '' : 'mobile-hidden'}>
        <div className="auction-grid">
          <div style={{ display: 'grid', gap: 12 }}>
            <section className="card lot-card">
              <div className="left">
                <span className="ping" />
                <div style={{ minWidth: 0 }}>
                  <h3>{current ? `Lot #${current.number} · Live` : 'Live auction'}</h3>
                  <small>
                    {isUnsoldRound ? 'Re-auction round' : 'Dream XI draft'} · {counts.sold.length} sold
                  </small>
                </div>
              </div>
              <span className="count-ring" title="Players left on this wheel">{n}</span>
            </section>

            {current ? (
              <section className="card player-spot">
                <div className="row">
                  <span className="avatar">
                    {current.initials}
                    <span className="tag">#{current.number}</span>
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="chips">
                      {current.role && <span className="pill sand">{current.role}</span>}
                      <span className="pill">Base ₹{(current.base || 500).toLocaleString()}</span>
                      {current.status !== 'Upcoming' && (
                        <span className={current.status === 'Sold' ? 'pill green' : 'pill red'}>
                          {current.status === 'Sold' ? `Re-auction · ${current.soldTo}` : 'Re-auction'}
                        </span>
                      )}
                    </div>
                    <h3>{current.name}</h3>
                    {current.style && <span className="meta">{current.style}</span>}
                  </div>
                </div>
              </section>
            ) : (
              <section className="card wheel-card">
                <div className="filter-row scope-row" role="group" aria-label="Who is on the wheel">
                  {scopes.map(s => (
                    <button
                      key={s.id}
                      className={wheelScope === s.id ? 'filter-active' : ''}
                      onClick={() => setWheelScope(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className={spinning ? 'spinner spinning' : 'spinner'}>
                  <div
                    className="spinner-svg-wrap"
                    style={{
                      transform: `rotate(${wheelAngle}deg)`,
                      transition: spinning ? `transform ${WHEEL_SPIN_MS}ms cubic-bezier(0.12, 0.85, 0.22, 1)` : 'none'
                    }}
                  >
                    <svg viewBox="0 0 320 320" style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
                      <defs>
                        <linearGradient id="wheelRim" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#e7cf9f" />
                          <stop offset="50%" stopColor="#a9834a" />
                          <stop offset="100%" stopColor="#c5a880" />
                        </linearGradient>
                      </defs>
                      <circle cx={CX} cy={CY} r="158" fill="#2c241e" />
                      {n === 0 ? (
                        <circle cx={CX} cy={CY} r={R} fill="#ebe3d5" />
                      ) : (
                        wedges.map(w => (
                          <g key={w.id}>
                            <path d={w.path} fill={w.color} stroke="#2c241e" strokeWidth={n > 1 ? 1.2 : 0} />
                            <text
                              x={w.tx}
                              y={w.ty}
                              transform={`rotate(${w.rotate}, ${w.tx}, ${w.ty})`}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#ffffff"
                              fontFamily="'Space Grotesk', sans-serif"
                              fontWeight="700"
                              fontSize={n > 18 ? 10 : n > 12 ? 12 : n > 6 ? 14 : 16}
                            >
                              #{w.number}
                            </text>
                          </g>
                        ))
                      )}
                      <circle cx={CX} cy={CY} r="148" fill="none" stroke="url(#wheelRim)" strokeWidth="5" />
                    </svg>
                  </div>

                  <button className="spinner-center" onClick={spin} disabled={spinning || n === 0} aria-label="Spin the wheel">
                    {spinning ? (
                      <>
                        <Shuffle size={20} className="spin-icon-anim" />
                        <small>DRAWING</small>
                      </>
                    ) : (
                      <>
                        <Shuffle size={20} style={{ opacity: n === 0 ? 0.4 : 1 }} />
                        <small>{n === 0 ? 'EMPTY' : `SPIN (${n})`}</small>
                      </>
                    )}
                  </button>
                  <div className="pointer" />
                </div>

                <div className="idle-note">
                  <b>{idleMessage.title}</b>
                  {idleMessage.text}
                </div>

                {counts.unsold.length > 0 && (
                  <button className="text-btn" onClick={onReopenAllUnsold}>
                    <RotateCcw size={13} /> Return all unsold to Available
                  </button>
                )}
              </section>
            )}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <section className="card bid-hero">
              <div className="row">
                <span className="kicker">Current leading bid</span>
                {leader && <span className="pill"><span className="live-dot" /> Active bidder</span>}
              </div>
              <div className="row" style={{ marginTop: 6, flexWrap: 'wrap' }}>
                <div className="bid-amount">₹{bid.toLocaleString()}</div>
                {leader && (
                  <div className="leader-chip">
                    <span className="team-dot" style={{ background: leader.color }} />
                    <div>
                      <b>{leader.name}</b>
                      <small>₹{leader.purse.toLocaleString()} left in purse</small>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="card-label">
                <span>Select bidding franchise</span>
                <b>{maxSquadSize}/team limit</b>
              </div>
              {teams.length === 0 ? (
                <div className="empty-state" style={{ padding: 22 }}>
                  <p>No franchises yet.</p>
                  <button className="primary-btn btn-sm" onClick={onAddTeam}><Plus size={14} /> Add Franchise</button>
                </div>
              ) : (
                <div className="team-select">
                  {teams.map(t => {
                    const full = t.players >= maxSquadSize
                    return (
                      <button
                        key={t.id}
                        className={awardTeam === t.name ? 'team-opt selected' : 'team-opt'}
                        onClick={() => setAwardTeam(t.name)}
                        disabled={full}
                      >
                        <span className="nm">
                          <span className="team-dot" style={{ background: t.color }} />
                          <span>{t.name}</span>
                        </span>
                        <small>{full ? 'FULL' : `₹${(t.purse / 1000).toFixed(1)}k`}</small>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="card-label"><span>Quick bid increments</span></div>
              <div className="inc-grid">
                {INCREMENTS.map(inc => (
                  <button
                    key={inc.value}
                    className={`inc-btn ${inc.tone}`}
                    onClick={() => selectedTeam && makeBid(selectedTeam, inc.value)}
                    disabled={!current || !selectedTeam || selectedFull || selectedTeam.purse < bid + inc.value}
                  >
                    <b>+₹{inc.value.toLocaleString()}</b>
                    <small>{inc.label}</small>
                  </button>
                ))}
              </div>
            </section>

            {current && (
              <section>
                <div className="price-edit">
                  <label htmlFor="hammer-price">Hammer price (₹)</label>
                  <input
                    id="hammer-price"
                    type="number"
                    min={0}
                    step={50}
                    value={awardPrice}
                    onChange={e => setAwardPrice(Number(e.target.value) || 0)}
                    style={{ maxWidth: 150 }}
                  />
                </div>
                <div className="hammer-row">
                  <button className="sell-btn" onClick={awardSell} disabled={!awardTeam}>
                    <Gavel size={18} /> Sold to {awardTeam || 'team'}
                  </button>
                  <button className="unsold-btn" onClick={unsold}>
                    <X size={16} /> Unsold
                  </button>
                </div>
              </section>
            )}

            <button className="ghost-btn btn-block" onClick={() => onDirectSell()}>
              <Zap size={15} /> Direct Sell / Assign
            </button>
          </div>
        </div>

        <section style={{ marginTop: 16 }}>
          <div className="card-label">
            <span>Franchise purse &amp; slots</span>
            <span className="desktop-only">S spin · 1-9 bid · Enter sell · U unsold</span>
          </div>
          <div className="rail">
            {teams.map(t => (
              <button className="purse-card" key={t.id} onClick={() => onAdjustBudget(t)} title="Adjust purse" style={{ textAlign: 'left' }}>
                <span className="top">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <TeamBadge team={t} size={24} />
                    <b style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.short}</b>
                  </span>
                  <span className="pill sand">{t.players}/{maxSquadSize}</span>
                </span>
                <strong>₹{t.purse.toLocaleString()}</strong>
                <small>Spent ₹{t.spent.toLocaleString()}</small>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className={tab === 'pool' ? '' : 'mobile-hidden'} style={{ marginTop: 16 }}>
        <div className="subhead">
          <h3>Player pool</h3>
          <button className="text-btn" onClick={onAddPlayer}><Plus size={14} /> Add player</button>
        </div>

        <div className="search-box">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search by name or #number"
            value={poolSearch}
            onChange={e => setPoolSearch(e.target.value)}
          />
        </div>

        <div className="filter-row">
          {filters.map(f => (
            <button
              key={f.id}
              className={poolFilter === f.id ? 'filter-active' : ''}
              onClick={() => setPoolFilter(f.id)}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {filteredPool.length === 0 ? (
          <div className="empty-state" style={{ padding: 22 }}>
            <p>{players.length === 0 ? 'No players in the pool yet.' : 'No players match this filter.'}</p>
            {players.length === 0 && (
              <button className="primary-btn btn-sm" onClick={onAddPlayer}><Plus size={14} /> Add Player</button>
            )}
          </div>
        ) : (
          <div className="pool-list">
            {filteredPool.map(p => (
              <div key={p.id} className={current?.id === p.id ? 'pool-row selected' : 'pool-row'}>
                <div className="top">
                  <span className="nm">
                    <span className="num-badge">#{p.number}</span>
                    <b>{p.name}</b>
                  </span>
                  <span className={`status ${p.status.toLowerCase()}`}>{p.status}</span>
                </div>
                <div className="top" style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>
                  <span>{p.status === 'Sold' ? `${p.soldTo}` : p.role || 'Base price'}</span>
                  <span className="mono">₹{(p.soldPrice || p.base || 500).toLocaleString()}</span>
                </div>
                <div className="acts">
                  <button className="mini-btn fill" onClick={() => nominate(p.id)}>
                    <Gavel size={12} /> {p.status === 'Upcoming' ? 'Nominate' : 'Re-auction'}
                  </button>
                  <button className="mini-btn" onClick={() => onDirectSell(p)}>
                    <Zap size={12} /> {p.status === 'Sold' ? 'Reassign' : 'Sell'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
