# Contrato: módulo de orden y control «Ordenar por»

La funcionalidad no expone endpoints ni cambia la API (FR-014). Sus interfaces son el módulo `frontend/src/destination-sorting.js` y el control de la página.

## 1. Módulo `destination-sorting.js`

Funciones puras, sin React, sin efectos y sin mutar argumentos.

### Exportaciones

| Nombre | Firma | Descripción |
|--------|-------|-------------|
| `SORT_OPTIONS` | `ReadonlyArray<{ key, label, announce }>` | Las cuatro opciones, en este orden: `catalog`, `price-asc`, `price-desc`, `name-asc`. Valores en [data-model.md](../data-model.md). |
| `DEFAULT_SORT` | `"catalog"` | Opción inicial. |
| `validSort(key)` | `(unknown) → string` | Devuelve `key` si es una clave conocida; si no, `"catalog"`. No lanza. |
| `sortDestinations(destinations, key)` | `(Destino[], string) → Destino[]` | Devuelve un arreglo **nuevo** con los mismos elementos en el orden pedido. |
| `sortAnnouncement(key, count)` | `(string, number) → string` | Texto para el lector de pantalla: `announce` de la opción + « N destinos.» / « 1 destino.». |

### Garantías de `sortDestinations`

1. No modifica `destinations` ni sus elementos (acepta arreglos congelados) y devuelve siempre un arreglo distinto del recibido.
2. Mismo conjunto de elementos: misma longitud y los mismos objetos (por referencia), solo cambia la secuencia.
3. `catalog` y cualquier clave desconocida o ausente: copia en el orden de entrada.
4. `price-asc`: precio ascendente. `price-desc`: precio descendente. En ambos, los empates conservan el orden de entrada (no se invierten).
5. `name-asc`: `Intl.Collator("es", { sensitivity: "base" })` sobre `name`; no distingue mayúsculas ni tildes en la comparación principal; los empates conservan el orden de entrada.
6. Lista vacía → `[]`. Un solo elemento → copia de ese elemento.
7. Es idempotente y determinista: la misma entrada y clave dan siempre la misma secuencia.

### Resultados esperados con el catálogo actual (sin filtros)

| Clave | Secuencia de nombres |
|-------|----------------------|
| `catalog` | Desierto de la Tatacoa, Parque Arqueológico de San Agustín, Malecón del río Magdalena, Salto de Bordones, Estrecho del río Magdalena, Termales de Rivera, Represa de Betania, Centro de Neiva y tradición opita |
| `price-asc` | precios 35.000, 45.000, 65.000, 70.000, 85.000, 90.000, 95.000, 120.000 (Malecón primero; Parque Arqueológico último) |
| `price-desc` | inverso exacto de `price-asc` |
| `name-asc` | Centro de Neiva y tradición opita, Desierto de la Tatacoa, Estrecho del río Magdalena, Malecón del río Magdalena, Parque Arqueológico de San Agustín, Represa de Betania, Salto de Bordones, Termales de Rivera |

Con la categoría «Cultura» y `price-asc`: Malecón (35.000), Centro de Neiva (45.000), Parque Arqueológico (120.000).

## 2. Control en la página

| Aspecto | Contrato |
|---------|----------|
| Elemento | `<select id="sort-order">` con `<label for="sort-order">Ordenar por</label>` (FR-011) |
| Ubicación | dentro de `.filter-row`, después del filtro de municipio |
| Opciones | las de `SORT_OPTIONS`, con su `label` como texto y su `key` como valor (FR-001) |
| Valor inicial | `catalog` (FR-002) |
| Al cambiar | actualiza `sortKey` y `sortMessage`; reordena las tarjetas sin recarga ni consulta a la API (FR-003); el foco permanece en el selector |
| Teclado | alcanzable con Tab; opción cambiable con las teclas propias del `<select>`; foco visible (`:focus-visible`) |
| Anuncio | `<p role="status" aria-live="polite">` con `sortMessage`; vacío hasta el primer cambio; solo cambia al cambiar el orden (FR-012) |
| Filtros | cambiar un filtro conserva `sortKey` y no modifica `sortMessage`; cambiar el orden no modifica ningún filtro (FR-008) |
| Catálogo | el cambio API ↔ demostración conserva `sortKey` (FR-010) |

## 3. Trazabilidad contrato → requisitos

| Requisito | Dónde se cumple |
|-----------|-----------------|
| FR-001, FR-002 | `SORT_OPTIONS`, `DEFAULT_SORT`, control |
| FR-003 | `useMemo` en la vista, sin consulta |
| FR-004, FR-005, FR-006 | garantías 4 y 5 |
| FR-007, FR-008 | garantía 2 y aplicación posterior a `filtered` |
| FR-009 | garantía 1 |
| FR-010 | mismo módulo para ambas fuentes; `sortKey` independiente del catálogo |
| FR-011, FR-012 | control y anuncio |
| FR-013 | `validSort` y garantía 3 |
| FR-014 | sin cambios en backend |
| FR-015 | `frontend/tests/destination-sorting.test.js` |
