import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const searchPluginKey = new PluginKey('searchAndReplace')

// Recorre cada bloque de texto (párrafo, encabezado, celda, etc.) y devuelve
// las posiciones { from, to } de cada coincidencia dentro del documento.
function findMatches(doc, term, caseSensitive) {
  if (!term) return []

  const normalize = (str) => (caseSensitive ? str : str.toLowerCase())
  const needle = normalize(term)
  const results = []

  doc.descendants((node, pos) => {
    if (!node.isTextblock) return

    let text = ''
    const positions = [] // índice dentro de `text` -> posición real en el documento

    node.forEach((child, offset) => {
      const childPos = pos + 1 + offset
      if (child.isText) {
        for (let i = 0; i < child.text.length; i++) positions.push(childPos + i)
        text += child.text
      } else {
        // Nodo en línea que no es texto (imagen, salto de línea):
        // un marcador evita que una coincidencia lo atraviese.
        text += '\uFFFC'
        positions.push(childPos)
      }
    })

    const haystack = normalize(text)
    if (haystack.length !== text.length) return false

    let index = haystack.indexOf(needle)
    while (index !== -1) {
      results.push({
        from: positions[index],
        to: positions[index + needle.length - 1] + 1,
      })
      index = haystack.indexOf(needle, index + needle.length)
    }

    return false
  })

  return results
}

function buildDecorations(doc, results, activeIndex) {
  if (!results.length) return DecorationSet.empty

  return DecorationSet.create(
    doc,
    results.map((match, i) =>
      Decoration.inline(match.from, match.to, {
        class: i === activeIndex ? 'search-match search-match-active' : 'search-match',
      })
    )
  )
}

// Reemplaza un rango conservando las marcas (negrita, enlace...) del primer carácter.
function replaceRange(tr, doc, schema, { from, to }, replacement) {
  if (!replacement) {
    tr.delete(from, to)
    return
  }
  const marks = doc.nodeAt(from)?.marks ?? []
  tr.replaceWith(from, to, schema.text(replacement, marks))
}

function scrollToActiveMatch(editor) {
  requestAnimationFrame(() => {
    const el = editor.view.dom.querySelector('.search-match-active')
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  })
}

export const SearchAndReplace = Extension.create({
  name: 'searchAndReplace',

  addCommands() {
    return {
      setSearchTerm: (term) => ({ tr, dispatch, editor }) => {
        if (dispatch) {
          tr.setMeta(searchPluginKey, { term })
          if (term) scrollToActiveMatch(editor)
        }
        return true
      },

      setSearchCaseSensitive: (value) => ({ tr, dispatch, editor }) => {
        if (dispatch) {
          tr.setMeta(searchPluginKey, { caseSensitive: value })
          scrollToActiveMatch(editor)
        }
        return true
      },

      clearSearch: () => ({ tr, dispatch }) => {
        if (dispatch) tr.setMeta(searchPluginKey, { term: '', caseSensitive: false })
        return true
      },

      nextSearchMatch: () => ({ state, tr, dispatch, editor }) => {
        const s = searchPluginKey.getState(state)
        if (!s || !s.results.length) return false
        if (dispatch) {
          tr.setMeta(searchPluginKey, {
            activeIndex: (s.activeIndex + 1) % s.results.length,
          })
          scrollToActiveMatch(editor)
        }
        return true
      },

      previousSearchMatch: () => ({ state, tr, dispatch, editor }) => {
        const s = searchPluginKey.getState(state)
        if (!s || !s.results.length) return false
        if (dispatch) {
          tr.setMeta(searchPluginKey, {
            activeIndex: (s.activeIndex - 1 + s.results.length) % s.results.length,
          })
          scrollToActiveMatch(editor)
        }
        return true
      },

      replaceCurrentMatch: (replacement) => ({ state, tr, dispatch, editor }) => {
        const s = searchPluginKey.getState(state)
        const match = s?.results[s.activeIndex]
        if (!match) return false
        if (dispatch) {
          replaceRange(tr, state.doc, state.schema, match, replacement)
          // Tras reemplazar, saltamos a la primera coincidencia posterior al texto nuevo
          // (evita quedarse atascado si el reemplazo contiene el propio término buscado).
          tr.setMeta(searchPluginKey, { jumpToPos: match.from + replacement.length })
          scrollToActiveMatch(editor)
        }
        return true
      },

      replaceAllMatches: (replacement) => ({ state, tr, dispatch }) => {
        const s = searchPluginKey.getState(state)
        if (!s || !s.results.length) return false
        if (dispatch) {
          // De atrás hacia adelante, para que las posiciones anteriores no se muevan.
          for (let i = s.results.length - 1; i >= 0; i--) {
            replaceRange(tr, state.doc, state.schema, s.results[i], replacement)
          }
        }
        return true
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: searchPluginKey,

        state: {
          init() {
            return {
              term: '',
              caseSensitive: false,
              results: [],
              activeIndex: 0,
              decorations: DecorationSet.empty,
            }
          },

          apply(tr, prev, _oldState, newState) {
            const meta = tr.getMeta(searchPluginKey)
            if (!meta && !tr.docChanged) return prev

            let { term, caseSensitive, activeIndex } = prev

            if (meta?.term !== undefined) {
              term = meta.term
              activeIndex = 0
            }
            if (meta?.caseSensitive !== undefined) {
              caseSensitive = meta.caseSensitive
              activeIndex = 0
            }
            if (meta?.activeIndex !== undefined) {
              activeIndex = meta.activeIndex
            }

            const results = findMatches(newState.doc, term, caseSensitive)

            if (meta?.jumpToPos !== undefined) {
              const next = results.findIndex((r) => r.from >= meta.jumpToPos)
              activeIndex = next === -1 ? 0 : next
            }

            if (activeIndex >= results.length) activeIndex = 0

            return {
              term,
              caseSensitive,
              results,
              activeIndex,
              decorations: buildDecorations(newState.doc, results, activeIndex),
            }
          },
        },

        props: {
          decorations(state) {
            return searchPluginKey.getState(state)?.decorations ?? DecorationSet.empty
          },
        },
      }),
    ]
  },
})