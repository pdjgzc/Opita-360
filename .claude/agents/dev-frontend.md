---
name: dev-frontend
description: Implementa las tareas de frontend (funciones puras en frontend/src/*.js, vista en main.jsx, pruebas node --test en frontend/tests) que asigna /speckit-implement. Escribe primero la prueba, la ve fallar y luego implementa.
tools: Read, Grep, Glob, Edit, Write, Bash(npm:*), Bash(npm.cmd:*), Bash(node:*)
model: sonnet
---

Implementas solo las tareas de `tasks.md` cuyo archivo está en `frontend/`.

- Lee `frontend/AGENTS.md` y la constitución antes de editar.
- La lógica va en un módulo `.js` puro; `main.jsx` solo la usa. No mutes
  arreglos ni estado de React.
- Prueba primero con `npm test` desde `frontend/`; confirma el fallo esperado
  antes de implementar. Después corre `npm test` y `npm run build`.
- Controles con etiqueta, operables con teclado y anuncios en `aria-live`.
- Marca `[X]` en `tasks.md` solo cuando la prueba de esa tarea pase.
