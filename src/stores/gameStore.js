// Game store for managing game state

import { generateProblem, checkAnswer } from '../utils/mathProblems.js'
import { sounds } from '../utils/sounds.js'

function createGameStore(Alpine) {
  return {
    // Game settings
    mode: null, // 'practice', 'timed', 'level'
    difficulty: 'easy',
    operations: ['add', 'subtract'],
    timeLimit: 60, // seconds for timed mode

    // Game state
    isPlaying: false,
    isPaused: false,
    currentProblem: null,
    userAnswer: '',

    // Score tracking
    score: 0,
    problemsAttempted: 0,
    correctAnswers: 0,

    // Timed mode
    timeRemaining: 0,
    timerInterval: null,

    // Level mode
    currentLevel: 1,
    problemsInLevel: 0,
    correctInLevel: 0,
    levelTarget: 10, // problems per level
    levelPassThreshold: 8, // correct needed to pass

    // Darab mode (multiplication tables)
    currentSifir: 1,
    sifirQuestions: [], // current set of questions to answer
    sifirWrongQuestions: [], // questions answered wrong, will be repeated
    sifirCurrentIndex: 0,
    sifirCompleted: false, // true when all 12 tables mastered

    // Bahagi mode (division tables)
    currentBahagi: 1,
    bahagiQuestions: [],
    bahagiWrongQuestions: [],
    bahagiCurrentIndex: 0,
    bahagiCompleted: false,

    // Feedback
    lastResult: null, // 'correct' or 'incorrect'
    showFeedback: false,

    // Currency tracking for current session
    starsEarned: 0,
    starBreakdown: {
      base: 0,
      streakBonus: 0,
      accuracyBonus: 0,
      completionBonus: 0
    },

    // Pet evolution tracking
    petEvolved: false,
    petEvolutionData: null,

    // Milestone tracking
    milestonesAchieved: [],

    // Computed
    get accuracy() {
      return this.problemsAttempted > 0
        ? Math.round((this.correctAnswers / this.problemsAttempted) * 100)
        : 0
    },

    get levelProgress() {
      return Math.round((this.problemsInLevel / this.levelTarget) * 100)
    },

    get formattedTime() {
      const mins = Math.floor(this.timeRemaining / 60)
      const secs = this.timeRemaining % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },

    get sifirProgress() {
      if (this.sifirQuestions.length === 0) return 0
      return Math.round((this.sifirCurrentIndex / this.sifirQuestions.length) * 100)
    },

    get sifirQuestionsRemaining() {
      return this.sifirQuestions.length - this.sifirCurrentIndex + this.sifirWrongQuestions.length
    },

    get bahagiProgress() {
      if (this.bahagiQuestions.length === 0) return 0
      return Math.round((this.bahagiCurrentIndex / this.bahagiQuestions.length) * 100)
    },

    get bahagiQuestionsRemaining() {
      return this.bahagiQuestions.length - this.bahagiCurrentIndex + this.bahagiWrongQuestions.length
    },

    // Methods
    startGame(mode, settings = {}) {
      this.mode = mode
      this.difficulty = settings.difficulty || 'easy'
      this.operations = settings.operations || ['add', 'subtract']
      this.timeLimit = settings.timeLimit || 60

      this.isPlaying = true
      this.isPaused = false
      this.score = 0
      this.problemsAttempted = 0
      this.correctAnswers = 0
      this.userAnswer = ''
      this.lastResult = null
      this.showFeedback = false
      this.starsEarned = 0
      this.starBreakdown = {
        base: 0,
        streakBonus: 0,
        accuracyBonus: 0,
        completionBonus: 0
      }
      this.petEvolved = false
      this.petEvolutionData = null
      this.milestonesAchieved = []

      if (mode === 'timed') {
        this.timeRemaining = this.timeLimit
        this.startTimer()
      } else if (mode === 'level') {
        this.currentLevel = settings.startLevel || 1
        this.problemsInLevel = 0
        this.correctInLevel = 0
        this.updateDifficultyForLevel()
      } else if (mode === 'sifir') {
        this.currentSifir = settings.startSifir || 1
        this.sifirCompleted = false
        this.initSifirQuestions()
      } else if (mode === 'bahagi') {
        this.currentBahagi = settings.startBahagi || 1
        this.bahagiCompleted = false
        this.initBahagiQuestions()
      }

      sounds.start()
      if (mode === 'sifir') {
        this.nextSifirProblem()
      } else if (mode === 'bahagi') {
        this.nextBahagiProblem()
      } else {
        this.nextProblem()
      }
    },

    nextProblem() {
      this.currentProblem = generateProblem(this.difficulty, this.operations)
      this.userAnswer = ''
      this.showFeedback = false
    },

    submitAnswer() {
      if (!this.userAnswer || !this.currentProblem) return

      const isCorrect = checkAnswer(this.currentProblem, this.userAnswer)

      this.problemsAttempted++
      this.lastResult = isCorrect ? 'correct' : 'incorrect'
      this.showFeedback = true

      if (isCorrect) {
        this.correctAnswers++
        this.score += this.getPointsForProblem()

        // Calculate and add stars
        const starsForProblem = this.calculateStarsForProblem(isCorrect)
        this.starsEarned += starsForProblem
        this.starBreakdown.base += starsForProblem

        sounds.correct()
      } else {
        sounds.wrong()
      }

      // Update profile stats
      Alpine.store('profile').updateStats(
        this.currentProblem.operation,
        this.currentProblem.difficulty,
        isCorrect
      )

      // Handle level mode
      if (this.mode === 'level') {
        this.problemsInLevel++
        if (isCorrect) this.correctInLevel++

        if (this.problemsInLevel >= this.levelTarget) {
          this.checkLevelComplete()
          return
        }
      }

      // Show feedback briefly then next problem
      setTimeout(() => {
        if (this.isPlaying) {
          this.nextProblem()
        }
      }, isCorrect ? 500 : 1000)
    },

    getPointsForProblem() {
      const difficultyMultiplier = {
        easy: 1,
        medium: 2,
        hard: 3
      }
      const opMultiplier = {
        add: 1,
        subtract: 1,
        multiply: 2,
        divide: 2
      }
      return 10 * difficultyMultiplier[this.difficulty] * opMultiplier[this.currentProblem.operation]
    },

    calculateStarsForProblem(isCorrect) {
      if (!isCorrect) return 0

      const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2
      }
      const opMultiplier = {
        add: 1,
        subtract: 1,
        multiply: 1.5,
        divide: 1.5
      }

      const difficulty = this.currentProblem.difficulty || this.difficulty
      return Math.round(5 * difficultyMultiplier[difficulty] * opMultiplier[this.currentProblem.operation])
    },

    startTimer() {
      this.timerInterval = setInterval(() => {
        if (!this.isPaused) {
          this.timeRemaining--
          // Play tick sounds in last 10 seconds
          if (this.timeRemaining <= 10 && this.timeRemaining > 0) {
            if (this.timeRemaining <= 5) {
              sounds.tickUrgent()
            } else {
              sounds.tick()
            }
          }
          if (this.timeRemaining <= 0) {
            this.endGame()
          }
        }
      }, 1000)
    },

    pauseGame() {
      this.isPaused = true
    },

    resumeGame() {
      this.isPaused = false
    },

    endGame() {
      this.isPlaying = false
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }

      // Calculate bonuses
      if (this.problemsAttempted > 0) {
        // Accuracy bonus
        if (this.accuracy >= 80) {
          this.starBreakdown.accuracyBonus = 50
        } else if (this.accuracy >= 60) {
          this.starBreakdown.accuracyBonus = 25
        } else if (this.accuracy >= 50) {
          this.starBreakdown.accuracyBonus = 10
        }

        // Completion bonus
        if (this.mode === 'practice' && this.problemsAttempted >= 10) {
          this.starBreakdown.completionBonus = 30
        } else if (this.mode === 'timed') {
          this.starBreakdown.completionBonus = 40
        } else if (this.mode === 'level' && this.correctInLevel >= this.levelPassThreshold) {
          this.starBreakdown.completionBonus = 60
        }

        // Add all bonuses to total stars
        this.starsEarned += this.starBreakdown.accuracyBonus +
                           this.starBreakdown.completionBonus +
                           this.starBreakdown.streakBonus

        // Award stars to profile
        Alpine.store('profile').addStars(this.starsEarned, 'session')

        // Update pet XP (1 XP per problem attempted)
        Alpine.store('profile').updatePetXP(this.problemsAttempted)

        // Check for pet evolution
        const evolutionResult = Alpine.store('profile').checkPetEvolution()
        if (evolutionResult && evolutionResult.evolved) {
          this.petEvolved = true
          this.petEvolutionData = evolutionResult
        }

        // Check for milestones
        const newMilestones = Alpine.store('profile').checkAndAwardMilestones()
        if (newMilestones && newMilestones.length > 0) {
          this.milestonesAchieved = newMilestones
        }
      }

      sounds.gameOver()

      // Update high scores
      if (this.mode === 'timed') {
        Alpine.store('profile').updateHighScore('timed', this.score)
      } else if (this.mode === 'level') {
        Alpine.store('profile').updateHighScore('level', this.currentLevel)
      }
    },

    checkLevelComplete() {
      const passed = this.correctInLevel >= this.levelPassThreshold

      if (passed) {
        sounds.levelUp()
        Alpine.store('profile').unlockLevel(this.currentLevel + 1)
        // Move to next level
        this.currentLevel++
        this.problemsInLevel = 0
        this.correctInLevel = 0
        this.updateDifficultyForLevel()
        this.nextProblem()
      } else {
        this.endGame()
      }
    },

    updateDifficultyForLevel() {
      // Levels 1-3: easy, 4-6: medium, 7+: hard
      if (this.currentLevel <= 3) {
        this.difficulty = 'easy'
        this.operations = ['add', 'subtract']
      } else if (this.currentLevel <= 6) {
        this.difficulty = 'medium'
        this.operations = ['add', 'subtract', 'multiply']
      } else {
        this.difficulty = 'hard'
        this.operations = ['add', 'subtract', 'multiply', 'divide']
      }
    },

    // Darab mode methods
    initSifirQuestions() {
      // Generate all questions for current sifir (1×n through 12×n or n×1 through n×12)
      const questions = []
      for (let i = 1; i <= 12; i++) {
        questions.push({
          num1: this.currentSifir,
          num2: i,
          answer: this.currentSifir * i,
          operation: 'multiply',
          symbol: '×',
          difficulty: 'sifir'
        })
      }
      // Shuffle questions
      this.sifirQuestions = this.shuffleArray(questions)
      this.sifirWrongQuestions = []
      this.sifirCurrentIndex = 0
    },

    shuffleArray(array) {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    },

    nextSifirProblem() {
      if (this.sifirCurrentIndex < this.sifirQuestions.length) {
        // Still have questions in current set
        this.currentProblem = this.sifirQuestions[this.sifirCurrentIndex]
      } else if (this.sifirWrongQuestions.length > 0) {
        // All questions done but have wrong ones to repeat
        this.sifirQuestions = this.shuffleArray(this.sifirWrongQuestions)
        this.sifirWrongQuestions = []
        this.sifirCurrentIndex = 0
        this.currentProblem = this.sifirQuestions[0]
      } else {
        // All correct! Move to next sifir
        this.advanceToNextSifir()
        return
      }
      this.userAnswer = ''
      this.showFeedback = false
    },

    submitSifirAnswer() {
      if (!this.userAnswer || !this.currentProblem) return

      const isCorrect = parseInt(this.userAnswer) === this.currentProblem.answer

      this.problemsAttempted++
      this.lastResult = isCorrect ? 'correct' : 'incorrect'
      this.showFeedback = true

      if (isCorrect) {
        this.correctAnswers++
        this.score += 10 * this.currentSifir // Higher sifir = more points

        // Calculate stars (5 base × 1.5 medium × 1.5 multiply = 11 stars, rounded)
        const starsForProblem = Math.round(5 * 1.5 * 1.5)
        this.starsEarned += starsForProblem
        this.starBreakdown.base += starsForProblem

        sounds.correct()
      } else {
        // Add to wrong questions for repeat later
        this.sifirWrongQuestions.push(this.currentProblem)
        sounds.wrong()
      }

      // Update profile stats (use 'medium' difficulty for sifir tracking)
      Alpine.store('profile').updateStats('multiply', 'medium', isCorrect)

      // Move to next question
      this.sifirCurrentIndex++

      setTimeout(() => {
        if (this.isPlaying) {
          this.nextSifirProblem()
        }
      }, isCorrect ? 500 : 1000)
    },

    advanceToNextSifir() {
      if (this.currentSifir >= 12) {
        // Completed all sifir!
        this.sifirCompleted = true
        sounds.levelUp()
        this.endGame()
      } else {
        // Move to next sifir
        sounds.levelUp()
        this.currentSifir++
        this.initSifirQuestions()
        this.nextSifirProblem()
      }
    },

    // Bahagi mode methods
    initBahagiQuestions() {
      // Generate all questions for current bahagi (n÷n through 12n÷n)
      const questions = []
      for (let i = 1; i <= 12; i++) {
        questions.push({
          num1: this.currentBahagi * i,
          num2: this.currentBahagi,
          answer: i,
          operation: 'divide',
          symbol: '÷',
          difficulty: 'bahagi'
        })
      }
      // Shuffle questions
      this.bahagiQuestions = this.shuffleArray(questions)
      this.bahagiWrongQuestions = []
      this.bahagiCurrentIndex = 0
    },

    nextBahagiProblem() {
      if (this.bahagiCurrentIndex < this.bahagiQuestions.length) {
        // Still have questions in current set
        this.currentProblem = this.bahagiQuestions[this.bahagiCurrentIndex]
      } else if (this.bahagiWrongQuestions.length > 0) {
        // All questions done but have wrong ones to repeat
        this.bahagiQuestions = this.shuffleArray(this.bahagiWrongQuestions)
        this.bahagiWrongQuestions = []
        this.bahagiCurrentIndex = 0
        this.currentProblem = this.bahagiQuestions[0]
      } else {
        // All correct! Move to next bahagi
        this.advanceToNextBahagi()
        return
      }
      this.userAnswer = ''
      this.showFeedback = false
    },

    submitBahagiAnswer() {
      if (!this.userAnswer || !this.currentProblem) return

      const isCorrect = parseInt(this.userAnswer) === this.currentProblem.answer

      this.problemsAttempted++
      this.lastResult = isCorrect ? 'correct' : 'incorrect'
      this.showFeedback = true

      if (isCorrect) {
        this.correctAnswers++
        this.score += 10 * this.currentBahagi // Higher bahagi = more points

        // Calculate stars (5 base × 1.5 medium × 1.5 divide = 11 stars, rounded)
        const starsForProblem = Math.round(5 * 1.5 * 1.5)
        this.starsEarned += starsForProblem
        this.starBreakdown.base += starsForProblem

        sounds.correct()
      } else {
        // Add to wrong questions for repeat later
        this.bahagiWrongQuestions.push(this.currentProblem)
        sounds.wrong()
      }

      // Update profile stats (use 'medium' difficulty for bahagi tracking)
      Alpine.store('profile').updateStats('divide', 'medium', isCorrect)

      // Move to next question
      this.bahagiCurrentIndex++

      setTimeout(() => {
        if (this.isPlaying) {
          this.nextBahagiProblem()
        }
      }, isCorrect ? 500 : 1000)
    },

    advanceToNextBahagi() {
      if (this.currentBahagi >= 12) {
        // Completed all bahagi!
        this.bahagiCompleted = true
        sounds.levelUp()
        this.endGame()
      } else {
        // Move to next bahagi
        sounds.levelUp()
        this.currentBahagi++
        this.initBahagiQuestions()
        this.nextBahagiProblem()
      }
    },

    reset() {
      this.endGame()
      this.mode = null
      this.currentProblem = null
    }
  }
}

export { createGameStore }
