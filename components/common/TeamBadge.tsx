'use client'

import type { Team } from '@/lib/server/db'

function readableOn(hex: string): string {
  const value = hex.replace('#', '')
  if (value.length !== 6) return '#ffffff'
  const [r, g, b] = [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? '#2c241e' : '#ffffff'
}

/** The owner's uploaded logo, or a monogram in the team color. */
export function TeamBadge({ team, size = 52 }: { team: Team; size?: number }) {
  const style = { width: size, height: size, fontSize: Math.round(size / 3) }

  if (team.logo) {
    return (
      // Stored as a small data URL, so next/image adds nothing here
      // eslint-disable-next-line @next/next/no-img-element
      <img className="team-logo" src={team.logo} alt={`${team.name} logo`} style={{ ...style, objectFit: 'cover' }} />
    )
  }

  return (
    <span className="team-logo" style={{ ...style, background: team.color, color: readableOn(team.color) }}>
      {team.short}
    </span>
  )
}
