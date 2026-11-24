# Checklist de contrato de API: Resumen del catálogo por categoría

**Propósito**: validar la calidad de los requisitos del contrato `GET /api/categories` (completitud, claridad, coherencia con el catálogo, casos vacíos e inválidos y medibilidad). No comprueba la implementación.
**Creada**: 2026-11-24
**Funcionalidad**: [spec.md](../spec.md) · [contracts/categories.md](../contracts/categories.md) · [plan.md](../plan.md) · [data-model.md](../data-model.md)
**Público**: persona que revisa el PR · **Profundidad**: estándar

**Nota**: checklist personalizado generado por `/speckit-checklist`.
**Propiedad de la revisión**: es un artefacto de revisión de calidad de requisitos a cargo de quien revisa. Marca un ítem `[x]` solo cuando determines que el criterio de calidad del requisito se cumple.
**Semántica de la marca**: `[x]` significa que el criterio se revisó y se cumple para los requisitos. No significa que el trabajo de implementación esté terminado.

## Completitud del contrato

- [x] CHK001 ¿Están definidos ruta, método, ausencia de parámetros y ausencia de autenticación en un solo lugar, sin contradicciones entre la spec y el contrato? [Completitud, Spec §FR-001, §FR-011, Contrato §Solicitud]
- [x] CHK002 ¿Se especifican tipo, nulabilidad y obligatoriedad de cada campo de la respuesta (`total_destinations`, `currency`, `categories[]`, `category`, `count`, `min_price`, `max_price`)? [Completitud, Spec §FR-002, Contrato §Respuesta 200]
- [x] CHK003 ¿Está definido en la spec (y no solo en el contrato o el plan) que los precios son enteros? La spec dice «mismos valores numéricos» pero solo el contrato y el modelo de datos dicen `entero`. [Brecha, Spec §FR-003, Contrato §Respuesta 200]
- [x] CHK004 ¿Se define si la respuesta puede contener campos adicionales no documentados, o si el conjunto de campos es cerrado? [Brecha, Contrato §Respuesta 200]
- [x] CHK005 ¿Se define el tipo de contenido de la respuesta (`application/json`) y su codificación para nombres con tilde? [Brecha, Contrato §Respuesta 200]
- [x] CHK006 ¿Se documenta la política de versionado o de evolución del contrato (p. ej. agregar campos después sin romper clientes)? [Brecha, Constitución §II]
- [x] CHK007 ¿Está establecido qué ocurre con `HEAD`, `OPTIONS` y la ruta con barra final (`/api/categories/`)? El contrato solo enumera `POST/PUT/PATCH/DELETE`. [Brecha, Contrato §Errores]

## Claridad y ambigüedad

- [x] CHK008 ¿«Orden alfabético» (FR-007) está definido sin ambigüedad? La spec dice «alfabético» y el contrato dice «comparación de cadenas, sin normalizar»; con tildes o mayúsculas iniciales distintas ambos criterios divergen. [Ambigüedad / Conflicto, Spec §FR-007, Contrato §Respuesta 200, Investigación §D2]
- [x] CHK009 ¿«Resumen pequeño» y «tamaño menor que el de la lista completa» (SC-004) están cuantificados con un umbral y una forma de medirlo? [Medibilidad, Spec §SC-004]
- [x] CHK010 ¿«Menos de 1 segundo» (SC-004) indica condiciones de medición (entorno, catálogo, percentil)? [Claridad, Spec §SC-004]
- [x] CHK011 ¿Está definido «sin conversiones ni redondeos» con una regla verificable (igualdad exacta de valores) y no solo como intención? [Claridad, Spec §FR-003]
- [x] CHK012 ¿Se define con precisión qué significa «parámetros que la consulta no admite se ignoran» (consulta, cabeceras, cuerpo en un `GET`)? [Claridad, Spec §Casos límite, Contrato §Solicitud]
- [x] CHK013 ¿El término «error de cliente de método no permitido» se concreta en el código 405 también en la spec, no solo en el contrato? [Claridad, Spec §Casos límite, Contrato §Errores]

## Coherencia con el catálogo

- [x] CHK014 ¿Las reglas de coherencia (suma de `count` = `total_destinations`; min/max/count por categoría = valores de los destinos) están expresadas como invariantes verificables y trazadas a SC-002 y SC-003? [Coherencia, Spec §FR-005, §SC-002, §SC-003, Modelo de datos §Invariantes]
- [x] CHK015 ¿Está definido contra qué fuente se compara la coherencia («mismo catálogo que devuelve la API»), incluyendo si `/api/destinations` aplica algún filtro o paginación que pudiera hacer divergir el total? [Dependencia, Spec §FR-005, §US2]
- [x] CHK016 ¿Existe conflicto entre US2-escenario 3 («se agrega un destino») y el supuesto de catálogo en memoria que no cambia mientras corre la API? Falta definir cómo se «agrega» un destino y qué se prueba. [Conflicto, Spec §US2, §Supuestos]
- [x] CHK017 ¿El requisito de agrupar «tal como está escrito» define el resultado esperado cuando dos categorías difieren solo por mayúsculas, espacios o tildes (dos entradas separadas, ordenadas según CHK008)? [Cobertura, Spec §Casos límite, §Supuestos]
- [x] CHK018 ¿Se define una línea base verificable para «no cambia la forma ni el contenido» de los 4 endpoints existentes (FR-009): qué pruebas existentes cubren la forma de cada uno? [Medibilidad / Brecha, Spec §FR-009, §SC-005]

