import { ref } from 'vue'

const isOpen = ref(false)
const focusSignal = ref(0)

function openSearch() {
  isOpen.value = true
  focusSignal.value++
}

function closeSearch() {
  isOpen.value = false
}

function toggleSearch() {
  if (isOpen.value) closeSearch()
  else openSearch()
}

export function useSearch() {
  return { isOpen, focusSignal, openSearch, closeSearch, toggleSearch }
}