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
- **Justificación**: FR-005 pide alfabeto español sin distinguir mayúsculas; con `sensitivity: "base"`, «Á», «A» y «a» comparan iguales y los nombres con tildes quedan junto a su letra base. Usa el mismo alfabeto (`"es"`) que `getMunicipalities`, pero **no es equivalente** a su `localeCompare(b, "es")`: este, sin opciones, usa la sensibilidad por defecto (`variant`), que sí distingue tildes y mayúsculas como desempate. Aquí se prefiere `base` para que esos empates los resuelva el orden del catálogo (FR-006, D3) y no la tilde o la mayúscula. El resultado sería el mismo con `a.name.localeCompare(b.name, "es", { sensitivity: "base" })`; se usa un `Collator` compartido para no recrear las opciones en cada comparación. Si dos nombres comparan igual, manda el orden del catálogo (D3).
- **Alternativas**: `localeCompare(b, "es")` sin `sensitivity` (desempata por tilde y mayúscula, lo que contradice FR-006); `localeCompare` sin locale (depende de la configuración regional del navegador); `toLowerCase()` + `<` (no respeta el alfabeto español).
- **Nota**: el resultado esperado con el catálogo actual (Centro, Desierto, Estrecho, Malecón, Parque, Represa, Salto, Termales) se fija en las pruebas.

## D5. Identidad del «orden del catálogo»

- **Decisión**: el orden del catálogo es la secuencia de entrada; no se reordena por `id` dentro del módulo.
- **Justificación**: tanto la API como `fallback-destinations.json` ya entregan los destinos por identificador (el catálogo es idéntico por la prueba del backend). Así el módulo es independiente de la forma del `id` y el desempate «orden del catálogo» coincide con la posición de entrada.
- **Alternativas**: ordenar por `id` en el módulo (acopla el módulo a un campo que no necesita).

## D6. Dónde se aplica el orden en la vista

- **Decisión**: después de `filtered` (que ya incluye «Solo favoritos»), con `useMemo` sobre `[filtered, sortKey]`.
- **Justificación**: FR-007 y FR-008. Los filtros deciden el conjunto y el orden solo la secuencia; el estado `sortKey` es independiente, de modo que cambiar un filtro lo conserva y el paso del catálogo local al de la API, cuando termina la consulta inicial, también (FR-010; la página no tiene otra recarga de datos sin reiniciarse). No se reinicia en el efecto de `municipalities`. Las tarjetas se generan desde `visible` con su índice, así que la numeración sigue la posición visible (FR-016).
- **Alternativas**: incluir el orden dentro de `filterDestinations` (haría que el orden fuera «un filtro» y complicaría su firma y sus pruebas existentes).

## D7. Anuncio a lectores de pantalla

- **Decisión**: el mensaje se calcula en el manejador `onChange` del selector con `sortAnnouncement(key, filtered.length)` y se guarda en un estado `sortMessage` mostrado en `<p role="status" aria-live="polite">`, ubicado junto al selector. Un `useEffect` sobre `[filtered]` vacía `sortMessage` cuando cambia el resultado filtrado.
- **Justificación**: la aclaración del 2026-11-24 exige anunciar solo al cambiar el orden. Calcularlo en el manejador, y no derivarlo del estado, evita que un cambio de filtro lo regenere. Pero si el mensaje se quedara tras un cambio de filtro, la región seguiría mostrando una cantidad que ya no es cierta («8 destinos» con 3 tarjetas); vaciarla lo corrige y no genera anuncio (una región `aria-live` solo anuncia texto nuevo no vacío). El efecto no se dispara con el cambio de orden, porque `filtered` no depende de `sortKey`. La cantidad es la misma con cualquier orden (FR-007). Se usa la misma convención de regiones de estado que ya tiene el costo máximo y los favoritos.
- **Alternativas**: `useEffect` sobre `[sortKey, filtered]` que genere el mensaje (anunciaría al cambiar filtros, contra la aclaración); dejar el mensaje sin vaciar (cantidad desactualizada); `aria-live="assertive"` (intrusivo, contra FR-012).
- **Redacción**: «Ordenado por <criterio>. N destinos.» con singular «1 destino»; el texto exacto por opción está en el contrato.

## D8. Control de selección

- **Decisión**: `<select>` nativo con `<label htmlFor="sort-order">` que envuelve un icono `aria-hidden`, el texto «Ordenar por» en un `<span>` y el `<select>`, igual que el filtro de municipio; sin ARIA adicional.
- **Justificación**: un `<select>` nativo ya es operable con teclado, conserva el foco al cambiar y lo leen bien los lectores de pantalla (FR-011). Es la misma estructura del filtro de municipio. En JSX el atributo es `htmlFor`.
- **Alternativas**: grupo de botones o `radiogroup` personalizado (más código y más riesgo de accesibilidad sin beneficio); una lista desplegable propia (innecesario).

