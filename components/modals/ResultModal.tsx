'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import type { Match } from '@/lib/server/db'
import { parseOvers, formatOvers, DEFAULT_OVERS } from '@/lib/shared/standings'

type Payload = {
  oversLimit: number
  noResult?: boolean
  scoreA?: { runs: number; wickets: number; balls: number; allOut: boolean }
  scoreB?: { runs: number; wickets: number; balls: number; allOut: boolean }
}

export function ResultModal({
  match,
  onClose,
  onSave
}: {
  match: Match
  onClose: () => void
  onSave: (matchId: string, payload: Payload) => void
}) {
  const [limit, setLimit] = useState(String(match.oversLimit || DEFAULT_OVERS))
  const [a, setA] = useState({
    runs: match.scoreA ? String(match.scoreA.runs) : '',
    wickets: match.scoreA ? String(match.scoreA.wickets) : '0',
    overs: match.scoreA ? formatOvers(match.scoreA.balls) : '',
    allOut: match.scoreA?.allOut || false
  })
  const [b, setB] = useState({
    runs: match.scoreB ? String(match.scoreB.runs) : '',
    wickets: match.scoreB ? String(match.scoreB.wickets) : '0',
    overs: match.scoreB ? formatOvers(match.scoreB.balls) : '',
    allOut: match.scoreB?.allOut || false
  })
  const [error, setError] = useState('')

  const build = (s: typeof a, label: string) => {
    const balls = parseOvers(s.overs)
    const runs = Number(s.runs)
    const wickets = Number(s.wickets)
    if (s.runs === '' || !Number.isInteger(runs) || runs < 0) throw new Error(`${label}: enter runs scored`)
    if (!Number.isInteger(wickets) || wickets < 0) throw new Error(`${label}: wickets must be 0 or more`)
    if (balls === null) throw new Error(`${label}: overs like 7.3 (balls 0-5 after the dot)`)
    if (balls > Number(limit) * 6) throw new Error(`${label}: overs cannot exceed ${limit}`)
    return { runs, wickets, balls, allOut: s.allOut }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const oversLimit = Number(limit)
    if (!Number.isInteger(oversLimit) || oversLimit < 1 || oversLimit > 50) {
      setError('Overs per side must be 1-50')
      return
    }
    try {
      onSave(match.id, {
        oversLimit,
        scoreA: build(a, match.teamA),
        scoreB: build(b, match.teamB)
      })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const column = (name: string, s: typeof a, set: (v: typeof a) => void) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <b style={{ display: 'block', marginBottom: 8, color: 'var(--gold)' }}>{name}</b>
      <label>
        RUNS
        <input type="number" min={0} value={s.runs} onChange={e => set({ ...s, runs: e.target.value })} />
      </label>
      <label>
        WICKETS LOST
        <input type="number" min={0} value={s.wickets} onChange={e => set({ ...s, wickets: e.target.value })} />
      </label>
      <label>
        OVERS FACED (e.g. 7.3)
        <input inputMode="decimal" value={s.overs} onChange={e => set({ ...s, overs: e.target.value })} placeholder={`0-${limit}`} />
      </label>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <input type="checkbox" checked={s.allOut} onChange={e => set({ ...s, allOut: e.target.checked })} style={{ width: 'auto' }} />
        All out
      </label>
    </div>
  )

  return (
    <div className="modal-backdrop">
      <div className="setup-modal" style={{ maxWidth: '560px' }}>
        <div className="modal-head">
          <div>
            <span className="section-kicker">MATCH #{match.matchNumber} · SCORECARD</span>
            <h2>Enter <em>Result.</em></h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={submit} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label>
            OVERS PER SIDE
            <input type="number" min={1} max={50} value={limit} onChange={e => setLimit(e.target.value)} />
          </label>
          <div style={{ display: 'flex', gap: 14 }}>
            {column(match.teamA, a, setA)}
            {column(match.teamB, b, setB)}
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
            Tick <b>All out</b> when a side was bowled out: for net run rate they are then charged the full {limit || '–'} overs,
            exactly like international cricket.
          </p>
          {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{error}</p>}
          <div className="modal-actions">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => onSave(match.id, { oversLimit: Number(limit) || DEFAULT_OVERS, noResult: true })}
              title="Rain / abandoned: 1 point each, ignored for net run rate"
            >
              No result
            </button>
            <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn"><Check size={16} /> Save Result</button>
          </div>
        </form>
      </div>
    </div>
  )
}
