# Contrato: módulo de orden y control «Ordenar por»

La funcionalidad no expone endpoints ni cambia la API (FR-014). Sus interfaces son el módulo `frontend/src/destination-sorting.js`, la función `filterFavorites` añadida a `frontend/src/destination-filters.js` y el control de la página.

## 1. Módulo `destination-sorting.js`

Funciones puras, sin React, sin efectos y sin mutar argumentos.

### Exportaciones

| Nombre | Firma | Descripción |
|--------|-------|-------------|
| `SORT_OPTIONS` | `ReadonlyArray<{ key, label, announce }>` | Las cuatro opciones, en este orden: `catalog`, `price-asc`, `price-desc`, `name-asc`. Valores en [data-model.md](../data-model.md). |
| `DEFAULT_SORT` | `"catalog"` | Opción inicial. |
| `validSort(key)` | `(unknown) → string` | Devuelve `key` si es una clave conocida; si no, `"catalog"`. No lanza. |
| `sortDestinations(destinations, key)` | `(Destino[], string) → Destino[]` | Devuelve un arreglo **nuevo** con los mismos elementos en el orden pedido. |
| `sortAnnouncement(key, count)` | `(unknown, number) → string` | Texto para el lector de pantalla: `announce` de `validSort(key)` + « N destinos.» / « 1 destino.». Ver «Garantías de `sortAnnouncement`». |

### Garantías de `sortAnnouncement`

1. Usa `validSort(key)`: una clave desconocida o ausente anuncia «Ordenado por el orden del catálogo.».
2. `count === 1` → « 1 destino.»; cualquier otro entero ≥ 0, incluido `0`, → « N destinos.» (`0` → « 0 destinos.»).
3. Si `count` no es un entero ≥ 0 (`NaN`, negativo, decimal, `undefined`, no numérico), devuelve solo el `announce`, sin cantidad. No lanza.

### Garantías de `sortDestinations`

1. No modifica `destinations` ni sus elementos (acepta arreglos congelados) y devuelve siempre un arreglo distinto del recibido.
2. Mismo conjunto de elementos: misma longitud y los mismos objetos (por referencia), solo cambia la secuencia.
3. `catalog` y cualquier clave desconocida o ausente: copia en el orden de entrada.
4. `price-asc`: precio ascendente. `price-desc`: precio descendente. En ambos, los empates conservan el orden de entrada (no se invierten).
5. `name-asc`: `Intl.Collator("es", { sensitivity: "base" })` sobre `name`; no distingue mayúsculas ni tildes en la comparación principal; los empates conservan el orden de entrada.
6. Lista vacía → `[]`. Un solo elemento → copia de ese elemento.
7. Es idempotente y determinista: la misma entrada y clave dan siempre la misma secuencia.
8. El resultado depende solo de la clave y de la lista recibida: la misma clave aplicada a otra lista (p. ej. la de la API tras la local) produce la secuencia que esa clave define para esa lista (FR-010).

## 1b. Función `filterFavorites` (en `destination-filters.js`)

| Nombre | Firma | Descripción |
|--------|-------|-------------|
| `filterFavorites(destinations, favoriteIds, onlyFavorites)` | `(Destino[], string[], boolean) → Destino[]` | Si `onlyFavorites` es verdadero, devuelve un arreglo nuevo con los destinos cuyo `id` está en `favoriteIds`, en su orden de entrada; si es falso, devuelve `destinations` tal cual. |

Garantías: pura y sin mutar argumentos (acepta arreglos congelados); conserva el orden de entrada; un `favoriteIds` que no sea un arreglo se trata como vacío; con `onlyFavorites` verdadero y sin favoritos → `[]`. `main.jsx` la usa en lugar del filtro en línea, sin cambiar su comportamiento. Combinada con el orden: `sortDestinations(filterFavorites(...), key)` muestra solo los favoritos, ordenados (historia 2, escenario 3).

### Resultados esperados con el catálogo actual (sin filtros)

