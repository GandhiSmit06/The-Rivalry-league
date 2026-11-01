import { readDb, writeDb, AuctionState, Player, Team } from './db'

export async function getAuctionSnapshot(): Promise<{
  auctionState: AuctionState
  current: Player | null
  leader: Team | null
  teams: Team[]
  players: Player[]
}> {
  const db = await readDb()
  const current = db.players.find(p => p.id === db.auctionState.currentPlayerId) || null
  const leader = db.teams.find(t => t.name === db.auctionState.leaderTeamName) || null

  return {
    auctionState: db.auctionState,
    current,
    leader,
    teams: db.teams,
    players: db.players
  }
}

export async function spinWheel(): Promise<{
  success: boolean
  player?: Player
  auctionState?: AuctionState
  message: string
  isUnsoldRound?: boolean
}> {
  const db = await readDb()
  const upcoming = db.players.filter(p => p.status === 'Upcoming')
  const unsold = db.players.filter(p => p.status === 'Unsold')

  let candidatePool = upcoming
  let isUnsoldRound = false

  if (candidatePool.length === 0) {
    if (unsold.length > 0) {
      candidatePool = unsold
      isUnsoldRound = true
    } else {
      return { success: false, message: 'All players processed! No upcoming or unsold players remaining in pool.' }
    }
  }

  const randomPlayer = candidatePool[Math.floor(Math.random() * candidatePool.length)]
  db.auctionState = {
    currentPlayerId: randomPlayer.id,
    currentBid: randomPlayer.base || 500,
    leaderTeamId: null,
    leaderTeamName: null,
    lastUpdated: new Date().toISOString()
  }

  await writeDb(db)
  return {
    success: true,
    message: isUnsoldRound
      ? `[RE-AUCTION ROUND] Unsold Player #${randomPlayer.number} (${randomPlayer.name}) drawn on the block!`
      : `Player #${randomPlayer.number} (${randomPlayer.name}) drawn by Auctioneer`,
    player: randomPlayer,
    auctionState: db.auctionState,
    isUnsoldRound
  }
}

export async function reopenAllUnsold(): Promise<{
  success: boolean
  message: string
  players: Player[]
}> {
  const db = await readDb()
  const unsold = db.players.filter(p => p.status === 'Unsold')
  if (!unsold.length) {
    return { success: false, message: 'No unsold players to restore', players: db.players }
  }

  unsold.forEach(p => {
    p.status = 'Upcoming'
  })

  await writeDb(db)
  return {
    success: true,
    message: `Restored ${unsold.length} unsold player(s) back into the upcoming pool`,
    players: db.players
  }
}

export async function nominatePlayer(playerId: number): Promise<{
  success: boolean
  player?: Player
  auctionState?: AuctionState
  message: string
}> {
  const db = await readDb()
  const target = db.players.find(p => p.id === playerId)

  if (!target) {
    return { success: false, message: 'Player not found' }
  }

  db.auctionState = {
    currentPlayerId: target.id,
    currentBid: target.base || 500,
    leaderTeamId: null,
    leaderTeamName: null,
    lastUpdated: new Date().toISOString()
  }

  await writeDb(db)
  return {
    success: true,
    message: `Player #${target.number} (${target.name}) nominated by Auctioneer`,
    player: target,
    auctionState: db.auctionState
  }
}

export async function placeBid(
  teamName: string,
  amount: number
): Promise<{
  success: boolean
  auctionState?: AuctionState
  message: string
}> {
  const db = await readDb()
  const current = db.players.find(p => p.id === db.auctionState.currentPlayerId)
  if (!current) {
    return { success: false, message: 'No player currently on auction' }
  }

  const team = db.teams.find(t => t.name === teamName || t.id === teamName)
  if (!team) {
    return { success: false, message: 'Team not found' }
  }

  const maxSquad = db.league.maxSquadSize || 11
  if (team.players >= maxSquad) {
    return {
      success: false,
      message: `${team.name} has already reached the maximum squad limit of ${maxSquad} players`
    }
  }

  const bidAmount = Number(amount)
  if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
    return { success: false, message: 'Please enter a valid bid amount' }
  }
  const currentBid = db.auctionState.currentBid || 0
  if (db.auctionState.leaderTeamId ? bidAmount <= currentBid : bidAmount < currentBid) {
    return {
      success: false,
      message: `Bid must be ${db.auctionState.leaderTeamId ? 'higher than' : 'at least'} ₹${currentBid.toLocaleString()}`
    }
  }
  if (bidAmount > team.purse) {
    return {
      success: false,
      message: `${team.name} has insufficient purse (₹${team.purse.toLocaleString()} available)`
    }
  }

  db.auctionState.currentBid = bidAmount
  db.auctionState.leaderTeamId = team.id
  db.auctionState.leaderTeamName = team.name
  db.auctionState.lastUpdated = new Date().toISOString()

  await writeDb(db)
  return {
    success: true,
    message: `Bid of ₹${bidAmount.toLocaleString()} accepted for ${team.name}`,
    auctionState: db.auctionState
  }
}

