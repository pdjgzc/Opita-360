# Lista de calidad de requisitos UX (accesibilidad e interacción): Ordenar el catálogo de destinos

**Propósito**: validar que los requisitos del selector de orden, el anuncio `aria-live`, el uso con teclado, la combinación con filtros y el modo demostración estén completos, claros y medibles. Evalúa la redacción de los requisitos, no el código.
**Creada**: 2026-11-24
**Funcionalidad**: [spec.md](../spec.md) · [plan.md](../plan.md) · [contracts/sorting-module.md](../contracts/sorting-module.md)
**Público**: la persona que revisa el PR · **Profundidad**: estándar

**Nota**: lista generada por `/speckit-checklist`.
**Responsabilidad de la revisión**: es un artefacto de revisión de calidad de requisitos que pertenece a quien revisa. Marca un ítem `[x]` solo cuando determines que el criterio de calidad del requisito se cumple.
**Semántica de la marca**: `[x]` significa que el criterio se revisó y se cumple en los requisitos. No significa que la implementación esté terminada.

## Selector de orden: completitud y claridad

- [x] CHK001 ¿Están definidos el texto exacto de la etiqueta («Ordenar por») y el de las cuatro opciones, y es el mismo en la spec, el plan y el contrato? [Consistencia, Spec §FR-001, §FR-011]
- [x] CHK002 ¿Se especifica la ubicación del selector con criterio verificable («tras el filtro de municipio dentro de la fila de filtros»), y no solo «un punto lógico»? [Claridad, Spec §Historia 4 esc. 1, Plan §Diseño]
- [x] CHK003 ¿Se definen los estados de interacción del selector (reposo, foco, deshabilitado, abierto) o se declara que se hereda el estilo del filtro de municipio? [Completitud, Spec §FR-017]
- [x] CHK004 ¿Está definido cómo se presenta el selector en pantallas estrechas (móvil) y con zoom del 200 %? [Gap]
- [x] CHK005 ¿Se define qué pasa con el selector mientras carga la consulta inicial: ¿está habilitado y se aplica sobre el catálogo local? [Cobertura, Spec §Historia 3 esc. 2]
- [x] CHK006 ¿Es medible «las tarjetas se reordenan de inmediato»? ¿Hay un umbral (SC-003: menos de 1 s) y una forma de comprobarlo? [Mensurabilidad, Spec §FR-003, §SC-003]
- [x] CHK007 ¿Está definido el aviso visual (no solo sonoro) de que hay un orden activo distinto del predeterminado, o se declara que el selector basta? [Gap]

## Teclado y foco

- [x] CHK008 ¿Se especifica el conjunto de teclas que deben operar el selector, o se delega con claridad en el comportamiento nativo del control? [Claridad, Spec §FR-011, Contrato §Teclado]
- [x] CHK009 ¿Es medible «indicador de foco visible» (grosor, color, contraste mínimo del indicador frente al fondo), más allá del contorno de 3 px del contrato? [Mensurabilidad, Spec §FR-011]
- [x] CHK010 ¿Se exige explícitamente que el orden de tabulación no cambie para los controles existentes al insertar el selector? [Completitud, Gap]
- [x] CHK011 ¿Está definido que cambiar la opción con teclado no mueve el foco y no provoca saltos de desplazamiento de la página? [Cobertura, Spec §Historia 4 esc. 2]
- [x] CHK012 ¿Se define si cada cambio de opción con las flechas aplica el orden de inmediato o solo al confirmar, dado que los navegadores difieren? [Ambigüedad, Spec §Historia 4 esc. 2]
- [x] CHK013 ¿Los requisitos de teclado tienen un criterio de aceptación verificable distinto de la revisión manual del quickstart? [Mensurabilidad, Spec §SC-004, Research §D9]

## Anuncio `aria-live`

- [x] CHK014 ¿Está fijado el texto exacto del anuncio de cada una de las cuatro opciones, y no solo «un mensaje como…»? [Claridad, Spec §Historia 4 esc. 3, Contrato §sortAnnouncement]
- [x] CHK015 ¿Se define la politeness de la región (`polite`, no `assertive`) como requisito y no solo como decisión del plan? [Consistencia, Spec §FR-012, Plan §Diseño]
- [x] CHK016 ¿Se especifica el momento del anuncio cuando se elige la misma opción que ya estaba aplicada (¿se anuncia o no?)? [Gap, Caso límite]
- [x] CHK017 ¿Se define qué ocurre si se cambia el orden dos veces seguidas con rapidez: se anuncia el último mensaje o se encolan ambos? [Cobertura, Gap]
- [x] CHK018 ¿Está especificado que dos cambios consecutivos que produzcan el mismo texto (p. ej. mismo orden y misma cantidad) siguen siendo anunciados? [Cobertura, Spec §FR-012]
- [x] CHK019 ¿Es coherente el retiro del mensaje al cambiar un filtro (FR-012) con la aclaración que dice que los filtros «conservan su comportamiento actual»? [Consistencia, Spec §Aclaraciones, §FR-012]
- [x] CHK020 ¿Se define la redacción de la cantidad en 0 destinos («0 destinos») y su coherencia con el mensaje de «sin resultados» ya existente, sin doble anuncio? [Cobertura, Spec §FR-012, §Historia 2 esc. 5]
- [x] CHK021 ¿Se declara si la región de anuncio debe ser visible o puede estar oculta visualmente, y cómo se garantiza su contraste si es visible? [Gap, Spec §FR-017]
- [x] CHK022 ¿Es medible «el 100 % de los cambios generan un anuncio» (SC-004) dado que la región solo se puede comprobar con un lector de pantalla y no hay pruebas automáticas de vista? [Mensurabilidad, Spec §SC-004, Research §D9]
- [x] CHK023 ¿Se especifica con qué lectores de pantalla y navegadores se espera que el anuncio funcione? [Supuesto, Gap]

