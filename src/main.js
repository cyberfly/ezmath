import './style.css'
import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'

import { createProfileStore, AVATARS } from './stores/profileStore.js'
import { createGameStore } from './stores/gameStore.js'
import { createShopStore } from './stores/shopStore.js'
import { DIFFICULTY_CONFIG, OPERATION_SYMBOLS } from './utils/mathProblems.js'
import * as PetSystem from './utils/petSystem.js'
import * as Themes from './utils/themes.js'
import * as SoundPacks from './utils/soundPacks.js'

// Register persist plugin
Alpine.plugin(persist)

// Register stores
Alpine.store('profile', createProfileStore(Alpine))
Alpine.store('game', createGameStore(Alpine))
Alpine.store('shop', createShopStore(Alpine))

// Make constants and utilities available globally
window.AVATARS = AVATARS
window.DIFFICULTY_CONFIG = DIFFICULTY_CONFIG
window.OPERATION_SYMBOLS = OPERATION_SYMBOLS
window.PetSystem = PetSystem
window.Themes = Themes
window.SoundPacks = SoundPacks

// Start Alpine
Alpine.start()

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}
