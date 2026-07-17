<script setup>
import { AlertTriangle } from 'lucide-vue-next'
import Modal from './Modal.vue'
import { useConfirm } from '../../composables/useConfirm'

const {
  isOpen, title, message, confirmLabel, cancelLabel, isDanger,
  handleConfirm, handleCancel,
} = useConfirm()
</script>

<template>
  <Modal :model-value="isOpen" @update:model-value="handleCancel" :title="title">
    <div class="space-y-4">
      <div class="flex gap-3">
        <AlertTriangle v-if="isDanger" class="w-5 h-5 text-advertencia shrink-0 mt-0.5" />
        <p class="text-sm text-texto/90">{{ message }}</p>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          @click="handleCancel"
          class="px-4 py-2 rounded-lg text-sm font-medium bg-fondo-secundario hover:opacity-80 transition"
        >
          {{ cancelLabel }}
        </button>
        <button
          @click="handleConfirm"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90',
            isDanger ? 'bg-error' : 'bg-primario'
          ]"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </Modal>
</template>