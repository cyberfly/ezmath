// Pet system for virtual companion that grows with player progress

// Pet evolution stages based on total problems solved
const PET_STAGES = [
  {
    stage: 0,
    name: 'Egg',
    emoji: '🥚',
    message: 'Your Math Buddy is sleeping!',
    minProblems: 0,
    maxProblems: 24
  },
  {
    stage: 1,
    name: 'Baby',
    emoji: '🐣',
    message: 'Your Math Buddy has hatched!',
    minProblems: 25,
    maxProblems: 99
  },
  {
    stage: 2,
    name: 'Kid',
    emoji: '🐤',
    message: 'Your Math Buddy is learning!',
    minProblems: 100,
    maxProblems: 299
  },
  {
    stage: 3,
    name: 'Teen',
    emoji: '🐦',
    message: 'Your Math Buddy is getting stronger!',
    minProblems: 300,
    maxProblems: 499
  },
  {
    stage: 4,
    name: 'Adult',
    emoji: '🦅',
    message: 'Your Math Buddy has fully evolved!',
    minProblems: 500,
    maxProblems: Infinity
  }
]

// Get current pet stage based on total problems solved
function getPetStage(totalProblems) {
  for (let i = PET_STAGES.length - 1; i >= 0; i--) {
    if (totalProblems >= PET_STAGES[i].minProblems) {
      return PET_STAGES[i].stage
    }
  }
  return 0
}

// Get pet emoji for a given stage
function getPetEmoji(stage) {
  const stageData = PET_STAGES.find(s => s.stage === stage)
  return stageData ? stageData.emoji : '🥚'
}

// Get pet stage name
function getPetStageName(stage) {
  const stageData = PET_STAGES.find(s => s.stage === stage)
  return stageData ? stageData.name : 'Egg'
}

// Get pet message for a given stage
function getPetMessage(stage) {
  const stageData = PET_STAGES.find(s => s.stage === stage)
  return stageData ? stageData.message : 'Your Math Buddy is sleeping!'
}

// Check if pet should evolve and return evolution data if yes
function checkEvolution(currentStage, totalProblems) {
  const newStage = getPetStage(totalProblems)

  if (newStage > currentStage) {
    return {
      evolved: true,
      oldStage: currentStage,
      newStage: newStage,
      emoji: getPetEmoji(newStage),
      name: getPetStageName(newStage),
      message: getPetMessage(newStage)
    }
  }

  return {
    evolved: false,
    currentStage: currentStage
  }
}

// Calculate progress to next evolution (0-100%)
function getEvolutionProgress(totalProblems) {
  const currentStageData = PET_STAGES.find(s =>
    totalProblems >= s.minProblems && totalProblems <= s.maxProblems
  )

  if (!currentStageData || currentStageData.stage === 4) {
    return 100 // Max level reached
  }

  const problemsInStage = totalProblems - currentStageData.minProblems
  const problemsNeeded = currentStageData.maxProblems - currentStageData.minProblems + 1

  return Math.round((problemsInStage / problemsNeeded) * 100)
}

// Get problems needed for next evolution
function getProblemsToNextEvolution(totalProblems) {
  const currentStageData = PET_STAGES.find(s =>
    totalProblems >= s.minProblems && totalProblems <= s.maxProblems
  )

  if (!currentStageData || currentStageData.stage === 4) {
    return 0 // Max level reached
  }

  return currentStageData.maxProblems + 1 - totalProblems
}

export {
  PET_STAGES,
  getPetStage,
  getPetEmoji,
  getPetStageName,
  getPetMessage,
  checkEvolution,
  getEvolutionProgress,
  getProblemsToNextEvolution
}
