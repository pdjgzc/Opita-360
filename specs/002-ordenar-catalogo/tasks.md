---

description: "Lista de tareas de 002-ordenar-catalogo"
---

# Tareas: Ordenar el catálogo de destinos

**Entrada**: documentos de diseño en `specs/002-ordenar-catalogo/` (`plan.md`, `spec.md`, `data-model.md`, `contracts/sorting-module.md`, `research.md`, `quickstart.md`).

**Requisitos previos**: `plan.md` y `spec.md` (presentes).

**Pruebas**: obligatorias. La constitución (principio IV) y FR-015 exigen escribirlas antes de implementar y verlas **fallar** antes de escribir el código que las hace pasar. Cada grupo de pruebas nuevas va seguido de una tarea de «ver fallar» y, tras implementar, de una tarea de «ver pasar».

**Organización**: por historia de usuario, en el orden de prioridad de `spec.md`.

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes).
- **[USn]**: historia de usuario a la que pertenece la tarea.
- **Responsable** (al final de cada tarea): `dev-frontend`, `verificador` o `persona revisora`. `verificador` solo ejecuta y reporta (no edita ni corrige); la verificación manual en el navegador es de la `persona revisora`.
- Las rutas de `git` se limitan a `backend/` y `frontend/` (por ejemplo `git diff --stat -- backend/ frontend/`).

## Convenciones de rutas

- Frontend: `frontend/src/` (módulos puros y `main.jsx`) y `frontend/tests/` (`node --test`).
- Backend: **no se modifica** (FR-014); solo se ejecuta su suite como regresión.
- Comandos de frontend desde `frontend/`; comando de backend desde la raíz del repositorio.

## Citas de `data-model.md` (campos con restricciones)

Los campos con restricciones se citan en las tareas que los implementan, sin repetir sus reglas:

- `data-model.md` · `Opción de orden.key`, `Opción de orden.label`, `Opción de orden.announce` → T003, T005, T018, T020.
- `data-model.md` · `Destino.name`, `Destino.price` → T005.
- `data-model.md` · `sortKey` y `sortMessage` (Estado de la vista) → T007, T022.

## Trazabilidad FR/SC → tareas

| Requisito | Implementación | Pruebas / verificación |
|-----------|----------------|------------------------|
| FR-001, FR-002 | T005, T007, T008 | T003 (h), T029 |
| FR-003 | T007 | T029 (SC-003) |
| FR-004, FR-005, FR-006 | T005 | T003 (a)–(d) |
| FR-007, FR-008 | T007, T012, T013 | T010, T014, T029 |
| FR-009 | T005 | T003 (g) |
| FR-010 | T007 (`sortKey` independiente del catálogo) | T015, T016, T030 |
| FR-011 | T008, T023 | T031 |
| FR-012 | T020, T022 | T018, T019, T021, T031 |
| FR-013 | T005 | T003 (f), T018 |
| FR-014 | (sin cambios en `backend/`) | T017, T025, T027 |
| FR-015 | T003, T010, T015, T018 | T004, T006, T011, T014, T016, T019, T021 |
| FR-016 | T007 | T029 |
| FR-017 | T023 | T024, T026 |
| SC-001 | T005 | T003 (a), T029 |
| SC-002 | T007, T012 | T010 (b) |
| SC-003 | T007 | T029 |
| SC-004 | T020, T022 | T018, T031 |
| SC-005 | T005 | T003 (a), T030 |
| SC-006 | (sin modificar pruebas existentes) | T001, T025, T026, T028 |

---

## Fase 1: Preparación

**Propósito**: confirmar el punto de partida antes de tocar nada.

- [ ] T001 Ejecutar la línea base: `npm test` y `npm run build` en `frontend/`, y `python -B -m unittest discover -s backend/tests -v` desde la raíz; registrar conteo de pruebas y resultado (todo debe pasar antes de empezar). Responsable: verificador
- [ ] T002 [P] Comprobar que el árbol limpio no tiene cambios en las rutas del alcance: `git status --short -- backend/ frontend/` debe salir vacío. Responsable: verificador

---

## Fase 2: Fundamentos (bloqueante)

