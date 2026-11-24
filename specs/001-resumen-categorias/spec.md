# Especificación de funcionalidad: Resumen del catálogo por categoría

**Rama de la funcionalidad**: `001-resumen-categorias`

**Creada**: 2026-11-24

**Estado**: Borrador

**Entrada**: Descripción del usuario: «Nombre corto: resumen-categorias. Quiero que la API de OPITA 360 ofrezca un resumen del catálogo por categoría turística, para que el frontend o cualquier cliente sepa qué categorías hay sin descargar y recorrer todos los destinos. Para cada categoría presente en el catálogo debe indicar cuántos destinos tiene y el precio más bajo y el más alto entre ellos, en pesos colombianos. Solo aparecen categorías que tengan al menos un destino. El resumen debe ser coherente con el catálogo de destinos que ya devuelve la API. Es una consulta de solo lectura y no debe cambiar el comportamiento de los endpoints existentes.»

## Clarifications

### Session 2026-11-24

- Q: ¿Qué ruta y qué nombres de campos debe tener la respuesta del resumen? → A: `GET /api/categories` (sin `/summary`, siguiendo el patrón de `/api/destinations`), con campos en inglés `total_destinations`, `currency` (`"COP"`) y `categories[]` con `category`, `count`, `min_price`, `max_price`.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Consultar el resumen por categoría (Prioridad: P1)

Un cliente de la API (el frontend de OPITA 360 u otra aplicación) solicita el resumen del catálogo y recibe, en una sola respuesta pequeña, la lista de categorías turísticas disponibles. Para cada categoría obtiene cuántos destinos tiene y el precio más bajo y el más alto entre ellos, en pesos colombianos. Así puede mostrar opciones de categoría y rangos de precio sin descargar ni recorrer todos los destinos.

**Por qué esta prioridad**: es el valor central de la funcionalidad; sin esta consulta no hay forma ligera de conocer las categorías y sus rangos de precio.

**Prueba independiente**: se puede probar por completo solicitando el resumen con el catálogo actual y comparando cada categoría con el conteo y los precios mínimo y máximo calculados a mano a partir de los destinos. Entrega valor por sí sola.

**Escenarios de aceptación**:

1. **Dado** el catálogo actual (8 destinos), **cuando** el cliente solicita el resumen, **entonces** recibe exactamente cuatro categorías: Aventura (2 destinos, de 70.000 a 90.000 COP), Bienestar (1 destino, de 65.000 a 65.000 COP), Cultura (3 destinos, de 35.000 a 120.000 COP) y Naturaleza (2 destinos, de 85.000 a 95.000 COP).
2. **Dado** una categoría con un único destino, **cuando** se solicita el resumen, **entonces** su precio más bajo y su precio más alto son iguales al precio de ese destino y su conteo es 1.
3. **Dado** que se solicita el resumen varias veces sin cambios en el catálogo, **cuando** se comparan las respuestas, **entonces** son idénticas, incluido el orden de las categorías.

---

### Historia de usuario 2 - Coherencia con el catálogo de destinos (Prioridad: P2)

Quien mantiene el sistema necesita la garantía de que el resumen nunca contradice la lista de destinos que ya devuelve la API: la suma de los conteos del resumen es igual al total de destinos, y cada categoría y cada precio del resumen se corresponden con destinos reales de esa lista.

**Por qué esta prioridad**: un resumen que no coincide con el catálogo confundiría a los clientes; es una garantía de calidad sobre la historia P1, pero depende de ella.

**Prueba independiente**: se obtienen el resumen y la lista completa de destinos, y se verifica por separado que los conteos suman el total y que los mínimos y máximos de cada categoría coinciden con los de los destinos de esa categoría.

**Escenarios de aceptación**:

1. **Dado** el resumen y el catálogo de destinos, **cuando** se suman los conteos de todas las categorías, **entonces** el resultado es igual al total de destinos del catálogo.
2. **Dado** cualquier categoría del resumen, **cuando** se filtran los destinos del catálogo con esa categoría, **entonces** su cantidad, su precio más bajo y su precio más alto coinciden con los del resumen.
3. **Dado** un destino cuya categoría no estaba antes en el catálogo, **cuando** se agrega y se solicita el resumen, **entonces** aparece la nueva categoría sin que haya que cambiar nada más.

---

### Historia de usuario 3 - Catálogo sin impacto en lo existente (Prioridad: P3)

Quien integra la API necesita que añadir el resumen no altere nada de lo que ya funciona: la lista de destinos, el detalle de un destino y las recomendaciones responden exactamente igual que antes.

**Por qué esta prioridad**: protege a los clientes actuales; no aporta capacidad nueva, pero su incumplimiento rompería el frontend.

**Prueba independiente**: se ejecutan las pruebas existentes de los endpoints actuales y se confirma que pasan sin modificarlas.

**Escenarios de aceptación**:

1. **Dado** la API con la nueva consulta disponible, **cuando** se consultan la lista de destinos, el detalle de un destino y las recomendaciones, **entonces** las respuestas mantienen la misma forma y contenido que antes.
2. **Dado** una consulta del resumen, **cuando** se completa, **entonces** el catálogo queda sin ninguna modificación.

---

### Casos límite

