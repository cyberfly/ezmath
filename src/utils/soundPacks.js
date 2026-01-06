// Sound pack system for different correct/wrong sound effects

const SOUND_PACKS = {
  classic: {
    id: 'classic',
    name: 'Classic',
    price: 0,
    tier: 0,
    description: 'Default sounds'
  },
  chime: {
    id: 'chime',
    name: 'Chime',
    price: 100,
    tier: 1,
    description: 'Bell-like tones'
  },
  arcade: {
    id: 'arcade',
    name: 'Arcade',
    price: 100,
    tier: 1,
    description: 'Retro game sounds'
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    price: 100,
    tier: 1,
    description: 'Bird chirps and gentle tones'
  },
  orchestra: {
    id: 'orchestra',
    name: 'Orchestra',
    price: 250,
    tier: 2,
    description: 'Grand orchestral notes'
  }
}

// Play correct answer sound with selected pack
function playCorrectSound(packId = 'classic', audioContext) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  const now = audioContext.currentTime

  switch(packId) {
    case 'chime':
      // Bell-like tone
      oscillator.frequency.setValueAtTime(523.25, now) // C5
      oscillator.frequency.exponentialRampToValueAtTime(1046.50, now + 0.1) // C6
      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
      oscillator.start(now)
      oscillator.stop(now + 0.4)
      break

    case 'arcade':
      // Retro game sound
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(659.25, now) // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.1) // G5
      oscillator.frequency.setValueAtTime(1046.50, now + 0.2) // C6
      gainNode.gain.setValueAtTime(0.2, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      oscillator.start(now)
      oscillator.stop(now + 0.3)
      break

    case 'nature':
      // Bird chirp-like
      oscillator.frequency.setValueAtTime(800, now)
      oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05)
      oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.1)
      gainNode.gain.setValueAtTime(0.15, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      oscillator.start(now)
      oscillator.stop(now + 0.15)
      break

    case 'orchestra':
      // Grand orchestral
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(523.25, now) // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.2) // G5
      oscillator.frequency.setValueAtTime(1046.50, now + 0.3) // C6
      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.2)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
      oscillator.start(now)
      oscillator.stop(now + 0.5)
      break

    default: // classic
      // Default classic sound (existing)
      oscillator.frequency.setValueAtTime(523.25, now) // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.2) // G5
      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      oscillator.start(now)
      oscillator.stop(now + 0.3)
  }
}

// Get all sound packs as an array
function getSoundPacks() {
  return Object.values(SOUND_PACKS)
}

// Get sound pack by ID
function getSoundPack(packId) {
  return SOUND_PACKS[packId] || SOUND_PACKS.classic
}

export { SOUND_PACKS, playCorrectSound, getSoundPacks, getSoundPack }
