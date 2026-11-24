# Plan de implementación: Ordenar el catálogo de destinos

**Rama**: `002-ordenar-catalogo` | **Fecha**: 2026-11-24 | **Especificación**: [spec.md](spec.md)

**Entrada**: especificación `specs/002-ordenar-catalogo/spec.md` (con la sesión de aclaraciones del 2026-11-24).

## Resumen

Se añade un selector «Ordenar por» con cuatro opciones (orden del catálogo, precio ascendente, precio descendente, nombre A–Z) a la zona de filtros del catálogo. La lógica vive en un módulo nuevo de funciones puras, `frontend/src/destination-sorting.js`, que no muta su entrada y se prueba con `node --test` sin navegador. El filtro «solo favoritos» se extrae de `main.jsx` a una función pura, `filterFavorites`, en `frontend/src/destination-filters.js`, para poder probar sin navegador su combinación con el orden. `main.jsx` aplica el orden **después** de los filtros existentes (estado derivado con `useMemo`), guarda la opción elegida en un estado propio que no se reinicia al cambiar el catálogo, y anuncia el orden en una región `aria-live` solo cuando se cambia el orden; el mensaje se retira si cambia el resultado filtrado. No se toca el backend ni se añaden dependencias.

## Contexto técnico

**Lenguaje/Versión**: JavaScript (módulos ES) con React 19 en Vite; Node.js 22.12+ para las pruebas.

**Dependencias principales**: ninguna nueva (se usa `Intl.Collator` del propio entorno).

**Almacenamiento**: N/A. El orden es estado de la vista y no se persiste (spec, Supuestos).

**Pruebas**: `node --test` en `frontend/tests/*.test.js` (estilo de `destination-filters.test.js`: `node:test`, `assert/strict`, catálogo congelado con `Object.freeze`). Los estilos nuevos deben pasar `frontend/tests/performance-a11y.test.js` sin modificarlo.

**Plataforma objetivo**: navegador moderno (frontend estático servido por Vite).

**Tipo de proyecto**: aplicación web (frontend + backend); esta funcionalidad solo toca el frontend.

**Metas de rendimiento**: reordenar en menos de 1 s sin recarga (SC-003). El catálogo tiene 8 destinos, por lo que ordenar es trivial.

**Restricciones**: sin cambios en backend ni en `fallback-destinations.json`; `destination-filters.js` solo gana la función `filterFavorites` (las existentes no cambian); sin dependencias nuevas; funciones puras sin React; entradas no mutadas; textos en español.

**Escala/Alcance**: 8 destinos hoy; el diseño no depende de ese número.

No quedan marcas `NEEDS CLARIFICATION`; las decisiones se registran en [research.md](research.md).

## Verificación de la constitución

*Puerta previa a la Fase 0 y reevaluada tras el diseño de la Fase 1.*

| Principio | Cumplimiento | Estado |
|-----------|--------------|--------|
| I. Lógica pura y estado inmutable | Orden en `destination-sorting.js`, sin React, con `[...destinations].sort(...)`. «Solo favoritos» sale de `main.jsx` a la función pura `filterFavorites`. En la vista el orden es estado derivado (`useMemo`) y el estado de React no se muta. | Cumple |
| II. Contratos de API estables | No se toca el backend, sus endpoints ni sus respuestas (FR-014). | No aplica / Cumple |
| III. Catálogo único en memoria | No se modifica `DESTINATIONS` ni `fallback-destinations.json`; la prueba de identidad existente sigue vigente. | Cumple |
| IV. Pruebas antes de dar algo por hecho | Las pruebas se escriben primero, se ven fallar (el módulo no existe) y luego pasan; casos normales, vacíos e inválidos (FR-015). | Cumple |
| V. Accesibilidad y modo demostración | Etiqueta «Ordenar por», operable con teclado, foco visible, anuncio en `aria-live`; funciona igual con el catálogo local. | Cumple |
| VI. Cambios pequeños y trazables | Un módulo nuevo, un archivo de pruebas, una función añadida a `destination-filters.js` y cambios acotados en `main.jsx` y `styles.css`. Trazabilidad FR→tareas→pruebas en `/speckit-tasks`. Sin commit. | Cumple |

Restricciones técnicas: sin dependencias nuevas; verificación con `npm test` y `npm run build` en `frontend` y `python -B -m unittest discover -s backend/tests -v` desde la raíz (SC-006).

