import { neon } from '@neondatabase/serverless'
import fs from 'fs/promises'
import path from 'path'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('Set DATABASE_URL before running this script.')
  process.exit(1)
}

async function migrate() {
  console.log('Connecting to Neon PostgreSQL...')
  const sql = neon(connectionString)

  console.log('Creating auction_store table if not exists...')
  await sql`
    CREATE TABLE IF NOT EXISTS auction_store (
      id VARCHAR(32) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `

  console.log('Reading local auction-db.json...')
  const dbPath = path.join(process.cwd(), 'data', 'auction-db.json')
  const content = await fs.readFile(dbPath, 'utf-8')
  const localData = JSON.parse(content)

  console.log(`Uploading ${localData.teams.length} teams and ${localData.players.length} players to Neon...`)
  await sql`
    INSERT INTO auction_store (id, data, updated_at)
    VALUES ('default', ${JSON.stringify(localData)}::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE
    SET data = EXCLUDED.data, updated_at = NOW();
  `

  const verify = await sql`SELECT data FROM auction_store WHERE id = 'default' LIMIT 1;`
  console.log('✅ Successfully synced with Neon PostgreSQL!')
  console.log(`Franchises in Cloud DB: ${verify[0].data.teams.length}`)
  console.log(`Players in Cloud DB: ${verify[0].data.players.length}`)
}

migrate().catch(err => {
  console.error('Migration error:', err)
  process.exit(1)
})

