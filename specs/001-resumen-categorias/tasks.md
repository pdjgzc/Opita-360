---

description: "Lista de tareas de 001-resumen-categorias"
---

# Tareas: Resumen del catálogo por categoría

**Entrada**: documentos de diseño en `specs/001-resumen-categorias/`

**Requisitos previos**: plan.md, spec.md, research.md, data-model.md, contracts/categories.md, quickstart.md

**Pruebas**: obligatorias (constitución IV, FR-012). En cada historia las pruebas se escriben primero, se ejecutan y se registra su fallo real por la razón esperada; solo después se implementa. No se simula el ciclo.

**Organización**: tareas agrupadas por historia de usuario. Todo el código nuevo cae en dos archivos: `backend/app/main.py` y `backend/tests/test_category_summary.py`; por eso las tareas que tocan el mismo archivo no llevan `[P]`.

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[USn]**: historia de usuario a la que pertenece
- Las referencias a `data-model.md` indican la definición canónica del campo (`Entidad.campo`); no se repiten sus reglas aquí.

## Convenciones de ruta

- Aplicación: `backend/app/main.py` (único archivo de aplicación; no se crea módulo nuevo, ver plan.md)
- Pruebas: `backend/tests/test_category_summary.py` (nuevo); las pruebas existentes no se modifican
- Comandos desde la raíz del repositorio: `python -B -m unittest ...`

---

## Fase 1: Preparación

**Propósito**: confirmar el punto de partida; no hay estructura nueva ni dependencias.

- [X] T001 Ejecutar `python -B -m unittest discover -s backend/tests -v` desde la raíz y registrar el conteo de pruebas que pasan antes de cambiar nada (línea base para SC-005). Sin editar archivos.
  - **Registro T001**: `backend/.venv/Scripts/python.exe -B -m unittest discover -s backend/tests -v` → `Ran 32 tests in 0.331s` · `OK` (8 api, 4 detalle, 2 integradas, 9 municipio, 9 review_fixes).

---

## Fase 2: Fundacional

**Propósito**: sin prerrequisitos bloqueantes. No hay esquema, autenticación ni infraestructura nueva (plan.md, Almacenamiento: N/A; D7 de research.md). Se pasa directamente a la Fase 3.

**Punto de control**: línea base verde (T001) → se pueden empezar las historias.

---

## Fase 3: Historia de usuario 1 — Consultar el resumen por categoría (Prioridad: P1) 🎯 MVP

**Objetivo**: `GET /api/categories` devuelve `total_destinations`, `currency` y `categories[]` con `category`, `count`, `min_price`, `max_price`, calculados por la función pura `summarize_categories`.

**Prueba independiente**: con el catálogo actual, la respuesta coincide con la tabla de `data-model.md` (4 categorías, total 8), dos consultas dan cuerpos idénticos y una categoría de un solo destino cumple `min_price == max_price` y `count == 1`.

### Pruebas de la historia 1 (escribirlas primero y verlas FALLAR) ⚠️

> Todas van en `backend/tests/test_category_summary.py`: se escriben en secuencia, no en paralelo.

