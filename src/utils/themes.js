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

const THEME_STYLES = {
  default: {
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    pink: '#ec4899',
    gameBg: '#faf5ff',
    bgStart: '#faf5ff',
    bgEnd: '#e0f2fe'
  },
  ocean: {
    primary: '#06b6d4',
    secondary: '#3b82f6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    pink: '#ec4899',
    gameBg: '#ecfeff',
    bgStart: '#ecfeff',
    bgEnd: '#dbeafe'
  },
  sunset: {
    primary: '#f97316',
    secondary: '#ec4899',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    pink: '#f472b6',
    gameBg: '#fff7ed',
    bgStart: '#fff7ed',
    bgEnd: '#ffe4e6'
  },
  forest: {
    primary: '#10b981',
    secondary: '#22c55e',
    success: '#16a34a',
    danger: '#ef4444',
    warning: '#f59e0b',
    pink: '#ec4899',
    gameBg: '#f0fdf4',
    bgStart: '#f0fdf4',
    bgEnd: '#dcfce7'
  },
  rainbow: {
    primary: '#ec4899',
    secondary: '#a855f7',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    pink: '#f472b6',
    gameBg: '#fdf2f8',
    bgStart: '#fdf2f8',
    bgEnd: '#dbeafe'
  },
  space: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    pink: '#ec4899',
    gameBg: '#eef2ff',
    bgStart: '#eef2ff',
    bgEnd: '#ede9fe'
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

function applyTheme(themeId) {
  if (typeof document === 'undefined') {
    return
  }

  const theme = getTheme(themeId)
  const styles = THEME_STYLES[theme.id] || THEME_STYLES.default
  const root = document.documentElement

  root.style.setProperty('--color-primary', styles.primary)
  root.style.setProperty('--color-secondary', styles.secondary)
  root.style.setProperty('--color-success', styles.success)
  root.style.setProperty('--color-danger', styles.danger)
  root.style.setProperty('--color-warning', styles.warning)
  root.style.setProperty('--color-pink', styles.pink)
  root.style.setProperty('--color-game-bg', styles.gameBg)

  document.body.style.background = `linear-gradient(135deg, ${styles.bgStart} 0%, ${styles.bgEnd} 100%)`

  const themeMeta = document.querySelector('meta[name="theme-color"]')
  if (themeMeta) {
    themeMeta.setAttribute('content', styles.primary)
  }
}

export { THEMES, getThemes, getTheme, applyTheme }
