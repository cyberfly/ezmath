// Sound effects using Web Audio API
// No external files needed - generates tones programmatically

import { playCorrectSound } from './soundPacks.js'

let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

// Get the equipped sound pack from the active profile
function getEquippedSoundPack() {
  try {
    const profiles = JSON.parse(localStorage.getItem('ezmath_profiles') || '[]')
    const activeId = localStorage.getItem('ezmath_active_profile')
    if (!activeId) return 'classic'

    const profile = profiles.find(p => p.id === activeId?.replace(/"/g, ''))
    return profile?.equippedItems?.soundPack || 'classic'
  } catch (e) {
    return 'classic'
  }
}

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  const ctx = getAudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.frequency.value = frequency
  oscillator.type = type

  gainNode.gain.setValueAtTime(volume, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

function playNotes(notes, baseTime = 0.15) {
  const ctx = getAudioContext()
  notes.forEach((note, index) => {
    setTimeout(() => {
      playTone(note.freq, note.duration || baseTime, note.type || 'sine', note.volume || 0.3)
    }, index * baseTime * 1000)
  })
}

const sounds = {
  // Pleasant rising chime for correct answers
  correct() {
    const packId = getEquippedSoundPack()
    const ctx = getAudioContext()
    playCorrectSound(packId, ctx)
  },

  // Soft, gentle buzz for wrong answers (not discouraging)
  wrong() {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 200
    oscillator.type = 'triangle'

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  },

  // Celebration fanfare for level up
  levelUp() {
    playNotes([
      { freq: 523.25, duration: 0.12 },  // C5
      { freq: 587.33, duration: 0.12 },  // D5
      { freq: 659.25, duration: 0.12 },  // E5
      { freq: 698.46, duration: 0.12 },  // F5
      { freq: 783.99, duration: 0.2 },   // G5
      { freq: 1046.50, duration: 0.3 },  // C6
    ], 0.1)
  },

  // Game over / completion sound
  gameOver() {
    playNotes([
      { freq: 659.25, duration: 0.15 },  // E5
      { freq: 523.25, duration: 0.15 },  // C5
      { freq: 392.00, duration: 0.25 },  // G4
    ], 0.12)
  },

  // Soft click for buttons
  click() {
    playTone(800, 0.05, 'sine', 0.1)
  },

  // Timer tick for last 10 seconds
  tick() {
    playTone(440, 0.08, 'square', 0.15)
  },

  // Timer warning (last 5 seconds - more urgent)
  tickUrgent() {
    playTone(880, 0.1, 'square', 0.2)
  },

  // Start game sound
  start() {
    playNotes([
      { freq: 392.00, duration: 0.1 },  // G4
      { freq: 523.25, duration: 0.15 }, // C5
    ], 0.1)
  }
}

export { sounds }
