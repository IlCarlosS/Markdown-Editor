# Editor Markdown

Editor de texto visual (WYSIWYG) para archivos `.md` y `.mdx`, construido con Vue 3 y Tiptap. Escribe con una interfaz enriquecida — similar a Word o Google Docs — mientras el archivo se guarda como Markdown limpio y compatible por debajo.

## El problema que resuelve

Escribir Markdown a mano es rápido para quienes ya dominan la sintaxis, pero para usuarios novatos suele ser una fuente constante de errores pequeños y frustrantes:

- Olvidar cerrar un `**` o un `_` y romper el formato de todo el párrafo siguiente.
- Perder la cuenta de columnas al armar una tabla con `|` y `-` a mano.
- Escribir mal la sintaxis de un enlace o una imagen (`[texto](url)` vs `![alt](url)`).

Este editor elimina esa fricción: el usuario ve el texto ya formateado mientras escribe (negritas, tablas, listas, citas), y el archivo `.md` resultante se genera automáticamente, sin que la persona necesite conocer la sintaxis subyacente.

## Características

- **Edición WYSIWYG real**: lo que ves es el documento formateado, no símbolos de Markdown crudo.
- **Abrir, guardar y crear archivos** `.md`**/**`.mdx` directamente desde el navegador (usando la File System Access API, con fallback de descarga para navegadores sin soporte).
- **Formato de texto**: negrita, cursiva, subrayado, tachado, código en línea.
- **Encabezados** (H1–H3), citas, listas con viñetas, numeradas y de tareas (checkboxes).
- **Tablas editables**: inserción con selección de tamaño (filas/columnas), agregar/eliminar filas y columnas, redimensionar columnas, eliminar tabla completa.
- **Enlaces e imágenes** mediante diálogos simples, sin escribir sintaxis.
- **Bloques de código** con estilo diferenciado del texto normal.
- **Modo claro/oscuro** con persistencia de preferencia (`localStorage`) y detección de preferencia del sistema.
- **Confirmaciones no destructivas**: aviso visual antes de perder cambios sin guardar al crear o abrir un archivo nuevo.
- **Indicador de estado del archivo**: nombre del documento actual y aviso de cambios sin guardar.

## Tecnologías utilizadas

| Categoría | Herramienta |
| --- | --- |
| Framework | [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/) |
| Motor de edición | [Tiptap](https://tiptap.dev/) (sobre ProseMirror) |
| Serialización Markdown | [tiptap-markdown](https://github.com/aguingand/tiptap-markdown) |
| Estilos | [Tailwind CSS v4](https://tailwindcss.com/) + [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography) |
| Íconos | [Lucide](https://lucide.dev/) (`lucide-vue-next`) |
| Persistencia de archivos | File System Access API (nativa del navegador) |
| Despliegue | GitHub Pages |

## Estructura del proyecto

```
markdown-editor/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   └── Toolbar.vue          # Barra de herramientas de edición
│   │   ├── Layout/
│   │   │   └── Header.vue           # Encabezado: marca, estado del archivo, tema
│   │   └── UI/
│   │       ├── Modal.vue            # Modal genérico reusable
│   │       ├── ConfirmModal.vue     # Confirmaciones (perder cambios, etc.)
│   │       ├── TableInsertModal.vue # Selección de tamaño al insertar tabla
│   │       └── InfoModalContent.vue # Contenido del modal de información
│   ├── composables/
│   │   ├── useMarkdownEditor.js     # Configuración del editor Tiptap
│   │   ├── useFileSystem.js         # Lógica de nuevo/abrir/guardar archivo
│   │   ├── useTheme.js              # Lógica de modo claro/oscuro
│   │   ├── useConfirm.js            # Modal de confirmación (patrón Promise)
│   │   └── useTableInsert.js        # Modal de tamaño de tabla (patrón Promise)
│   ├── App.vue
│   ├── main.js
│   └── style.css                    # Variables de diseño + integración Tailwind
├── index.html
└── vite.config.js
```

## Lógica y arquitectura 

El proyecto separa responsabilidades en tres capas: 

- **Composables** (`src/composables/`): contienen toda la lógica de negocio, independiente de cómo se ve en pantalla: 
  - `useMarkdownEditor` configura Tiptap: qué extensiones están activas (tablas, imágenes, enlaces, listas de tareas), cómo se ve el contenido, y qué pasa cuando el usuario escribe. 
  - `useFileSystem` maneja crear, abrir y guardar archivos, incluyendo el aviso de cambios sin guardar. 
  - `useTheme` y `useConfirm`/`useTableInsert` usan un patrón de estado compartido a nivel de módulo (similar a un singleton): el estado vive fuera de la función exportada, así que cualquier componente que use el composable ve y modifica el mismo estado, sin necesidad de una librería de gestión de estado como Pinia. 


- **\*Modales por Promesa**: en lugar de usar `confirm()`/`alert()` nativos del navegador, `useConfirm` y `useTableInsert` exponen una función que retorna una `Promise`. Cualquier parte del código puede hacer `const respuesta = await confirmAction({...})` y el flujo se pausa hasta que el usuario interactúa con el modal visual correspondiente — mismo patrón que un diálogo nativo, pero con la interfaz propia del proyecto. 
- **Componentes (**`src/components/`**)** son mayormente "tontos": reciben datos y funciones por props, y se limitan a mostrar UI y emitir eventos. La lógica real vive en los composables. 

## Instalación y uso local 

```
git clone 
cd markdown-editor 
npm install 
npm run dev 
```

Para generar el build de producción: 

```
bash npm run build  
```

## Licencia 

Este proyecto está bajo la licencia MIT — libre para usar, modificar y distribuir. 

## Créditos 

Construido con: 

- [Tiptap ](https://tiptap.dev/)y el ecosistema [ProseMirror](https://prosemirror.net/)  
- [tiptap-markdown](https://github.com/aguingand/tiptap-markdown) por Nathan Vögel
- [Vue.js](https://vuejs.org/) y [Vite](https://vitejs.dev/) 
- [Tailwind CSS](https://tailwindcss.com/)  
- [Lucide Icons](https://lucide.dev/) 
- Desarrollado por **Carlos Solis (@IlCarlosS)** como proyecto personal y portafolio.