Esta funcionalidad no requiere infraestructura previa: no hay migraciones, dependencias nuevas ni cambios de backend. No hay tareas en esta fase; las historias pueden empezar tras la Fase 1.

---

## Fase 3: Historia de usuario 1 — Elegir el orden de las tarjetas (P1) 🎯 MVP

**Objetivo**: un selector «Ordenar por» con cuatro opciones que reordena las tarjetas; por defecto, el orden del catálogo.

**Prueba independiente**: con el catálogo completo y sin filtros, cada opción produce la secuencia del contrato (`contracts/sorting-module.md`, «Resultados esperados»).

### Pruebas de la historia 1 (escribir primero; deben fallar) ⚠️

- [ ] T003 [US1] Crear `frontend/tests/destination-sorting.test.js` con el estilo de `frontend/tests/destination-filters.test.js` (`node:test`, `assert/strict`, listas congeladas con `Object.freeze`) y pruebas de `sortDestinations`, `validSort`, `SORT_OPTIONS` y `DEFAULT_SORT` importados de `../src/destination-sorting.js`: (a) las cuatro secuencias del contrato ordenando el contenido real de `frontend/src/fallback-destinations.json` (SC-001, SC-005); (b) `price-desc` es el inverso exacto de `price-asc` con el catálogo actual; (c) desempate estable por precio igual con una lista sintética, también en `price-desc` (no se invierte); (d) nombres con tildes, eñes y mayúsculas, incluido que «Estrecho» va antes que «Malecón» y que un nombre con «Á» se ordena junto a la «A»; (e) lista vacía y un solo elemento; (f) clave desconocida, `undefined`, `null` y no cadena tratadas como `catalog` (FR-013); (g) la entrada congelada no se modifica, el resultado es un arreglo distinto, con los mismos objetos por referencia y es idempotente (FR-009); (h) `SORT_OPTIONS` tiene exactamente las cuatro opciones en el orden del contrato, con `key`, `label` y `announce` según `data-model.md` `Opción de orden.key`, `Opción de orden.label` y `Opción de orden.announce`, y `DEFAULT_SORT === "catalog"`. Responsable: dev-frontend
- [ ] T004 [US1] Ver fallar T003: ejecutar `node --test tests/destination-sorting.test.js` en `frontend/` y registrar el fallo (el módulo `destination-sorting.js` no existe). Si la prueba pasara o fallara por otra causa, detenerse y corregir la prueba. Responsable: verificador

### Implementación de la historia 1

- [ ] T005 [US1] Crear `frontend/src/destination-sorting.js` con las exportaciones `SORT_OPTIONS` (arreglo congelado; `key`, `label`, `announce` según `data-model.md` `Opción de orden.key`, `Opción de orden.label` y `Opción de orden.announce`), `DEFAULT_SORT`, `validSort(key)` y `sortDestinations(destinations, key)` según `contracts/sorting-module.md` §1 (copia con `[...destinations].sort(...)`, `Intl.Collator("es", { sensitivity: "base" })` sobre `data-model.md` · `Destino.name`, precio sobre `data-model.md` · `Destino.price`, empates por orden de entrada, sin React ni mutación). `sortAnnouncement` se añade en T015. Responsable: dev-frontend
- [ ] T006 [US1] Ver pasar T003: ejecutar `node --test tests/destination-sorting.test.js` en `frontend/`; deben pasar todas las pruebas de la historia 1. Responsable: verificador
- [ ] T007 [US1] En `frontend/src/main.jsx`: importar `DEFAULT_SORT`, `SORT_OPTIONS` y `sortDestinations` desde `./destination-sorting.js` (sin tocar el filtro existente); declarar `const [sortKey, setSortKey] = useState(DEFAULT_SORT)` (`data-model.md` `sortKey`); derivar `visible = useMemo(() => sortDestinations(filtered, sortKey), [filtered, sortKey])`; generar las tarjetas con `visible.map((d, i) => …)` conservando `i + 1` como numeración (FR-016); mantener el mensaje de «sin resultados» con la misma condición de hoy (`filtered.length === 0`). Responsable: dev-frontend
- [ ] T008 [US1] En `frontend/src/main.jsx`: añadir dentro de `.filter-row`, tras el filtro de municipio, un `<div className="sort-control">` que contiene `<label className="municipality-filter sort-filter" htmlFor="sort-order">` con el icono `ArrowUpDown` de `lucide-react` (añadirlo a la importación existente, con `aria-hidden="true"`), `<span>Ordenar por</span>` y `<select id="sort-order">` cuyas opciones salen de `SORT_OPTIONS` (`label` como texto, `key` como valor), `value={sortKey}` y `onChange` que define `const next = validSort(event.target.value)` y llama a `setSortKey(next)` (importar `validSort`). El label va dentro de un contenedor `<div className="sort-control">` (que en la historia 4 también recibirá el `<p role="status">`, para que el anuncio quede debajo del selector); el contenedor es el elemento que se coloca dentro de `.filter-row`, tras el filtro de municipio. Sin mover el foco. El anuncio se añade en la historia 4. Responsable: dev-frontend
- [ ] T009 [US1] Comprobar que la compilación no se rompe: `npm run build` en `frontend/`. Responsable: verificador