- [X] T002 [US1] Crear `backend/tests/test_category_summary.py` (clase `unittest.TestCase`, `TestClient`, `from backend.app.main import app`, al estilo de `backend/tests/test_api.py`) con pruebas HTTP de `GET /api/categories` sobre el catálogo actual: código 200, las cuatro categorías exactas con `count`, `min_price` y `max_price` de la tabla de `data-model.md`, `total_destinations == 8`, `currency == "COP"` (FR-001, FR-002, FR-003, FR-006; `CategorySummary.category`, `CategorySummary.count`, `CategorySummary.min_price`, `CategorySummary.max_price`, `CategoriesResponse.total_destinations`, `CategoriesResponse.currency` de data-model.md); precios de tipo `int`.
- [X] T003 [US1] En `backend/tests/test_category_summary.py` añadir pruebas de la función pura `summarize_categories` (importada de `backend.app.main`): catálogo sintético con una sola categoría de un destino → `count == 1` y `min_price == max_price` (invariante de `CategorySummary.min_price` en data-model.md); catálogo vacío → `{"total_destinations": 0, "currency": "COP", "categories": []}` (FR-010, FR-012); dos destinos con el mismo precio cuentan ambos; una categoría sin destinos en el catálogo sintético no aparece en `categories` (FR-004).
- [X] T004 [US1] En `backend/tests/test_category_summary.py` añadir pruebas de orden y determinismo: `categories` ordenadas ascendentemente por `category` sin normalizar (`CategoriesResponse.categories` de data-model.md; FR-007, con catálogo sintético donde `"cultura"` y `"Cultura"` son categorías distintas) y dos llamadas HTTP seguidas con cuerpos JSON iguales.
- [X] T005 [US1] En `backend/tests/test_category_summary.py` añadir pruebas de borde HTTP: 200 con catálogo vacío parcheando `DESTINATIONS` con `unittest.mock.patch("backend.app.main.DESTINATIONS", [])` (FR-010); parámetro de consulta extra (`?x=1`) ignorado y con cuerpo idéntico (FR-011); `POST`, `PUT`, `PATCH` y `DELETE` sobre `/api/categories` → 405 con `{"detail": "Method Not Allowed"}`.
- [X] T006 [US1] Ejecutar `python -B -m unittest backend.tests.test_category_summary -v` y confirmar que TODAS las pruebas nuevas fallan por la razón esperada (ruta inexistente → 404 / `ImportError` de `summarize_categories`), no por errores de sintaxis ni de importación del archivo de pruebas. Registrar la salida real del fallo en el informe.
  - **Registro T006 (salida real, antes de implementar)**: `backend/.venv/Scripts/python.exe -B -m unittest backend.tests.test_category_summary -v` → `Ran 11 tests in 0.050s` · `FAILED (failures=8, errors=6)`.
    - Rutas (`CategoriesEndpointTests`): `test_current_catalog_summary`, `test_empty_catalog_returns_200`, `test_extra_query_parameter_is_ignored`, `test_two_consecutive_calls_are_identical` → `FAIL: AssertionError: 404 != 200`; `test_other_methods_return_405` (post, put, patch, delete) → `FAIL: AssertionError: 404 != 405` (4 subpruebas); `test_prices_are_integers` → `ERROR: KeyError: 'categories'` (cuerpo del 404).
    - Función (`SummarizeCategoriesTests`): `test_categories_sorted_without_normalizing`, `test_category_without_destinations_not_listed`, `test_empty_catalog`, `test_same_price_destinations_both_counted`, `test_single_destination_category` → `ERROR: ImportError: cannot import name 'summarize_categories' from 'backend.app.main'`.
    - Razón esperada (ruta inexistente / función inexistente); sin errores de sintaxis ni de importación del archivo de pruebas.

### Implementación de la historia 1

- [X] T007 [US1] En `backend/app/main.py` definir los modelos Pydantic `CategorySummary` (`category: str`, `count: int`, `min_price: int`, `max_price: int`) y `CategoriesResponse` (`total_destinations: int`, `currency: str`, `categories: list[CategorySummary]`) con los tipos de `CategorySummary.*` y `CategoriesResponse.*` de data-model.md; los precios deben ser `int`, nunca `float` (FR-003, D3 y D4 de research.md). No tocar modelos existentes.
- [X] T008 [US1] En `backend/app/main.py` implementar `summarize_categories(destinations: list[dict]) -> dict` según D2 de research.md: un solo recorrido que acumula por `category` tal cual (sin normalizar) `count` y mínimo/máximo de `price` (`CategorySummary.category`, `CategorySummary.count`, `CategorySummary.min_price`, `CategorySummary.max_price`), claves ordenadas con `sorted(...)` (`CategoriesResponse.categories`), `total_destinations = len(destinations)` y `currency = "COP"` (`CategoriesResponse.currency`). Pura: sin FastAPI ni estado global, estructuras nuevas, no muta ni ordena `destinations` in situ (constitución I, FR-008). Depende de T007.
- [X] T009 [US1] En `backend/app/main.py` añadir `@app.get("/api/categories", response_model=CategoriesResponse)` que devuelva `summarize_categories(DESTINATIONS)`, sin parámetros declarados (FR-001, FR-011, D5 de research.md). No cambiar CORS ni los 4 endpoints existentes. Depende de T008.
- [X] T010 [US1] Ejecutar `python -B -m unittest backend.tests.test_category_summary -v` y confirmar que pasan las pruebas de T002–T005 sin modificarlas para forzar el resultado; si alguna falla, corregir la implementación (o la prueba solo si estaba mal escrita, dejándolo registrado).
  - **Registro T010**: `backend/.venv/Scripts/python.exe -B -m unittest backend.tests.test_category_summary -v` → `Ran 11 tests in 0.066s` · `OK`. Pruebas de T002–T005 sin modificar tras T006.

