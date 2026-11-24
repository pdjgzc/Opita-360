<!--
Sync Impact Report
- Cambio de versión: plantilla sin ratificar → 1.0.1 (1.0.0 + aclaración del flujo tras revisión humana)
- Principios añadidos: I. Lógica pura y estado inmutable; II. Contratos de API estables y
  validados; III. Catálogo único en memoria; IV. Pruebas antes de dar algo por hecho;
  V. Accesibilidad y modo demostración; VI. Cambios pequeños, trazables y revisados
- Secciones añadidas: Restricciones técnicas; Flujo de trabajo y control humano; Gobernanza
- Secciones eliminadas: ninguna
- Pendientes diferidos: ninguno
- Plantillas dependientes: no se modificaron (se leen en tiempo de ejecución)
-->
# Constitución de OPITA 360

## Core Principles

### I. Lógica pura y estado inmutable
- En el frontend, la lógica de filtros, orden y validación MUST vivir en módulos `.js` de
  funciones puras (como `frontend/src/destination-filters.js`), sin dependencias de React.
- Las funciones MUST NOT mutar sus argumentos: se copian los arreglos antes de ordenar
  (`[...x].sort(...)`) y el estado de React MUST NOT mutarse directamente. La vista usa
  estado derivado para filtros.
- En Python, nombres de funciones, variables y módulos MUST usar `snake_case`.

Justificación: las funciones puras se prueban sin navegador y evitan errores de render.

### II. Contratos de API estables y validados
- Toda entrada del backend MUST validarse con FastAPI + Pydantic (límites de rango, longitud
  y tipo, p. ej. `Field(ge=..., le=...)`, `Path(gt=0)`); no se confía en datos del cliente.
- Las respuestas MUST seguir siendo compatibles con el frontend; cambiar una forma de
  respuesta o la URL de la API exige coordinar backend y frontend.
- Los errores de cliente MUST devolver códigos 4xx con mensajes claros (p. ej. 404
  «Destino no encontrado», 422 por validación).
- Un endpoint nuevo MUST NOT romper los existentes: `GET /`, `GET /api/destinations`,
  `GET /api/destinations/{destination_id}` y `POST /api/recommendations`. CORS no se
  modifica sin necesidad (puertos locales 8000 y 5173).

### III. Catálogo único en memoria
- `DESTINATIONS` en `backend/app/main.py` y `frontend/src/fallback-destinations.json`
  MUST ser idénticos; una prueba automática (`backend/tests/test_review_fixes.py`) lo
  verifica y MUST mantenerse.
- Los destinos y recomendaciones viven en memoria. La documentación y el código MUST NOT
  afirmar persistencia en PostgreSQL; `database/schema.sql` solo prepara el esquema.

### IV. Pruebas antes de dar algo por hecho (NON-NEGOTIABLE)
- Cada funcionalidad MUST incluir pruebas automáticas: `unittest` en `backend/tests` y
  `node --test` en `frontend/tests`.
- Las pruebas MUST escribirse primero, verse fallar por la razón esperada y luego pasar
  tras implementar. Los fallos reales se registran; no se simula el ciclo.
- Cubrir casos normales, vacíos y entradas inválidas.
- Compilar (`npm run build`) o comprobar sintaxis NO sustituye a las pruebas funcionales.
  Una tarea no se marca como hecha por haber generado un archivo.

### V. Accesibilidad y modo demostración
- Todo control MUST tener etiqueta accesible y ser operable con teclado; los estados de
  carga, error y resultados MUST anunciarse con mensajes en regiones `aria-live`.
- La aplicación MUST seguir funcionando sin la API, usando
  `frontend/src/fallback-destinations.json` (modo demostración), con aviso claro al usuario.
- Los filtros por municipio incluyen la opción «Todos los municipios», se combinan con
  búsqueda y categoría, y reinician la selección si el catálogo cambia.

### VI. Cambios pequeños, trazables y revisados por una persona
- Los cambios MUST ser pequeños y acotados al plan aprobado.
- Cada requisito `FR-NNN` MUST trazarse a tareas y a pruebas concretas.
- Nada se publica, fusiona ni sube (commit, push, PR, merge) sin revisión y autorización
  humana explícita.
- El repositorio MUST NOT contener secretos, tokens, nombres de cuentas ni rutas locales.

## Restricciones técnicas
- Backend: Python 3.10+ con FastAPI y Pydantic.
- Frontend: React 19 + Vite, con lucide-react para iconos; Node.js 22.12+.
- No se añaden dependencias, proveedores de pago ni descargas sin aprobación.
- Verificación desde la raíz: `python -B -m unittest discover -s backend/tests -v` y, en
  `frontend`, `npm test` y `npm run build`.

## Flujo de trabajo y control humano
1. Leer `README.md`, `AGENTS.md`, el `AGENTS.md` de la carpeta afectada y la especificación.
2. Cada funcionalidad sigue el flujo de Spec Kit: `/speckit-specify` → `/speckit-clarify` →
   `/speckit-plan` → `/speckit-checklist` → `/speckit-tasks` → `/speckit-analyze` →
   `/speckit-implement` → `/speckit-converge`. Una persona revisa la salida de cada paso
   antes de seguir y aprueba antes de implementar.
3. Ejecutar la verificación y revisar los hallazgos antes de proponer un PR.
4. Cada funcionalidad se trabaja en su propia rama numerada (`NNN-nombre`) y se integra por PR
   en la rama de trabajo de la que salió, con revisión de una persona. Una rama de trabajo
   declarada como no fusionable (p. ej. una rama de recuperación) MUST NOT fusionarse en
   `main`. No se atribuye revisión de terceros sin evidencia.

## Governance
- Esta constitución prevalece sobre otras prácticas del proyecto; `AGENTS.md` y los
  `AGENTS.md` de carpeta son guía operativa complementaria.
- Las enmiendas MUST proponerse mediante PR, con justificación y plan de migración si afectan
  a código existente, y requieren revisión humana.
- Versionado semántico: MAJOR por eliminar o redefinir principios de forma incompatible;
  MINOR por añadir un principio o ampliar materialmente la guía; PATCH por aclaraciones.
- Cada PR y revisión MUST verificar el cumplimiento de estos principios; toda complejidad o
  excepción se justifica por escrito en el PR.

**Version**: 1.0.1 | **Ratified**: 2026-11-24 | **Last Amended**: 2026-11-24
