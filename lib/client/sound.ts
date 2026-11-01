// Web Audio API Synthesizer for Auction and Tournament SFX

class SoundManager {
  private ctx: AudioContext | null = null
  private muted: boolean = false

  constructor() {
    // Lazy initialized on first user interaction to comply with browser audio autoplay policy
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  public setMuted(muted: boolean) {
    this.muted = muted
  }

  public isMuted(): boolean {
    return this.muted
  }

  // Solid wooden gavel strike sound
  public playHammer() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(140, now)
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.18)

    gain.gain.setValueAtTime(0.7, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.24)
  }

  // Metallic spinning coin chime for toss
  public playCoinFlip() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const time = now + i * 0.08

      osc.type = 'sine'
      osc.frequency.setValueAtTime(800 + i * 160, time)

      gain.gain.setValueAtTime(0.25, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + 0.08)
    }
  }

  // Click/tick sound for wheel slices
  public playSpinnerTick() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04)

    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.05)
  }

  // Triumphal chord for player sold
  public playCheer() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    const notes = [440, 554.37, 659.25, 880] // A major chord
    const now = ctx.currentTime

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + idx * 0.06

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.2, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(start)
      osc.stop(start + 0.38)
    })
  }
}

export const sounds = new SoundManager()

