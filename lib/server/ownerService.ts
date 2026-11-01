import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { readDb, writeDb, Team } from './db'

// Resized in the browser to 256x256, so a real logo is far below this.
const MAX_LOGO_CHARS = 150_000
const LOGO_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/
const MIN_PIN_LENGTH = 6

function hashPin(pin: string): string {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(pin, salt, 32).toString('hex')}`
}

function pinMatches(pin: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(pin, salt, 32)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

/** Superadmin assigns (or resets) the login a team owner signs in with. */
export async function setOwnerLogin(
  teamId: string,
  loginId: string,
  pin: string
): Promise<{ success: boolean; message: string }> {
  const id = (loginId || '').trim().toLowerCase()
  const cleanPin = (pin || '').trim()
  if (id.length < 3) return { success: false, message: 'Login ID must be at least 3 characters' }
  if (cleanPin.length < MIN_PIN_LENGTH) {
    return { success: false, message: `PIN must be at least ${MIN_PIN_LENGTH} characters` }
  }

  const db = await readDb()
  const team = db.teams.find(t => t.id === teamId)
  if (!team) return { success: false, message: 'Team not found' }

  const taken = Object.entries(db.ownerLogins || {}).some(
    ([otherTeam, login]) => otherTeam !== teamId && login.loginId === id
  )
  if (taken) return { success: false, message: 'That login ID is already used by another team' }

  db.ownerLogins = { ...db.ownerLogins, [team.id]: { loginId: id, pinHash: hashPin(cleanPin) } }
  await writeDb(db)
  return { success: true, message: `Login saved for ${team.name}` }
}

export async function getOwnerLoginId(teamId: string): Promise<string> {
  const db = await readDb()
  return db.ownerLogins?.[teamId]?.loginId || ''
}

export async function verifyOwnerLogin(loginId: string, pin: string): Promise<Team | null> {
  const id = (loginId || '').trim().toLowerCase()
  const db = await readDb()
  const entry = Object.entries(db.ownerLogins || {}).find(([, login]) => login.loginId === id)
  if (!entry) return null
  const [teamId, login] = entry
  if (!pinMatches((pin || '').trim(), login.pinHash)) return null
  return db.teams.find(t => t.id === teamId) || null
}

export async function setTeamLogo(
  teamId: string,
  logo: string | null
): Promise<{ success: boolean; message: string }> {
  if (logo !== null) {
    if (typeof logo !== 'string' || !LOGO_PATTERN.test(logo)) {
      return { success: false, message: 'Logo must be a PNG, JPEG or WebP image' }
    }
    if (logo.length > MAX_LOGO_CHARS) {
      return { success: false, message: 'Logo is too large' }
    }
  }

  const db = await readDb()
  const team = db.teams.find(t => t.id === teamId)
  if (!team) return { success: false, message: 'Team not found' }

  if (logo) team.logo = logo
  else delete team.logo

  await writeDb(db)
  return { success: true, message: logo ? 'Team logo updated' : 'Team logo removed' }
}
