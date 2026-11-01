'use client'

import React from 'react'
import {
  Trophy,
  Users,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Settings2,
  LayoutDashboard,
  Gavel,
  Swords,
  CalendarDays,
  BarChart3
} from 'lucide-react'

export const navItems = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'auction', label: 'Auction', icon: Gavel },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'players', label: 'Players', icon: Swords },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'results', label: 'Results', icon: BarChart3 }
]

export function Topbar({
  page,
  setPage,
  leagueName,
  season,
  maxSquadSize,
  onUpdateSquadLimit,
  isAuctioneer,
  setIsAuctioneer,
  onOpenAuth,
  isMuted,
  onToggleSound,
  onOpenSettings
}: {
  page: string
  setPage: (p: string) => void
  leagueName: string
  season: string
  maxSquadSize: number
  onUpdateSquadLimit: (limit: number) => void
  isAuctioneer: boolean
  setIsAuctioneer: (v: boolean) => void
  onOpenAuth: () => void
  isMuted: boolean
  onToggleSound: () => void
  onOpenSettings: () => void
}) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => setPage('home')}>
        <div className="brand-mark">
          <Trophy size={18} />
        </div>
        <div>
          <b style={{ letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{leagueName || 'Sunday Premier Auction'}</b>
          <small>SEASON · {season}</small>
        </div>
      </button>

      <nav className="desktop-nav">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = page === item.id
          return (
            <button
              key={item.id}
              className={isActive ? 'nav-active' : ''}
              onClick={() => setPage(item.id)}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="top-actions">
        {/* Squad Limit Target Control */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--line)',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '11px'
          }}
        >
          <Users size={12} style={{ color: 'var(--gold)' }} />
          <span style={{ color: 'var(--muted)', fontSize: '10px' }}>Squad:</span>
          <select
            value={maxSquadSize}
            onChange={e => onUpdateSquadLimit(Number(e.target.value))}
            style={{
              background: 'none',
              border: 0,
              color: 'var(--gold)',
              fontWeight: 800,
              fontSize: '11px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {[3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => (
              <option key={n} value={n} style={{ background: '#0e1626', color: '#fff' }}>
                {n} players
              </option>
            ))}
          </select>
        </div>

        {/* Auctioneer PIN lock toggle */}
        <button
          className={isAuctioneer ? 'auctioneer-pill unlocked' : 'auctioneer-pill locked'}
          onClick={() => {
            if (isAuctioneer) {
              setIsAuctioneer(false)
            } else {
              onOpenAuth()
            }
          }}
          title={isAuctioneer ? 'Click to lock Auctioneer Mode' : 'Click to unlock with PIN'}
        >
          {isAuctioneer ? <Unlock size={13} /> : <Lock size={13} />}
          <span>{isAuctioneer ? 'AUCTIONEER' : 'LOCKED'}</span>
        </button>

        {/* Audio Mute / Unmute */}
        <button
          className="icon-btn"
          onClick={onToggleSound}
          aria-label="Toggle sound"
          title={isMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        {/* Settings button */}
        <button
          className="icon-btn"
          onClick={onOpenSettings}
          title="Tournament Settings"
        >
          <Settings2 size={17} />
        </button>
      </div>
    </header>
  )
}

