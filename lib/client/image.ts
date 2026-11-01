const LOGO_SIZE = 256
const MAX_CHARS = 140_000

/** Center-crops an image file to a small square data URL suitable for storing with the team. */
export async function fileToLogo(file: File): Promise<string> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
    throw new Error('Please choose a PNG, JPG or WebP image')
  }

  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = LOGO_SIZE
  canvas.height = LOGO_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process this image')

  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    LOGO_SIZE,
    LOGO_SIZE
  )
  bitmap.close()

  const webp = canvas.toDataURL('image/webp', 0.85)
  if (webp.startsWith('data:image/webp') && webp.length <= MAX_CHARS) return webp

  const jpeg = canvas.toDataURL('image/jpeg', 0.8)
  if (jpeg.length <= MAX_CHARS) return jpeg

  throw new Error('This image is too detailed - try a simpler logo')
}