**Punto de control**: la historia 1 es funcional y verificable por sí sola (MVP).

---

## Fase 4: Historia de usuario 2 — Coherencia con el catálogo de destinos (Prioridad: P2)

**Objetivo**: garantizar que el resumen nunca contradice `/api/destinations` (FR-005, SC-002, SC-003, SC-004).

**Prueba independiente**: con el resumen y la lista completa de destinos, los conteos suman el total y cada categoría coincide con los destinos de esa categoría, con referencia calculada por separado.

### Pruebas de la historia 2 (escribirlas primero y verlas pasar o FALLAR según el caso) ⚠️

> Estas pruebas validan comportamiento que T008–T009 ya aportan; para respetar «prueba primero», T011 se ejecuta contra el código antes de dar la historia por cerrada y cualquier fallo real se corrige y se registra. Si pasan de inmediato, se deja constancia de que no se observó fallo previo y se refuerza con una mutación temporal (ver T012).

- [X] T011 [US2] En `backend/tests/test_category_summary.py` añadir la prueba de coherencia: obtener `GET /api/destinations` y `GET /api/categories`, recalcular de forma independiente (sin llamar a `summarize_categories`) conteo, mínimo y máximo por categoría, y verificar que la suma de `count` es igual a `total_destinations` y al número de destinos (invariante 1 de data-model.md; `CategoriesResponse.total_destinations`, `CategorySummary.count`, `CategorySummary.min_price`, `CategorySummary.max_price`; FR-005, SC-002, SC-003); categorías únicas (invariante 2); cada `min_price`/`max_price` es el `price` de algún destino de esa categoría (FR-003).
- [X] T012 [US2] En `backend/tests/test_category_summary.py` añadir: (a) prueba con catálogo sintético que contiene una categoría inexistente en el catálogo real (p. ej. `"Gastronomía"`) y aparece en el resultado sin cambiar el código (escenario 3 de la historia 2); (b) prueba de tamaño: `len(client.get("/api/categories").content) < len(client.get("/api/destinations").content)` (SC-004). Después, comprobar que la prueba de coherencia detecta un fallo real: alterar temporalmente un valor en `summarize_categories` (p. ej. sumar 1 a `count`), ejecutar `python -B -m unittest backend.tests.test_category_summary -v`, verificar que T011 falla, y **revertir el cambio temporal** dejando `backend/app/main.py` como en T010. Registrar el fallo observado.
  - **Registro T011/T012 (antes de la mutación)**: las pruebas nuevas pasaron de inmediato contra el código de T010 (`Ran 14 tests` · `OK`); no se observó fallo previo, por eso se aplicó la mutación.
  - **Registro de la mutación de T012 (salida real)**: en `backend/app/main.py` línea 112 se cambió `group["count"] += 1` por `group["count"] += 2` (cada destino repetido de una categoría suma 1 de más). Resultado de `backend/.venv/Scripts/python.exe -B -m unittest backend.tests.test_category_summary`: `Ran 14 tests` · `FAILED (failures=5)`. T011 `test_summary_is_coherent_with_destinations` → `AssertionError: 12 != 8` (suma de `count` frente a `total_destinations`). También fallaron `test_current_catalog_summary` (`'count': 3` != `'count': 2` en Aventura), `test_new_category_appears_without_code_changes` (`'count': 3` != `'count': 2`), `test_categories_sorted_without_normalizing` (`3 != 2`) y `test_same_price_destinations_both_counted` (`'count': 3` != `'count': 2`).
  - **Reversión**: `group["count"] += 1` restaurado; `sha256` de `backend/app/main.py` idéntico al de antes de la mutación (`e48c86dc…ded92`).
- [X] T013 [US2] Ejecutar `python -B -m unittest backend.tests.test_category_summary -v` con el código restaurado y confirmar que todo pasa.
  - **Registro T013**: `backend/.venv/Scripts/python.exe -B -m unittest backend.tests.test_category_summary -v` → `Ran 14 tests in 0.076s` · `OK` (verificador, código de salida 0).

**Punto de control**: las historias 1 y 2 funcionan; la coherencia queda protegida por pruebas.

---

## Fase 5: Historia de usuario 3 — Catálogo sin impacto en lo existente (Prioridad: P3)

