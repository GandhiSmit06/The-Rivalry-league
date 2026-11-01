'use client'

import React, { useState } from 'react'
import { Coins, Check, X } from 'lucide-react'
import type { Match } from '@/lib/server/db'
import { sounds } from '@/lib/client/sound'

export function TossModal({
  match,
  onClose,
  onRecordToss
}: {
  match: Match
  onClose: () => void
  onRecordToss: (matchId: string, tossWinner: string, tossDecision: 'Bat' | 'Bowl') => void
}) {
  const [flipping, setFlipping] = useState(false)
  const [tossResult, setTossResult] = useState<'HEADS' | 'TAILS' | null>(null)
  const [coinRotation, setCoinRotation] = useState(0)
  const [selectedWinner, setSelectedWinner] = useState<string>(match.tossWinner || match.teamA)
  const [decision, setDecision] = useState<'Bat' | 'Bowl'>(match.tossDecision || 'Bat')

  const handleFlipCoin = () => {
    if (flipping) return
    setFlipping(true)
    setTossResult(null)
    sounds.playCoinFlip()

    const randomRotations = 5 + Math.floor(Math.random() * 5) // 5 to 9 full spins
    const outcome = Math.random() > 0.5 ? 'HEADS' : 'TAILS'
    const finalAngle = randomRotations * 360 + (outcome === 'HEADS' ? 0 : 180)

    setCoinRotation(finalAngle)

    window.setTimeout(() => {
      setFlipping(false)
      setTossResult(outcome)
      sounds.playHammer()
      // If Heads, Team A wins; if Tails, Team B wins by default
      const winner = outcome === 'HEADS' ? match.teamA : match.teamB
      setSelectedWinner(winner)
    }, 2200)
  }

  const handleSave = () => {
    if (!selectedWinner || !decision) return
    onRecordToss(match.id, selectedWinner, decision)
  }

  return (
    <div className="modal-backdrop">
      <div className="setup-modal" style={{ maxWidth: '440px', textAlign: 'center' }}>
        <div className="modal-head" style={{ textAlign: 'left' }}>
          <div>
            <span className="section-kicker">3D MATCH TOSS SIMULATOR</span>
            <h2>Coin <em>Toss.</em></h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ margin: '14px 0 20px', padding: '10px', background: '#0e1626', borderRadius: '10px', border: '1px solid var(--line)' }}>
          <b style={{ fontSize: '15px', color: 'var(--text)' }}>{match.teamA}</b>
          <span style={{ margin: '0 8px', color: 'var(--gold)', fontWeight: 800 }}>VS</span>
          <b style={{ fontSize: '15px', color: 'var(--text)' }}>{match.teamB}</b>
          <small style={{ display: 'block', color: 'var(--muted)', marginTop: '4px', fontSize: '10px' }}>{match.stage} · {match.venue}</small>
        </div>

        {/* 3D Coin Graphic */}
        <div className="toss-arena" style={{ padding: '24px 0', perspective: '1000px', display: 'grid', placeItems: 'center' }}>
          <div
            className="coin"
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFDF70 0%, #D4AF37 50%, #996515 100%)',
              border: '4px solid #FFF1A8',
              boxShadow: '0 8px 30px rgba(255, 200, 61, 0.4), inset 0 0 15px rgba(0,0,0,0.4)',
              display: 'grid',
              placeItems: 'center',
              transformStyle: 'preserve-3d',
              transition: 'transform 2.2s cubic-bezier(0.12, 0.84, 0.2, 1)',
              transform: `rotateY(${coinRotation}deg)`
            }}
          >
            <div style={{ textAlign: 'center', color: '#3A2800' }}>
              <Coins size={32} />
              <b style={{ display: 'block', fontSize: '13px', fontWeight: 900, letterSpacing: '1px', marginTop: '2px' }}>
                {tossResult || (flipping ? 'FLIPPING' : 'TOSS')}
              </b>
            </div>
          </div>
        </div>

        <button
          className="primary-btn"
          style={{ width: '100%', marginBottom: '18px' }}
          onClick={handleFlipCoin}
          disabled={flipping}
        >
          <Coins size={16} /> {flipping ? 'COIN IN THE AIR...' : 'FLIP OFFICIAL COIN'}
        </button>

        {tossResult && (
          <div style={{ background: '#090e18', border: '1px solid var(--line-strong)', borderRadius: '10px', padding: '14px', textAlign: 'left', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', color: 'var(--gold)', letterSpacing: '1.2px', fontWeight: 800 }}>RESULT: {tossResult}</span>
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                TOSS WINNER:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  className={selectedWinner === match.teamA ? 'primary-btn' : 'ghost-btn'}
                  style={{ fontSize: '11px', padding: '8px' }}
                  onClick={() => setSelectedWinner(match.teamA)}
                >
                  {match.teamA}
                </button>
                <button
                  type="button"
                  className={selectedWinner === match.teamB ? 'primary-btn' : 'ghost-btn'}
                  style={{ fontSize: '11px', padding: '8px' }}
                  onClick={() => setSelectedWinner(match.teamB)}
                >
                  {match.teamB}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                DECISION:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  className={decision === 'Bat' ? 'primary-btn' : 'ghost-btn'}
                  style={{ fontSize: '11px', padding: '8px' }}
                  onClick={() => setDecision('Bat')}
                >
                  🏏 Elected to Bat
                </button>
                <button
                  type="button"
                  className={decision === 'Bowl' ? 'primary-btn' : 'ghost-btn'}
                  style={{ fontSize: '11px', padding: '8px' }}
                  onClick={() => setDecision('Bowl')}
                >
                  ⚡ Elected to Bowl
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="ghost-btn" onClick={onClose}>Close</button>
          <button
            type="button"
            className="primary-btn"
            disabled={!selectedWinner || !decision || flipping}
            onClick={handleSave}
          >
            <Check size={16} /> Save Toss Result
          </button>
        </div>
      </div>
    </div>
  )
}

