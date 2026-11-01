'use client'

import {
  Plus,
  FileText,
  Gavel,
  Search,
  Swords,
  Trash2,
  Zap,
  Settings2,
  RotateCcw
} from 'lucide-react'
import type { Player } from '@/lib/server/db'

export function PlayersView({
  players,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  isAuctioneer,
  onAddPlayer,
  onBulkImport,
  onDeletePlayer,
  onReopenPlayer,
  onNominate,
  onDirectSell
}: {
  players: Player[]
  search: string
  setSearch: (s: string) => void
  roleFilter: string
  setRoleFilter: (r: string) => void
  isAuctioneer: boolean
  onAddPlayer: () => void
  onBulkImport: () => void
  onDeletePlayer: (id: number) => void
  onReopenPlayer: (id: number) => void
  onNominate: (id: number) => void
  onDirectSell: (player?: Player) => void
}) {
  const filtered = players.filter(p => {
    const query = search.toLowerCase().replace('#', '').trim()
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      String(p.number || '').includes(query)

    const matchesFilter =
      roleFilter === 'ALL'
        ? true
        : roleFilter === 'UPCOMING'
        ? p.status === 'Upcoming'
        : roleFilter === 'SOLD'
        ? p.status === 'Sold'
        : roleFilter === 'UNSOLD'
        ? p.status === 'Unsold'
        : true

    return matchesSearch && matchesFilter
  })

  return (
    <div className="content-page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">AUCTIONEER PLAYER POOL · BASE ₹500</span>
          <h2>Player <em>Directory.</em></h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="ghost-btn"
            style={{ color: 'var(--gold)', borderColor: 'rgba(255, 200, 61, 0.4)' }}
            onClick={() => onDirectSell()}
          >
            <Gavel size={16} /> Direct Sell / Assign
          </button>
          <button className="ghost-btn" onClick={onBulkImport}>
            <FileText size={16} /> Bulk Import
          </button>
          <button className="primary-btn" onClick={onAddPlayer}>
            <Plus size={16} /> Add Player (₹500 Base)
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="filter-row" style={{ margin: 0 }}>
          <button
            className={roleFilter === 'ALL' ? 'filter-active' : ''}
            onClick={() => setRoleFilter('ALL')}
          >
            ALL PLAYERS <span>{players.length}</span>
          </button>
          <button
            className={roleFilter === 'UPCOMING' ? 'filter-active' : ''}
            onClick={() => setRoleFilter('UPCOMING')}
          >
            UPCOMING <span>{players.filter(p => p.status === 'Upcoming').length}</span>
          </button>
          <button
            className={roleFilter === 'SOLD' ? 'filter-active' : ''}
            onClick={() => setRoleFilter('SOLD')}
          >
            SOLD <span>{players.filter(p => p.status === 'Sold').length}</span>
          </button>
          <button
            className={roleFilter === 'UNSOLD' ? 'filter-active' : ''}
            onClick={() => setRoleFilter('UNSOLD')}
          >
            UNSOLD <span>{players.filter(p => p.status === 'Unsold').length}</span>
          </button>
        </div>
        <div className="search-box">
          <Search size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players or #number..."
          />
        </div>
      </div>

      {players.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--panel)', border: '1px dashed var(--line)', borderRadius: '16px' }}>
          <Swords size={44} style={{ color: 'var(--gold)', marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '32px', margin: '0 0 8px' }}>No Players Registered</h3>
          <p style={{ color: 'var(--muted)', fontSize: '13px', maxWidth: '380px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            Auctioneer: Add individual players (standard ₹500 base price), or paste an entire roster CSV.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="primary-btn" onClick={onAddPlayer}>
              <Plus size={16} /> Add Single Player (₹500)
            </button>
            <button className="ghost-btn" onClick={onBulkImport}>
              <FileText size={16} /> Bulk Import Roster
            </button>
          </div>
        </div>
      ) : (
        <div className="players-grid">
          {filtered.map(p => (
            <article className="player-card" key={p.id}>
              <div className="player-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="player-number-pill">#{p.number}</span>
                  <span className="player-avatar">{p.initials}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className={`status ${p.status.toLowerCase()}`}>{p.status}</span>
                  <button
                    className="icon-btn"
                    onClick={() => onDeletePlayer(p.id)}
                    title="Remove player"
                    style={{ width: '26px', height: '26px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3>{p.name}</h3>

              <div className="player-card-bottom">
                <span>
                  <small>BASE PRICE</small>
                  <b style={{ color: 'var(--gold)' }}>₹{(p.base || 500).toLocaleString()}</b>
                </span>
                {p.soldPrice ? (
                  <span>
                    <small>SOLD TO</small>
                    <b className="green">{p.soldTo} (₹{p.soldPrice.toLocaleString()})</b>
                  </span>
                ) : (
                  <span>
                    <small>STATUS</small>
                    <b style={{ color: p.status === 'Upcoming' ? 'var(--gold)' : 'var(--red)' }}>{p.status}</b>
                  </span>
                )}
              </div>

              <div style={{ marginTop: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {p.status === 'Upcoming' && (
                  <>
                    <button
                      className="primary-btn"
                      style={{ flex: 1, padding: '8px', fontSize: '10px' }}
                      onClick={() => onNominate(p.id)}
                    >
                      <Gavel size={13} /> Nominate
                    </button>
                    <button
                      className="ghost-btn"
                      style={{ flex: 1, padding: '8px', fontSize: '10px', color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.4)' }}
                      onClick={() => onDirectSell(p)}
                    >
                      <Zap size={13} /> Sell to Team
                    </button>
                  </>
                )}
                {p.status === 'Sold' && (
                  <>
                    <button
                      className="ghost-btn"
                      style={{ flex: 1, padding: '8px', fontSize: '10px', color: 'var(--gold)', borderColor: 'rgba(255, 200, 61, 0.4)' }}
                      onClick={() => onDirectSell(p)}
                    >
                      <Settings2 size={13} /> Change Team/Price
                    </button>
                    <button
                      className="ghost-btn"
                      style={{ padding: '8px 10px', fontSize: '10px' }}
                      onClick={() => onReopenPlayer(p.id)}
                      title="Reopen to upcoming"
                    >
                      <RotateCcw size={13} />
                    </button>
                  </>
                )}
                {p.status === 'Unsold' && (
                  <>
                    <button
                      className="ghost-btn"
                      style={{ flex: 1, padding: '8px', fontSize: '10px', color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.4)' }}
                      onClick={() => onDirectSell(p)}
                    >
                      <Zap size={13} /> Sell to Team
                    </button>
                    <button
                      className="ghost-btn"
                      style={{ flex: 1, padding: '8px', fontSize: '10px', color: 'var(--gold)', borderColor: 'var(--gold)' }}
                      onClick={() => onReopenPlayer(p.id)}
                    >
                      <RotateCcw size={13} /> Re-auction
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

