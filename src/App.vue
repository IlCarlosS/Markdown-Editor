<script setup>
import { EditorContent } from '@tiptap/vue-3'
import { onMounted, onBeforeUnmount } from 'vue'
import { useMarkdownEditor } from './composables/useMarkdownEditor'
import { useFileSystem } from './composables/useFileSystem'
import { useTheme } from './composables/useTheme'
import { useSearch } from './composables/useSearch'
import Header from './components/Layout/Header.vue'
import Toolbar from './components/Editor/Toolbar.vue'
import SearchBar from './components/Editor/SearchBar.vue'
import ConfirmModal from './components/UI/ConfirmModal.vue'
import TableInsertModal from './components/UI/TableInsertModal.vue'

function handleUpdate() {
  if (fileControls) fileControls.markDirty()
}

const editor = useMarkdownEditor('# Bienvenido\n\nEmpieza a escribir...', handleUpdate)
const fileControls = useFileSystem(editor)
const { theme, toggleTheme } = useTheme()
const { isOpen: isSearchOpen, openSearch } = useSearch()

// Ctrl/Cmd+F abre nuestra barra en lugar de la del navegador
function handleGlobalShortcuts(event) {
  const isFind =
    (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'f'
  if (isFind && editor.value) {
    event.preventDefault()
    openSearch()
  }
}

onMounted(() => window.addEventListener('keydown', handleGlobalShortcuts))
onBeforeUnmount(() => window.removeEventListener('keydown', handleGlobalShortcuts))
</script>

<template>
  <div class="min-h-screen bg-fondo text-texto font-sans flex flex-col">

    <!-- Header + Toolbar (+ barra de búsqueda) viajan juntos, fijos arriba -->
    <div class="sticky top-0 z-20 bg-fondo shadow-sm">
      <Header
        :theme="theme"
        :toggle-theme="toggleTheme"
        :file-name="fileControls.currentFileName.value"
        :is-dirty="fileControls.isDirty.value"
      />
      <Toolbar v-if="editor" :editor="editor" :file-controls="fileControls" />
      <SearchBar v-if="editor && isSearchOpen" :editor="editor" />
    </div>

    <main v-if="editor" class="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
      <EditorContent :editor="editor" />
    </main>

    <ConfirmModal />
    <TableInsertModal />
  </div>
</template>