## D9. Estilos

- **Decisión**: el label lleva las dos clases, `municipality-filter sort-filter`, de modo que hereda borde, alto, color, `font-size:12px` y `:focus-within` de `.municipality-filter` sin duplicarlos. Solo se añaden reglas mínimas nuevas: `.sort-filter select:focus-visible` con el contorno naranja ya usado en el proyecto (`outline:3px solid #b35b08`) y una regla para el `<p>` de estado (`font-size` ≥ 12px, color de texto con contraste ≥ 4.5:1). No se modifica ni se agrupa ninguna regla existente.
- **Justificación**: coherencia visual y foco visible (FR-011) sin dependencias ni tokens nuevos, y sin romper `frontend/tests/performance-a11y.test.js`, que no se modifica: A11Y-01 lee el color de la regla `.municipality-filter` (agrupar su selector con otro la rompería) y A11Y-02 rechaza cualquier `font-size` < 12px (FR-017).

## D10. Qué no se puede probar sin navegador

- **Decisión**: probar con `node --test` toda la lógica (orden, validación, mensajes, no mutación, combinación con `filterDestinations` y `filterFavorites`, conservación de la clave al cambiar de lista y coincidencia con las secuencias del contrato usando el `fallback-destinations.json` real). El comportamiento de la vista (foco que permanece, que un cambio de filtro retire el anuncio, la numeración, el recorrido con Tab) se verifica manualmente con [quickstart.md](quickstart.md).
- **Justificación**: el proyecto no tiene entorno de pruebas de componentes y no se añaden dependencias. Se mantiene la mayor cantidad de decisiones en funciones puras (p. ej. el texto del anuncio) para que lo manual sea mínimo.
- **Alternativas**: añadir `jsdom` o Playwright al proyecto (nueva dependencia, requiere aprobación).

## D11. Filtro «solo favoritos» como función pura

- **Decisión**: extraer de `main.jsx` la expresión `onlyFavorites ? matches.filter(d => favorites.ids.includes(d.id)) : matches` a `filterFavorites(destinations, favoriteIds, onlyFavorites)` en `frontend/src/destination-filters.js`, y que `main.jsx` la use. Con `onlyFavorites` falso devuelve la lista recibida; con verdadero, un arreglo nuevo con los destinos cuyo `id` está en `favoriteIds`.
- **Justificación**: FR-007 pide que el orden se combine con «solo favoritos», y hoy ese filtro vive dentro de un `useMemo` de `main.jsx`, que no se puede probar sin navegador (D10). Es un cambio de comportamiento nulo: misma condición, movida a una función pura (constitución I y IV).
- **Alternativas**: probar la combinación solo a mano (deja sin automatizar uno de los cinco filtros que exige FR-015); reimplementar el filtro dentro de la prueba (probaría una copia, no el código real).
- **Pruebas**: van en `destination-sorting.test.js` para no modificar `destination-filters.test.js` (SC-006).

## D12. Prueba de coincidencia API/local

- **Decisión**: la prueba lee el `fallback-destinations.json` real, lo ordena con cada clave y compara con las secuencias del contrato. La igualdad entre ese archivo y la lista de la API ya la cubre `backend/tests/test_review_fixes.py` (`test_rev07_frontend_fallback_catalog_matches_api`); no se duplica en el frontend.
- **Justificación**: si el archivo es idéntico a `DESTINATIONS` de la API y el orden da la secuencia esperada con el archivo, la secuencia es la misma con la API. Comparar dos listas construidas a mano dentro de la prueba no demostraría nada.
- **Alternativas**: simular la API en la prueba (no hay servidor en `node --test` y duplicaría la prueba del backend).

## D13. Cobertura de FR-010 (cambio de fuente)

- **Decisión**: FR-010 se cubre con una prueba de lógica: la misma clave aplicada a dos listas distintas sucesivas (la local y una lista de «API» con otro contenido y orden) produce en cada una la secuencia que esa clave define, y `validSort` devuelve la clave intacta sin depender de la lista. Que `sortKey` no se reinicie en la vista se verifica manualmente (quickstart §4.3) y por revisión: ningún efecto de `main.jsx` escribe `sortKey`.
- **Justificación**: la página arranca con `fallbackDestinations` y un único `fetch` inicial lo reemplaza por el catálogo de la API (`setDestinations`) al terminar; no existe una recarga de datos sin reiniciar la página. El estado de React no se prueba sin navegador (D10), pero la propiedad lógica (el orden depende solo de la clave y de la lista) sí.
