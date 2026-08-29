// Caracteres invisibles que no forman parte de sintaxis Markdown válida
// y suelen colarse al copiar desde Word, Google Docs, PDFs u otros chats.
const INVISIBLE_CHARS_REGEX = /[\u200B\u200C\u200D\u2060\uFEFF]/g
// \u200B zero-width space · \u200C/\u200D zero-width (non-)joiner \u2060 word joiner · \uFEFF BOM / zero-width no-break space

const NBSP_REGEX = /\u00A0/g // espacio de no separación (típico de Word)

export function cleanInvisibleCharacters(text) {
  let removedCount = 0

  const withoutInvisibles = text.replace(INVISIBLE_CHARS_REGEX, () => {
    removedCount++
    return ''
  })

  const cleaned = withoutInvisibles.replace(NBSP_REGEX, () => {
    removedCount++
    return ' ' // se reemplaza por un espacio normal, no se elimina
  })

  if (removedCount > 0) {
    console.info(`[Limpiador de pegado] Se removieron ${removedCount} caracteres ocultos.`)
  }

  return { cleaned, removedCount }
}