**Punto de control**: la historia 1 funciona sola (módulo probado y selector operativo); falta la verificación manual en T029.

---

## Fase 4: Historia de usuario 2 — Combinar el orden con los filtros (P1)

**Objetivo**: el orden se aplica sobre el resultado de los filtros existentes sin añadir ni quitar destinos; «solo favoritos» pasa a una función pura probable sin navegador.

**Prueba independiente**: para varias combinaciones de filtros, el conjunto de destinos es el mismo con los cuatro órdenes y solo cambia la secuencia.

### Pruebas de la historia 2 (escribir primero; deben fallar) ⚠️

- [ ] T010 [US2] Añadir a `frontend/tests/destination-sorting.test.js` (importando `filterFavorites` de `../src/destination-filters.js` y las funciones existentes de ese módulo) pruebas de: (a) `filterFavorites` según `contracts/sorting-module.md` §1b: con `onlyFavorites` verdadero devuelve un arreglo nuevo con solo los favoritos en su orden de entrada; con falso devuelve la lista tal cual; `favoriteIds` que no es arreglo se trata como vacío; sin favoritos → `[]`; entradas congeladas no se modifican; (b) combinación con cada filtro existente (búsqueda, categoría, municipio, costo máximo y favoritos) aplicando `sortDestinations` al resultado de `filterDestinations`/`filterFavorites`: con las cuatro claves el conjunto de identificadores es idéntico y solo cambia la secuencia (FR-007, SC-002); (c) categoría «Cultura» + `price-asc` → Malecón, Centro de Neiva, Parque Arqueológico; (d) favoritos + orden de precio → solo favoritos ordenados por precio; (e) combinación sin resultados + cualquier orden → `[]` sin error. Responsable: dev-frontend
- [ ] T011 [US2] Ver fallar T010: ejecutar `node --test tests/destination-sorting.test.js` en `frontend/`. Como `filterFavorites` aún no está exportada, el `import` estático falla al cargar el archivo (`SyntaxError` por export inexistente) y **falla todo el archivo**, incluidas las pruebas de la historia 1 (no se ejecuta ninguna). Registrar ese fallo tal cual; si falla por otra causa, detenerse y corregir la prueba. Responsable: verificador

### Implementación de la historia 2

- [ ] T012 [US2] Añadir y exportar `filterFavorites(destinations, favoriteIds, onlyFavorites)` en `frontend/src/destination-filters.js` según `contracts/sorting-module.md` §1b, sin modificar ninguna función existente de ese archivo. Responsable: dev-frontend
- [ ] T013 [US2] En `frontend/src/main.jsx` (línea del `useMemo` de `filtered`, hoy con el filtro en línea de favoritos): reemplazar `onlyFavorites ? matches.filter(...) : matches` por `filterFavorites(matches, favorites.ids, onlyFavorites)`, importando `filterFavorites` junto a `filterDestinations`; sin cambiar el comportamiento ni las dependencias del `useMemo`. El orden queda fuera de `filtered`. Responsable: dev-frontend
- [ ] T014 [US2] Ver pasar T010 y la regresión: `npm test` y `npm run build` en `frontend/`; deben pasar las pruebas nuevas y todas las existentes sin modificarlas. Responsable: verificador

