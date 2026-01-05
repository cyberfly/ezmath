// Profile store with local storage persistence

const AVATARS = ['🦊', '🐱', '🐶', '🦁', '🐼', '🐨', '🐰', '🦄', '🚀', '⭐', '🌈', '🎮']

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function createEmptyStats() {
  return {
    totalProblems: 0,
    correctAnswers: 0,
    byOperation: {
      add: { attempted: 0, correct: 0 },
      subtract: { attempted: 0, correct: 0 },
      multiply: { attempted: 0, correct: 0 },
      divide: { attempted: 0, correct: 0 }
    },
    byDifficulty: {
      easy: { attempted: 0, correct: 0 },
      medium: { attempted: 0, correct: 0 },
      hard: { attempted: 0, correct: 0 }
    },
    highScores: {
      timed: 0,
      level: 0
    },
    currentStreak: 0,
    bestStreak: 0,
    levelsUnlocked: 1
  }
}

function createProfileStore(Alpine) {
  return {
    profiles: Alpine.$persist([]).as('ezmath_profiles'),
    activeId: Alpine.$persist(null).as('ezmath_active_profile'),

    get activeProfile() {
      return this.profiles.find(p => p.id === this.activeId) || null
    },

    get hasProfiles() {
      return this.profiles.length > 0
    },

    createProfile(name, avatar) {
      const profile = {
        id: generateId(),
        name: name.trim(),
        avatar,
        createdAt: Date.now(),
        stats: createEmptyStats()
      }
      this.profiles.push(profile)
      this.activeId = profile.id
      return profile
    },

    selectProfile(id) {
      this.activeId = id
    },

    deleteProfile(id) {
      const index = this.profiles.findIndex(p => p.id === id)
      if (index !== -1) {
        this.profiles.splice(index, 1)
        if (this.activeId === id) {
          this.activeId = this.profiles.length > 0 ? this.profiles[0].id : null
        }
      }
    },

    updateStats(operation, difficulty, isCorrect) {
      const profile = this.activeProfile
      if (!profile) return

      profile.stats.totalProblems++
      profile.stats.byOperation[operation].attempted++
      profile.stats.byDifficulty[difficulty].attempted++

      if (isCorrect) {
        profile.stats.correctAnswers++
        profile.stats.byOperation[operation].correct++
        profile.stats.byDifficulty[difficulty].correct++
        profile.stats.currentStreak++
        if (profile.stats.currentStreak > profile.stats.bestStreak) {
          profile.stats.bestStreak = profile.stats.currentStreak
        }
      } else {
        profile.stats.currentStreak = 0
      }
    },

    updateHighScore(mode, score) {
      const profile = this.activeProfile
      if (!profile) return

      if (score > profile.stats.highScores[mode]) {
        profile.stats.highScores[mode] = score
      }
    },

    unlockLevel(level) {
      const profile = this.activeProfile
      if (!profile) return

      if (level > profile.stats.levelsUnlocked) {
        profile.stats.levelsUnlocked = level
      }
    },

    getAccuracy(operation = null, difficulty = null) {
      const profile = this.activeProfile
      if (!profile) return 0

      let attempted, correct

      if (operation) {
        attempted = profile.stats.byOperation[operation].attempted
        correct = profile.stats.byOperation[operation].correct
      } else if (difficulty) {
        attempted = profile.stats.byDifficulty[difficulty].attempted
        correct = profile.stats.byDifficulty[difficulty].correct
      } else {
        attempted = profile.stats.totalProblems
        correct = profile.stats.correctAnswers
      }

      return attempted > 0 ? Math.round((correct / attempted) * 100) : 0
    }
  }
}

export { AVATARS, createProfileStore, createEmptyStats }
