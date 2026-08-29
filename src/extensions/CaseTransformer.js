import { Extension } from '@tiptap/core'

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

function toSentenceCase(str) {
  const lower = str.toLowerCase()
  return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase())
}

function toToggleCase(str) {
  return str.split('').map((char) =>
    char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
  ).join('')
}

const transformers = {
  upper: (str) => str.toUpperCase(),
  lower: (str) => str.toLowerCase(),
  title: toTitleCase,
  sentence: toSentenceCase,
  toggle: toToggleCase,
}

export const CaseTransformer = Extension.create({
  name: 'caseTransformer',

  addCommands() {
    return {
      setTextCase: (caseType) => ({ state, dispatch }) => {
        const { from, to, empty } = state.selection
        if (empty) return false

        const transform = transformers[caseType]
        if (!transform) return false

        // Recolectamos cada nodo de texto dentro de la selección,
        // junto con sus marcas (negrita, cursiva, enlace, etc.) individuales.
        const segments = []
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (!node.isText) return
          const start = Math.max(pos, from)
          const end = Math.min(pos + node.nodeSize, to)
          if (start >= end) return
          const text = node.text.slice(start - pos, end - pos)
          segments.push({ start, end, text, marks: node.marks })
        })

        if (segments.length === 0) return false

        if (dispatch) {
          const tr = state.tr
          // Se reemplaza de atrás hacia adelante para que las posiciones
          // de los segmentos anteriores no se descuadren con cada edición.
          for (let i = segments.length - 1; i >= 0; i--) {
            const { start, end, text, marks } = segments[i]
            const newText = transform(text)
            tr.replaceWith(start, end, state.schema.text(newText, marks))
          }
          dispatch(tr)
        }

        return true
      },
    }
  },
})