| Clave | Secuencia de nombres |
|-------|----------------------|
| `catalog` | Desierto de la Tatacoa, Parque Arqueológico de San Agustín, Malecón del río Magdalena, Salto de Bordones, Estrecho del río Magdalena, Termales de Rivera, Represa de Betania, Centro de Neiva y tradición opita |
| `price-asc` | precios 35.000, 45.000, 65.000, 70.000, 85.000, 90.000, 95.000, 120.000 (Malecón primero; Parque Arqueológico último) |
| `price-desc` | inverso exacto de `price-asc` |
| `name-asc` | Centro de Neiva y tradición opita, Desierto de la Tatacoa, Estrecho del río Magdalena, Malecón del río Magdalena, Parque Arqueológico de San Agustín, Represa de Betania, Salto de Bordones, Termales de Rivera |

Con la categoría «Cultura» y `price-asc`: Malecón (35.000), Centro de Neiva (45.000), Parque Arqueológico (120.000).

Estas secuencias se prueban ordenando el contenido real de `frontend/src/fallback-destinations.json`. Que ese archivo sea idéntico a la lista de la API lo cubre `backend/tests/test_review_fixes.py`.

## 2. Control en la página

| Aspecto | Contrato |
|---------|----------|
| Elemento | Misma estructura que el filtro de municipio: `<label className="municipality-filter sort-filter" htmlFor="sort-order">` que envuelve un icono `ArrowUpDown` con `aria-hidden="true"`, `<span>Ordenar por</span>` y `<select id="sort-order">` (FR-011). En JSX se usa `htmlFor`. |
| Ubicación | dentro de `.filter-row`, después del filtro de municipio; el `<p role="status">` del anuncio, inmediatamente después del label |
| Opciones | las de `SORT_OPTIONS`, con su `label` como texto y su `key` como valor (FR-001) |
| Valor inicial | `catalog` (FR-002) |
| Al cambiar | actualiza `sortKey` y `sortMessage`; reordena las tarjetas sin recarga ni consulta a la API (FR-003); el foco permanece en el selector |
| Teclado | alcanzable con Tab; opción cambiable con las teclas propias del `<select>`; foco visible con `.sort-filter select:focus-visible` (contorno `3px solid #b35b08`) |
| Anuncio | `<p role="status" aria-live="polite">` con `sortMessage`; vacío hasta el primer cambio; el mensaje solo se genera al cambiar el orden (FR-012) |
| Filtros | cambiar un filtro conserva `sortKey`, no genera anuncio y **vacía** `sortMessage` (la región nunca muestra una cantidad desactualizada; vaciar no anuncia); cambiar el orden no modifica ningún filtro (FR-008) |
| Catálogo | el paso del catálogo local al de la API, al terminar la consulta inicial, conserva `sortKey` (FR-010); no hay otra recarga de datos sin reiniciar la página. Al cambiar el catálogo cambia `filtered`, así que `sortMessage` se vacía |
| Tarjetas | se generan desde `visible.map((d, i) => …)`; la numeración `i + 1` sigue la posición visible (FR-016) |
| Estilos | el label reutiliza `.municipality-filter` (sin modificarla ni agrupar su selector); reglas nuevas mínimas con `font-size` ≥ 12px y contraste ≥ 4.5:1; `frontend/tests/performance-a11y.test.js` pasa sin modificarse (FR-017) |

## 3. Trazabilidad contrato → requisitos

| Requisito | Dónde se cumple |
|-----------|-----------------|
| FR-001, FR-002 | `SORT_OPTIONS`, `DEFAULT_SORT`, control |
| FR-003 | `useMemo` en la vista, sin consulta |
| FR-004, FR-005, FR-006 | garantías 4 y 5 |
| FR-007, FR-008 | garantía 2, `filterFavorites` y aplicación posterior a `filtered` |
| FR-009 | garantía 1 |
| FR-010 | garantía 8; `sortKey` independiente del catálogo; prueba de lógica + quickstart §4.3 |
| FR-011, FR-012 | control, anuncio y vaciado de `sortMessage` |
| FR-013 | `validSort` y garantía 3 |
| FR-014 | sin cambios en backend |
| FR-015 | `frontend/tests/destination-sorting.test.js` (+ `backend/tests/test_review_fixes.py` para API = JSON) |
| FR-016 | tarjetas desde `visible` con su índice; verificación manual (quickstart §3, pasos 2 y 3) |
| FR-017 | reutilización de `.municipality-filter`; `performance-a11y.test.js` |