## Casos vacíos

- [x] CHK019 ¿Está especificada la respuesta exacta con catálogo vacío (código, `total_destinations`, `currency`, `categories`) de forma consistente entre spec, contrato y modelo de datos? [Coherencia, Spec §FR-010, Contrato §Respuesta 200, Modelo de datos §Invariantes 5]
- [x] CHK020 ¿Se aclara si `currency` permanece `"COP"` con catálogo vacío? La spec lo exige siempre, pero solo el contrato lo muestra en el ejemplo vacío. [Claridad, Spec §FR-003, §FR-010]
- [x] CHK021 ¿Está definido el escenario de una categoría con un solo destino (`count` = 1, `min_price` = `max_price`) como requisito de contrato y no solo como escenario de prueba? [Cobertura, Spec §US1-2, Modelo de datos §CategorySummary]

## Casos inválidos y errores

- [x] CHK022 ¿Se define el formato del cuerpo de error del 405 y su compatibilidad con los demás errores 4xx del proyecto (mensaje claro exigido por la constitución)? [Brecha, Contrato §Errores, Constitución §II]
- [x] CHK023 ¿Se definen los requisitos ante datos inválidos en el catálogo (destino sin `category`, categoría vacía o `null`, precio ausente, no numérico o negativo)? [Brecha, Spec §Casos límite]
- [x] CHK024 ¿Se define el comportamiento ante fallo interno (5xx) o se declara explícitamente fuera de alcance? [Brecha, Contrato §Errores]
- [x] CHK025 ¿Es coherente la decisión de ignorar parámetros extra con el principio «toda entrada se valida» de la constitución, y está justificada la excepción por escrito? [Coherencia, Spec §FR-011, Constitución §II]
- [x] CHK026 ¿Se justifica por qué no existen 404 ni 422 propios y se confirma que esa decisión es intencional y no una omisión? [Suposición, Contrato §Errores]

## Calidad de los criterios de aceptación

- [x] CHK027 ¿Cada criterio de éxito (SC-001 a SC-005) es objetivamente verificable, con un método de medición indicado? SC-001 («una sola consulta») y SC-004 carecen de método. [Medibilidad, Spec §SC-001, §SC-004]
- [x] CHK028 ¿Los valores esperados del catálogo actual (4 categorías, 8 destinos, precios) son idénticos en spec §US1-1, contrato y modelo de datos? [Coherencia, Spec §US1, Contrato §Respuesta 200, Modelo de datos §Resultado esperado]
- [x] CHK029 ¿Se define qué significa «respuestas idénticas» (igualdad del cuerpo JSON, del orden de claves o de los bytes)? [Claridad, Spec §US1-3, Contrato §Garantías]
- [x] CHK030 ¿La trazabilidad FR → prueba cubre todos los requisitos, incluido FR-012, y el contrato omite referencias a FR-012 y a los SC? [Trazabilidad, Contrato §Trazabilidad, Quickstart §3]

## Notas

- Marca un ítem `[x]` solo después de que la revisión confirme que el criterio de calidad del requisito se cumple.
- Deja sin marcar los ítems que requieran aclaración, corrección o evaluación de quien revisa.
- `/speckit-implement` lee el estado de las casillas como puerta y no modifica las marcas.
- `checklists/requirements.md` tiene un ciclo de vida propio, mantenido por `/speckit-specify` y `/speckit-clarify`.
- Los ítems CHK008, CHK016, CHK022 y CHK023 señalan los hallazgos de mayor riesgo detectados al leer los artefactos.

## Revisión de la persona revisora (2026-11-24)

Los 30 ítems se revisaron. Cambios hechos en `spec.md` para que se cumplan:

- CHK003, CHK011: FR-003 exige precios enteros iguales al `price` de algún destino.
- CHK008, CHK029: FR-007 define el orden (cadena tal como está escrita, sin normalizar) y que «idénticas» es igualdad del cuerpo JSON, incluido el orden de `categories`.
- CHK016: el escenario 3 de la historia 2 usa un catálogo sintético; el catálogo real no cambia en ejecución.
- CHK009, CHK010, CHK027: SC-004 pasa a una comparación medible de tamaños; se retira el «menos de 1 segundo», que no tenía método de medición.
- CHK013, CHK022: el caso límite fija el 405 y su cuerpo `{"detail": "Method Not Allowed"}`.
- CHK019, CHK020: FR-010 fija 200, lista vacía, total 0 y `currency` "COP".
- CHK007, CHK023, CHK024: `HEAD`, `OPTIONS`, barra final, 5xx y datos inválidos del catálogo quedan declarados fuera de alcance.
- CHK012, CHK025, CHK026: los parámetros extra se ignoran porque no se lee entrada; no hay 404 ni 422 propios porque no hay recurso ni entrada que validar.

Sin cambios porque ya se cumplían: CHK001, CHK002, CHK004–CHK006 (el contrato es cerrado y añadir campos sería un cambio compatible), CHK014, CHK015, CHK017, CHK018, CHK021, CHK028, CHK030.
