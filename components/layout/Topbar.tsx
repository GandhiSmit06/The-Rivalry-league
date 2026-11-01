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
import { RivalryLeagueLogo } from '@/components/common/RivalryLeagueLogo'

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
  onUpdateSeason,
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
  onUpdateSeason: (season: string) => void
  maxSquadSize: number
  onUpdateSquadLimit: (limit: number) => void
  isAuctioneer: boolean
  setIsAuctioneer: (v: boolean) => void
  onOpenAuth: () => void
  isMuted: boolean
  onToggleSound: () => void
  onOpenSettings: () => void
}) {
  const displayName =
    leagueName && leagueName !== 'Sunday Premier Auction'
      ? leagueName
      : 'The Rivalry League'

  return (
    <>
      <header className="topbar">
        <button className="brand" onClick={() => setPage('home')}>
          <RivalryLeagueLogo size={38} animated={true} />
          <div className="brand-text-col">
            <b style={{ letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{displayName}</b>
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
          {/* Season Selector */}
          <div className="top-ctrl-pill top-ctrl-season" title="Active Tournament Season">
            <Trophy size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <span className="ctrl-label">Season:</span>
            <select
              value={season}
              onChange={e => onUpdateSeason(e.target.value)}
              className="ctrl-select"
            >
              {['01', '02', '03', '04', '05', '06', '07'].map(s => (
                <option key={s} value={s} style={{ background: '#0e1626', color: '#fff' }}>
                  S{s}
                </option>
              ))}
            </select>
          </div>

          {/* Squad Limit Target Control */}
          <div className="top-ctrl-pill top-ctrl-squad" title="Max Players per Franchise for this Season">
            <Users size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <span className="ctrl-label">Squad:</span>
            <select
              value={maxSquadSize}
              onChange={e => onUpdateSquadLimit(Number(e.target.value))}
              className="ctrl-select"
            >
              {[3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => (
                <option key={n} value={n} style={{ background: '#0e1626', color: '#fff' }}>
                  {n}/team
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
            <span className="auctioneer-text">{isAuctioneer ? 'AUCTIONEER' : 'LOCKED'}</span>
          </button>

          {/* Audio Mute / Unmute */}
          <button
            className="icon-btn"
            onClick={onToggleSound}
            aria-label="Toggle sound"
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Settings button */}
          <button
            className="icon-btn"
            onClick={onOpenSettings}
            title="Tournament Settings"
          >
            <Settings2 size={16} />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Ultra-responsive on all smartphones) */}
      <nav className="mobile-tabs" aria-label="Mobile Navigation">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = page === item.id
          return (
            <button
              key={item.id}
              className={isActive ? 'nav-active' : ''}
              onClick={() => setPage(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