**Punto de control**: las historias 1 y 2 funcionan juntas; falta la verificación manual en T029.

---

## Fase 5: Historia de usuario 3 — Mismo comportamiento con la API y en modo demostración (P2)

**Objetivo**: la misma clave produce el mismo orden con el catálogo local y con el de la API, y se conserva al pasar de uno a otro (FR-010).

**Prueba independiente**: ordenar el contenido real de `fallback-destinations.json` con cada opción y aplicar la misma clave a dos listas sucesivas.

### Pruebas de la historia 3 (escribir primero; deben fallar, con mutación temporal) ⚠️

- [ ] T015 [US3] Añadir a `frontend/tests/destination-sorting.test.js` pruebas de la conservación de la clave al cambiar de lista (FR-010): con una misma clave (`price-desc`), `sortDestinations` aplicado a una lista local y luego a una lista distinta produce para cada una la secuencia que esa clave define; y que ni `sortDestinations` ni `validSort` guardan estado entre llamadas. Las secuencias sobre el `fallback-destinations.json` real ya se cubren en T003 (a). Responsable: dev-frontend
- [ ] T016 [US3] Ver fallar T015 con una **mutación temporal** del código (como en la funcionalidad 001), porque `sortDestinations` ya existe y las pruebas no fallarían solas. (1) `dev-frontend` aplica en `frontend/src/destination-sorting.js` una mutación, por ejemplo que `sortDestinations` ignore la clave y devuelva siempre el orden de entrada, o que ordene la entrada en su sitio; (2) `verificador` ejecuta `node --test tests/destination-sorting.test.js` en `frontend/` y registra qué pruebas de T015 fallan y por qué (si no falla ninguna, la prueba no protege la garantía 8: «el resultado depende solo de la clave y de la lista recibida; la misma clave aplicada a otra lista produce la secuencia que esa clave define para esa lista», `contracts/sorting-module.md` §1, y se corrige T015); (3) `dev-frontend` **revierte** la mutación; (4) `verificador` vuelve a ejecutar y confirma que todo pasa y que `git diff -- frontend/src/destination-sorting.js` no contiene rastro de la mutación. Responsable: dev-frontend (mutación y reversión) y verificador (ejecución y registro)
- [ ] T017 [US3] Comprobar sin cambios la regresión de la igualdad API = JSON: `python -B -m unittest backend.tests.test_review_fixes -v` desde la raíz (no se modifica ningún archivo de `backend/`). Responsable: verificador

### Implementación de la historia 3

No hay código de producción nuevo: el orden depende solo de la clave y de la lista (garantía 8) y `sortKey` no se reinicia al cambiar el catálogo (T007). La comprobación en la página se hace en T030.

**Punto de control**: la conservación de la clave está cubierta por prueba de lógica.

---

## Fase 6: Historia de usuario 4 — Teclado y lectores de pantalla (P2)

**Objetivo**: el selector se opera solo con teclado, tiene etiqueta «Ordenar por» y al cambiar el orden se anuncia el orden y la cantidad de destinos, sin anunciar por cambios de filtro.

**Prueba independiente**: recorrido solo con teclado hasta el selector, cambio de opción y comprobación del anuncio (`quickstart.md` §5).

### Pruebas de la historia 4 (escribir primero; deben fallar) ⚠️

- [ ] T018 [US4] Añadir a `frontend/tests/destination-sorting.test.js` pruebas de `sortAnnouncement(key, count)` según `contracts/sorting-module.md` «Garantías de `sortAnnouncement`»: el texto de cada opción (`data-model.md` `Opción de orden.announce`) con 8 destinos («… 8 destinos.»); singular con 1 («… 1 destino.»); plural con 3; `0` → «… 0 destinos.»; `count` inválido (`NaN`, negativo, decimal, `undefined`, texto) devuelve solo el `announce` sin lanzar; clave desconocida o ausente anuncia «Ordenado por el orden del catálogo.». Responsable: dev-frontend
- [ ] T019 [US4] Ver fallar T018: ejecutar `node --test tests/destination-sorting.test.js` en `frontend/`. Como `sortAnnouncement` aún no está exportada, el `import` estático falla al cargar el archivo (`SyntaxError` por export inexistente) y **falla todo el archivo**, incluidas las pruebas de las historias 1 a 3. Registrar ese fallo tal cual; si falla por otra causa, detenerse y corregir la prueba. Responsable: verificador

