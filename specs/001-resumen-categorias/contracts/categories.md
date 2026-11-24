# Contrato: `GET /api/categories`

Consulta de solo lectura; resume `DESTINATIONS` por categoría.

## Solicitud
- Método: `GET`. Sin parámetros de ruta, de consulta ni cuerpo. Parámetros extra se ignoran.
- Sin autenticación (igual que los endpoints actuales).

## Respuesta 200
```json
{
  "total_destinations": 8,
  "currency": "COP",
  "categories": [
    {"category": "Aventura",   "count": 2, "min_price": 70000, "max_price": 90000},
    {"category": "Bienestar",  "count": 1, "min_price": 65000, "max_price": 65000},
    {"category": "Cultura",    "count": 3, "min_price": 35000, "max_price": 120000},
    {"category": "Naturaleza", "count": 2, "min_price": 85000, "max_price": 95000}
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `total_destinations` | entero | total de destinos; igual a la suma de `count` |
| `currency` | cadena | siempre `"COP"` |
| `categories` | arreglo | una entrada por categoría con ≥ 1 destino, ordenada alfabéticamente por `category` (comparación de cadenas, sin normalizar) |
| `categories[].category` | cadena | nombre tal como está en el catálogo |
| `categories[].count` | entero ≥ 1 | destinos de la categoría |
| `categories[].min_price` / `max_price` | entero | precios en COP, sin conversión ni redondeo |

Catálogo vacío: `{"total_destinations": 0, "currency": "COP", "categories": []}` con 200.

## Errores
| Caso | Código |
|------|--------|
| `POST`, `PUT`, `PATCH`, `DELETE` sobre `/api/categories` | 405 (automático de FastAPI) |

No hay 404 ni 422 propios: la consulta no recibe entrada validable.

## Garantías
- Idempotente y sin efectos secundarios: no modifica `DESTINATIONS`.
- Respuestas idénticas (incluido el orden) mientras el catálogo no cambie.
- No altera `GET /`, `GET /api/destinations`, `GET /api/destinations/{destination_id}` ni
  `POST /api/recommendations`; CORS sin cambios.

## Trazabilidad
FR-001 → ruta y método; FR-002/003/006 → campos; FR-004/007/010 → lista; FR-005 → coherencia;
FR-008/009/011 → garantías.
