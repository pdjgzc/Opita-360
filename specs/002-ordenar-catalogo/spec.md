# Especificación de funcionalidad: Ordenar el catálogo de destinos

**Rama de la funcionalidad**: `002-ordenar-catalogo`

**Creada**: 2026-11-24

**Estado**: Borrador

**Entrada**: Descripción del usuario: «Nombre corto de la funcionalidad: ordenar-catalogo. Quiero que quien explora el catálogo de destinos en la página de OPITA 360 pueda elegir el orden en que se muestran las tarjetas: el orden actual del catálogo (por defecto), precio de menor a mayor, precio de mayor a menor y nombre de la A a la Z. El orden se combina con los filtros que ya existen (búsqueda, categoría, municipio, costo máximo y solo favoritos) sin cambiar qué destinos se muestran, solo su orden. Debe funcionar igual con la API y en modo demostración, usarse con teclado y anunciar el orden elegido a lectores de pantalla.»

## Clarifications

### Session 2026-11-24

- Q: Cuando el orden ya está elegido y se cambia un filtro, ¿el lector de pantalla también debe anunciar el orden y la cantidad de destinos? → A: No. Solo se anuncia al cambiar el orden; los filtros conservan su comportamiento actual.

### Sesión de revisión del plan 2026-11-24

- La página no tiene una recarga de datos sin reiniciarla: el cambio de fuente del catálogo ocurre una sola vez, del catálogo local a la API, cuando termina la consulta inicial. El orden elegido antes de ese momento se conserva (FR-010).
- Cuando cambia el resultado filtrado, el mensaje de anuncio anterior se retira para que la región de anuncios no muestre una cantidad desactualizada; vaciar la región no genera anuncio (FR-012).
- La numeración de las tarjetas sigue la posición visible tras ordenar (FR-016).

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Elegir el orden de las tarjetas (Prioridad: P1)

Una persona que explora el catálogo quiere ver los destinos ordenados según lo que le importa: los más baratos primero, los más caros primero o por nombre alfabético. En la zona de filtros elige una de cuatro opciones de orden («Orden del catálogo», «Precio: menor a mayor», «Precio: mayor a menor» y «Nombre: A a Z») y las tarjetas se reordenan al instante. Al abrir la página, el orden es el del catálogo, igual que hoy.

**Por qué esta prioridad**: es el valor central de la funcionalidad; sin poder elegir el orden no hay nada que entregar.

**Prueba independiente**: con el catálogo completo y sin filtros, se elige cada opción y se compara la secuencia de tarjetas con la secuencia esperada calculada a mano. Entrega valor por sí sola.

**Escenarios de aceptación**:

1. **Dado** la página recién abierta, **cuando** se ve el catálogo, **entonces** el selector de orden muestra «Orden del catálogo» y las tarjetas aparecen en el mismo orden que antes de esta funcionalidad (por identificador: Desierto de la Tatacoa, Parque Arqueológico de San Agustín, Malecón del río Magdalena, Salto de Bordones, Estrecho del río Magdalena, Termales de Rivera, Represa de Betania, Centro de Neiva y tradición opita).
2. **Dado** el catálogo completo (8 destinos), **cuando** se elige «Precio: menor a mayor», **entonces** las tarjetas aparecen con estos precios en orden: 35.000, 45.000, 65.000, 70.000, 85.000, 90.000, 95.000 y 120.000 COP (Malecón del río Magdalena primero y Parque Arqueológico de San Agustín último).
3. **Dado** el catálogo completo, **cuando** se elige «Precio: mayor a menor», **entonces** las tarjetas aparecen exactamente en el orden inverso al del escenario anterior.
4. **Dado** el catálogo completo, **cuando** se elige «Nombre: A a Z», **entonces** las tarjetas aparecen en este orden: Centro de Neiva y tradición opita, Desierto de la Tatacoa, Estrecho del río Magdalena, Malecón del río Magdalena, Parque Arqueológico de San Agustín, Represa de Betania, Salto de Bordones, Termales de Rivera.
5. **Dado** cualquier orden elegido, **cuando** se vuelve a elegir «Orden del catálogo», **entonces** las tarjetas regresan al orden original del catálogo.

---

### Historia de usuario 2 - Combinar el orden con los filtros existentes (Prioridad: P1)

La persona ya usa búsqueda, categoría, municipio, costo máximo y «Solo favoritos». El orden elegido se aplica sobre el resultado de esos filtros: los filtros deciden qué destinos se muestran y el orden decide solo en qué secuencia. Cambiar el orden nunca añade ni quita tarjetas, y cambiar un filtro conserva el orden elegido.

