---
name: revision-artefactos
description: Lista de qué revisar en la salida de cada paso de Spec Kit (constitution, specify, clarify, plan, checklist, tasks, analyze, implement, converge) antes de aceptarla. Úsala al terminar cada paso y antes de hacer el commit de ese paso.
---

# Revisión de artefactos de Spec Kit

Spec Kit genera; la persona revisa. Esta lista dice qué mirar en cada paso y
cómo dejar evidencia de lo corregido.

## Por paso

| Paso | Archivo | Qué revisar |
|------|---------|-------------|
| constitution | `.specify/memory/constitution.md` | Cada principio corresponde a algo que el código ya hace; versión y fecha correctas; sin reglas que contradigan la forma de trabajo de la rama. |
| specify | `specs/NNN/spec.md`, `checklists/requirements.md` | Requisitos FR-NNN verificables; sin detalles de implementación; criterios de éxito medibles; casos borde; como máximo 3 `[NEEDS CLARIFICATION]`. |
| clarify | `spec.md` (sección Clarifications) | Cada respuesta quedó escrita en el requisito que afecta, no solo en la lista de preguntas. |
| plan | `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` | Rutas y comandos existen en el repo; el Constitution Check está completo; no se añaden dependencias. |
| checklist | `checklists/<tema>.md` | Los ítems prueban la calidad de los requisitos («¿está definido…?»), no la implementación; cada ítem marcado tiene respaldo en la spec. |
| tasks | `tasks.md` | Formato `- [ ] TNNN`; pruebas antes de la implementación; rutas exactas; cada FR cubierto por al menos una tarea. |
| analyze | informe en la conversación | Ningún hallazgo CRITICAL; los HIGH se corrigen en el artefacto de origen antes de implementar. |
| implement | código y pruebas | Las pruebas nuevas se vieron fallar antes; todas pasan después; tareas `[X]` solo si su prueba pasa. |
| converge | `tasks.md` (tareas añadidas) | El veredicto es «Converged» o las tareas añadidas se resolvieron. |

## Evidencia

- Un commit por paso con el prefijo del paso (`speckit-specify: …`).
- Si corriges algo de la salida del agente, haz un commit aparte
  `speckit-<paso> (revisión): …` que diga qué estaba mal y por qué.
