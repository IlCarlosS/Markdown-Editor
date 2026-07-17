import { ref } from 'vue'
import { useConfirm } from './useConfirm'

export function useFileSystem(editor) {
  const currentFileHandle = ref(null)
  const currentFileName = ref('sin-titulo.md')
  const isDirty = ref(false)

  const { confirmAction } = useConfirm()
  const supportsFileSystemAccess = 'showOpenFilePicker' in window

  function markDirty() {
    isDirty.value = true
  }

  async function newFile() {
    if (isDirty.value) {
      const confirmed = await confirmAction({
        title: 'Crear nuevo archivo',
        message: 'Hay cambios sin guardar. Si continúas, se perderán permanentemente.',
        confirmLabel: 'Crear de todas formas',
        cancelLabel: 'Cancelar',
        danger: true,
      })
      if (!confirmed) return
    }
    editor.value.commands.setContent('')
    currentFileHandle.value = null
    currentFileName.value = 'sin-titulo.md'
    isDirty.value = false
  }

  async function openFile() {
    if (isDirty.value) {
      const confirmed = await confirmAction({
        title: 'Abrir archivo',
        message: 'Hay cambios sin guardar. Si continúas, se perderán permanentemente.',
        confirmLabel: 'Abrir de todas formas',
        cancelLabel: 'Cancelar',
        danger: true,
      })
      if (!confirmed) return
    }

    try {
      if (supportsFileSystemAccess) {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'Archivos Markdown',
            accept: { 'text/markdown': ['.md', '.mdx'] },
          }],
        })
        const file = await handle.getFile()
        const text = await file.text()
        editor.value.commands.setContent(text)
        currentFileHandle.value = handle
        currentFileName.value = file.name
        isDirty.value = false
      } else {
        openFileFallback()
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Error al abrir archivo:', err)
    }
  }

  function openFileFallback() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.mdx'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      const text = await file.text()
      editor.value.commands.setContent(text)
      currentFileName.value = file.name
      isDirty.value = false
    }
    input.click()
  }

  async function saveFile() {
    const markdown = editor.value.storage.markdown.getMarkdown()

    if (supportsFileSystemAccess) {
      try {
        if (!currentFileHandle.value) {
          currentFileHandle.value = await window.showSaveFilePicker({
            suggestedName: currentFileName.value,
            types: [{
              description: 'Archivo Markdown',
              accept: { 'text/markdown': ['.md'] },
            }],
          })
        }
        const writable = await currentFileHandle.value.createWritable()
        await writable.write(markdown)
        await writable.close()
        const file = await currentFileHandle.value.getFile()
        currentFileName.value = file.name
        isDirty.value = false
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Error al guardar:', err)
      }
    } else {
      saveFileFallback(markdown)
    }
  }

  function saveFileFallback(markdown) {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = currentFileName.value
    a.click()
    URL.revokeObjectURL(url)
    isDirty.value = false
  }

  return {
    currentFileName,
    isDirty,
    newFile,
    openFile,
    saveFile,
    markDirty,
  }
}