### Implementación de la historia 4

- [ ] T020 [US4] Añadir y exportar `sortAnnouncement(key, count)` en `frontend/src/destination-sorting.js` según el contrato (usa `validSort(key)` y `Opción de orden.announce` de `data-model.md`; singular/plural). Responsable: dev-frontend
- [ ] T021 [US4] Ver pasar T018: `node --test tests/destination-sorting.test.js` en `frontend/`; deben pasar todas las pruebas del archivo. Responsable: verificador
- [ ] T022 [US4] En `frontend/src/main.jsx`: añadir `const [sortMessage, setSortMessage] = useState("")` (`data-model.md` `sortMessage`); en el `onChange` del selector (T008) llamar además a `setSortMessage(sortAnnouncement(next, filtered.length))` con `next` (definido en T008); añadir `useEffect(() => setSortMessage(""), [filtered])` para retirar el mensaje en **cualquier recálculo de `filtered`** (cambio de filtro, marcar o desmarcar un favorito aunque «Solo favoritos» esté apagado, y la llegada del catálogo de la API); añadir dentro del `<div className="sort-control">` de T008, inmediatamente después del label, `<p role="status" aria-live="polite">{sortMessage}</p>`, de modo que el anuncio quede debajo del selector. Ningún filtro establece `sortMessage`; elegir la misma opción no emite cambio y no anuncia. Responsable: dev-frontend
- [ ] T023 [US4] En `frontend/src/styles.css` añadir reglas mínimas nuevas, sin modificar ni agrupar la regla `.municipality-filter`: `.sort-filter select:focus-visible { outline: 3px solid #b35b08; }` `.sort-control { display: flex; flex-direction: column; gap: 4px; }` para el contenedor y el estilo del `<p>` de estado del selector (`.sort-control p`), con `font-size` ≥ 12px y contraste ≥ 4.5:1 (FR-017). No modificar `frontend/tests/performance-a11y.test.js`. Responsable: dev-frontend
- [ ] T024 [US4] Verificar estilos y regresión: `npm test` (incluye `performance-a11y.test.js` sin modificarlo) y `npm run build` en `frontend/`. Responsable: verificador

**Punto de control**: las cuatro historias están implementadas; falta la verificación manual.

---

## Fase 7: Pulido y verificación final

- [ ] T025 [P] Regresión completa del backend: `python -B -m unittest discover -s backend/tests -v` desde la raíz; todo debe pasar (SC-006). Responsable: verificador
- [ ] T026 [P] Regresión completa del frontend: `npm test` y `npm run build` en `frontend/`; reportar comando, resultado y conteo de pruebas. Responsable: verificador
- [ ] T027 Comprobar el alcance de los cambios: `git diff --stat -- backend/ frontend/` y `git status --short -- backend/ frontend/`; el backend y `frontend/src/fallback-destinations.json` no deben aparecer, y las únicas rutas cambiadas deben ser `frontend/src/destination-sorting.js`, `frontend/src/destination-filters.js`, `frontend/src/main.jsx`, `frontend/src/styles.css` y `frontend/tests/destination-sorting.test.js`. Responsable: verificador
- [ ] T028 Revisar la trazabilidad FR-001…FR-017 → tareas/pruebas de este archivo y `contracts/sorting-module.md` §3, y que ninguna prueba existente fue modificada (`git diff --stat -- frontend/tests/`). Responsable: verificador
- [ ] T029 Verificación manual en el navegador, `quickstart.md` §3 (pasos 1–9): `npm run dev` en `frontend/` y comprobar secuencias, numeración visible 01…08, combinación con filtros y «sin resultados». Comprobar también SC-003: el reordenamiento ocurre con una sola acción, en menos de 1 segundo y sin recarga de la página. Responsable: persona revisora
- [ ] T030 Verificación manual de modo demostración y API, `quickstart.md` §4: 4.1 (backend apagado, aviso «Modo demostración», mismas secuencias), 4.2 (backend encendido, mismas secuencias) y 4.3 (cambio de fuente: elegir «Precio: mayor a menor» con la consulta inicial pendiente y comprobar que el orden se conserva al llegar el catálogo de la API) o, si no se logra la ventana de tiempo, la revisión de que ningún efecto de `main.jsx` escribe `sortKey`. Responsable: persona revisora
- [ ] T031 Verificación manual de teclado y lector de pantalla, `quickstart.md` §5 (pasos 1–6): foco visible, etiqueta «Ordenar por», anuncio con cantidad correcta, mensaje retirado al cambiar un filtro o un favorito. Responsable: persona revisora
- [ ] T032 Revisión final: confirmar los criterios de aceptación de `quickstart.md` y autorizar o rechazar el commit de la funcionalidad (nadie hace commit, push ni PR sin esa autorización). Responsable: persona revisora

