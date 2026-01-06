// Game store for managing game state

import { generateProblem, checkAnswer } from '../utils/mathProblems.js'
import { sounds } from '../utils/sounds.js'

function createGameStore(Alpine) {
  return {
    // Game settings (persisted)
    mode: Alpine.$persist(null).as('ezmath_game_mode'),
    difficulty: Alpine.$persist('easy').as('ezmath_game_difficulty'),
    operations: Alpine.$persist(['add', 'subtract']).as('ezmath_game_operations'),
    timeLimit: Alpine.$persist(60).as('ezmath_game_timeLimit'),

    // Game state (persisted)
    isPlaying: Alpine.$persist(false).as('ezmath_game_isPlaying'),
    isPaused: Alpine.$persist(false).as('ezmath_game_isPaused'),
    currentProblem: Alpine.$persist(null).as('ezmath_game_currentProblem'),
    userAnswer: '',
    inputElement: null, // Reference to the answer input element (NOT persisted)

    // Score tracking (persisted)
    score: Alpine.$persist(0).as('ezmath_game_score'),
    problemsAttempted: Alpine.$persist(0).as('ezmath_game_problemsAttempted'),
    correctAnswers: Alpine.$persist(0).as('ezmath_game_correctAnswers'),

    // Timed mode (persisted except timerInterval)
    timeRemaining: Alpine.$persist(0).as('ezmath_game_timeRemaining'),
    timerInterval: null, // NOT persisted - will be recreated on resume
    lastTimerUpdate: Alpine.$persist(null).as('ezmath_game_lastTimerUpdate'), // Track when timer was last updated

    // Level mode (persisted)
    currentLevel: Alpine.$persist(1).as('ezmath_game_currentLevel'),
    problemsInLevel: Alpine.$persist(0).as('ezmath_game_problemsInLevel'),
    correctInLevel: Alpine.$persist(0).as('ezmath_game_correctInLevel'),
    levelTarget: 10, // problems per level (constant)
    levelPassThreshold: 8, // correct needed to pass (constant)

    // Darab mode (persisted)
    currentSifir: Alpine.$persist(1).as('ezmath_game_currentSifir'),
    sifirQuestions: Alpine.$persist([]).as('ezmath_game_sifirQuestions'),
    sifirWrongQuestions: Alpine.$persist([]).as('ezmath_game_sifirWrongQuestions'),
    sifirCurrentIndex: Alpine.$persist(0).as('ezmath_game_sifirCurrentIndex'),
    sifirCompleted: Alpine.$persist(false).as('ezmath_game_sifirCompleted'),

    // Bahagi mode (persisted)
    currentBahagi: Alpine.$persist(1).as('ezmath_game_currentBahagi'),
    bahagiQuestions: Alpine.$persist([]).as('ezmath_game_bahagiQuestions'),
    bahagiWrongQuestions: Alpine.$persist([]).as('ezmath_game_bahagiWrongQuestions'),
    bahagiCurrentIndex: Alpine.$persist(0).as('ezmath_game_bahagiCurrentIndex'),
    bahagiCompleted: Alpine.$persist(false).as('ezmath_game_bahagiCompleted'),

    // Tambah mode (persisted)
    currentTambahDifficulty: Alpine.$persist('easy').as('ezmath_game_currentTambahDifficulty'),
    tambahQuestions: Alpine.$persist([]).as('ezmath_game_tambahQuestions'),
    tambahWrongQuestions: Alpine.$persist([]).as('ezmath_game_tambahWrongQuestions'),
    tambahCurrentIndex: Alpine.$persist(0).as('ezmath_game_tambahCurrentIndex'),
    tambahCompleted: Alpine.$persist(false).as('ezmath_game_tambahCompleted'),

    // Tolak mode (persisted)
    currentTolakDifficulty: Alpine.$persist('easy').as('ezmath_game_currentTolakDifficulty'),
    tolakQuestions: Alpine.$persist([]).as('ezmath_game_tolakQuestions'),
    tolakWrongQuestions: Alpine.$persist([]).as('ezmath_game_tolakWrongQuestions'),
    tolakCurrentIndex: Alpine.$persist(0).as('ezmath_game_tolakCurrentIndex'),
    tolakCompleted: Alpine.$persist(false).as('ezmath_game_tolakCompleted'),

    // Feedback (persisted)
    lastResult: Alpine.$persist(null).as('ezmath_game_lastResult'),
    showFeedback: Alpine.$persist(false).as('ezmath_game_showFeedback'),

    // Currency tracking (persisted)
    starsEarned: Alpine.$persist(0).as('ezmath_game_starsEarned'),
    starBreakdown: Alpine.$persist({
      base: 0,
      streakBonus: 0,
      accuracyBonus: 0,
      completionBonus: 0
    }).as('ezmath_game_starBreakdown'),

    // Pet evolution tracking (persisted)
    petEvolved: Alpine.$persist(false).as('ezmath_game_petEvolved'),
    petEvolutionData: Alpine.$persist(null).as('ezmath_game_petEvolutionData'),

    // Milestone tracking (persisted)
    milestonesAchieved: Alpine.$persist([]).as('ezmath_game_milestonesAchieved'),

    // Initialization flag
    _initialized: false,

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

    get tambahProgress() {
      if (this.tambahQuestions.length === 0) return 0
      return Math.round((this.tambahCurrentIndex / this.tambahQuestions.length) * 100)
    },

    get tambahQuestionsRemaining() {
      return this.tambahQuestions.length - this.tambahCurrentIndex + this.tambahWrongQuestions.length
    },

    get tolakProgress() {
      if (this.tolakQuestions.length === 0) return 0
      return Math.round((this.tolakCurrentIndex / this.tolakQuestions.length) * 100)
    },

    get tolakQuestionsRemaining() {
      return this.tolakQuestions.length - this.tolakCurrentIndex + this.tolakWrongQuestions.length
    },

    // Methods
    init() {
      // Called once when Alpine starts - restore timer if needed
      if (!this._initialized) {
        this._initialized = true

        // If game was playing in timed mode, restore the timer
        if (this.isPlaying && this.mode === 'timed' && !this.timerInterval) {
          // Adjust time remaining based on time elapsed since last update
          if (this.lastTimerUpdate) {
            const timeElapsed = Math.floor((Date.now() - this.lastTimerUpdate) / 1000)
            this.timeRemaining = Math.max(0, this.timeRemaining - timeElapsed)

            if (this.timeRemaining <= 0) {
              // Time ran out while away
              this.endGame()
            } else {
              // Resume timer
              this.startTimer()
            }
          }
        }
      }
    },

    registerInput(element) {
      this.inputElement = element
      // Focus immediately when registered
      if (this.isPlaying && !this.showFeedback) {
        setTimeout(() => element?.focus(), 100)
      }
    },

    focusInput() {
      if (this.inputElement && !this.showFeedback && this.isPlaying) {
        // Use setTimeout to ensure it happens after DOM updates and outside any restricted context
        setTimeout(() => {
          this.inputElement?.focus()
        }, 100)
      }
    },

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
      } else if (mode === 'tambah') {
        this.currentTambahDifficulty = settings.difficulty || 'easy'
        this.tambahCompleted = false
        this.initTambahQuestions()
      } else if (mode === 'tolak') {
        this.currentTolakDifficulty = settings.difficulty || 'easy'
        this.tolakCompleted = false
        this.initTolakQuestions()
      }

      sounds.start()
      if (mode === 'sifir') {
        this.nextSifirProblem()
      } else if (mode === 'bahagi') {
        this.nextBahagiProblem()
      } else if (mode === 'tambah') {
        this.nextTambahProblem()
      } else if (mode === 'tolak') {
        this.nextTolakProblem()
      } else {
        this.nextProblem()
      }
    },

    nextProblem() {
      this.currentProblem = generateProblem(this.difficulty, this.operations)
      this.userAnswer = ''
      this.showFeedback = false
      this.focusInput()
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
      this.lastTimerUpdate = Date.now()
      this.timerInterval = setInterval(() => {
        if (!this.isPaused) {
          this.timeRemaining--
          this.lastTimerUpdate = Date.now() // Update timestamp each second
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
      this.focusInput()
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
      this.focusInput()
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

    // Helper: Generate questions by difficulty and operation
    generateQuestionsByDifficulty(difficulty, operation) {
      const ranges = {
        easy: [1, 10],
        medium: [1, 50],
        hard: [1, 100]
      }
      const [min, max] = ranges[difficulty]
      const questions = []

      for (let i = 0; i < 12; i++) {
        let num1, num2, answer

        if (operation === 'add') {
          num1 = Math.floor(Math.random() * (max - min + 1)) + min
          num2 = Math.floor(Math.random() * (max - min + 1)) + min
          answer = num1 + num2
        } else if (operation === 'subtract') {
          // Ensure no negative results
          num1 = Math.floor(Math.random() * (max - min + 1)) + min
          num2 = Math.floor(Math.random() * (num1 - min + 1)) + min
          answer = num1 - num2
        }

        questions.push({
          num1,
          num2,
          answer,
          operation,
          symbol: operation === 'add' ? '+' : '-',
          difficulty
        })
      }

      return this.shuffleArray(questions)
    },

    // Tambah mode methods
    initTambahQuestions() {
      this.tambahQuestions = this.generateQuestionsByDifficulty(this.currentTambahDifficulty, 'add')
      this.tambahWrongQuestions = []
      this.tambahCurrentIndex = 0
    },

    nextTambahProblem() {
      if (this.tambahCurrentIndex < this.tambahQuestions.length) {
        this.currentProblem = this.tambahQuestions[this.tambahCurrentIndex]
      } else if (this.tambahWrongQuestions.length > 0) {
        this.tambahQuestions = this.shuffleArray(this.tambahWrongQuestions)
        this.tambahWrongQuestions = []
        this.tambahCurrentIndex = 0
        this.currentProblem = this.tambahQuestions[0]
      } else {
        this.advanceToNextTambahDifficulty()
        return
      }
      this.userAnswer = ''
      this.showFeedback = false
      this.focusInput()
    },

    submitTambahAnswer() {
      if (!this.userAnswer || !this.currentProblem) return

      const isCorrect = parseInt(this.userAnswer) === this.currentProblem.answer

      this.problemsAttempted++
      this.lastResult = isCorrect ? 'correct' : 'incorrect'
      this.showFeedback = true

      if (isCorrect) {
        this.correctAnswers++
        const difficultyPoints = { easy: 10, medium: 20, hard: 30 }
        this.score += difficultyPoints[this.currentTambahDifficulty]
        sounds.correct()
      } else {
        this.tambahWrongQuestions.push(this.currentProblem)
        sounds.wrong()
      }

      Alpine.store('profile').updateStats('add', this.currentTambahDifficulty, isCorrect)
      this.tambahCurrentIndex++

      setTimeout(() => {
        if (this.isPlaying) {
          this.nextTambahProblem()
        }
      }, isCorrect ? 500 : 1000)
    },

    advanceToNextTambahDifficulty() {
      const difficulties = ['easy', 'medium', 'hard']
      const currentIndex = difficulties.indexOf(this.currentTambahDifficulty)

      if (currentIndex >= difficulties.length - 1) {
        // Completed all difficulties!
        this.tambahCompleted = true
        sounds.levelUp()
        this.endGame()
      } else {
        // Move to next difficulty
        sounds.levelUp()
        this.currentTambahDifficulty = difficulties[currentIndex + 1]
        this.initTambahQuestions()
        this.nextTambahProblem()
      }
    },

    // Tolak mode methods
    initTolakQuestions() {
      this.tolakQuestions = this.generateQuestionsByDifficulty(this.currentTolakDifficulty, 'subtract')
      this.tolakWrongQuestions = []
      this.tolakCurrentIndex = 0
    },

    nextTolakProblem() {
      if (this.tolakCurrentIndex < this.tolakQuestions.length) {
        this.currentProblem = this.tolakQuestions[this.tolakCurrentIndex]
      } else if (this.tolakWrongQuestions.length > 0) {
        this.tolakQuestions = this.shuffleArray(this.tolakWrongQuestions)
        this.tolakWrongQuestions = []
        this.tolakCurrentIndex = 0
        this.currentProblem = this.tolakQuestions[0]
      } else {
        this.advanceToNextTolakDifficulty()
        return
      }
      this.userAnswer = ''
      this.showFeedback = false
      this.focusInput()
    },

    submitTolakAnswer() {
      if (!this.userAnswer || !this.currentProblem) return

      const isCorrect = parseInt(this.userAnswer) === this.currentProblem.answer

      this.problemsAttempted++
      this.lastResult = isCorrect ? 'correct' : 'incorrect'
      this.showFeedback = true

      if (isCorrect) {
        this.correctAnswers++
        const difficultyPoints = { easy: 10, medium: 20, hard: 30 }
        this.score += difficultyPoints[this.currentTolakDifficulty]
        sounds.correct()
      } else {
        this.tolakWrongQuestions.push(this.currentProblem)
        sounds.wrong()
      }

      Alpine.store('profile').updateStats('subtract', this.currentTolakDifficulty, isCorrect)
      this.tolakCurrentIndex++

      setTimeout(() => {
        if (this.isPlaying) {
          this.nextTolakProblem()
        }
      }, isCorrect ? 500 : 1000)
    },

    advanceToNextTolakDifficulty() {
      const difficulties = ['easy', 'medium', 'hard']
      const currentIndex = difficulties.indexOf(this.currentTolakDifficulty)

      if (currentIndex >= difficulties.length - 1) {
        // Completed all difficulties!
        this.tolakCompleted = true
        sounds.levelUp()
        this.endGame()
      } else {
        // Move to next difficulty
        sounds.levelUp()
        this.currentTolakDifficulty = difficulties[currentIndex + 1]
        this.initTolakQuestions()
        this.nextTolakProblem()
      }
    },

    reset() {
      this.endGame()
      this.mode = null
      this.currentProblem = null
      this.lastTimerUpdate = null
    }
  }
}

export { createGameStore }
