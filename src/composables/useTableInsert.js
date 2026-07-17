import { ref } from 'vue'

const isOpen = ref(false)
const rows = ref(3)
const cols = ref(3)

let resolvePromise = null

function requestTableSize() {
  rows.value = 3
  cols.value = 3
  isOpen.value = true

  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

function handleConfirm() {
  isOpen.value = false
  if (resolvePromise) resolvePromise({ rows: rows.value, cols: cols.value })
}

function handleCancel() {
  isOpen.value = false
  if (resolvePromise) resolvePromise(null)
}

export function useTableInsert() {
  return { isOpen, rows, cols, requestTableSize, handleConfirm, handleCancel }
}