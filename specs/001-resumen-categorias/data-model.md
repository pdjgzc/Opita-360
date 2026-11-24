# Modelo de datos: Resumen del catálogo por categoría

No hay almacenamiento nuevo: todo se deriva de `DESTINATIONS` (en memoria, solo lectura).

## Destino (existente, sin cambios)
Diccionario de `DESTINATIONS` en `backend/app/main.py`. Campos usados por esta funcionalidad:

| Campo | Tipo | Uso |
|-------|------|-----|
| `category` | `str` | clave de agrupación, tal como está escrita (sin normalizar) |
| `price` | `int` (COP) | origen de `min_price` y `max_price` |

El resto de campos (`id`, `name`, `municipality`, `days`, `tags`, …) no intervienen.

## CategorySummary (nuevo, derivado)
| Campo | Tipo | Regla |
|-------|------|-------|
| `category` | `str` | valor de `category` de al menos un destino |
| `count` | `int` | ≥ 1; destinos con esa categoría |
| `min_price` | `int` | mínimo de `price` en la categoría; `min_price <= max_price` |
| `max_price` | `int` | máximo de `price` en la categoría |

Existe solo si `count >= 1` (FR-004). Con un único destino, `min_price == max_price`.

## CategoriesResponse (nuevo, derivado)
| Campo | Tipo | Regla |
|-------|------|-------|
| `total_destinations` | `int` | `len(destinations)`; igual a la suma de `count` (FR-005) |
| `currency` | `str` | constante `"COP"` (FR-003) |
| `categories` | `list[CategorySummary]` | orden alfabético por `category` (FR-007); vacía si no hay destinos |

## Invariantes (base de las pruebas)
1. `sum(c.count) == total_destinations`.
2. Categorías únicas y ordenadas.
3. Para cada categoría, `count`, `min_price` y `max_price` coinciden con los calculados sobre
   los destinos de esa categoría.
4. Entrada no mutada: el catálogo es igual antes y después.
5. Catálogo vacío → `{"total_destinations": 0, "currency": "COP", "categories": []}`.

## Transiciones de estado
Ninguna: el resumen se recalcula en cada consulta; no hay caché ni escritura.

## Resultado esperado con el catálogo actual
| category | count | min_price | max_price |
|----------|-------|-----------|-----------|
| Aventura | 2 | 70000 | 90000 |
| Bienestar | 1 | 65000 | 65000 |
| Cultura | 3 | 35000 | 120000 |
| Naturaleza | 2 | 85000 | 95000 |

`total_destinations = 8`.
