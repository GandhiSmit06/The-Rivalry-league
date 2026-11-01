import { readDb, writeDb, Match } from './db'

export async function getAllMatches(): Promise<Match[]> {
  const db = await readDb()
  return db.matches
}

export async function createMatch(data: {
  teamA: string
  teamB: string
  date: string
  time?: string
  venue?: string
  stage?: string
}): Promise<{ success: boolean; match?: Match; message?: string }> {
  if (!data.teamA || !data.teamB) {
    return { success: false, message: 'Both Team A and Team B are required' }
  }
  if (data.teamA === data.teamB) {
    return { success: false, message: 'A team cannot play against itself' }
  }

  const db = await readDb()
  const newMatch: Match = {
    id: `m_${Date.now()}`,
    matchNumber: db.matches.length + 1,
    stage: data.stage || 'League Match',
    teamA: data.teamA,
    teamB: data.teamB,
    date: data.date || new Date().toISOString().split('T')[0],
    time: data.time || '18:00 IST',
    venue: data.venue || 'Main Stadium Arena',
    status: 'Scheduled'
  }

  db.matches.push(newMatch)
  await writeDb(db)
  return { success: true, match: newMatch }
}

export async function deleteMatch(id: string): Promise<{ success: boolean; message: string }> {
  const db = await readDb()
  db.matches = db.matches.filter(m => m.id !== id)
  db.matches.forEach((m, idx) => {
    m.matchNumber = idx + 1
  })
  await writeDb(db)
  return { success: true, message: 'Match deleted' }
}

export async function generateRoundRobinSchedule(): Promise<{
  success: boolean
  message: string
  matches: Match[]
}> {
  const db = await readDb()
  const teamNames = db.teams.map(t => t.name)
  if (teamNames.length < 2) {
    return { success: false, message: 'At least 2 teams are required to generate schedules', matches: [] }
  }

  const fixtures: Match[] = []
  let matchNum = 1
  const today = new Date()

  for (let i = 0; i < teamNames.length; i++) {
    for (let j = i + 1; j < teamNames.length; j++) {
      const matchDate = new Date(today)
      matchDate.setDate(today.getDate() + matchNum)
      fixtures.push({
        id: `m_${Date.now()}_${matchNum}`,
        matchNumber: matchNum,
        stage: `League Match #${matchNum}`,
        teamA: teamNames[i],
        teamB: teamNames[j],
        date: matchDate.toISOString().split('T')[0],
        time: matchNum % 2 === 0 ? '19:30 IST' : '15:30 IST',
        venue: 'Grand Central Arena',
        status: 'Scheduled'
      })
      matchNum++
    }
  }

  db.matches = fixtures
  await writeDb(db)
  return {
    success: true,
    message: `Generated ${fixtures.length} tournament fixtures across ${teamNames.length} teams`,
    matches: fixtures
  }
}

export async function recordTossOutcome(
  matchId: string,
  tossWinner: string,
  tossDecision: 'Bat' | 'Bowl'
): Promise<{ success: boolean; match?: Match; message?: string }> {
  const db = await readDb()
  const match = db.matches.find(m => m.id === matchId)
  if (!match) {
    return { success: false, message: 'Match fixture not found' }
  }

  if (tossWinner !== match.teamA && tossWinner !== match.teamB) {
    return { success: false, message: 'Toss winner must be one of the participating teams' }
  }

  match.tossWinner = tossWinner
  match.tossDecision = tossDecision
  match.status = 'Toss Done'

  await writeDb(db)
  return {
    success: true,
    match,
    message: `Toss won by ${tossWinner}, elected to ${tossDecision} first!`
  }
}

