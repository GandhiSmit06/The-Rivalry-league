'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  Shuffle,
  Gavel,
  Plus,
  Lock,
  Users,
  Search,
  Zap
} from 'lucide-react'
import type { Player, Team } from '@/lib/server/db'

export function AuctionView({
  players,
  teams,
  current,
  bid,
  leader,
  spinning,
  awardTeam,
  setAwardTeam,
  awardPrice,
  setAwardPrice,
  maxSquadSize,
  isAuctioneer,
  spin,
  nominate,
  makeBid,
  awardSell,
  unsold,
  onBack,
  onAddPlayer,
  onAddTeam,
  onAdjustBudget,
  onUpdateSquadLimit,
  onUnlock,
  onDirectSell,
  onReopenAllUnsold
}: {
  players: Player[]
  teams: Team[]
  current: Player | null
  bid: number
  leader: Team | null
  spinning: boolean
  awardTeam: string
  setAwardTeam: (team: string) => void
  awardPrice: number
  setAwardPrice: (p: number) => void
  maxSquadSize: number
  isAuctioneer: boolean
  spin: () => void
  nominate: (id: number) => void
  makeBid: (t: Team, increment?: number) => void
  awardSell: () => void
  unsold: () => void
  onBack: () => void
  onAddPlayer: () => void
  onAddTeam: () => void
  onAdjustBudget: (t: Team) => void
  onUpdateSquadLimit: (limit: number) => void
  onUnlock: () => void
  onDirectSell: (player?: Player) => void
  onReopenAllUnsold?: () => void
}) {
  const [poolSearch, setPoolSearch] = useState('')
  const [wheelAngle, setWheelAngle] = useState(0)
  const [mobileTab, setMobileTab] = useState<'stage' | 'bids' | 'pool'>('stage')

  const upcoming = useMemo(() => {
    return players.filter(p => p.status === 'Upcoming')
  }, [players])

  const unsoldPlayers = useMemo(() => {
    return players.filter(p => p.status === 'Unsold')
  }, [players])

  // When initial upcoming queue finishes, automatically transition wheel to Unsold players!
  const isUnsoldRound = upcoming.length === 0 && unsoldPlayers.length > 0
  const activeWheelPlayers = isUnsoldRound ? unsoldPlayers : upcoming
  const N = activeWheelPlayers.length

  // On mobile, if a player is drawn, focus on the Stage
  useEffect(() => {
    if (current) {
      setMobileTab('stage')
    }
  }, [current])

  const filteredPool = useMemo(() => {
    const source = isUnsoldRound ? unsoldPlayers : upcoming
    if (!poolSearch.trim()) return source
    const q = poolSearch.toLowerCase().replace('#', '').trim()
    return source.filter(
      p => p.name.toLowerCase().includes(q) || String(p.number || '').includes(q)
    )
  }, [isUnsoldRound, upcoming, unsoldPlayers, poolSearch])

  // Realistic Casino / Tournament Wheel Spin Rotation Physics
  useEffect(() => {
    if (spinning) {
      const extraDegrees = (5 + Math.random() * 2) * 360 + Math.floor(Math.random() * 180)
      setWheelAngle(prev => prev + extraDegrees)
    }
  }, [spinning])

  const WEDGE_COLORS = [
    '#111c30', // Deep Navy
    '#2c1524', // Rich Wine
    '#0c2725', // Forest Emerald
    '#36220e', // Dark Amber Gold
    '#1c1a3c', // Royal Indigo
    '#30161b', // Crimson Ruby
    '#0f2835', // Ocean Sapphire
    '#2e2410'  // Bronze Gold
  ]

  // Generate SVG Pie Slices with Radial Labels for active players (upcoming or unsold round)
  const wedges = useMemo(() => {
    if (N === 0) return []
    const cx = 160
    const cy = 160
    const r = 146
    const step = 360 / N

    return activeWheelPlayers.map((p, i) => {
      const startAngleDeg = i * step - 90
      const endAngleDeg = (i + 1) * step - 90
      const midAngleDeg = (i + 0.5) * step - 90

      const startRad = (startAngleDeg * Math.PI) / 180
      const endRad = (endAngleDeg * Math.PI) / 180
      const midRad = (midAngleDeg * Math.PI) / 180

      const x1 = cx + r * Math.cos(startRad)
      const y1 = cy + r * Math.sin(startRad)
      const x2 = cx + r * Math.cos(endRad)
      const y2 = cy + r * Math.sin(endRad)

      const largeArc = step > 180 ? 1 : 0

      const textRadius = N > 14 ? 112 : N > 8 ? 106 : 98
      const tx = cx + textRadius * Math.cos(midRad)
      const ty = cy + textRadius * Math.sin(midRad)
      const textRot = midAngleDeg + 90

      const pathData =
        N === 1
          ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 0 ${cx} ${cy + r} A ${r} ${r} 0 1 0 ${cx} ${cy - r} Z`
          : `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`

      return {
        id: p.id,
        number: p.number,
        name: p.name,
        color: isUnsoldRound ? (i % 2 === 0 ? '#3b1219' : '#1e142b') : WEDGE_COLORS[i % WEDGE_COLORS.length],
        pathData,
        tx: tx.toFixed(2),
        ty: ty.toFixed(2),
        textRot: textRot.toFixed(2)
      }
    })
  }, [activeWheelPlayers, N, isUnsoldRound])

  const rimStuds = useMemo(() => {
    const cx = 160
    const cy = 160
    const r = 152
    const count = 24
    return Array.from({ length: count }).map((_, i) => {
      const rad = ((i * (360 / count) - 90) * Math.PI) / 180
      return {
        x: (cx + r * Math.cos(rad)).toFixed(2),
        y: (cy + r * Math.sin(rad)).toFixed(2)
      }
    })
  }, [])

  return (
    <div className="auction-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">AUCTIONEER ARENA · BASE PRICE ₹500</span>
          <h2>The <em>Gavel</em> is in your hands.</h2>
        </div>
        <div className="room-status" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="ghost-btn"
            style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--gold)', borderColor: 'rgba(255, 200, 61, 0.4)' }}
            onClick={() => onDirectSell()}
            title="Auctioneer: Sell any player to any team with custom price"
          >
            <Gavel size={13} /> Direct Sell / Assign
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--panel)', border: '1px solid var(--line)', padding: '6px 12px', borderRadius: '10px' }}>
            <Users size={13} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>Squad Limit:</span>
            <select
              value={maxSquadSize}
              onChange={e => onUpdateSquadLimit(Number(e.target.value))}
              style={{ background: 'none', border: 0, color: 'var(--gold)', fontWeight: 800, fontSize: '11px', outline: 'none', cursor: 'pointer' }}
            >
              {[3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => (
                <option key={n} value={n} style={{ background: '#0e1626', color: '#fff' }}>
                  {n} Players/Team
                </option>
              ))}
            </select>
          </div>
          <span className="live-dot" /> LIVE ROOM
          <span style={{ fontSize: '10px', color: 'var(--muted)' }} title="Keyboard shortcuts">
            ⌨ S spin · 1-9 bid · Enter sell · U unsold
          </span>
          {!isAuctioneer && (
            <button className="auctioneer-pill locked" onClick={onUnlock}>
              <Lock size={12} /> Unlock Auctioneer Controls
            </button>
          )}
        </div>
      </div>

      {/* Mobile-Only Arena Switcher Pills */}
      <div className="mobile-auction-switcher">
        <button
          type="button"
          className={mobileTab === 'stage' ? 'm-tab-btn active' : 'm-tab-btn'}
          onClick={() => setMobileTab('stage')}
        >
          <Gavel size={13} />
          <span>Stage {current ? `(#${current.number})` : ''}</span>
        </button>
        <button
          type="button"
          className={mobileTab === 'bids' ? 'm-tab-btn active' : 'm-tab-btn'}
          onClick={() => setMobileTab('bids')}
        >
          <Users size={13} />
          <span>Bids & Teams</span>
        </button>
        <button
          type="button"
          className={mobileTab === 'pool' ? 'm-tab-btn active' : 'm-tab-btn'}
          onClick={() => setMobileTab('pool')}
        >
          <Search size={13} />
          <span>{isUnsoldRound ? `Unsold (${unsoldPlayers.length})` : `Pool (${upcoming.length})`}</span>
        </button>
      </div>

      <div className="auction-layout">
        {/* Left Pool Queue with dedicated, spacious player cards */}
        <aside className={`pool-card ${mobileTab === 'pool' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <div className="card-label">
            <span>{isUnsoldRound ? 'RE-AUCTION POOL' : 'PLAYER POOL'}</span>
            <b style={isUnsoldRound ? { color: '#f87171' } : undefined}>
              {isUnsoldRound ? `${unsoldPlayers.length} UNSOLD` : `${upcoming.length} UPCOMING`}
            </b>
          </div>

          {isUnsoldRound && onReopenAllUnsold && (
            <button
              className="ghost-btn"
              onClick={onReopenAllUnsold}
              style={{
                width: '100%',
                padding: '5px 8px',
                fontSize: '10px',
                color: 'var(--gold)',
                borderColor: 'rgba(255, 200, 61, 0.35)',
                margin: '6px 0 2px'
              }}
              title="Reset all unsold players back to Upcoming pool"
            >
              ↺ Reset All Unsold to Upcoming
            </button>
          )}

          <div style={{ margin: '8px 0 6px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name or #..."
              value={poolSearch}
              onChange={e => setPoolSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(9, 14, 25, 0.8)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '7px 10px 7px 28px',
                fontSize: '11px',
                color: 'var(--text)',
                outline: 'none'
              }}
            />
            <Search size={12} style={{ position: 'absolute', left: '9px', top: '9px', color: 'var(--muted)' }} />
          </div>

          <div className="pool-list" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredPool.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                <p style={{ margin: '0 0 12px' }}>
                  {N === 0
                    ? players.length === 0
                      ? 'No players in tournament pool.'
                      : 'All players processed.'
                    : 'No matching players found.'}
                </p>
                {players.length === 0 && (
                  <button className="primary-btn" style={{ padding: '8px 14px', fontSize: '11px' }} onClick={onAddPlayer}>
                    <Plus size={14} /> Add Player (₹500 Base)
                  </button>
                )}
              </div>
            ) : (
              filteredPool.map(p => {
                const isSelected = current?.id === p.id
                return (
                  <div
                    className={isSelected ? 'pool-player selected' : 'pool-player'}
                    key={p.id}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        <span className="pool-num-badge">#{p.number}</span>
                        <b
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: isSelected ? 'var(--gold)' : 'var(--text)'
                          }}
                        >
                          {p.name}
                        </b>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--gold)',
                          fontWeight: 800,
                          fontFamily: 'JetBrains Mono, monospace',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ₹{(p.base || 500).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                      <button
                        className="nominate-badge"
                        onClick={() => nominate(p.id)}
                        title="Put directly on auction block"
                        style={{
                          padding: '6px 8px',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          borderRadius: '6px'
                        }}
                      >
                        <Gavel size={11} /> Nominate
                      </button>
                      <button
                        className="direct-sell-btn"
                        onClick={() => onDirectSell(p)}
                        title="Directly sell to a franchise"
                        style={{
                          padding: '6px 8px',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          borderRadius: '6px'
                        }}
                      >
                        <Zap size={11} /> ⚡ Sell
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <button className="text-btn" onClick={onBack}>← Back to dashboard</button>
        </aside>

        {/* Center Stage & Smooth Animated SVG Tournament Wheel */}
        <section className={`stage ${mobileTab === 'stage' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <div className="stage-top">
            <span>AUCTION BLOCK</span>
            {isUnsoldRound ? (
              <span className="draw-filter" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)' }}>
                🔥 RE-AUCTION: {unsoldPlayers.length} UNSOLD
              </span>
            ) : (
              <span className="draw-filter">{upcoming.length} REMAINING</span>
            )}
          </div>

          {isUnsoldRound && (
            <div style={{
              background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.2), rgba(217, 119, 6, 0.2))',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '8px',
              padding: '6px 12px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#fca5a5',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}>
              <Shuffle size={13} style={{ color: '#fbbf24' }} />
              <span>ROUND 2: RE-AUCTIONING UNSOLD PLAYERS ({unsoldPlayers.length} IN POOL)</span>
            </div>
          )}

          <div className={spinning ? 'spinner spinning' : 'spinner'}>
            <div
              className="spinner-svg-wrap"
              style={{
                transform: `rotate(${wheelAngle}deg)`,
                transition: spinning
                  ? 'transform 2.8s cubic-bezier(0.12, 0.85, 0.22, 1)'
                  : 'none'
              }}
            >
              <svg
                viewBox="0 0 320 320"
                width="320"
                height="320"
                style={{ display: 'block', overflow: 'visible' }}
              >
                <defs>
                  <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1a2842" />
                    <stop offset="60%" stopColor="#0d1424" />
                    <stop offset="100%" stopColor="#050810" />
                  </radialGradient>
                  <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd875" />
                    <stop offset="35%" stopColor="#c89224" />
                    <stop offset="70%" stopColor="#ffe699" />
                    <stop offset="100%" stopColor="#946510" />
                  </linearGradient>
                </defs>

                {/* Base Wheel Rim Background */}
                <circle cx="160" cy="160" r="158" fill="#070c16" />

                {/* Wedges */}
                {N === 0 ? (
                  <circle
                    cx="160"
                    cy="160"
                    r="146"
                    fill="#0b1322"
                    stroke="rgba(255, 200, 61, 0.2)"
                    strokeWidth="2"
                  />
                ) : (
                  wedges.map(w => (
                    <g key={w.id}>
                      <path
                        d={w.pathData}
                        fill={w.color}
                        stroke="#070c14"
                        strokeWidth={N > 1 ? '1.5' : '0'}
                      />
                      <text
                        x={w.tx}
                        y={w.ty}
                        transform={`rotate(${w.textRot}, ${w.tx}, ${w.ty})`}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        fontFamily="'Bebas Neue', sans-serif"
                        fontWeight="700"
                        fontSize={N > 18 ? '11' : N > 12 ? '13' : N > 6 ? '15' : '17'}
                        letterSpacing="0.5"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))',
                          userSelect: 'none'
                        }}
                      >
                        #{w.number}
                      </text>
                    </g>
                  ))
                )}

                {/* Outer Golden Bezel Rim */}
                <circle
                  cx="160"
                  cy="160"
                  r="148"
                  fill="none"
                  stroke="url(#goldRim)"
                  strokeWidth="5"
                />

                {/* Rim Brass Studs */}
                {rimStuds.map((s, idx) => (
                  <circle
                    key={idx}
                    cx={s.x}
                    cy={s.y}
                    r="2.2"
                    fill="#ffd875"
                    stroke="#946510"
                    strokeWidth="0.8"
                  />
                ))}

                {/* Center Hub Graphic Ring */}
                <circle
                  cx="160"
                  cy="160"
                  r="48"
                  fill="url(#hubGrad)"
                  stroke="url(#goldRim)"
                  strokeWidth="3"
                />
              </svg>

              {/* Center Interactive Hub (Fixed overlay on center of wheel) */}
              <div className="spinner-center" onClick={spin} title="Click to spin!">
                {spinning ? (
                  <>
                    <Shuffle size={20} className="spin-icon-anim" />
                    <small>DRAWING #</small>
                  </>
                ) : current ? (
                  <>
                    <span className="center-label">{isUnsoldRound ? 'RE-AUCTION' : 'DRAWN'}</span>
                    <span className="center-num">#{current.number}</span>
                  </>
                ) : N === 0 ? (
                  <>
                    <Shuffle size={18} style={{ opacity: 0.35 }} />
                    <small style={{ color: 'var(--muted)' }}>ALL SOLD</small>
                  </>
                ) : isUnsoldRound ? (
                  <>
                    <Shuffle size={20} style={{ color: '#fbbf24' }} />
                    <small style={{ color: '#fca5a5' }}>RE-SPIN ({N})</small>
                  </>
                ) : (
                  <>
                    <Shuffle size={20} />
                    <small>SPIN ({N})</small>
                  </>
                )}
              </div>
            </div>

            {/* Pointer / Needle */}
            <div className="pointer" />
          </div>

          {current ? (
            <div className="player-focus">
              <div className="focus-avatar">
                <span style={{ fontSize: '18px', fontWeight: 800 }}>#{current.number}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="spotlight-num-badge">PLAYER #{current.number}</span>
                  <span className={current.status === 'Unsold' ? 'status unsold' : 'status upcoming'}>
                    {current.status === 'Unsold' ? 'RE-AUCTION NOMINATION' : 'ACTIVE NOMINATION'}
                  </span>
                </div>
                <h3>{current.name}</h3>
              </div>
              <div className="base-badge">
                <small>BASE PRICE</small>
                <b>₹{(current.base || 500).toLocaleString()}</b>
              </div>
            </div>
          ) : (
            <div className="empty-focus">
              <span>
                {players.length === 0
                  ? 'NO PLAYERS REGISTERED'
                  : N === 0
                  ? 'AUCTION COMPLETED · ALL PLAYERS SOLD!'
                  : isUnsoldRound
                  ? `RE-AUCTION ROUND: ${unsoldPlayers.length} UNSOLD PLAYERS`
                  : 'SPIN OR NOMINATE PLAYER'}
              </span>
              <p>
                {players.length === 0
                  ? 'Add players to your league pool to begin (default base ₹500).'
                  : N === 0
                  ? 'All registered players have been drafted into franchises! Review rosters on Results tab.'
                  : isUnsoldRound
                  ? 'All initial upcoming players finished. The wheel is now loaded with all Unsold players for the re-auction round!'
                  : 'Auctioneer: Spin the wheel to draw by player number or click Nominate beside any player.'}
              </p>
            </div>
          )}

          <button
            className="spin-btn"
            onClick={spin}
            disabled={spinning || N === 0}
            style={{
              width: '100%',
              maxWidth: '340px',
              marginTop: '14px',
              ...(isUnsoldRound
                ? {
                    background: 'linear-gradient(135deg, #b91c1c 0%, #ea580c 100%)',
                    borderColor: '#fca5a5',
                    color: '#ffffff',
                    boxShadow: '0 0 25px rgba(239, 68, 68, 0.45)'
                  }
                : {})
            }}
          >
            <Shuffle size={16} className={spinning ? 'spin-icon-anim' : ''} />{' '}
            {spinning
              ? 'Selecting Random Player...'
              : N === 0
              ? 'All Players Processed'
              : isUnsoldRound
              ? `SPIN RE-AUCTION WHEEL (${unsoldPlayers.length} UNSOLD)`
              : `SPIN THE WHEEL (${upcoming.length} IN POOL)`}
          </button>
        </section>

        {/* Right Bidding Stage & Live Auctioneer Desk */}
        <section className={`bid-card ${mobileTab === 'bids' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <div className="card-label">
            <span>LIVE BIDDING CONTROL</span>
            <b>{teams.length} FRANCHISES</b>
          </div>

          <div className="current-bid">
            <small>CURRENT TOP BID</small>
            <h3>₹{bid.toLocaleString()}</h3>
            <p>
              Leader:{' '}
              <b>
                {leader ? (
                  <span style={{ color: leader.color }}>
                    {leader.name} ({leader.short})
                  </span>
                ) : (
                  'No Bids Placed'
                )}
              </b>
            </p>
          </div>

          <div className="bid-team-list">
            {teams.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: '12px' }}>
                <p>No franchises available.</p>
                <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '11px', margin: '8px auto 0' }} onClick={onAddTeam}>
                  <Plus size={14} /> Add Franchise
                </button>
              </div>
            ) : (
              teams.map(t => {
                const isFull = t.players >= maxSquadSize
                return (
                  <button
                    key={t.id}
                    className="bid-row"
                    onClick={() => makeBid(t)}
                    disabled={!current || t.purse <= bid || isFull}
                  >
                    <span className="team-dot" style={{ background: t.color }} />
                    <span>
                      <b>{t.short} ({t.name})</b>
                      <small>₹{t.purse.toLocaleString()} left · {t.players}/{maxSquadSize} {isFull ? '[FULL]' : ''}</small>
                    </span>
                    <strong>{isFull ? 'FULL' : `BID +₹${bid < 1000 ? 100 : bid < 5000 ? 250 : 500}`}</strong>
                  </button>
                )
              })
            )}
          </div>

          {current ? (
            <div className="award-box">
              <h4><Gavel size={14} /> AUCTIONEER DECISION DESK: SELL PLAYER</h4>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>
                Selling: <b style={{ color: 'var(--text)' }}>#{current.number} {current.name}</b>
              </div>
              <div className="award-row">
                <select
                  value={awardTeam}
                  onChange={e => setAwardTeam(e.target.value)}
                  title="Choose winning team"
                >
                  <option value="">-- Choose Winning Team --</option>
                  {teams.map(t => {
                    const isFull = t.players >= maxSquadSize
                    return (
                      <option key={t.id} value={t.name} disabled={isFull}>
                        {t.name} (Purse: ₹{t.purse.toLocaleString()}) {isFull ? `[FULL]` : `[${t.players}/${maxSquadSize}]`}
                      </option>
                    )
                  })}
                </select>
                <input
                  type="number"
                  value={awardPrice}
                  onChange={e => setAwardPrice(Number(e.target.value) || 0)}
                  min={current.base || 500}
                  step={50}
                  placeholder="Price"
                  title="Winning Price in ₹"
                />
              </div>

              {/* Quick increment price chips */}
              <div style={{ display: 'flex', gap: '6px', margin: '8px 0 12px' }}>
                {[100, 250, 500, 1000].map(inc => (
                  <button
                    key={inc}
                    type="button"
                    className="ghost-btn"
                    style={{ flex: 1, padding: '4px', fontSize: '10px' }}
                    onClick={() => setAwardPrice(awardPrice + inc)}
                  >
                    +₹{inc}
                  </button>
                ))}
              </div>

              <div className="hammer-actions">
                <button
                  className="sell-btn"
                  onClick={awardSell}
                  disabled={!awardTeam}
                >
                  <Gavel size={14} /> Sell to {awardTeam || 'Team'} (₹{awardPrice.toLocaleString()})
                </button>
                <button className="unsold-btn" onClick={unsold}>
                  Unsold
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px', border: '1px dashed var(--line)', textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>
              Spin the wheel or click <b>Nominate</b> on any player in the left queue to open the auction bidding & hammer desk.
            </div>
          )}
        </section>
      </div>

      {/* Live Franchise Budget Strip */}
      <div className="team-strip">
        {teams.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '16px', color: 'var(--muted)', fontSize: '12px' }}>
            No franchises configured. Auctioneer: Create teams to track live budgets.
          </div>
        ) : (
          teams.map(t => (
            <div className="strip-team" key={t.id}>
              <span className="team-logo" style={{ background: t.color, color: '#0A0F1F' }}>
                {t.short}
              </span>
              <div>
                <b>{t.name}</b>
                <small>₹{t.purse.toLocaleString()} · {t.players}/{maxSquadSize}</small>
              </div>
              <button
                className="strip-btn"
                onClick={() => onAdjustBudget(t)}
                title="Adjust budget"
              >
                Purse
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