**Resultado de la puerta**: aprobada, sin violaciones. Reevaluada tras la Fase 1: sin cambios. La sección de seguimiento de complejidad queda vacía.

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/002-ordenar-catalogo/
├── plan.md                    # Este archivo
├── research.md                # Fase 0
├── data-model.md              # Fase 1
├── quickstart.md              # Fase 1
├── contracts/
│   └── sorting-module.md      # Fase 1: contrato del módulo y de la interfaz
└── tasks.md                   # Fase 2 (/speckit-tasks; no lo crea este comando)
```

### Código fuente (raíz del repositorio)

```text
frontend/
├── src/
│   ├── destination-sorting.js   # NUEVO: opciones, validación, orden y mensaje de anuncio (puro)
│   ├── destination-filters.js   # CAMBIO: se añade filterFavorites (puro); lo demás no cambia
│   ├── main.jsx                 # CAMBIO: usa filterFavorites; estado de orden, selector, región de anuncio
│   └── styles.css               # CAMBIO: reglas mínimas del selector (reutiliza .municipality-filter)
└── tests/
    └── destination-sorting.test.js   # NUEVO: pruebas del orden, de filterFavorites y de la combinación (escritas primero)
```

**Decisión de estructura**: se sigue el patrón existente de un módulo `.js` de funciones puras por responsabilidad (`destination-filters.js`, `favorites.js`, `trip-request.js`). El orden no se añade a `destination-filters.js` (ordenar no es filtrar; un módulo propio mantiene los cambios pequeños), pero sí se le añade `filterFavorites`, porque «solo favoritos» sí es un filtro y hoy vive sin pruebas dentro de `main.jsx`. Sus pruebas y las de combinación con el orden van en el archivo nuevo para no modificar las pruebas existentes (SC-006). `backend/` no se toca.

## Diseño (resumen)

- **Módulos** (detalle en [contracts/sorting-module.md](contracts/sorting-module.md)): `destination-sorting.js` exporta `SORT_OPTIONS`, `DEFAULT_SORT`, `validSort(key)`, `sortDestinations(destinations, key)` y `sortAnnouncement(key, count)`; `destination-filters.js` gana `filterFavorites(destinations, favoriteIds, onlyFavorites)`.
- **Vista**: `filtered` usa `filterFavorites(filterDestinations(...), favorites.ids, onlyFavorites)` en lugar del filtro en línea. `const [sortKey, setSortKey] = useState(DEFAULT_SORT)`; `visible = useMemo(() => sortDestinations(filtered, sortKey), [filtered, sortKey])` y las tarjetas se generan desde `visible.map((d, i) => …)`, de modo que la numeración (`i + 1`) sigue la posición visible (FR-016). El orden no entra en `filtered`, por lo que no afecta a los filtros ni al reinicio del municipio.
- **Anuncio**: `onChange` del selector llama a `setSortKey(next)` y `setSortMessage(sortAnnouncement(next, filtered.length))`. Un efecto `useEffect(() => setSortMessage(""), [filtered])` vacía el mensaje en cualquier recálculo de `filtered` (también al marcar un favorito con «Solo favoritos» apagado, porque `filtered` depende de `favorites.ids`); vaciar la región no genera anuncio y así nunca muestra una cantidad desactualizada (FR-012). El efecto no se dispara en el propio cambio de orden porque `filtered` no cambia. La región es un `<p role="status" aria-live="polite">`, como las existentes.
- **Selector**: sigue la estructura del filtro de municipio: `<label className="municipality-filter sort-filter" htmlFor="sort-order">` que envuelve un icono `ArrowUpDown` con `aria-hidden="true"`, un `<span>Ordenar por</span>` y `<select id="sort-order">`. El label y el `<p role="status">` del anuncio van juntos dentro de un contenedor `<div className="sort-control">` (columna: label arriba, anuncio debajo), de modo que el anuncio queda bajo el selector y no como un elemento más de la fila. El contenedor va dentro de `.filter-row`, tras el filtro de municipio, para un recorrido con Tab lógico. El foco no se mueve al cambiar la opción.
- **Estilos**: ninguna regla existente se modifica ni se agrupa con selectores nuevos (la prueba A11Y-01 lee la regla `.municipality-filter`). Las reglas nuevas son mínimas (`.sort-control` en columna, `.sort-filter select:focus-visible` y el estilo del `<p>` de estado), con `font-size` ≥ 12px y contraste ≥ 4.5:1, para pasar `performance-a11y.test.js` sin modificarlo.

## Seguimiento de complejidad

Sin violaciones de la constitución; no se requiere justificación.
