# Plan de implementación: Resumen del catálogo por categoría

**Rama**: `001-resumen-categorias` | **Fecha**: 2026-11-24 | **Especificación**: [spec.md](spec.md)

**Entrada**: especificación en `specs/001-resumen-categorias/spec.md`

## Resumen

Añadir `GET /api/categories`, una consulta de solo lectura que agrupa `DESTINATIONS` por
`category` y devuelve, por categoría, `count`, `min_price` y `max_price` (COP), más
`total_destinations` y `currency: "COP"`. La agregación vive en una función pura
`summarize_categories(destinations)` (snake_case, sin FastAPI ni estado global, no muta su
entrada) que el endpoint invoca con `DESTINATIONS`. Así se prueba también con un catálogo
vacío y con catálogos sintéticos; el 200 con catálogo vacío también se prueba por HTTP
parcheando `DESTINATIONS` con `unittest.mock.patch`. Sin dependencias nuevas; frontend sin cambios.

## Contexto técnico

**Lenguaje/Versión**: Python 3.10+

**Dependencias principales**: FastAPI y Pydantic (ya existentes); ninguna nueva

**Almacenamiento**: N/A (catálogo `DESTINATIONS` en memoria, solo lectura)

**Pruebas**: `unittest` con `fastapi.testclient.TestClient` en `backend/tests`, al estilo de
`backend/tests/test_api.py` (importa `from backend.app.main import app`)

**Plataforma objetivo**: servicio web local (uvicorn), CORS a 5173 sin cambios

**Tipo de proyecto**: servicio web (backend FastAPI + frontend React); solo se toca el backend

**Objetivos de rendimiento**: respuesta < 1 s (SC-004); con 8 destinos es O(n) trivial

**Restricciones**: no cambiar endpoints existentes ni `DESTINATIONS`; no mutar entradas; sin
parámetros de entrada

**Escala/Alcance**: 8 destinos, 4 categorías; un endpoint, una función pura, un archivo de
pruebas

Sin `NEEDS CLARIFICATION` pendientes (ruta y campos se fijaron en `/speckit-clarify`).

## Verificación de la constitución

*Puerta previa a la Fase 0; reevaluada tras el diseño de la Fase 1.*

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Lógica pura, sin mutar, `snake_case` | Cumple | `summarize_categories` pura, devuelve estructuras nuevas, no ordena `DESTINATIONS` in situ |
| II. Contratos estables y validados | Cumple | Endpoint nuevo sin entrada; modelos Pydantic de respuesta; los 4 endpoints existentes y CORS no se tocan; método distinto de GET → 405 automático |
| III. Catálogo único en memoria | Cumple | `DESTINATIONS` no cambia, por lo que `test_review_fixes.py` y el JSON de respaldo siguen idénticos; sin afirmar persistencia |
| IV. Pruebas primero | Cumple (se aplica en implementación) | Pruebas escritas antes, vistas fallar, luego implementar; cubren normal, vacío, un solo destino, coherencia y no regresión |
| V. Accesibilidad y modo demostración | No aplica | El frontend no cambia (ver Supuestos de la especificación) |
| VI. Cambios pequeños y trazables | Cumple | 2 archivos tocados/creados en backend; trazabilidad FR→prueba en `quickstart.md`; sin commit sin autorización |

**Resultado**: sin violaciones; no se requiere Seguimiento de complejidad. Reevaluación
posterior al diseño: igual, sin cambios.

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/001-resumen-categorias/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── categories.md
└── tasks.md            # lo genera /speckit-tasks (no existe aún)
```

### Código fuente (raíz del repositorio)

```text
backend/
├── app/
│   └── main.py                      # + modelos de respuesta, summarize_categories, GET /api/categories
└── tests/
    └── test_category_summary.py     # nuevo: función pura + endpoint (TestClient)
```

**Decisión de estructura**: la función va en `backend/app/main.py`, junto al catálogo, y no en
un módulo nuevo. El proyecto es de un solo archivo de aplicación y los tests importan
`backend.app.main`; un módulo aparte añadiría ruido de importación (`app.` vs `backend.app.`)
sin beneficio a esta escala. La separación pedida es de función frente a endpoint, no de
archivo. Las pruebas existentes no se modifican.

## Seguimiento de complejidad

Sin violaciones que justificar.
