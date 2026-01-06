// Milestone system for rewarding achievements

const MILESTONES = {
  // Problem count milestones
  problems25: {
    id: 'problems25',
    name: 'First Steps',
    description: '25 Problems Solved',
    emoji: '🎉',
    threshold: 25,
    checkField: 'totalProblems',
    reward: 100,
    message: '25 Problems Solved!'
  },
  problems50: {
    id: 'problems50',
    name: 'Rising Star',
    description: '50 Problems Solved',
    emoji: '🌟',
    threshold: 50,
    checkField: 'totalProblems',
    reward: 200,
    message: '50 Problems Champion!'
  },
  problems100: {
    id: 'problems100',
    name: 'Century Club',
    description: '100 Problems Solved',
    emoji: '🏆',
    threshold: 100,
    checkField: 'totalProblems',
    reward: 500,
    message: '100 Problems Mastered!'
  },
  problems500: {
    id: 'problems500',
    name: 'Math Legend',
    description: '500 Problems Solved',
    emoji: '💎',
    threshold: 500,
    checkField: 'totalProblems',
    reward: 1000,
    message: '500 Problems LEGEND!'
  },

  // Streak milestones
  streak10: {
    id: 'streak10',
    name: 'On Fire',
    description: '10 Correct in a Row',
    emoji: '🔥',
    threshold: 10,
    checkField: 'bestStreak',
    reward: 50,
    message: 'Hot Streak!'
  },
  streak25: {
    id: 'streak25',
    name: 'Unstoppable',
    description: '25 Correct in a Row',
    emoji: '🔥',
    threshold: 25,
    checkField: 'bestStreak',
    reward: 150,
    message: 'Unstoppable Streak!'
  },
  streak50: {
    id: 'streak50',
    name: 'Perfect Machine',
    description: '50 Correct in a Row',
    emoji: '🔥',
    threshold: 50,
    checkField: 'bestStreak',
    reward: 500,
    message: 'UNSTOPPABLE!'
  }
}

// Check which milestones have been newly achieved
function checkMilestones(profile) {
  if (!profile || !profile.stats) return []

  const newlyAchieved = []

  // Initialize milestones tracking if it doesn't exist
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

  // Check each milestone
  for (const [key, milestone] of Object.entries(MILESTONES)) {
    // Skip if already achieved
    if (profile.milestones[key]) continue

    // Get the value to check
    const value = profile.stats[milestone.checkField] || 0

    // Check if threshold reached
    if (value >= milestone.threshold) {
      profile.milestones[key] = true
      newlyAchieved.push(milestone)
    }
  }

  return newlyAchieved
}

// Get all achieved milestones
function getAchievedMilestones(profile) {
  if (!profile || !profile.milestones) return []

  const achieved = []
  for (const [key, milestone] of Object.entries(MILESTONES)) {
    if (profile.milestones[key]) {
      achieved.push(milestone)
    }
  }

  return achieved
}

// Get milestone progress (0-100%)
function getMilestoneProgress(profile, milestoneId) {
  if (!profile || !profile.stats) return 0

  const milestone = MILESTONES[milestoneId]
  if (!milestone) return 0

  const value = profile.stats[milestone.checkField] || 0
  return Math.min(Math.round((value / milestone.threshold) * 100), 100)
}

export { MILESTONES, checkMilestones, getAchievedMilestones, getMilestoneProgress }
