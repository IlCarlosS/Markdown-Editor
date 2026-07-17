<script setup>
import { X } from 'lucide-vue-next'
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}

function handleEscape(e) {
  if (e.key === 'Escape' && props.modelValue) close()
}

onMounted(() => window.addEventListener('keydown', handleEscape))
onUnmounted(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="close"
      >
        <div class="bg-fondo text-texto rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
          <div class="flex items-center justify-between px-5 py-4 border-b border-fondo-secundario">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
            <button @click="close" class="toolbar-btn" aria-label="Cerrar">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="p-5">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>