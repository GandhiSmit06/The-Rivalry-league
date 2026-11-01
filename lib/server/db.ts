import fs from 'fs/promises'
import path from 'path'
import { neon } from '@neondatabase/serverless'

export type Player = {
  id: number
  number: number // Sequential player number (1, 2, 3...)
  name: string
  role?: string
  rating?: number
  base: number
  status: 'Upcoming' | 'Sold' | 'Unsold'
  soldTo?: string
  soldPrice?: number
  initials: string
  style?: string
}

export type Team = {
  id: string
  name: string
  short: string
  color: string
  owner: string
  purse: number
  spent: number
  players: number
  tagline: string
}

export type Match = {
  id: string
  matchNumber: number
  stage: string
  teamA: string
  teamB: string
  date: string
  time: string
  venue: string
  status: 'Scheduled' | 'Toss Done' | 'Live' | 'Completed'
  tossWinner?: string
  tossDecision?: 'Bat' | 'Bowl'
  result?: string
}

export type AuctionState = {
  currentPlayerId: number | null
  currentBid: number
  leaderTeamId: string | null
  leaderTeamName: string | null
  lastUpdated: string
}

export type DatabaseSchema = {
  auctioneer: {
    pin: string
    name: string
  }
  league: {
    name: string
    season: string
    defaultPurse: number
    maxSquadSize: number
  }
  teams: Team[]
  players: Player[]
  matches: Match[]
  auctionState: AuctionState
}

const DB_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DB_DIR, 'auction-db.json')

const initialData: DatabaseSchema = {
  auctioneer: {
    pin: '1234',
    name: 'Chief Auctioneer'
  },
  league: {
    name: 'Sunday Premier Auction',
    season: '01',
    defaultPurse: 20000,
    maxSquadSize: 5
  },
  teams: [],
  players: [],
  matches: [],
  auctionState: {
    currentPlayerId: null,
    currentBid: 0,
    leaderTeamId: null,
    leaderTeamName: null,
    lastUpdated: new Date().toISOString()
  }
}

// -------------------------------------------------------------
// Neon Serverless PostgreSQL Database Client
// -------------------------------------------------------------
let sqlClient: ReturnType<typeof neon> | null = null
let isNeonInitialized = false

function getSqlClient() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return null
  if (!sqlClient) {
    sqlClient = neon(dbUrl)
  }
  return sqlClient
}

async function ensureNeonDb(sql: ReturnType<typeof neon>): Promise<void> {
  if (isNeonInitialized) return

  // Create persistence store table in Postgres
  await sql`
    CREATE TABLE IF NOT EXISTS auction_store (
      id VARCHAR(32) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `

  // Check if initial row exists
  const rows = await sql`
    SELECT id FROM auction_store WHERE id = 'default' LIMIT 1;
  `

  if (rows.length === 0) {
    // Seed initial row from local auction-db.json if available
    let seedData = initialData
    try {
      const content = await fs.readFile(DB_FILE, 'utf-8')
      seedData = JSON.parse(content) as DatabaseSchema
    } catch {
      seedData = initialData
    }

    await sql`
      INSERT INTO auction_store (id, data, updated_at)
      VALUES ('default', ${JSON.stringify(seedData)}::jsonb, NOW())
      ON CONFLICT (id) DO NOTHING;
    `
  }

  isNeonInitialized = true
}

// -------------------------------------------------------------
// Local JSON File Fallback (for offline or local testing)
// -------------------------------------------------------------
async function ensureLocalDb(): Promise<DatabaseSchema> {
  try {
    await fs.mkdir(DB_DIR, { recursive: true })
    const content = await fs.readFile(DB_FILE, 'utf-8')
    const parsed = JSON.parse(content) as DatabaseSchema
    let changed = false
    if (!parsed.matches) {
      parsed.matches = []
      changed = true
    }
    if (parsed.players && Array.isArray(parsed.players)) {
      parsed.players.forEach((p, idx) => {
        if (!p.number) {
          p.number = idx + 1
          changed = true
        }
      })
    }
    if (changed) {
      await fs.writeFile(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8')
    }
    return parsed
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8')
    return initialData
  }
}

// -------------------------------------------------------------
// Core Database Read / Write Operations
// -------------------------------------------------------------
export async function readDb(): Promise<DatabaseSchema> {
  const sql = getSqlClient()
  if (sql) {
    try {
      await ensureNeonDb(sql)
      const rows = await sql`
        SELECT data FROM auction_store WHERE id = 'default' LIMIT 1;
      `
      if (rows && rows.length > 0 && rows[0].data) {
        return rows[0].data as DatabaseSchema
      }
    } catch (err) {
      console.error('[Neon Postgres Read Warning, falling back to local file]:', err)
    }
  }
  return await ensureLocalDb()
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  const sql = getSqlClient()
  if (sql) {
    try {
      await ensureNeonDb(sql)
      await sql`
        INSERT INTO auction_store (id, data, updated_at)
        VALUES ('default', ${JSON.stringify(data)}::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE
        SET data = EXCLUDED.data, updated_at = NOW();
      `
      return
    } catch (err) {
      console.error('[Neon Postgres Write Warning, saving locally]:', err)
    }
  }

  // Local fallback
  await fs.mkdir(DB_DIR, { recursive: true })
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase() || 'PL'
}
