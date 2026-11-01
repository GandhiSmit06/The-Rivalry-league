export const PLAYER_ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'] as const

const ROLE_SHORT: Record<string, string> = {
  Batsman: 'BAT',
  Bowler: 'BOWL',
  'All-Rounder': 'AR',
  'Wicket-Keeper': 'WK'
}

export function roleShort(role: string): string {
  return ROLE_SHORT[role] || role.slice(0, 4).toUpperCase()
}