**Por qué esta prioridad**: sin esta garantía, ordenar podría ocultar destinos o ignorar los filtros, lo que rompería el comportamiento actual del catálogo.

**Prueba independiente**: para varias combinaciones de filtros, se comprueba que el conjunto de destinos mostrados es el mismo con cualquiera de los cuatro órdenes y que solo cambia la secuencia.

**Escenarios de aceptación**:

1. **Dado** la categoría «Cultura» seleccionada (Parque Arqueológico de San Agustín, Malecón del río Magdalena y Centro de Neiva y tradición opita), **cuando** se elige «Precio: menor a mayor», **entonces** se muestran esos mismos 3 destinos en este orden: Malecón (35.000), Centro de Neiva (45.000) y Parque Arqueológico (120.000).
2. **Dado** el orden «Nombre: A a Z» elegido, **cuando** se escribe un texto de búsqueda, se cambia el municipio o se fija un costo máximo, **entonces** los resultados se muestran en orden alfabético sin que haya que volver a elegir el orden.
3. **Dado** «Solo favoritos» activado con varios favoritos y un orden de precio elegido, **cuando** se ven las tarjetas, **entonces** solo aparecen los favoritos, ordenados por precio.
4. **Dado** cualquier combinación de filtros, **cuando** se cambia de un orden a otro, **entonces** el número y la identidad de los destinos mostrados no cambian.
5. **Dado** una combinación de filtros que no devuelve ningún destino, **cuando** se cambia el orden, **entonces** se sigue mostrando el mismo mensaje de «sin resultados» que hoy, sin error.

---

### Historia de usuario 3 - Mismo comportamiento con la API y en modo demostración (Prioridad: P2)

Tanto si la página obtiene el catálogo de la API como si usa el catálogo local del modo demostración (porque la API no está disponible), el selector ofrece las mismas cuatro opciones y produce el mismo orden para los mismos destinos.

**Por qué esta prioridad**: la aplicación debe seguir funcionando sin la API; es una garantía sobre la historia P1, no capacidad nueva.

**Prueba independiente**: se ordena el contenido real de `fallback-destinations.json` (la lista local) con cada opción y se compara con las secuencias del contrato; que la lista de la API sea idéntica a ese archivo ya lo comprueba `backend/tests/test_review_fixes.py`. Además, una prueba de lógica confirma que la misma clave de orden se aplica igual a dos listas distintas sucesivas (cambio de fuente).

**Escenarios de aceptación**:

1. **Dado** la API apagada y el aviso de modo demostración visible, **cuando** se elige cada orden, **entonces** las tarjetas se ordenan igual que con la API conectada.
2. **Dado** que la página arranca con el catálogo local y la consulta inicial a la API aún no termina, y que se eligió «Precio: mayor a menor» en ese intervalo, **cuando** la consulta termina y el catálogo local es reemplazado por el de la API, **entonces** el orden elegido se conserva y se aplica al catálogo recibido. (No existe una recarga de datos sin reiniciar la página; si la consulta falla, el catálogo local se mantiene.)

---

### Historia de usuario 4 - Uso con teclado y lectores de pantalla (Prioridad: P2)

Una persona que usa solo teclado o un lector de pantalla puede llegar al selector de orden con la tecla de tabulación, cambiar la opción con el teclado y escuchar qué orden quedó aplicado, sin tener que recorrer las tarjetas para descubrirlo.

**Por qué esta prioridad**: es un requisito de la constitución del proyecto para todo control nuevo; sin él la funcionalidad no es aceptable aunque ordene bien.

**Prueba independiente**: se recorre la página solo con teclado hasta el selector, se cambia la opción y se verifica el mensaje anunciado y la etiqueta del control.

**Escenarios de aceptación**:

1. **Dado** la página cargada, **cuando** se navega con la tecla de tabulación, **entonces** el selector de orden recibe el foco en un punto lógico dentro de los controles de filtro, con indicador de foco visible.
2. **Dado** el selector enfocado, **cuando** se cambia la opción solo con teclado, **entonces** el orden se aplica sin usar el ratón y el foco permanece en el selector.
3. **Dado** que se cambió el orden, **cuando** se aplica, **entonces** un lector de pantalla anuncia un mensaje como «Ordenado por precio, de menor a mayor. 8 destinos.» (con la cantidad de destinos mostrados en ese momento), sin quitar el foco del control.
4. **Dado** el selector, **cuando** lo lee un lector de pantalla, **entonces** su etiqueta lo identifica como «Ordenar por» y cada opción tiene un nombre comprensible.

---

### Casos límite

