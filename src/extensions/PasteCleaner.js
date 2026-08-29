import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { cleanInvisibleCharacters } from '../utils/textCleaner'

export const PasteCleaner = Extension.create({
  name: 'pasteCleaner',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          transformPastedText(text) {
            return cleanInvisibleCharacters(text).cleaned
          },
          transformPastedHTML(html) {
            return cleanInvisibleCharacters(html).cleaned
          },
        },
      }),
    ]
  },
})