- ¿Qué ocurre si el catálogo está vacío? El resumen devuelve una lista de categorías vacía y un total de 0, sin error.
- ¿Qué ocurre con una categoría sin destinos? No aparece en el resumen; solo se listan categorías con al menos un destino.
- ¿Qué ocurre si dos destinos tienen el mismo precio? Cuentan ambos; el precio más bajo y el más alto pueden coincidir.
- ¿Qué ocurre si dos categorías se escriben igual salvo mayúsculas o espacios? Se tratan como categorías distintas, tal como están escritas en el catálogo; el resumen no las reinterpreta (ver Supuestos).
- ¿Qué ocurre si el cliente envía parámetros que la consulta no admite? El resumen no define parámetros de entrada; cualquier parámetro adicional se ignora y no altera el resultado.
- ¿Qué ocurre si se usa un método distinto de consulta (por ejemplo, intentar modificar el resumen)? La API responde con un error de cliente de método no permitido; el resumen no se puede modificar.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema MUST ofrecer una consulta de solo lectura, `GET /api/categories`, que devuelva el resumen del catálogo agrupado por categoría turística.
- **FR-002**: Para cada categoría incluida, el resumen MUST indicar el nombre de la categoría (`category`), el número de destinos que tiene (`count`), el precio más bajo (`min_price`) y el precio más alto (`max_price`) entre esos destinos.
- **FR-003**: Los precios del resumen MUST expresarse en pesos colombianos (COP), en la misma unidad y como los mismos valores numéricos que usan los destinos del catálogo, sin conversiones ni redondeos. La respuesta MUST incluir el campo `currency` con el valor `"COP"` para dejar la unidad explícita.
- **FR-004**: El resumen MUST incluir solo las categorías que tengan al menos un destino en el catálogo; las categorías sin destinos no aparecen.
- **FR-005**: El resumen MUST derivarse del mismo catálogo de destinos que devuelve la API, de modo que la suma de los conteos por categoría sea igual al total de destinos y los precios mínimo y máximo de cada categoría coincidan con los de sus destinos.
- **FR-006**: El resumen MUST incluir también el número total de destinos del catálogo (`total_destinations`), para que el cliente verifique la coherencia sin otra consulta.
- **FR-007**: Las categorías MUST devolverse en un orden estable y predecible (alfabético por nombre de categoría), de modo que dos consultas con el mismo catálogo den respuestas idénticas.
- **FR-008**: La consulta MUST NOT modificar el catálogo ni ningún otro dato; solicitarla repetidamente no produce efectos secundarios.
- **FR-009**: La consulta MUST NOT cambiar el comportamiento ni la forma de respuesta de los endpoints existentes (`GET /`, `GET /api/destinations`, `GET /api/destinations/{destination_id}` y `POST /api/recommendations`).
- **FR-010**: Con un catálogo vacío, el sistema MUST responder con éxito, con una lista de categorías vacía y un total de 0.
- **FR-011**: La consulta MUST NOT requerir parámetros de entrada ni datos del cliente para obtener el resumen completo.
- **FR-012**: La funcionalidad MUST incluir pruebas automáticas que cubran el catálogo actual, una categoría con un solo destino, el catálogo vacío, la coherencia con la lista de destinos y la no alteración de los endpoints existentes.

### Entidades clave

- **Destino**: sitio turístico del catálogo, con nombre, municipio, categoría, precio en pesos colombianos y duración. Es la fuente única de la que se calcula el resumen; no se modifica.
- **Resumen de categoría**: agrupación derivada de los destinos que comparten una misma categoría. Atributos: nombre de la categoría, cantidad de destinos, precio más bajo y precio más alto (COP). Existe solo si la categoría tiene al menos un destino.
- **Resumen del catálogo**: conjunto de resúmenes de categoría más el total de destinos del catálogo.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: Un cliente conoce todas las categorías del catálogo, con su cantidad de destinos y su rango de precios, con una sola consulta, sin necesidad de recorrer la lista de destinos.
- **SC-002**: En el 100 % de las verificaciones, la suma de los destinos por categoría del resumen es igual al total de destinos del catálogo.
- **SC-003**: En el 100 % de las categorías, el precio más bajo, el más alto y el conteo del resumen coinciden con los calculados a partir de la lista de destinos.
- **SC-004**: El resumen del catálogo actual se obtiene en menos de 1 segundo, y su tamaño es menor que el de la lista completa de destinos.
- **SC-005**: Todas las pruebas existentes de los endpoints actuales siguen pasando sin modificarlas.

## Supuestos

- «Categoría» es el valor de categoría que ya tiene cada destino del catálogo (hoy: Aventura, Bienestar, Cultura y Naturaleza); esta funcionalidad no crea, renombra ni valida categorías.
- Las categorías se agrupan por su valor tal como está escrito en el catálogo, sin normalizar mayúsculas ni espacios.
- Los precios del catálogo ya están en pesos colombianos y se reportan tal cual, sin símbolo de moneda ni formato de texto; la unidad se indica de forma explícita en el campo `currency` (`"COP"`) de la respuesta.
- El orden alfabético por nombre de categoría es la decisión por defecto, porque la descripción no pide otro orden.
- El resumen cubre todo el catálogo; no admite filtros por municipio, rango de precio ni otros criterios (fuera de alcance).
- El frontend no cambia en esta funcionalidad; el resumen queda disponible para que lo consuman el frontend u otros clientes más adelante. El modo demostración sin API queda fuera de alcance.
- El catálogo vive en memoria y no cambia mientras la API corre, de modo que no se requiere almacenamiento ni caché adicional.
- No se añaden dependencias nuevas, y no hay autenticación, igual que en los endpoints actuales.
