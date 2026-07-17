<script setup>
import { EditorContent } from '@tiptap/vue-3'
import { ref } from 'vue'
import { useMarkdownEditor } from './composables/useMarkdownEditor'
import { useFileSystem } from './composables/useFileSystem'
import { useTheme } from './composables/useTheme'
import Header from './components/Layout/Header.vue'
import Toolbar from './components/Editor/Toolbar.vue'
import ConfirmModal from './components/UI/ConfirmModal.vue'
import TableInsertModal from './components/UI/TableInsertModal.vue'

function handleUpdate() {
  if (fileControls) fileControls.markDirty()
}

const editor = useMarkdownEditor('# Bienvenido\n\nEmpieza a escribir...', handleUpdate)
const fileControls = useFileSystem(editor)
const { theme, toggleTheme } = useTheme()
</script>

<template>
  <div class="min-h-screen bg-fondo text-texto font-sans flex flex-col">

    <!-- Header + Toolbar viajan juntos, fijos arriba -->
    <div class="sticky top-0 z-20 bg-fondo shadow-sm">
      <Header
        :theme="theme"
        :toggle-theme="toggleTheme"
        :file-name="fileControls.currentFileName.value"
        :is-dirty="fileControls.isDirty.value"
      />
      <Toolbar v-if="editor" :editor="editor" :file-controls="fileControls" />
    </div>

    <main v-if="editor" class="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
      <EditorContent :editor="editor" />
    </main>

    <ConfirmModal />
    <TableInsertModal />
  </div>
</template>