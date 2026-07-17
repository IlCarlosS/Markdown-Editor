<script setup>
import { Sun, Moon, Info, FileText } from 'lucide-vue-next'
import { ref } from 'vue'
import Modal from '../UI/Modal.vue'
import InfoModalContent from '../UI/InfoModalContent.vue'

defineProps({
  theme: { type: String, required: true },
  toggleTheme: { type: Function, required: true },
  fileName: { type: String, required: true },
  isDirty: { type: Boolean, default: false },
})

const showInfo = ref(false)
</script>

<template>
  <header class="flex items-center justify-between px-4 py-3 border-b border-fondo-secundario">
    <!-- Marca -->
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-primario flex items-center justify-center text-white font-bold text-sm shrink-0">
        M↓
      </div>
      <span class="font-semibold text-lg hidden sm:inline">Editor Markdown</span>
    </div>

    <!-- Estado del archivo actual -->
    <div class="flex items-center gap-1.5 text-sm text-secundario min-w-0">
      <FileText class="w-3.5 h-3.5 shrink-0" />
      <span class="truncate max-w-[160px]">{{ fileName }}</span>
      <span v-if="isDirty" class="w-1.5 h-1.5 rounded-full bg-advertencia shrink-0" title="Cambios sin guardar" />
    </div>

    <!-- Acciones -->
    <div class="flex items-center gap-1">
      <button @click="showInfo = true" class="toolbar-btn" aria-label="Información">
        <Info class="w-4 h-4" />
      </button>
      <button
        @click="toggleTheme"
        class="toolbar-btn"
        :aria-label="theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      >
        <Sun v-if="theme === 'dark'" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </button>
    </div>

    <Modal v-model="showInfo" title="Acerca del editor">
      <InfoModalContent />
    </Modal>
  </header>
</template>