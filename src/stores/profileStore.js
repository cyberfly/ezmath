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
    levelsUnlocked: 1,
    // Currency system
    stars: 0,
    lifetimeStars: 0,
    // Session history
    sessionHistory: []
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
        stats: createEmptyStats(),
        // Unlockables
        unlockedItems: {
          avatars: ['🦊'], // Default fox avatar
          themes: ['default'],
          soundPacks: ['classic'],
          petAccessories: []
        },
        equippedItems: {
          avatar: avatar,
          theme: 'default',
          soundPack: 'classic',
          petAccessory: null
        },
        // Pet system
        pet: {
          name: 'Buddy',
          stage: 0, // 0=egg, 1=baby, 2=kid, 3=teen, 4=adult
          xp: 0,
          evolutionPath: 'default',
          lastFed: null,
          accessories: []
        },
        // Milestones
        milestones: {
          problems25: false,
          problems50: false,
          problems100: false,
          problems500: false,
          streak10: false,
          streak25: false,
          streak50: false
        }
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
    },

    addStars(amount, reason = 'earned') {
      const profile = this.activeProfile
      if (!profile) return

      profile.stats.stars += amount
      profile.stats.lifetimeStars += amount
    },

    unlockAvatar(avatarId) {
      const profile = this.activeProfile
      if (!profile) return

      // Initialize unlockedItems if it doesn't exist (for old profiles)
      if (!profile.unlockedItems) {
        profile.unlockedItems = {
          avatars: ['🦊'],
          themes: ['default'],
          soundPacks: ['classic'],
          petAccessories: []
        }
      }

      if (!profile.unlockedItems.avatars.includes(avatarId)) {
        profile.unlockedItems.avatars.push(avatarId)
      }
    },

    equipAvatar(avatarId) {
      const profile = this.activeProfile
      if (!profile) return

      // Initialize equippedItems if it doesn't exist (for old profiles)
      if (!profile.equippedItems) {
        profile.equippedItems = {
          avatar: profile.avatar,
          theme: 'default',
          soundPack: 'classic',
          petAccessory: null
        }
      }

      profile.equippedItems.avatar = avatarId
      profile.avatar = avatarId // Also update main avatar field
    },

    // Pet system methods
    initializePet() {
      const profile = this.activeProfile
      if (!profile) return

      // Initialize pet if it doesn't exist (for old profiles)
      if (!profile.pet) {
        profile.pet = {
          name: 'Buddy',
          stage: 0,
          xp: 0,
          evolutionPath: 'default',
          lastFed: null,
          accessories: []
        }
      }
    },

    updatePetName(name) {
      const profile = this.activeProfile
      if (!profile) return

      this.initializePet()
      profile.pet.name = name.trim() || 'Buddy'
    },

    updatePetXP(amount) {
      const profile = this.activeProfile
      if (!profile) return

      this.initializePet()
      profile.pet.xp += amount
    },

    checkPetEvolution() {
      const profile = this.activeProfile
      if (!profile) return null

      this.initializePet()

      // Import pet system utilities (will be available globally)
      const totalProblems = profile.stats.totalProblems || 0
      const currentStage = profile.pet.stage

      // Calculate what stage pet should be at
      let newStage = 0
      if (totalProblems >= 500) newStage = 4
      else if (totalProblems >= 300) newStage = 3
      else if (totalProblems >= 100) newStage = 2
      else if (totalProblems >= 25) newStage = 1
      else newStage = 0

      if (newStage > currentStage) {
        profile.pet.stage = newStage
        return {
          evolved: true,
          oldStage: currentStage,
          newStage: newStage
        }
      }

      return {
        evolved: false,
        currentStage: currentStage
      }
    },

    feedPet() {
      const profile = this.activeProfile
      if (!profile || (profile.stats.stars || 0) < 10) return false

      this.initializePet()

      // Deduct 10 stars
      profile.stats.stars -= 10
      profile.pet.lastFed = Date.now()

      return true
    },

    playWithPet() {
      const profile = this.activeProfile
      if (!profile || (profile.stats.stars || 0) < 5) return false

      this.initializePet()

      // Deduct 5 stars
      profile.stats.stars -= 5

      return true
    },

    // Milestone system methods
    checkAndAwardMilestones() {
      const profile = this.activeProfile
      if (!profile) return []

      // Initialize milestones if it doesn't exist (for old profiles)
      if (!profile.milestones) {
        profile.milestones = {
          problems25: false,
          problems50: false,
          problems100: false,
          problems500: false,
          streak10: false,
          streak25: false,
          streak50: false
        }
      }

      const newlyAchieved = []

      // Check problem count milestones
      const problemMilestones = [
        { id: 'problems25', threshold: 25, reward: 100, message: '25 Problems Solved!', emoji: '🎉' },
        { id: 'problems50', threshold: 50, reward: 200, message: '50 Problems Champion!', emoji: '🌟' },
        { id: 'problems100', threshold: 100, reward: 500, message: '100 Problems Mastered!', emoji: '🏆' },
        { id: 'problems500', threshold: 500, reward: 1000, message: '500 Problems LEGEND!', emoji: '💎' }
      ]

      for (const milestone of problemMilestones) {
        if (!profile.milestones[milestone.id] && (profile.stats.totalProblems || 0) >= milestone.threshold) {
          profile.milestones[milestone.id] = true
          profile.stats.stars += milestone.reward
          newlyAchieved.push(milestone)
        }
      }

      // Check streak milestones
      const streakMilestones = [
        { id: 'streak10', threshold: 10, reward: 50, message: 'Hot Streak!', emoji: '🔥' },
        { id: 'streak25', threshold: 25, reward: 150, message: 'Unstoppable Streak!', emoji: '🔥' },
        { id: 'streak50', threshold: 50, reward: 500, message: 'UNSTOPPABLE!', emoji: '🔥' }
      ]

      for (const milestone of streakMilestones) {
        if (!profile.milestones[milestone.id] && (profile.stats.bestStreak || 0) >= milestone.threshold) {
          profile.milestones[milestone.id] = true
          profile.stats.stars += milestone.reward
          newlyAchieved.push(milestone)
        }
      }

      return newlyAchieved
    },

    // Theme system methods
    unlockTheme(themeId) {
      const profile = this.activeProfile
      if (!profile) return

      if (!profile.unlockedItems) {
        profile.unlockedItems = {
          avatars: ['🦊'],
          themes: ['default'],
          soundPacks: ['classic'],
          petAccessories: []
        }
      }

      if (!profile.unlockedItems.themes.includes(themeId)) {
        profile.unlockedItems.themes.push(themeId)
      }
    },

    equipTheme(themeId) {
      const profile = this.activeProfile
      if (!profile) return

      if (!profile.equippedItems) {
        profile.equippedItems = {
          avatar: profile.avatar,
          theme: 'default',
          soundPack: 'classic',
          petAccessory: null
        }
      }

      profile.equippedItems.theme = themeId
    },

    // Sound pack system methods
    unlockSoundPack(packId) {
      const profile = this.activeProfile
      if (!profile) return

      if (!profile.unlockedItems) {
        profile.unlockedItems = {
          avatars: ['🦊'],
          themes: ['default'],
          soundPacks: ['classic'],
          petAccessories: []
        }
      }

      if (!profile.unlockedItems.soundPacks.includes(packId)) {
        profile.unlockedItems.soundPacks.push(packId)
      }
    },

    equipSoundPack(packId) {
      const profile = this.activeProfile
      if (!profile) return

      if (!profile.equippedItems) {
        profile.equippedItems = {
          avatar: profile.avatar,
          theme: 'default',
          soundPack: 'classic',
          petAccessory: null
        }
      }

      profile.equippedItems.soundPack = packId
    },

    // Session history methods
    saveSession(sessionData) {
      const profile = this.activeProfile
      if (!profile) return

      // Initialize sessionHistory if it doesn't exist (for old profiles)
      if (!profile.stats.sessionHistory) {
        profile.stats.sessionHistory = []
      }

      // Check if session already exists (updating existing session)
      const existingIndex = profile.stats.sessionHistory.findIndex(
        s => s.gameId === sessionData.gameId
      )

      if (existingIndex >= 0) {
        // Update existing session
        profile.stats.sessionHistory[existingIndex] = {
          ...profile.stats.sessionHistory[existingIndex],
          ...sessionData,
          lastUpdated: Date.now()
        }
      } else {
        // Add new session
        profile.stats.sessionHistory.push({
          ...sessionData,
          createdAt: Date.now(),
          lastUpdated: Date.now()
        })
      }

      // Keep only last 50 sessions per mode to prevent storage bloat
      const sessionsByMode = profile.stats.sessionHistory.filter(s => s.mode === sessionData.mode)
      if (sessionsByMode.length > 50) {
        // Remove oldest sessions for this mode
        const sortedSessions = sessionsByMode.sort((a, b) => b.lastUpdated - a.lastUpdated)
        const sessionsToRemove = sortedSessions.slice(50)
        profile.stats.sessionHistory = profile.stats.sessionHistory.filter(
          s => !sessionsToRemove.find(r => r.gameId === s.gameId)
        )
      }
    },

    getSessionsByMode(mode) {
      const profile = this.activeProfile
      if (!profile || !profile.stats.sessionHistory) return []

      return profile.stats.sessionHistory
        .filter(s => s.mode === mode)
        .sort((a, b) => b.lastUpdated - a.lastUpdated)
    },

    getIncompleteSessionsByMode(mode) {
      const profile = this.activeProfile
      if (!profile || !profile.stats.sessionHistory) return []

      return profile.stats.sessionHistory
        .filter(s => s.mode === mode && !s.isCompleted)
        .sort((a, b) => b.lastUpdated - a.lastUpdated)
    },

    deleteSession(gameId) {
      const profile = this.activeProfile
      if (!profile || !profile.stats.sessionHistory) return

      profile.stats.sessionHistory = profile.stats.sessionHistory.filter(
        s => s.gameId !== gameId
      )
    }
  }
}

export { AVATARS, createProfileStore, createEmptyStats }
