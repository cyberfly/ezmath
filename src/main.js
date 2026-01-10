import './style.css'
import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'

import { createProfileStore, AVATARS } from './stores/profileStore.js'
import { createGameStore } from './stores/gameStore.js'
import { createShopStore } from './stores/shopStore.js'
import { createViewStore } from './stores/viewStore.js'
import { DIFFICULTY_CONFIG, OPERATION_SYMBOLS } from './utils/mathProblems.js'
import * as PetSystem from './utils/petSystem.js'
import * as Themes from './utils/themes.js'
import * as SoundPacks from './utils/soundPacks.js'
import * as HintGenerator from './utils/hintGenerator.js'

// Register persist plugin
Alpine.plugin(persist)

// Register stores
Alpine.store('profile', createProfileStore(Alpine))
Alpine.store('game', createGameStore(Alpine))
Alpine.store('shop', createShopStore(Alpine))
Alpine.store('view', createViewStore(Alpine))

// Make constants and utilities available globally
window.AVATARS = AVATARS
window.DIFFICULTY_CONFIG = DIFFICULTY_CONFIG
window.OPERATION_SYMBOLS = OPERATION_SYMBOLS
window.PetSystem = PetSystem
window.Themes = Themes
window.SoundPacks = SoundPacks
window.HintGenerator = HintGenerator

// Start Alpine
Alpine.start()

// Initialize game store after Alpine starts (to restore timer if needed)
setTimeout(() => {
  Alpine.store('game').init()
}, 0)

// PWA Install prompt management
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Store the event so it can be triggered later
  deferredPrompt = e;
  // Update Alpine store to show install button
  Alpine.store('view').showPWAInstall = true;
});

window.addEventListener('appinstalled', () => {
  // Hide the install button when app is installed
  Alpine.store('view').showPWAInstall = false;
  deferredPrompt = null;
});

// Expose install function globally
window.installPWA = async () => {
  if (!deferredPrompt) {
    return;
  }
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response to the install prompt: ${outcome}`);
  // Clear the deferred prompt
  deferredPrompt = null;
  Alpine.store('view').showPWAInstall = false;
};

// Service worker is automatically registered by vite-plugin-pwa