**Objetivo**: demostrar que el endpoint nuevo no altera el catálogo ni los endpoints existentes (FR-008, FR-009, SC-005).

**Prueba independiente**: la suite existente pasa sin modificarse y una consulta al resumen deja `DESTINATIONS` idéntico.

### Pruebas de la historia 3

- [X] T014 [US3] En `backend/tests/test_category_summary.py` añadir pruebas de no mutación: (a) `copy.deepcopy(DESTINATIONS)` antes y después de llamar a `GET /api/categories` varias veces → iguales (FR-008, invariante 4 de data-model.md); (b) `summarize_categories(entrada)` sobre una lista sintética que no cambia (`entrada == copia_previa`, incluido el orden de la lista); (c) los cuatro endpoints existentes (`GET /`, `GET /api/destinations`, `GET /api/destinations/{destination_id}` con un id válido, `POST /api/recommendations` con una solicitud válida usada en `backend/tests/test_api.py`) responden 200 con la misma forma de claves de siempre (FR-009). Después, comprobar que las pruebas de no mutación detectan un fallo real: alterar temporalmente `summarize_categories` para que mute su entrada (p. ej. `destinations.sort(key=...)` in situ o un `destinations.append(...)`), ejecutar `python -B -m unittest backend.tests.test_category_summary -v`, verificar que (a) o (b) fallan por la razón esperada, **registrar la salida real del fallo** y solo entonces **revertir el cambio temporal** dejando `backend/app/main.py` como en T013.
  - **Registro de la mutación de T014 (salida real)**: pruebas sobre el código sano → `Ran 17 tests` · `OK`. Mutación temporal en `summarize_categories` (`backend/app/main.py`): se añadió `destinations.sort(key=lambda d: d["id"], reverse=True)` antes del bucle. Resultado de `backend/.venv/Scripts/python.exe -B -m unittest backend.tests.test_category_summary`: `Ran 17 tests` · `FAILED (failures=1)`. Falla (b) `test_summarize_does_not_mutate_input`: `AssertionError: Lists differ: [{'id': 'c', 'name': 'Destino c', 'category': 'Cul[227 chars]: 5}] != [{'id': 'd', 'name': 'Destino d', 'category': 'Bie[227 chars] 20}]` / `First differing element 0: {'id': 'c', ..., 'price': 30} {'id': 'd', ..., 'price': 5}`.
  - **Observación**: (a) `test_destinations_unchanged_after_category_calls` NO falló con esta mutación: las pruebas de `CategoriesEndpointTests` (que corren antes por orden alfabético) ya dejan `DESTINATIONS` reordenado, y un reordenamiento idempotente no cambia el estado entre su copia y su comparación. La mutación la detecta (b); (a) solo detectaría mutaciones no idempotentes (p. ej. `append`). Queda como posible refuerzo para la revisión.
  - **Reversión**: línea de mutación eliminada; `sha256` de `backend/app/main.py` idéntico al original (`e48c86dc…ded92`).
- [X] T015 [US3] Ejecutar `python -B -m unittest discover -s backend/tests -v` y confirmar que el conteo de pruebas previas de T001 sigue pasando sin haber editado ningún archivo de prueba existente (`git status -- backend frontend` solo debe mostrar `backend/app/main.py` y `backend/tests/test_category_summary.py`; los cambios en `specs/` no se evalúan aquí). Incluye `backend/tests/test_review_fixes.py` (catálogo = `fallback-destinations.json`).
  - **Registro T015**: `backend/.venv/Scripts/python.exe -B -m unittest discover -s backend/tests -v` → `Ran 49 tests in 0.379s` · `OK` (32 de la línea base de T001 + 17 de `test_category_summary`). `git status --short -- backend frontend` → ` M backend/app/main.py` y `?? backend/tests/test_category_summary.py`; ningún archivo de prueba existente editado.

**Punto de control**: las tres historias pasan y la suite completa sigue verde.

---

## Fase 6: Pulido y verificación final

**Propósito**: cierre y trazabilidad (constitución VI).

