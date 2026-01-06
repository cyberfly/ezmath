// Shop store for unlockables and purchases

import { getThemes } from '../utils/themes.js'
import { getSoundPacks } from '../utils/soundPacks.js'

// Avatar shop items with pricing tiers
const AVATAR_ITEMS = [
  // Default - unlocked from start
  { id: '🦊', name: 'Fox', price: 0, tier: 0 },

  // Tier 1 - 50 stars each
  { id: '🐱', name: 'Cat', price: 50, tier: 1 },
  { id: '🐶', name: 'Dog', price: 50, tier: 1 },
  { id: '🐰', name: 'Bunny', price: 50, tier: 1 },
  { id: '🐼', name: 'Panda', price: 50, tier: 1 },

  // Tier 2 - 100 stars each
  { id: '🦁', name: 'Lion', price: 100, tier: 2 },
  { id: '🐨', name: 'Koala', price: 100, tier: 2 },
  { id: '🦄', name: 'Unicorn', price: 100, tier: 2 },
  { id: '🐸', name: 'Frog', price: 100, tier: 2 },
  { id: '🐢', name: 'Turtle', price: 100, tier: 2 },
  { id: '🦉', name: 'Owl', price: 100, tier: 2 },

  // Tier 3 - 200 stars each
  { id: '🚀', name: 'Rocket', price: 200, tier: 3 },
  { id: '⭐', name: 'Star', price: 200, tier: 3 },
  { id: '🌈', name: 'Rainbow', price: 200, tier: 3 },
  { id: '🎮', name: 'Gamer', price: 200, tier: 3 },
  { id: '🎨', name: 'Artist', price: 200, tier: 3 },
  { id: '🎪', name: 'Circus', price: 200, tier: 3 },

  // Tier 4 - 500 stars each (special)
  { id: '🐲', name: 'Dragon', price: 500, tier: 4 },
  { id: '🦖', name: 'Dino', price: 500, tier: 4 },
  { id: '🤖', name: 'Robot', price: 500, tier: 4 },
  { id: '👑', name: 'Crown', price: 500, tier: 4 },
  { id: '💎', name: 'Diamond', price: 500, tier: 4 },
  { id: '🏆', name: 'Trophy', price: 500, tier: 4 }
]

function createShopStore(Alpine) {
  return {
    // Current shop tab
    activeTab: 'avatars',

    get avatarItems() {
      return AVATAR_ITEMS
    },

    get themeItems() {
      return getThemes()
    },

    get soundPackItems() {
      return getSoundPacks()
    },

    isUnlocked(category, itemId) {
      const profile = Alpine.store('profile').activeProfile
      if (!profile) return false

      if (!profile.unlockedItems || !profile.unlockedItems[category]) {
        return false
      }

      return profile.unlockedItems[category].includes(itemId)
    },

    isEquipped(category, itemId) {
      const profile = Alpine.store('profile').activeProfile
      if (!profile) return false

      if (!profile.equippedItems || !profile.equippedItems[category]) {
        return false
      }

      return profile.equippedItems[category] === itemId
    },

    canAfford(cost) {
      const profile = Alpine.store('profile').activeProfile
      if (!profile) return false

      return (profile.stats.stars || 0) >= cost
    },

    purchaseItem(category, itemId, cost) {
      const profileStore = Alpine.store('profile')
      const profile = profileStore.activeProfile

      if (!profile) return false

      // Check if already unlocked
      if (this.isUnlocked(category, itemId)) {
        return false
      }

      // Check if can afford
      if (!this.canAfford(cost)) {
        return false
      }

      // Deduct stars
      profile.stats.stars -= cost

      // Unlock item based on category
      if (category === 'avatars') {
        profileStore.unlockAvatar(itemId)
      } else if (category === 'themes') {
        profileStore.unlockTheme(itemId)
      } else if (category === 'soundPacks') {
        profileStore.unlockSoundPack(itemId)
      }

      return true
    },

    equipItem(category, itemId) {
      const profileStore = Alpine.store('profile')

      if (!this.isUnlocked(category, itemId)) {
        return false
      }

      if (category === 'avatars') {
        profileStore.equipAvatar(itemId)
      } else if (category === 'themes') {
        profileStore.equipTheme(itemId)
      } else if (category === 'soundPacks') {
        profileStore.equipSoundPack(itemId)
      }

      return true
    }
  }
}

export { createShopStore, AVATAR_ITEMS }