- ¿Qué ocurre si dos destinos tienen el mismo precio? En los órdenes por precio conservan entre sí el orden del catálogo (el desempate es estable y predecible); en «Precio: mayor a menor» el desempate es el mismo, no se invierte. El catálogo actual no tiene precios repetidos, así que esto se prueba con una lista sintética.
- ¿Qué ocurre con los nombres con tildes, eñes o mayúsculas? «Nombre: A a Z» sigue el alfabeto español sin distinguir mayúsculas de minúsculas, de modo que «Estrecho» va antes que «Malecón» y un nombre que empiece con «Á» se ordena junto a la «A».
- ¿Qué ocurre si el catálogo cambia (del local a la API al terminar la consulta inicial) o queda vacío? El orden elegido se conserva y se aplica al nuevo contenido; con cero destinos se muestra el mensaje habitual sin error.
- ¿Qué número lleva cada tarjeta tras ordenar? La numeración (01, 02, …) sigue la posición visible: la primera tarjeta mostrada es siempre la 01, como ya ocurre con los filtros; no es un identificador del destino.
- ¿Qué ocurre con el mensaje de anuncio cuando después de ordenar se cambia un filtro? El mensaje se retira (la región queda vacía, sin nuevo anuncio) porque la cantidad dejaría de ser correcta; el siguiente cambio de orden vuelve a anunciar.
- ¿Qué ocurre si hay un solo destino visible? El orden no cambia nada y el anuncio sigue indicando el orden elegido y «1 destino».
- ¿Qué ocurre si se marca o desmarca un favorito mientras se ve un orden? El orden no cambia; si «Solo favoritos» está activo, el destino sale o entra del resultado sin alterar la secuencia de los demás.
- ¿Qué ocurre al recargar la página? El orden vuelve a «Orden del catálogo» (no se guarda la elección; ver Supuestos).
- ¿Qué ocurre si la lógica de orden recibe un valor de orden desconocido? Se trata como «Orden del catálogo» y no produce error.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: La página del catálogo MUST ofrecer un control de selección única con exactamente cuatro opciones de orden: «Orden del catálogo», «Precio: menor a mayor», «Precio: mayor a menor» y «Nombre: A a Z».
- **FR-002**: La opción por defecto, al abrir la página, MUST ser «Orden del catálogo», y con ella las tarjetas MUST mostrarse en la misma secuencia que antes de esta funcionalidad.
- **FR-003**: Al elegir una opción, las tarjetas visibles MUST reordenarse de inmediato, sin recargar la página ni hacer una nueva consulta a la API.
- **FR-004**: «Precio: menor a mayor» MUST ordenar por precio ascendente y «Precio: mayor a menor» por precio descendente, usando el mismo precio en pesos colombianos que muestra cada tarjeta.
- **FR-005**: «Nombre: A a Z» MUST ordenar por el nombre del destino según el alfabeto español, sin distinguir mayúsculas de minúsculas.
- **FR-006**: Cuando varios destinos empaten en el criterio elegido, MUST conservar entre sí su orden relativo del catálogo, en cualquiera de los órdenes.
- **FR-007**: El orden MUST aplicarse sobre el resultado de los filtros existentes (búsqueda, categoría, municipio, costo máximo y solo favoritos) y MUST NOT añadir, quitar ni modificar destinos: para cualquier combinación de filtros, el conjunto de destinos mostrados MUST ser el mismo con los cuatro órdenes.
- **FR-008**: Cambiar cualquier filtro MUST conservar el orden elegido, y cambiar el orden MUST conservar el valor de todos los filtros.
- **FR-009**: El orden MUST NOT modificar la lista original de destinos ni el catálogo del que se obtiene; solo cambia la secuencia en que se muestran los resultados.
- **FR-010**: El comportamiento MUST ser el mismo cuando el catálogo viene de la API y cuando viene del catálogo local del modo demostración. La página no ofrece una recarga de datos sin reiniciarse: la única transición de fuente es del catálogo local a la API cuando termina la consulta inicial, y el orden elegido antes de ese momento MUST conservarse y aplicarse al catálogo recibido.
- **FR-011**: El control de orden MUST tener una etiqueta accesible («Ordenar por») y MUST poder enfocarse y operarse solo con el teclado, con indicador de foco visible, sin perder el foco al cambiar la opción.
- **FR-012**: Al cambiar el orden, el sistema MUST anunciar a los lectores de pantalla, mediante una región de anuncios no intrusiva, el orden aplicado y la cantidad de destinos mostrados (por ejemplo, «Ordenado por nombre, de la A a la Z. 8 destinos.»), con redacción correcta en singular y plural. El anuncio ocurre solo al cambiar el orden: cambiar un filtro MUST NOT generar este anuncio y los filtros conservan su comportamiento actual. Cuando cambia el resultado filtrado, el mensaje anterior MUST retirarse (la región queda vacía; vaciarla no genera anuncio) para que nunca muestre una cantidad desactualizada.
- **FR-013**: Un valor de orden desconocido o ausente MUST tratarse como «Orden del catálogo» sin producir error.
- **FR-014**: La funcionalidad MUST NOT cambiar el comportamiento, la forma de respuesta ni la lista de endpoints de la API existente ni el contenido del catálogo; no requiere cambios en el servidor.
- **FR-015**: La funcionalidad MUST incluir pruebas automáticas, escritas antes de implementar, que cubran: cada una de las cuatro opciones con el catálogo actual, el desempate por precio igual, nombres con tildes y mayúsculas, lista vacía, valor de orden desconocido, combinación con cada filtro existente (incluido «solo favoritos», mediante la función pura `filterFavorites`), que la lista de entrada no se modifique, el texto del anuncio (singular, plural, 0 destinos y cantidad inválida), la conservación de la misma clave de orden al cambiar de lista (FR-010) y que ordenar el contenido real de `fallback-destinations.json` produzca las secuencias del contrato. La igualdad entre la lista de la API y ese archivo ya la cubre `backend/tests/test_review_fixes.py`.
- **FR-016**: La numeración visible de las tarjetas MUST seguir la posición en pantalla tras ordenar y filtrar (la primera tarjeta mostrada lleva el 01).
- **FR-017**: Los estilos nuevos MUST pasar `frontend/tests/performance-a11y.test.js` sin modificarlo: texto de al menos 12 px y contraste mínimo de 4.5:1; el selector reutiliza el estilo del filtro de municipio.

