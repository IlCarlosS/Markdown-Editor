// src/composables/useTheme.js
import { ref, watch } from 'vue'

const THEME_KEY = 'markdown-editor-theme'

// Determina el tema inicial: localStorage > preferencia del sistema > 'light'
function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

// Estado compartido entre todos los componentes que usen este composable
const theme = ref(getInitialTheme())

function applyTheme(value) {
  const root = document.documentElement
  if (value === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  localStorage.setItem(THEME_KEY, value)
}

// Aplicar inmediatamente al cargar el módulo (evita "flash" de tema incorrecto)
applyTheme(theme.value)

// Reaccionar a cambios futuros
watch(theme, (newValue) => {
  applyTheme(newValue)
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(value) {
    theme.value = value
  }

  return { theme, toggleTheme, setTheme }
}