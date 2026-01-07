// View store with local storage persistence

function createViewStore(Alpine) {
  return {
    // Persisted view state
    current: Alpine.$persist('home').as('ezmath_current_view'),
    showCreateProfile: Alpine.$persist(false).as('ezmath_show_create_profile'),

    // Game settings (persisted for convenience)
    selectedMode: Alpine.$persist(null).as('ezmath_selected_mode'),
    selectedDifficulty: Alpine.$persist('easy').as('ezmath_selected_difficulty'),
    selectedOperations: Alpine.$persist(['add', 'subtract']).as('ezmath_selected_operations'),
    selectedTime: Alpine.$persist(60).as('ezmath_selected_time'),

    // Profile creation (not persisted)
    newProfileName: '',
    newProfileAvatar: '🦊',

    // PWA install prompt (not persisted)
    showPWAInstall: false,

    // Navigate to a view
    goTo(viewName) {
      this.current = viewName
    },

    // Toggle operation selection
    toggleOperation(op) {
      const idx = this.selectedOperations.indexOf(op)
      if (idx > -1) {
        this.selectedOperations.splice(idx, 1)
      } else {
        this.selectedOperations.push(op)
      }
    },

    // Start a game with current settings
    startGame() {
      Alpine.store('game').startGame(this.selectedMode, {
        difficulty: this.selectedDifficulty,
        operations: this.selectedOperations,
        timeLimit: this.selectedTime,
        startLevel: 1
      })
      this.current = 'game'
    },

    // Navigate back to menu and finalize active session
    goHome() {
      const game = Alpine.store('game')
      if (game?.isPlaying) {
        // game.pauseGame()
      }
      this.current = 'menu'
    }
  }
}

export { createViewStore }