### Entidades clave

- **Destino**: sitio turístico del catálogo, con nombre, municipio, categoría, precio en pesos colombianos y duración. No se modifica; el orden solo cambia la secuencia en que se muestran.
- **Opción de orden**: criterio elegido por la persona (orden del catálogo, precio ascendente, precio descendente o nombre ascendente), con una etiqueta visible y un mensaje de anuncio asociado. Es un estado de la vista, no un dato del catálogo.
- **Resultado filtrado**: conjunto de destinos que cumplen los filtros activos; el orden se aplica a este conjunto sin alterar su contenido.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: Con el catálogo actual y sin filtros, las cuatro opciones producen la secuencia esperada de las 8 tarjetas en el 100 % de las verificaciones.
- **SC-002**: Para cada combinación probada de filtros y cada uno de los cuatro órdenes, el conjunto de destinos mostrados es idéntico, es decir, hay 0 destinos añadidos o perdidos al ordenar.
- **SC-003**: Una persona puede cambiar el orden y ver las tarjetas reordenadas con una sola acción y en menos de 1 segundo, sin recarga de la página.
- **SC-004**: Una persona puede llegar al selector, cambiar la opción y confirmar el orden aplicado usando solo el teclado, y el 100 % de los cambios de orden generan un anuncio para lectores de pantalla con el orden y la cantidad de destinos.
- **SC-005**: Con la API apagada (modo demostración) y con la API conectada, el orden de las tarjetas es idéntico para las mismas opciones en el 100 % de las verificaciones.
- **SC-006**: Todas las pruebas existentes de backend y frontend siguen pasando sin modificarlas.

## Supuestos

- Los destinos se descargan completos y el filtrado ya ocurre en la página; por eso ordenar no requiere nuevas consultas a la API ni cambios en el servidor, y funciona igual en modo demostración.
- «Orden del catálogo» es la secuencia en que el catálogo entrega los destinos hoy (por identificador); es el valor por defecto porque la descripción lo pide.
- «Nombre» se refiere al nombre del destino, no al municipio ni a la categoría.
- El orden elegido no se guarda entre visitas ni se refleja en la dirección de la página: al recargar vuelve al orden por defecto. Guardarlo queda fuera de alcance.
- El orden no se considera un filtro: no se reinicia al cambiar el catálogo (del local a la API) ni cuenta como filtro activo.
- Los filtros existentes, incluido «solo favoritos», se componen antes del orden; para poder probar esa combinación sin navegador, el filtro «solo favoritos» pasa a una función pura `filterFavorites` (sin cambiar su comportamiento).
- No se ofrecen otros criterios de orden (duración, municipio, popularidad, distancia) ni orden combinado de varios criterios; quedan fuera de alcance.
- Los precios del catálogo son números en pesos colombianos y todos los destinos tienen nombre y precio válidos; el catálogo es interno.
- La etiqueta, las opciones del control y los mensajes de anuncio se redactan en español, como el resto de la interfaz.
- No se añaden dependencias nuevas.
