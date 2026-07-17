<script setup>
import Modal from './Modal.vue'
import { useTableInsert } from '../../composables/useTableInsert'

const { isOpen, rows, cols, handleConfirm, handleCancel } = useTableInsert()
</script>

<template>
  <Modal :model-value="isOpen" @update:model-value="handleCancel" title="Insertar tabla">
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <label class="block">
          <span class="text-sm text-secundario">Filas</span>
          <input
            v-model.number="rows"
            type="number"
            min="1"
            max="20"
            class="mt-1 w-full px-3 py-2 rounded-lg bg-fondo-secundario text-texto outline-none focus:ring-2 focus:ring-primario"
          />
        </label>
        <label class="block">
          <span class="text-sm text-secundario">Columnas</span>
          <input
            v-model.number="cols"
            type="number"
            min="1"
            max="10"
            class="mt-1 w-full px-3 py-2 rounded-lg bg-fondo-secundario text-texto outline-none focus:ring-2 focus:ring-primario"
          />
        </label>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button @click="handleCancel" class="px-4 py-2 rounded-lg text-sm font-medium bg-fondo-secundario hover:opacity-80 transition">
          Cancelar
        </button>
        <button @click="handleConfirm" class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primario hover:opacity-90 transition">
          Insertar
        </button>
      </div>
    </div>
  </Modal>
</template>