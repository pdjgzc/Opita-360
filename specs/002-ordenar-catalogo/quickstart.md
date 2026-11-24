# Guía de validación (Fase 1): Ordenar el catálogo de destinos

Escenarios para comprobar la funcionalidad de punta a punta. Detalle de opciones y garantías en [data-model.md](data-model.md) y [contracts/sorting-module.md](contracts/sorting-module.md).

## Requisitos previos

- Node.js 22.12+ y dependencias instaladas: `npm install` en `frontend`.
- Python 3.10+ con el entorno del backend (solo para la comprobación de regresión y para el escenario con API).

## 1. Pruebas automáticas del frontend (sin navegador)

Desde `frontend`:

```text
node --test tests/destination-sorting.test.js
npm test
npm run build
```

Resultado esperado: todas las pruebas pasan, incluidas las anteriores sin modificar (entre ellas `performance-a11y.test.js`, que valida los estilos nuevos: texto ≥ 12px y contraste 4.5:1), y la compilación termina sin errores. El archivo nuevo cubre: las cuatro opciones con el `fallback-destinations.json` real, desempates, tildes y mayúsculas, lista vacía, clave desconocida, no mutación, `filterFavorites` y su combinación con el orden, `sortAnnouncement` (singular, plural, 0 y cantidad inválida) y la conservación de la clave al cambiar de lista (FR-010). Siguiendo la constitución (IV), antes de implementar `destination-sorting.js` la primera orden debe **fallar** (módulo inexistente); se registra ese fallo y luego pasa.

## 2. Regresión del backend

Desde la raíz del repositorio:

```text
python -B -m unittest discover -s backend/tests -v
```

Resultado esperado: todas las pruebas pasan sin cambios (SC-006, FR-014).

## 3. Verificación manual en el navegador

Desde `frontend`: `npm run dev` y abrir la dirección que indica Vite (normalmente `http://127.0.0.1:5173`).

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1 | Abrir la página y ver «Destinos» | Selector «Ordenar por» con «Orden del catálogo»; 8 tarjetas en el orden original (FR-002) |
| 2 | Elegir «Precio: menor a mayor» | Precios 35.000 … 120.000; Malecón primero, Parque Arqueológico último; la numeración va 01 … 08 siguiendo la posición visible (Malecón lleva 01) |
| 3 | Elegir «Precio: mayor a menor» | Orden inverso del paso 2; la numeración vuelve a ir 01 … 08 de arriba abajo (Parque Arqueológico lleva 01) |
| 4 | Elegir «Nombre: A a Z» | Centro de Neiva … Termales de Rivera (ver contrato) |
| 5 | Volver a «Orden del catálogo» | Regresa al orden original |
| 6 | Categoría «Cultura» y «Precio: menor a mayor» | Malecón, Centro de Neiva, Parque Arqueológico |
| 7 | Con «Nombre: A a Z», escribir una búsqueda, cambiar municipio y fijar costo máximo | El resultado sigue en orden alfabético sin volver a elegir el orden |
| 8 | Marcar dos favoritos, activar «Solo favoritos» y elegir un orden de precio | Solo favoritos, ordenados por precio |
| 9 | Combinación de filtros sin resultados y cambiar el orden | Mismo mensaje de «sin resultados» de hoy, sin error |

## 4. Modo demostración y API

1. Con el backend **apagado** y el aviso «Modo demostración» visible, repetir los pasos 2–4: mismas secuencias.
2. Con el backend **encendido** (`uvicorn` según el `README.md`), recargar y repetir: mismas secuencias.
3. Cambio de fuente (FR-010). La página no tiene una recarga de datos sin reiniciarla: arranca con el catálogo local y lo reemplaza por el de la API cuando termina la consulta inicial. Para verlo: con el backend **encendido**, en las herramientas del navegador (pestaña Red) aplicar una limitación «Slow 3G» o bloquear temporalmente `/api/destinations`, recargar la página, elegir «Precio: mayor a menor» mientras la consulta sigue pendiente y luego quitar la limitación o el bloqueo para que la consulta termine. Resultado esperado: al llegar el catálogo de la API el selector sigue en «Precio: mayor a menor» y las tarjetas siguen en ese orden. Recargar la página reinicia el orden a «Orden del catálogo». Si no se puede lograr la ventana de tiempo, la conservación de la clave queda cubierta por la prueba de lógica de FR-010 y por revisión de que ningún efecto de `main.jsx` escribe `sortKey`.

## 5. Teclado y lector de pantalla

1. Recorrer la página solo con Tab: el selector recibe el foco tras el filtro de municipio, con contorno visible.
2. Cambiar la opción con el teclado: se aplica sin ratón y el foco permanece en el selector.
3. Con un lector de pantalla (p. ej. NVDA): el control se lee como «Ordenar por»; al cambiar se anuncia, por ejemplo, «Ordenado por precio, de menor a mayor. 8 destinos.».
4. Con «Cultura» activa, el anuncio dice «3 destinos»; con un único resultado, «1 destino».
5. Cambiar un filtro (categoría, búsqueda) **no** produce un anuncio de orden y el texto de la región junto al selector queda vacío (no conserva una cantidad desactualizada); el siguiente cambio de orden vuelve a anunciar con la cantidad correcta.
6. Con «Solo favoritos» activo, marcar o desmarcar un favorito cambia el resultado: el mensaje de orden también se retira.

## Criterios de aceptación de la guía

Se cumple cuando los pasos 1–5 dan los resultados esperados (§3, §4 con el escenario del paso 4.3 o su cobertura por prueba de lógica, y §5), `npm test`, `npm run build` y las pruebas del backend pasan, y no hay cambios en `backend/` ni en `fallback-destinations.json` (`git diff --stat`).
