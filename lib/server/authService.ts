import { readDb, writeDb } from './db'

export async function verifyAuctioneerPin(pin: string): Promise<{ success: boolean; message?: string }> {
  const db = await readDb()
  const correct = (db.auctioneer?.pin || '1234').trim()
  if (pin.trim() === correct) {
    return { success: true }
  }
  return { success: false, message: 'Invalid Auctioneer PIN' }
}

export async function updateAuctioneerPin(
  currentPin: string,
  newPin: string
): Promise<{ success: boolean; message: string }> {
  const db = await readDb()
  const correct = (db.auctioneer?.pin || '1234').trim()
  if (currentPin.trim() !== correct) {
    return { success: false, message: 'Current PIN is incorrect' }
  }
  if (!newPin || newPin.trim().length < 4) {
    return { success: false, message: 'New PIN must be at least 4 digits' }
  }
  db.auctioneer.pin = newPin.trim()
  await writeDb(db)
  return { success: true, message: 'PIN updated successfully' }
}
