# Investigación (Fase 0): Ordenar el catálogo de destinos

No quedaban marcas `NEEDS CLARIFICATION` en el contexto técnico; este documento registra las decisiones de diseño.

## D1. Dónde vive la lógica

- **Decisión**: módulo nuevo `frontend/src/destination-sorting.js` de funciones puras.
- **Justificación**: la constitución (I) exige lógica de orden en módulos `.js` puros sin React; el patrón del repositorio es un módulo por responsabilidad. Se prueba con `node --test` sin navegador.
- **Alternativas**: añadirlo a `destination-filters.js` (mezcla filtrar con ordenar y agranda un archivo ya probado); ordenar dentro de `main.jsx` (no se puede probar sin navegador).

## D2. Cómo se garantiza que no se muta la entrada

- **Decisión**: `[...destinations].sort(comparador)`; para «Orden del catálogo» y para valores desconocidos se devuelve una copia `[...destinations]`.
- **Justificación**: constitución (I) y FR-009. Devolver siempre un arreglo nuevo hace uniforme el contrato.
- **Alternativas**: devolver la misma referencia en el orden por defecto (más barato, pero contrato menos uniforme y riesgo de mutación aguas abajo).

## D3. Estabilidad y desempate

- **Decisión**: apoyarse en que `Array.prototype.sort` es estable (ECMAScript 2019, Node 22). Comparadores de precio que devuelven `a.price - b.price` (ascendente) y `b.price - a.price` (descendente), sin invertir el arreglo.
- **Justificación**: FR-006 pide que los empates conserven el orden del catálogo en todos los órdenes, también en descendente. Invertir el resultado ascendente rompería ese desempate; un comparador descendente propio lo conserva.
- **Alternativas**: ordenar por `[precio, índice]` explícito (innecesario con sort estable); `reverse()` para descendente (invierte los empates, incumple FR-006).

## D4. Comparación de nombres

- **Decisión**: un `Intl.Collator("es", { sensitivity: "base" })` compartido, usado como `collator.compare(a.name, b.name)`.
- **Justificación**: FR-005 pide alfabeto español sin distinguir mayúsculas; con `sensitivity: "base"`, «Á» y «A» se tratan como iguales en el primer nivel y los nombres con tildes quedan junto a su letra base. Es coherente con `localeCompare(..., "es")` ya usado en `getMunicipalities`. Si dos nombres comparan igual, manda el orden del catálogo (D3).
- **Alternativas**: `localeCompare` sin opciones (distingue acentos como desempate y depende de la configuración regional por defecto); `toLowerCase()` + `<` (no respeta el alfabeto español).
- **Nota**: el resultado esperado con el catálogo actual (Centro, Desierto, Estrecho, Malecón, Parque, Represa, Salto, Termales) se fija en las pruebas.

## D5. Identidad del «orden del catálogo»

- **Decisión**: el orden del catálogo es la secuencia de entrada; no se reordena por `id` dentro del módulo.
- **Justificación**: tanto la API como `fallback-destinations.json` ya entregan los destinos por identificador (el catálogo es idéntico por la prueba del backend). Así el módulo es independiente de la forma del `id` y el desempate «orden del catálogo» coincide con la posición de entrada.
- **Alternativas**: ordenar por `id` en el módulo (acopla el módulo a un campo que no necesita).

## D6. Dónde se aplica el orden en la vista

- **Decisión**: después de `filtered` (que ya incluye «Solo favoritos»), con `useMemo` sobre `[filtered, sortKey]`.
- **Justificación**: FR-007 y FR-008. Los filtros deciden el conjunto y el orden solo la secuencia; el estado `sortKey` es independiente, de modo que cambiar un filtro lo conserva y cambiar el catálogo (API ↔ demostración) también (FR-010). No se reinicia en el efecto de `municipalities`.
- **Alternativas**: incluir el orden dentro de `filterDestinations` (haría que el orden fuera «un filtro» y complicaría su firma y sus pruebas existentes).

## D7. Anuncio a lectores de pantalla

- **Decisión**: el mensaje se calcula en el manejador `onChange` del selector con `sortAnnouncement(key, filtered.length)` y se guarda en un estado `sortMessage` mostrado en `<p role="status" aria-live="polite">`.
- **Justificación**: la aclaración del 2026-11-24 exige anunciar solo al cambiar el orden. Calcularlo en el manejador, y no derivarlo del estado, evita que un cambio de filtro lo regenere. La cantidad de destinos es la misma con cualquier orden (FR-007). Se usa la misma convención de regiones de estado que ya tiene el costo máximo y los favoritos.
- **Alternativas**: `useEffect` sobre `[sortKey, filtered]` (anunciaría al cambiar filtros, contra la aclaración); `aria-live="assertive"` (intrusivo, contra FR-012).
- **Redacción**: «Ordenado por <criterio>. N destinos.» con singular «1 destino»; el texto exacto por opción está en el contrato.

## D8. Control de selección

- **Decisión**: `<select>` nativo con `<label>` asociado «Ordenar por», sin ARIA adicional.
- **Justificación**: un `<select>` nativo ya es operable con teclado, conserva el foco al cambiar y lo leen bien los lectores de pantalla (FR-011). Es el mismo patrón del filtro de municipio.
- **Alternativas**: grupo de botones o `radiogroup` personalizado (más código y más riesgo de accesibilidad sin beneficio); una lista desplegable propia (innecesario).

## D9. Estilos

- **Decisión**: un bloque de reglas `.sort-filter` en `styles.css` que sigue a `.municipality-filter` (mismo borde, alto y `:focus-within`), más `:focus-visible` con el contorno naranja ya usado en el proyecto (`outline:3px solid #b35b08`).
- **Justificación**: coherencia visual y foco visible (FR-011) sin dependencias ni tokens nuevos.

## D10. Qué no se puede probar sin navegador

- **Decisión**: probar con `node --test` toda la lógica (orden, validación, mensajes, no mutación, combinación con `filterDestinations`, coincidencia API/local). El comportamiento de la vista (foco que permanece, que un cambio de filtro no anuncie, el recorrido con Tab) se verifica manualmente con [quickstart.md](quickstart.md).
- **Justificación**: el proyecto no tiene entorno de pruebas de componentes y no se añaden dependencias. Se mantiene la mayor cantidad de decisiones en funciones puras (p. ej. el texto del anuncio) para que lo manual sea mínimo.
- **Alternativas**: añadir `jsdom` o Playwright al proyecto (nueva dependencia, requiere aprobación).
