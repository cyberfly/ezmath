// Theme system for customizable color schemes

const THEMES = {
  default: {
    id: 'default',
    name: 'Purple Dream',
    price: 0,
    tier: 0,
    primary: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-pink-50',
    cardBorder: 'border-purple-200'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze',
    price: 150,
    tier: 1,
    primary: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-50 to-blue-50',
    cardBorder: 'border-cyan-200'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Sky',
    price: 150,
    tier: 1,
    primary: 'orange',
    gradient: 'from-orange-500 to-pink-600',
    bgGradient: 'from-orange-50 to-pink-50',
    cardBorder: 'border-orange-200'
  },
  forest: {
    id: 'forest',
    name: 'Forest Friend',
    price: 150,
    tier: 1,
    primary: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    bgGradient: 'from-emerald-50 to-green-50',
    cardBorder: 'border-emerald-200'
  },
  rainbow: {
    id: 'rainbow',
    name: 'Rainbow Magic',
    price: 300,
    tier: 2,
    primary: 'pink',
    gradient: 'from-pink-500 via-purple-500 to-blue-500',
    bgGradient: 'from-pink-50 via-purple-50 to-blue-50',
    cardBorder: 'border-pink-200'
  },
  space: {
    id: 'space',
    name: 'Space Explorer',
    price: 300,
    tier: 2,
    primary: 'indigo',
    gradient: 'from-indigo-600 to-purple-700',
    bgGradient: 'from-indigo-50 to-purple-50',
    cardBorder: 'border-indigo-200'
  }
}

// Get all themes as an array
function getThemes() {
  return Object.values(THEMES)
}

// Get theme by ID
function getTheme(themeId) {
  return THEMES[themeId] || THEMES.default
}

export { THEMES, getThemes, getTheme }