## Combinación con filtros

- [x] CHK024 ¿Está claro y sin conflicto que el orden se aplica después de los cinco filtros, incluido «solo favoritos»? [Consistencia, Spec §FR-007, §Supuestos]
- [x] CHK025 ¿Se define el comportamiento al marcar o desmarcar un favorito con «Solo favoritos» activo respecto a la cantidad anunciada (el mensaje queda retirado)? [Cobertura, Spec §Casos límite, §FR-012]
- [x] CHK026 ¿Se define si la acción «limpiar filtros» (si existe) restablece también el orden o lo conserva? [Gap, Spec §Supuestos]
- [x] CHK027 ¿Está especificada la interacción con el reinicio automático del municipio al cambiar el catálogo, y que no reinicia el orden? [Consistencia, Spec §Supuestos, Constitución §V]
- [x] CHK028 ¿Se define si el contador de resultados visible (si lo hay) y la cantidad del anuncio provienen de la misma cifra? [Consistencia, Spec §FR-012, §FR-007]
- [x] CHK029 ¿Es medible la afirmación «el conjunto mostrado es idéntico con los cuatro órdenes» para un conjunto de combinaciones definido, y no para «cualquier combinación»? [Mensurabilidad, Spec §FR-007, §SC-002]
- [x] CHK030 ¿Se especifica que la numeración visible (01, 02…) no se anuncia ni se usa como identificador, para evitar confusión en lectores de pantalla? [Claridad, Spec §FR-016]

## Modo demostración

- [x] CHK031 ¿Es medible «idéntico con la API y en modo demostración» (SC-005) dado que ambos catálogos son iguales por prueba y no hay una verificación con la API real en la vista? [Mensurabilidad, Spec §SC-005, §FR-010]
- [x] CHK032 ¿Se define qué ocurre con el anuncio si la consulta inicial termina justo después de cambiar el orden (cambia `filtered` y el mensaje se retira)? [Cobertura, Spec §FR-010, §FR-012]
- [x] CHK033 ¿Se especifica que el aviso de modo demostración no interfiere con la región del anuncio (dos regiones de estado cercanas)? [Gap, Constitución §V]
- [x] CHK034 ¿Se documenta el supuesto de que no hay recarga de datos sin reiniciar la página y se valida contra el código actual? [Supuesto, Spec §FR-010]
- [x] CHK035 ¿Está definido el comportamiento cuando la consulta a la API falla después de haber elegido un orden (el catálogo local y el orden se mantienen)? [Cobertura, Spec §Historia 3 esc. 2]

## Casos límite y requisitos no funcionales

- [x] CHK036 ¿Está definido el comportamiento para nombres con tildes y eñes de forma verificable con ejemplos concretos, y no solo «alfabeto español»? [Claridad, Spec §FR-005, §Casos límite]
- [x] CHK037 ¿Se exige contraste mínimo 4.5:1 y tamaño mínimo 12 px para etiqueta, opciones y mensaje, y se indica cómo se mide más allá de `performance-a11y.test.js`? [Mensurabilidad, Spec §FR-017]
- [x] CHK038 ¿Se declara que la etiqueta, las opciones y los anuncios están solo en español y que el atributo de idioma de la página es coherente? [Supuesto, Spec §Supuestos]
- [x] CHK039 ¿Se define cómo se comporta el selector con la preferencia de movimiento reducido, si el reordenamiento tuviera animación? [Gap]
- [x] CHK040 ¿Existe un esquema de trazabilidad de FR a pruebas y a verificaciones manuales para los requisitos de interacción que no se automatizan? [Trazabilidad, Constitución §VI, Research §D9]

## Notas

- Marca los ítems `[x]` solo después de que la revisión confirme que el criterio de calidad del requisito se cumple.
- Deja sin marcar los ítems que aún requieran aclaración, corrección o evaluación de quien revisa.
- `/speckit-implement` lee el estado de las casillas como puerta y no debe modificar las marcas.
- `checklists/requirements.md` tiene un ciclo de vida propio, mantenido por `/speckit-specify` y `/speckit-clarify`.
- Añade comentarios o hallazgos en línea.
- Los ítems se numeran de forma secuencial para referenciarlos con facilidad.

## Revisión de la persona revisora (2026-11-24)

Se revisaron los 40 ítems. Cambios en `spec.md` para cerrar los vacíos detectados:

- CHK004: pantallas estrechas y zoom del 200 % reutilizan las reglas responsivas del filtro de municipio.
- CHK012: el orden se aplica con el evento de cambio del selector nativo; no se altera el comportamiento del navegador.
- CHK016, CHK017: elegir la misma opción no anuncia nada; con cambios seguidos la región muestra solo el último.
- CHK021: la región es visible bajo el selector y cumple FR-017 (12 px, contraste 4.5:1).
- CHK022, CHK031: SC-004 y SC-005 indican su método de verificación (prueba automática más `quickstart.md` §4 y §5) en lugar de un «100 %» sin método.

El resto de ítems ya se cumplía con FR-001 a FR-017, la sección Clarifications y las decisiones del plan revisado.