---

## Dependencias y orden de ejecución

### Dependencias entre fases

- **Preparación (Fase 1)**: sin dependencias.
- **Fundamentos (Fase 2)**: vacía.
- **Historias (Fases 3–6)**: dependen de la Fase 1. Todas tocan `frontend/tests/destination-sorting.test.js` y `frontend/src/main.jsx`, por lo que se ejecutan **en orden** US1 → US2 → US3 → US4 (no en paralelo entre sí).
- **Pulido (Fase 7)**: depende de las cuatro historias.

### Dependencias entre historias

- **US1 (P1)**: independiente; entrega el MVP.
- **US2 (P1)**: usa `sortDestinations` y el `visible` de US1; añade `filterFavorites`.
- **US3 (P2)**: solo pruebas; depende de T005 y T007.
- **US4 (P2)**: añade `sortAnnouncement` en el módulo de US1 y el anuncio sobre el selector de T008.

### Dentro de cada historia

- Pruebas → verlas fallar → implementar → verlas pasar. En US3 no hay código nuevo que implementar: el fallo se registra con una mutación temporal que luego se revierte (T016).
- Módulo puro antes de `main.jsx`; `main.jsx` antes de estilos.

### Oportunidades de paralelismo

- T001 y T002 (Fase 1, solo lectura).
- T025 y T026 (Fase 7, solo lectura).
- Dentro de las historias casi no hay paralelismo útil: comparten archivo. La suite de backend (T017, T025) puede correr mientras `dev-frontend` trabaja, porque no comparte archivos.

### Ejemplo de ejecución en paralelo

```text
# Fase 1
Tarea: "T001 línea base de pruebas y build"      (verificador)
Tarea: "T002 estado limpio de backend/ y frontend/" (verificador)

# Fase 7
Tarea: "T025 regresión del backend"   (verificador)
Tarea: "T026 regresión del frontend"  (verificador)
```

---

## Estrategia de implementación

### Primero el MVP (solo historia 1)

1. Fase 1 → T003–T009 (módulo probado y selector).
2. **Detenerse y validar**: `npm test`, `npm run build` y revisión manual rápida (T029, pasos 1–5).

### Entrega incremental

1. US1: el selector ordena.
2. US2: combinación garantizada con filtros y favoritos.
3. US3: conservación y paridad API/demo.
4. US4: teclado y anuncio.
5. Fase 7: regresión, alcance y verificación manual.

---

## Notas

- Orden estricto de la constitución (IV): cada prueba nueva se escribe, se ve fallar (T004, T011, T016, T019) y solo entonces se implementa; no hay excepciones. En T016 el fallo se obtiene con una mutación temporal que se revierte y se verifica.
- `verificador` solo ejecuta y reporta; si algo falla, lo corrige `dev-frontend` y se vuelve a verificar.
- No se hace commit, push, PR ni merge sin autorización de la persona revisora (T032). El gancho opcional `speckit.git.commit` de `after_tasks` no se ejecuta.
- Sin cambios en `backend/` ni en `fallback-destinations.json` (FR-014).
