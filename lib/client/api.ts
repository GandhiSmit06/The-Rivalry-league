import type { Player, Team, Match, AuctionState } from '@/lib/server/db'

// API Client Helper
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  const json = await res.json()
  return json as T
}

// 1. Auth API
export const apiAuth = {
  verifyPin: (pin: string) =>
    request<{ success: boolean; message?: string }>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ pin })
    }),
  changePin: (currentPin: string, newPin: string) =>
    request<{ success: boolean; message: string }>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'change-pin', currentPin, newPin })
    })
}

// 2. League API
export const apiLeague = {
  getSettings: () =>
    request<{ success: boolean; league: { name: string; season: string; defaultPurse: number; maxSquadSize: number } }>('/api/league'),
  updateSettings: (settings: { name?: string; season?: string; defaultPurse?: number; maxSquadSize?: number }) =>
    request<{ success: boolean; message: string; league: any }>('/api/league', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
}

// 3. Teams API
export const apiTeams = {
  getAll: () => request<{ success: boolean; teams: Team[] }>('/api/teams'),
  create: (data: { name: string; short?: string; color?: string; owner?: string; purse?: number; tagline?: string }) =>
    request<{ success: boolean; team?: Team; teams: Team[]; message?: string }>('/api/teams', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string; teams: Team[]; players: Player[] }>(`/api/teams?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }),
  adjustBudget: (teamId: string, mode: 'set' | 'add' | 'subtract', amount: number) =>
    request<{ success: boolean; team?: Team; teams: Team[]; message: string }>(`/api/teams/${encodeURIComponent(teamId)}/budget`, {
      method: 'POST',
      body: JSON.stringify({ mode, amount })
    })
}

// 4. Players API
export const apiPlayers = {
  getAll: () => request<{ success: boolean; players: Player[] }>('/api/players'),
  create: (data: { name: string; role?: string; rating?: number; base?: number; style?: string }) =>
    request<{ success: boolean; player?: Player; players: Player[]; message?: string }>('/api/players', {
      method: 'POST',
      body: JSON.stringify({ ...data, base: data.base || 500 })
    }),
  bulkImport: (players: Array<{ name: string; role?: string; base?: number; rating?: number; style?: string }>) =>
    request<{ success: boolean; message: string; players: Player[] }>('/api/players', {
      method: 'POST',
      body: JSON.stringify({ bulk: true, players })
    }),
  update: (id: number, data: Partial<Player>) =>
    request<{ success: boolean; player?: Player; players: Player[]; message?: string }>('/api/players', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data })
    }),
  delete: (id: number) =>
    request<{ success: boolean; message: string; players: Player[] }>(`/api/players?id=${id}`, {
      method: 'DELETE'
    })
}

// 5. Auction API
export const apiAuction = {
  getState: () =>
    request<{
      success: boolean
      auctionState: AuctionState
      current: Player | null
      leader: Team | null
      teams: Team[]
      players: Player[]
    }>('/api/auction'),
  spin: () =>
    request<{
      success: boolean
      player: Player
      auctionState: AuctionState
      message: string
      isUnsoldRound?: boolean
    }>('/api/auction', {
      method: 'POST',
      body: JSON.stringify({ action: 'spin' })
    }),
  nominate: (playerId: number) =>
    request<{
      success: boolean
      player: Player
      auctionState: AuctionState
      message: string
    }>('/api/auction', {
      method: 'POST',
      body: JSON.stringify({ action: 'nominate', playerId })
    }),
  bid: (teamName: string, amount: number) =>
    request<{
      success: boolean
      auctionState: AuctionState
      message: string
    }>('/api/auction', {
      method: 'POST',
      body: JSON.stringify({ action: 'bid', teamName, amount })
    }),
  sell: (teamName: string, price: number, playerId?: number) =>
    request<{
      success: boolean
      player: Player
      team: Team
      teams: Team[]
      players: Player[]
      auctionState: AuctionState
      message: string
    }>('/api/auction', {
      method: 'POST',
      body: JSON.stringify({ action: 'sell', teamName, price, playerId })
    }),
  unsold: () =>
    request<{
      success: boolean
      player: Player
      message: string
    }>('/api/auction', {
      method: 'POST',
      body: JSON.stringify({ action: 'unsold' })
    }),
  reopenAllUnsold: () =>
    request<{
      success: boolean
      message: string
      players: Player[]
    }>('/api/auction', {
      method: 'POST',
      body: JSON.stringify({ action: 'reopen-unsold' })
    }),
  reset: () =>
    request<{
      success: boolean
      message: string
      players: Player[]
      teams: Team[]
    }>('/api/auction', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset' })
    })
}

// 6. Matches & Toss API
export const apiMatches = {
  getAll: () => request<{ success: boolean; matches: Match[] }>('/api/matches'),
  create: (data: { teamA: string; teamB: string; date: string; time?: string; venue?: string; stage?: string }) =>
    request<{ success: boolean; match?: Match; matches: Match[]; message?: string }>('/api/matches', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string; matches: Match[] }>(`/api/matches?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }),
  generateRoundRobin: () =>
    request<{ success: boolean; message: string; matches: Match[] }>('/api/matches', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate-round-robin' })
    }),
  recordToss: (matchId: string, tossWinner: string, tossDecision: 'Bat' | 'Bowl') =>
    request<{ success: boolean; match?: Match; matches: Match[]; message: string }>(`/api/matches/${encodeURIComponent(matchId)}/toss`, {
      method: 'POST',
      body: JSON.stringify({ tossWinner, tossDecision })
    })
}

