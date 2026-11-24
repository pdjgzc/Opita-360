# Modelo de datos (Fase 1): Ordenar el catálogo de destinos

La funcionalidad no crea ni modifica datos persistentes: solo añade un estado de la vista y una tabla de opciones constantes.

## Destino (existente, sin cambios)

Campos usados por el orden:

| Campo | Tipo | Uso |
|-------|------|-----|
| `name` | texto | criterio de «Nombre: A a Z» |
| `price` | número (COP) | criterio de los dos órdenes por precio |
| (resto) | — | no intervienen; se conservan intactos |

Reglas: los destinos no se modifican, ni se añaden ni se pierden al ordenar (FR-007, FR-009). Se asume `name` y `price` válidos (spec, Supuestos).

## Opción de orden (nueva, constante)

Definida en `destination-sorting.js` como `SORT_OPTIONS`, un arreglo congelado de cuatro elementos:

| `key` | `label` (selector) | Criterio | Texto del anuncio (`announce`) |
|-------|--------------------|----------|--------------------------------|
| `catalog` | Orden del catálogo | posición de entrada | «Ordenado por el orden del catálogo.» |
| `price-asc` | Precio: menor a mayor | `price` ascendente | «Ordenado por precio, de menor a mayor.» |
| `price-desc` | Precio: mayor a menor | `price` descendente | «Ordenado por precio, de mayor a menor.» |
| `name-asc` | Nombre: A a Z | `name`, alfabeto español | «Ordenado por nombre, de la A a la Z.» |

`DEFAULT_SORT = "catalog"`. El anuncio completo es `announce` + « N destinos.» (o « 1 destino.»; con 0, « 0 destinos.»).

Validación: `validSort(key)` devuelve `key` si coincide con una opción y `DEFAULT_SORT` en cualquier otro caso (desconocido, `undefined`, `null`, no cadena) (FR-013).

## Resultado filtrado (existente)

`filtered` en `main.jsx`: arreglo derivado de `destinations` por los filtros actuales. El orden se aplica a este arreglo y produce `visible`, un arreglo nuevo con los mismos elementos.

## Estado de la vista (nuevo)

| Estado | Tipo | Valor inicial | Reglas |
|--------|------|---------------|--------|
| `sortKey` | texto (clave de opción) | `"catalog"` | Lo cambia solo el selector. No se reinicia al cambiar filtros ni catálogo. No se guarda entre visitas. |
| `sortMessage` | texto | `""` | Lo establece solo el manejador del selector. Los filtros no lo modifican. |

## Transiciones

```text
catalog ⇄ price-asc ⇄ price-desc ⇄ name-asc   (cualquier opción puede pasar a cualquier otra)
```

Cada transición actualiza `sortKey` y `sortMessage` en el mismo evento. Recargar la página vuelve a `catalog` con mensaje vacío.

## Relaciones

`destinations` → (filtros existentes) → `filtered` → (`sortDestinations(filtered, sortKey)`) → `visible` → tarjetas.