export async function sellPlayer(
  teamName: string,
  price?: number,
  playerId?: number
): Promise<{
  success: boolean
  player?: Player
  team?: Team
  teams?: Team[]
  players?: Player[]
  auctionState?: AuctionState
  message: string
}> {
  const db = await readDb()
  const targetPlayerId = playerId ? Number(playerId) : db.auctionState.currentPlayerId

  if (!targetPlayerId) {
    return { success: false, message: 'No player selected to sell' }
  }

  const targetPlayer = db.players.find(p => p.id === targetPlayerId)
  if (!targetPlayer) {
    return { success: false, message: 'Player not found' }
  }

  const winningTeamName = teamName || db.auctionState.leaderTeamName
  if (!winningTeamName) {
    return { success: false, message: 'Please select which team this player went into' }
  }

  const team = db.teams.find(t => t.name === winningTeamName || t.id === winningTeamName)
  if (!team) {
    return { success: false, message: 'Chosen team not found' }
  }

  const finalPrice = price !== undefined ? Number(price) : (db.auctionState.currentBid || targetPlayer.base || 500)
  if (finalPrice < 0 || isNaN(finalPrice)) {
    return { success: false, message: 'Please enter a valid sale price' }
  }

  // If re-selling a player, refund previous team
  if (targetPlayer.status === 'Sold' && targetPlayer.soldTo) {
    const prevTeam = db.teams.find(t => t.name === targetPlayer.soldTo)
    if (prevTeam && prevTeam.id !== team.id) {
      prevTeam.purse += targetPlayer.soldPrice || 0
      prevTeam.spent = Math.max(0, prevTeam.spent - (targetPlayer.soldPrice || 0))
      prevTeam.players = Math.max(0, prevTeam.players - 1)
    } else if (prevTeam && prevTeam.id === team.id) {
      team.purse += targetPlayer.soldPrice || 0
      team.spent = Math.max(0, team.spent - (targetPlayer.soldPrice || 0))
      team.players = Math.max(0, team.players - 1)
    }
  }

  const maxSquad = db.league.maxSquadSize || 11
  if (team.players >= maxSquad) {
    return {
      success: false,
      message: `${team.name} has reached maximum squad capacity (${maxSquad} players)`
    }
  }

  if (finalPrice > team.purse) {
    return {
      success: false,
      message: `${team.name} only has ₹${team.purse.toLocaleString()} purse available`
    }
  }

  targetPlayer.status = 'Sold'
  targetPlayer.soldTo = team.name
  targetPlayer.soldPrice = finalPrice

  team.purse -= finalPrice
  team.spent += finalPrice
  team.players += 1

  if (db.auctionState.currentPlayerId === targetPlayer.id) {
    db.auctionState = {
      currentPlayerId: null,
      currentBid: 0,
      leaderTeamId: null,
      leaderTeamName: null,
      lastUpdated: new Date().toISOString()
    }
  }

  await writeDb(db)
  return {
    success: true,
    message: `HAMMER DOWN! Player #${targetPlayer.number} (${targetPlayer.name}) sold to ${team.name} for ₹${finalPrice.toLocaleString()}`,
    player: targetPlayer,
    team,
    teams: db.teams,
    players: db.players,
    auctionState: db.auctionState
  }
}

export async function markUnsold(): Promise<{
  success: boolean
  player?: Player
  message: string
}> {
  const db = await readDb()
  const current = db.players.find(p => p.id === db.auctionState.currentPlayerId)
  if (!current) {
    return { success: false, message: 'No player currently on auction to mark unsold' }
  }

  current.status = 'Unsold'
  current.soldTo = undefined
  current.soldPrice = undefined

  db.auctionState = {
    currentPlayerId: null,
    currentBid: 0,
    leaderTeamId: null,
    leaderTeamName: null,
    lastUpdated: new Date().toISOString()
  }

  await writeDb(db)
  return {
    success: true,
    message: `Player #${current.number} (${current.name}) passed as UNSOLD`,
    player: current
  }
}

export async function resetAuction(): Promise<{
  success: boolean
  message: string
  players: Player[]
  teams: Team[]
}> {
  const db = await readDb()
  const defaultPurse = db.league?.defaultPurse || 20000

  db.players.forEach(p => {
    p.status = 'Upcoming'
    p.soldTo = undefined
    p.soldPrice = undefined
  })

  db.teams.forEach(t => {
    t.purse = defaultPurse
    t.spent = 0
    t.players = 0
  })

  db.auctionState = {
    currentPlayerId: null,
    currentBid: 0,
    leaderTeamId: null,
    leaderTeamName: null,
    lastUpdated: new Date().toISOString()
  }

  await writeDb(db)
  return {
    success: true,
    message: 'Auction reset — all players and purses restored to pristine state',
    players: db.players,
    teams: db.teams
  }
}