- [X] T016 Seguir `specs/001-resumen-categorias/quickstart.md` sección 2: levantar `python -m uvicorn backend.app.main:app --port 8000`, comprobar con `curl.exe http://localhost:8000/api/categories` el JSON del contrato y que `curl.exe -i -X POST http://localhost:8000/api/categories` responde 405; detener el servidor.
  - Resultado (persona revisora, 2026-11-24): 200 con `total_destinations` 8, `currency` "COP" y las 4 categorías de la tabla del contrato; `POST` → `405 Method Not Allowed` con `{"detail":"Method Not Allowed"}`. Cuerpo del resumen 339 bytes frente a 2289 de `/api/destinations` (SC-004).
- [X] T017 Revisar que `git diff --stat -- backend frontend` (más `git status -- backend frontend` para el archivo nuevo) muestra solo `backend/app/main.py` y `backend/tests/test_category_summary.py`: sin cambios en frontend, `fallback-destinations.json` ni `database/schema.sql` (D7 de research.md), sin dependencias nuevas y sin secretos ni rutas locales (constitución VI).
  - Resultado (persona revisora, 2026-11-24): solo cambian `backend/app/main.py` (+38 líneas) y el archivo nuevo `backend/tests/test_category_summary.py`; `frontend/`, `database/` y `requirements.txt` sin cambios; sin rutas locales ni secretos.
- [X] T018 Ejecutar la verificación completa de la constitución: `python -B -m unittest discover -s backend/tests -v` y, en `frontend`, `npm test` y `npm run build` (confirma que el frontend sigue intacto). Informar los conteos reales. No hacer commit, push, PR ni merge sin autorización humana.
  - **Registro T018**: backend → `Ran 49 tests in 0.379s` · `OK` (verificador; sin cambios en `main.py` ni en las pruebas desde esa ejecución). Frontend: `npm test` y `npm run build` NO se ejecutaron por indicación expresa de la persona responsable (el frontend no cambia; `git status -- frontend` sin cambios). Sin commit, push, PR ni merge.

---

## Trazabilidad requisito → tarea

| Requisito | Tareas (pruebas → implementación) |
|-----------|-----------------------------------|
| FR-001, FR-002, FR-003, FR-006 | T002 → T007, T008, T009 |
| FR-004, FR-010 | T003, T005 → T008 |
| FR-005, SC-002, SC-003 | T011 |
| FR-007 | T004 → T008 |
| FR-008 | T014 → T008 |
| FR-009, SC-005 | T001, T014, T015 |
| FR-011 | T005 → T009 |
| FR-012 | T002–T005, T011, T012, T014 |
| SC-004 | T012 |

---

## Dependencias y orden de ejecución

- **Fase 1** → sin dependencias. **Fase 2** → vacía. **Fase 3** → depende de T001.
- Dentro de la historia 1: T002 → T003 → T004 → T005 (mismo archivo) → T006 (ver fallar) → T007 → T008 → T009 → T010.
- **Historia 2** → depende de la historia 1 (consume la función y el endpoint). **Historia 3** → depende de T009 (puede escribirse en paralelo a la historia 2 solo si se coordinan las ediciones del mismo archivo de pruebas; por defecto, secuencial).
- **Fase 6** → depende de todas las historias.

### Oportunidades de paralelismo

Casi no hay: todas las tareas tocan `backend/app/main.py` o `backend/tests/test_category_summary.py`, así que ninguna lleva `[P]`. Lo único independiente es de solo lectura: T001 (línea base) puede ejecutarse mientras se redactan las pruebas de T002, y T016 y `npm test` de T018 pueden correr en paralelo tras T015.

## Estrategia de implementación

### Primero el MVP (historia 1)
1. T001 línea base. 2. T002–T006 pruebas y fallo real. 3. T007–T010 implementación. 4. Parar y validar con quickstart sección 2.

### Entrega incremental
Historia 1 (resumen) → historia 2 (coherencia, pruebas de refuerzo) → historia 3 (no regresión) → pulido.

## Notas

- Una tarea no se marca como hecha por haber generado un archivo (constitución IV): se marca cuando la prueba o el comando indicado se ejecutó y su resultado se registró.
- Agentes del flujo: `dev-backend` escribe e implementa T002–T005, T007–T009, T011, T012 y T014 (incluidas las mutaciones temporales de T012 y T014 y su reversión); `verificador` ejecuta T001, T006, T010, T013, T015 y T018.
- T016 y T017 (arranque del servidor con `curl`, y revisión de `git diff`/`git status`) las realiza la persona revisora: ni `dev-backend` ni `verificador` tienen esos permisos de shell.
- Sin commit: la integración requiere revisión y autorización humana.
