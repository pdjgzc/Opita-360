# Investigación: Resumen del catálogo por categoría

No quedaban `NEEDS CLARIFICATION`; estas son las decisiones de diseño tomadas.

## D1. Ubicación de la función de agregación
- **Decisión**: función pura `summarize_categories(destinations: list[dict]) -> dict` en
  `backend/app/main.py`, separada del endpoint, que solo la llama con `DESTINATIONS`.
- **Justificación**: pedido explícito de probarla con catálogo vacío; la constitución (I) exige
  lógica pura en `snake_case`. Recibir el catálogo como parámetro evita depender del global.
- **Alternativas**: módulo nuevo `backend/app/categories.py` (descartado: complica los
  imports `app.main` / `backend.app.main` sin ganancia a esta escala); calcular dentro del
  endpoint (descartado: no probable con catálogo vacío sin parchear el global).

## D2. Algoritmo
- **Decisión**: un solo recorrido acumulando por `category` (clave tal cual, sin normalizar)
  `count`, mínimo y máximo de `price`; luego ordenar las claves con `sorted(...)` (orden
  alfabético, FR-007) y construir listas/dicts nuevos. `total_destinations = len(destinations)`.
- **Justificación**: O(n), sin mutar la entrada, determinista. Vacío → `categories: []`,
  `total_destinations: 0` sin caso especial (FR-010).
- **Alternativas**: `itertools.groupby` (exige ordenar antes; más código); recalcular
  min/max por categoría con comprensiones (O(n·k), sin ventaja).
- **Nota sobre el orden**: `sorted` por cadena usa orden de puntos de código; con las
  categorías actuales (Aventura, Bienestar, Cultura, Naturaleza) coincide con el orden
  alfabético esperado. Una categoría con mayúscula inicial minúscula o con tilde inicial se
  ordenaría después; está dentro de «tal como está escrito» (Supuestos) y se documenta en el
  contrato.

## D3. Modelos de respuesta
- **Decisión**: `CategorySummary` y `CategoriesResponse` (Pydantic) y `response_model` en el
  endpoint; la función pura devuelve `dict`, que FastAPI valida.
- **Justificación**: documenta el contrato en OpenAPI y valida la salida (principio II) sin
  dependencias nuevas.
- **Alternativa**: devolver `dict` sin modelo, como los endpoints actuales (descartado:
  contrato menos explícito; el costo del modelo es mínimo y no afecta a los existentes).

## D4. Tipo de los precios
- **Decisión**: `min_price` y `max_price` como `int`, los mismos valores del catálogo, sin
  conversión ni redondeo (FR-003).
- **Justificación**: los precios de `DESTINATIONS` son enteros; el modelo no debe convertirlos
  a `float`.

## D5. Método, parámetros y errores
- **Decisión**: solo `@app.get`; no se declaran parámetros. Parámetros de consulta extra se
  ignoran (comportamiento por defecto de FastAPI); POST/PUT/DELETE devuelven 405 sin código
  adicional.
- **Justificación**: cumple los casos límite de la especificación sin lógica extra. No hay
  entrada del cliente que validar (FR-011), así que no hay 422 propio.

## D6. Coherencia con el catálogo
- **Decisión**: la prueba de coherencia compara el resumen con `/api/destinations` recalculando
  por separado conteos, mínimos y máximos; otra prueba verifica que el catálogo no cambia tras
  la consulta.
- **Justificación**: cubre US2 y SC-002/SC-003 con una referencia independiente de la función
  probada. Agregar una categoría nueva se prueba pasando un catálogo sintético a la función
  pura (sin tocar `DESTINATIONS` global).

## D7. Frontend y datos
- **Decisión**: sin cambios en frontend, `fallback-destinations.json` ni `database/schema.sql`.
- **Justificación**: Supuestos de la especificación; `DESTINATIONS` no cambia, así que la
  prueba de identidad del catálogo sigue pasando.
