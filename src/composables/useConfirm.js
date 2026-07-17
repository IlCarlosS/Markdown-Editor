import { ref } from 'vue'

// Estado compartido (singleton), igual patrón que usamos en useTheme.js
const isOpen = ref(false)
const title = ref('')
const message = ref('')
const confirmLabel = ref('Aceptar')
const cancelLabel = ref('Cancelar')
const isDanger = ref(false)

let resolvePromise = null

function confirmAction({
  title: t = '¿Estás seguro?',
  message: m = '',
  confirmLabel: cl = 'Aceptar',
  cancelLabel: cnl = 'Cancelar',
  danger = false,
} = {}) {
  title.value = t
  message.value = m
  confirmLabel.value = cl
  cancelLabel.value = cnl
  isDanger.value = danger
  isOpen.value = true

  // Devolvemos una promesa que se resuelve cuando el usuario hace clic
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

function handleConfirm() {
  isOpen.value = false
  if (resolvePromise) resolvePromise(true)
}

function handleCancel() {
  isOpen.value = false
  if (resolvePromise) resolvePromise(false)
}

export function useConfirm() {
  return {
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel,
    isDanger,
    confirmAction,
    handleConfirm,
    handleCancel,
  }
}