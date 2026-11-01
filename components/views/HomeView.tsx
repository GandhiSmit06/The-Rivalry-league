'use client'

import React from 'react'
import {
  Play,
  CalendarDays,
  Users,
  Shuffle,
  Gavel,
  Coins,
  ChevronRight
} from 'lucide-react'
import { FeatureCard } from '@/components/common/FeatureCard'

export function HomeView({
  season,
  teamsCount,
  playersCount,
  matchesCount,
  maxSquadSize,
  defaultPurse,
  onStart,
  onManageTeams,
  onManageSchedule
}: {
  season: string
  teamsCount: number
  playersCount: number
  matchesCount: number
  maxSquadSize: number
  defaultPurse: number
  onStart: () => void
  onManageTeams: () => void
  onManageSchedule: () => void
}) {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="eyebrow">
          <span className="live-dot" /> AUCTIONEER COMMAND CENTER
          <span className="season-pill">SEASON · {season}</span>
        </div>
        <h1>
          BUILD YOUR<br />
          <em>DREAM XI.</em>
        </h1>
        <p className="hero-copy">
          Tournament cricket auction operated exclusively by the Auctioneer.<br className="desktop-only" />
          Base price ₹500 per player. Custom squad limits. Real-time franchise budgets.
        </p>
        <div className="hero-actions">
          <button className="primary-btn" onClick={onStart}>
            <Play size={16} fill="currentColor" /> Enter Auction Room <ChevronRight size={16} />
          </button>
          <button className="ghost-btn" onClick={onManageSchedule}>
            <CalendarDays size={16} /> Tournament Schedule & Toss
          </button>
        </div>
        <div className="hero-meta">
          <span>
            <strong>{String(teamsCount).padStart(2, '0')}</strong> FRANCHISES
          </span>
          <span>
            <strong>{String(playersCount).padStart(2, '0')}</strong> PLAYERS IN POOL
          </span>
          <span>
            <strong>{String(matchesCount).padStart(2, '0')}</strong> FIXTURES
          </span>
          <span>
            <strong>{maxSquadSize}</strong> SQUAD LIMIT
          </span>
          <span>
            <strong>₹{defaultPurse.toLocaleString()}</strong> DEFAULT PURSE
          </span>
        </div>
      </section>

      <section className="feature-row">
        <FeatureCard
          icon={<Shuffle />}
          num="01"
          title="₹500 Base Price"
          text="Every player starts at ₹500 base price with custom incremental bids."
        />
        <FeatureCard
          icon={<Users />}
          num="02"
          title="Select Squad Size"
          text={`Auctioneer sets exact player count per franchise (${maxSquadSize} players target).`}
        />
        <FeatureCard
          icon={<Gavel />}
          num="03"
          title="Hammer Down"
          text="Auctioneer chooses which player goes into which team and sets price."
        />
        <FeatureCard
          icon={<Coins />}
          num="04"
          title="Match Toss Flip"
          text="Interactive 3D coin toss simulator with official Bat or Bowl calls."
        />
      </section>

      <section className="home-bottom">
        <div>
          <span className="section-kicker">AUCTIONEER DESK</span>
          <h2>
            Your room.<br />
            <span>Your tournament.</span>
          </h2>
        </div>
        <div className="quick-grid">
          <button onClick={onManageSchedule}>
            <CalendarDays size={20} />
            <span>
              <b>Match Schedules & Toss</b>
              <small>{matchesCount} matches scheduled</small>
            </span>
            <ChevronRight size={16} />
          </button>
          <button onClick={onManageTeams}>
            <Users size={20} />
            <span>
              <b>Franchise Roster & Budgets</b>
              <small>{teamsCount} teams · {maxSquadSize} players each</small>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </section>
    </div>
  )
}

