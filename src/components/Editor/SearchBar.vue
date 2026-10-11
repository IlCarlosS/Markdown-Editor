<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ChevronUp, ChevronDown, X } from 'lucide-vue-next'
import { searchPluginKey } from '../../extensions/SearchAndReplace'
import { useSearch } from '../../composables/useSearch'
import { useConfirm } from '../../composables/useConfirm'

const props = defineProps({
  editor: { type: Object, required: true },
})

const { closeSearch, focusSignal } = useSearch()
const { confirmAction } = useConfirm()

const searchTerm = ref('')
const replaceTerm = ref('')
const caseSensitive = ref(false)
const matchCount = ref(0)
const activeIndex = ref(0)
const searchInput = ref(null)

const inputClass =
  'flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-fondo-secundario text-texto text-sm outline-none focus:ring-2 focus:ring-primario'
const actionBtnClass =
  'px-3 py-1.5 rounded-lg text-sm font-medium bg-fondo-secundario text-texto hover:opacity-80 transition whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed'

const counterLabel = computed(() => {
  if (matchCount.value > 0) return `${activeIndex.value + 1} de ${matchCount.value}`
  return searchTerm.value ? 'Sin resultados' : ''
})

// Lee el estado de la búsqueda directamente del plugin cada vez que cambia el editor
function syncState() {
  const s = searchPluginKey.getState(props.editor.view.state)
  if (!s) return
  matchCount.value = s.results.length
  activeIndex.value = s.activeIndex
}

function focusInput() {
  nextTick(() => {
    searchInput.value?.focus()
    searchInput.value?.select()
  })
}

// Si hay texto seleccionado dentro de un mismo párrafo, lo usamos como término inicial
function prefillFromSelection() {
  const { selection, doc } = props.editor.view.state
  if (selection.empty || !selection.$from.sameParent(selection.$to)) return
  const text = doc.textBetween(selection.from, selection.to)
  if (text && text.length <= 100) searchTerm.value = text
}

watch(searchTerm, (value) => props.editor.commands.setSearchTerm(value))
watch(caseSensitive, (value) => props.editor.commands.setSearchCaseSensitive(value))

watch(focusSignal, () => {
  prefillFromSelection()
  focusInput()
})

onMounted(() => {
  props.editor.on('transaction', syncState)
  prefillFromSelection()
  focusInput()
  syncState()
})

onBeforeUnmount(() => {
  props.editor.off('transaction', syncState)
  if (!props.editor.isDestroyed) props.editor.commands.clearSearch()
})

function next() {
  props.editor.commands.nextSearchMatch()
}

function previous() {
  props.editor.commands.previousSearchMatch()
}

function replaceCurrent() {
  if (!matchCount.value) return
  props.editor.commands.replaceCurrentMatch(replaceTerm.value)
}

async function replaceAll() {
  if (!matchCount.value) return

  const count = matchCount.value
  const replacement = replaceTerm.value
    ? `"${replaceTerm.value}"`
    : 'nada (se eliminarán)'

  const confirmed = await confirmAction({
    title: 'Reemplazar todo',
    message: `Se reemplazarán ${count} coincidencias de "${searchTerm.value}" por ${replacement}. Puedes deshacerlo con Ctrl+Z.`,
    confirmLabel: 'Reemplazar todo',
    cancelLabel: 'Cancelar',
    danger: true,
  })
  if (!confirmed) return

  props.editor.commands.replaceAllMatches(replaceTerm.value)
}

function close() {
  closeSearch()
  props.editor.commands.focus()
}

function onSearchKeydown(event) {
  if (event.key !== 'Enter') return
  event.preventDefault()
  if (event.shiftKey) previous()
  else next()
}

function onReplaceKeydown(event) {
  if (event.key !== 'Enter') return
  event.preventDefault()
  replaceCurrent()
}

function onBarKeydown(event) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    close()
  }
}
</script>

<template>
  <div
    class="border-b border-fondo-secundario bg-fondo px-3 py-2"
    role="search"
    @keydown="onBarKeydown"
  >
    <div class="flex flex-wrap items-center gap-2">
      <!-- Buscar -->
      <div class="flex items-center gap-1 flex-1 min-w-[260px]">
        <input
          ref="searchInput"
          v-model="searchTerm"
          type="text"
          placeholder="Buscar…"
          aria-label="Buscar en el documento"
          :class="inputClass"
          @keydown="onSearchKeydown"
        />
        <span class="text-xs text-secundario min-w-[78px] text-center tabular-nums">
          {{ counterLabel }}
        </span>
        <button
          class="toolbar-btn"
          title="Anterior (Shift+Enter)"
          aria-label="Coincidencia anterior"
          @click="previous"
        >
          <ChevronUp class="w-4 h-4" />
        </button>
        <button
          class="toolbar-btn"
          title="Siguiente (Enter)"
          aria-label="Coincidencia siguiente"
          @click="next"
        >
          <ChevronDown class="w-4 h-4" />
        </button>
        <button
          :class="['toolbar-btn text-xs font-medium px-2', { 'toolbar-btn-active': caseSensitive }]"
          title="Distinguir mayúsculas y minúsculas"
          :aria-pressed="caseSensitive"
          @click="caseSensitive = !caseSensitive"
        >
          Aa
        </button>
      </div>

      <!-- Reemplazar -->
      <div class="flex items-center gap-1 flex-1 min-w-[260px]">
        <input
          v-model="replaceTerm"
          type="text"
          placeholder="Reemplazar con…"
          aria-label="Texto de reemplazo"
          :class="inputClass"
          @keydown="onReplaceKeydown"
        />
        <button :class="actionBtnClass" :disabled="!matchCount" @click="replaceCurrent">
          Reemplazar
        </button>
        <button :class="actionBtnClass" :disabled="!matchCount" @click="replaceAll">
          Reemplazar todo
        </button>
      </div>

      <button class="toolbar-btn" title="Cerrar (Esc)" aria-label="Cerrar búsqueda" @click="close">
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>