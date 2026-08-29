<script setup>
import {
  FilePlus, FolderOpen, Save,
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, ListTodo, Quote, Code, Code2, Link2, Image as ImageIcon,
  Table as TableIcon, Minus, Undo2, Redo2, Type,
} from 'lucide-vue-next'
import { useTableInsert } from '../../composables/useTableInsert'
import { ref, onMounted, onUnmounted } from 'vue'

const { requestTableSize } = useTableInsert()

const props = defineProps({
  editor: { type: Object, required: true },
  fileControls: { type: Object, required: true },
})

function setLink() {
  const previousUrl = props.editor.getAttributes('link').href
  const url = window.prompt('URL del enlace:', previousUrl || 'https://')
  if (url === null) return
  if (url === '') {
    props.editor.chain().focus().unsetLink().run()
    return
  }
  props.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function addImage() {
  const url = window.prompt('URL de la imagen:')
  if (url) {
    props.editor.chain().focus().setImage({ src: url }).run()
  }
}

async function insertTable() {
  const size = await requestTableSize()
  if (!size) return
  props.editor.chain().focus().insertTable({ rows: size.rows, cols: size.cols, withHeaderRow: true }).run()
}

//logica boton Cambiar mayúsculas y minúsculas
const showCaseMenu = ref(false)
const caseMenuRef = ref(null)

const caseOptions = [
  { value: 'upper', label: 'MAYÚSCULAS' },
  { value: 'lower', label: 'minúsculas' },
  { value: 'title', label: 'Cada Palabra En Mayúscula' },
  { value: 'sentence', label: 'Oración normal.' },
  { value: 'toggle', label: 'iNVERTIR MAYÚS/MINÚS' },
]

function applyCase(value) {
  props.editor.chain().focus().setTextCase(value).run()
  showCaseMenu.value = false
}

function handleClickOutside(event) {
  if (caseMenuRef.value && !caseMenuRef.value.contains(event.target)) {
    showCaseMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

</script>

<template>
  <div class="flex flex-wrap items-center gap-1 border-b border-fondo-secundario bg-fondo-secundario p-2">
    <!-- Grupo: Archivo -->
    <div class="flex items-center gap-1 pr-2 border-r border-fondo-secundario">
      <button @click="fileControls.newFile" title="Nuevo archivo" class="toolbar-btn">
        <FilePlus class="w-4 h-4" />
      </button>
      <button @click="fileControls.openFile" title="Abrir archivo" class="toolbar-btn">
        <FolderOpen class="w-4 h-4" />
      </button>
      <button @click="fileControls.saveFile" title="Guardar archivo" class="toolbar-btn">
        <Save class="w-4 h-4" />
      </button>
    </div>

    <!-- Grupo: Deshacer/Rehacer -->
    <div class="flex items-center gap-1 pr-2 border-r border-fondo-secundario">
      <button @click="editor.chain().focus().undo().run()" title="Deshacer" class="toolbar-btn">
        <Undo2 class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().redo().run()" title="Rehacer" class="toolbar-btn">
        <Redo2 class="w-4 h-4" />
      </button>
    </div>

    <!-- Grupo: Encabezados -->
    <div class="flex items-center gap-1 pr-2 border-r border-fondo-secundario">
      <button
        v-for="level in [1, 2, 3]"
        :key="level"
        @click="editor.chain().focus().toggleHeading({ level }).run()"
        :class="['toolbar-btn font-bold text-xs', { 'toolbar-btn-active': editor.isActive('heading', { level }) }]"
      >
        H{{ level }}
      </button>
    </div>

    <!-- Grupo: Formato de texto -->
    <div class="flex items-center gap-1 pr-2 border-r border-fondo-secundario">
      <button @click="editor.chain().focus().toggleBold().run()" :class="['toolbar-btn', { 'toolbar-btn-active': editor.isActive('bold') }]" title="Negrita">
        <Bold class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="['toolbar-btn', { 'toolbar-btn-active': editor.isActive('italic') }]" title="Cursiva">
        <Italic class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().toggleUnderline().run()" :class="['toolbar-btn', { 'toolbar-btn-active': editor.isActive('underline') }]" title="Subrayado">
        <Underline class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="['toolbar-btn', { 'toolbar-btn-active': editor.isActive('strike') }]" title="Tachado">
        <Strikethrough class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().toggleCode().run()" :class="['toolbar-btn', { 'toolbar-btn-active': editor.isActive('code') }]" title="Código en línea">
        <Code class="w-4 h-4" />
      </button>
    </div>

    <!-- Grupo: Listas -->
    <div class="flex items-center gap-1 pr-2 border-r border-fondo-secundario">
      <button @click="editor.chain().focus().toggleBulletList().run()" :class="['toolbar-btn', { 'toolbar-btn-active': editor.isActive('bulletList') }]" title="Lista con viñetas">
        <List class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().toggleOrderedList().run()" :class="['toolbar-btn', { 'toolbar-btn-active': editor.isActive('orderedList') }]" title="Lista numerada">
        <ListOrdered class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().toggleTaskList().run()" :class="['toolbar-btn', { 'toolbar-btn-active': editor.isActive('taskList') }]" title="Lista de tareas">
        <ListTodo class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().toggleBlockquote().run()" :class="['toolbar-btn', { 'toolbar-btn-active': editor.isActive('blockquote') }]" title="Cita">
        <Quote class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().toggleCodeBlock().run()" :class="['toolbar-btn', { 'toolbar-btn-active': editor.isActive('codeBlock') }]" title="Bloque de código">
        <Code2 class="w-4 h-4" />
      </button>
    </div>

    <!-- Grupo: Insertar -->
    <div class="flex items-center gap-1">
      <button @click="setLink" :class="['toolbar-btn', { 'toolbar-btn-active': editor.isActive('link') }]" title="Insertar enlace">
        <Link2 class="w-4 h-4" />
      </button>
      <button @click="addImage" class="toolbar-btn" title="Insertar imagen">
        <ImageIcon class="w-4 h-4" />
      </button>
      <button @click="insertTable" class="toolbar-btn" title="Insertar tabla">
        <TableIcon class="w-4 h-4" />
      </button>
      <button @click="editor.chain().focus().setHorizontalRule().run()" class="toolbar-btn" title="Línea horizontal">
        <Minus class="w-4 h-4" />
      </button>
    </div>

    <!-- Grupo contextual: solo visible con el cursor dentro de una tabla -->
    <div v-if="editor.isActive('table')" class="flex items-center gap-1 pl-2 ml-2 border-l border-fondo-secundario">
      <span class="text-xs text-secundario px-1">Tabla:</span>

      <button @click="editor.chain().focus().addRowAfter().run()" class="toolbar-btn text-xs px-2" title="Agregar fila abajo">
        Fila +
      </button>
      <button @click="editor.chain().focus().deleteRow().run()" class="toolbar-btn text-xs px-2" title="Eliminar fila actual">
        Fila −
      </button>
      <button @click="editor.chain().focus().addColumnAfter().run()" class="toolbar-btn text-xs px-2" title="Agregar columna a la derecha">
        Col +
      </button>
      <button @click="editor.chain().focus().deleteColumn().run()" class="toolbar-btn text-xs px-2" title="Eliminar columna actual">
        Col −
      </button>
      <button @click="editor.chain().focus().deleteTable().run()" class="toolbar-btn text-xs px-2 text-error" title="Eliminar tabla completa">
        Eliminar tabla
      </button>
    </div>

    <!-- Grupo: Cambiar mayúsculas/minúsculas -->
    <div ref="caseMenuRef" class="relative pr-2 border-r border-fondo-secundario">
      <button @click="showCaseMenu = !showCaseMenu" class="toolbar-btn" title="Cambiar mayúsculas y minúsculas">
        <Type class="w-4 h-4" />
      </button>

      <div
        v-if="showCaseMenu"
        class="absolute top-full left-0 mt-1 z-20 bg-fondo border border-fondo-secundario rounded-lg shadow-lg py-1 min-w-[210px]"
      >
        <button
          v-for="option in caseOptions"
          :key="option.value"
          @click="applyCase(option.value)"
          class="w-full text-left px-3 py-2 text-sm hover:bg-fondo-secundario transition-colors"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>