import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SORT_OPTIONS, DEFAULT_SORT, validSort, sortDestinations, sortAnnouncement } from '../src/destination-sorting.js';
import { filterDestinations, filterFavorites } from '../src/destination-filters.js';

const real = JSON.parse(readFileSync(new URL('../src/fallback-destinations.json', import.meta.url), 'utf8'));
const catalog = Object.freeze(real.map((d) => Object.freeze({ ...d })));
const names = (list) => list.map((d) => d.name);
const prices = (list) => list.map((d) => d.price);
const ids = (list) => list.map((d) => d.id);
const item = (id, name, price) => Object.freeze({ id, name, price });

// (a) secuencias del contrato con el contenido real de fallback-destinations.json
test('catalog keeps the entry order', () => {
  assert.deepEqual(names(sortDestinations(catalog, 'catalog')), [
    'Desierto de la Tatacoa',
    'Parque Arqueológico de San Agustín',
    'Malecón del río Magdalena',
    'Salto de Bordones',
    'Estrecho del río Magdalena',
    'Termales de Rivera',
    'Represa de Betania',
    'Centro de Neiva y tradición opita'
  ]);
});

test('price-asc sequence on the real catalog', () => {
  const sorted = sortDestinations(catalog, 'price-asc');
  assert.deepEqual(prices(sorted), [35000, 45000, 65000, 70000, 85000, 90000, 95000, 120000]);
  assert.equal(sorted[0].name, 'Malecón del río Magdalena');
  assert.equal(sorted[7].name, 'Parque Arqueológico de San Agustín');
});

test('price-desc sequence on the real catalog', () => {
  assert.deepEqual(prices(sortDestinations(catalog, 'price-desc')), [120000, 95000, 90000, 85000, 70000, 65000, 45000, 35000]);
});

test('name-asc sequence on the real catalog', () => {
  assert.deepEqual(names(sortDestinations(catalog, 'name-asc')), [
    'Centro de Neiva y tradición opita',
    'Desierto de la Tatacoa',
    'Estrecho del río Magdalena',
    'Malecón del río Magdalena',
    'Parque Arqueológico de San Agustín',
    'Represa de Betania',
    'Salto de Bordones',
    'Termales de Rivera'
  ]);
});

// (b) price-desc es el inverso exacto de price-asc con el catálogo actual
test('price-desc is the exact reverse of price-asc on the real catalog', () => {
  const asc = sortDestinations(catalog, 'price-asc');
  const desc = sortDestinations(catalog, 'price-desc');
  assert.deepEqual(ids(desc), ids(asc).reverse());
});

// (c) desempate estable por precio igual, también en price-desc
test('equal prices keep the entry order in price-asc', () => {
  const list = Object.freeze([item(1, 'B', 50), item(2, 'A', 10), item(3, 'C', 50), item(4, 'D', 10)]);
  assert.deepEqual(ids(sortDestinations(list, 'price-asc')), [2, 4, 1, 3]);
});

test('equal prices keep the entry order in price-desc (not reversed)', () => {
  const list = Object.freeze([item(1, 'B', 50), item(2, 'A', 10), item(3, 'C', 50), item(4, 'D', 10)]);
  assert.deepEqual(ids(sortDestinations(list, 'price-desc')), [1, 3, 2, 4]);
});

// (d) nombres con tildes, eñes y mayúsculas
test('name-asc ignores case and accents in the primary comparison', () => {
  const list = Object.freeze([item(1, 'zeta', 1), item(2, 'Álamo', 1), item(3, 'beta', 1), item(4, 'Abeto', 1), item(5, 'Azul', 1)]);
  assert.deepEqual(names(sortDestinations(list, 'name-asc')), ['Abeto', 'Álamo', 'Azul', 'beta', 'zeta']);
});

test('name-asc places Ñ after N and before O (Spanish alphabet)', () => {
  const list = Object.freeze([item(1, 'Oso', 1), item(2, 'Ñandú', 1), item(3, 'Nube', 1)]);
  assert.deepEqual(names(sortDestinations(list, 'name-asc')), ['Nube', 'Ñandú', 'Oso']);
});

test('name-asc puts Estrecho before Malecón', () => {
  const sorted = names(sortDestinations(catalog, 'name-asc'));
  assert.ok(sorted.indexOf('Estrecho del río Magdalena') < sorted.indexOf('Malecón del río Magdalena'));
});

test('name-asc keeps the entry order for names equal ignoring case and accents', () => {
  const list = Object.freeze([item(1, 'árbol', 1), item(2, 'Arbol', 1), item(3, 'ARBOL', 1)]);
  assert.deepEqual(ids(sortDestinations(list, 'name-asc')), [1, 2, 3]);
});

// (e) lista vacía y un solo elemento
test('empty list returns a new empty array for every key', () => {
  const empty = Object.freeze([]);
  for (const { key } of SORT_OPTIONS) {
    const result = sortDestinations(empty, key);
    assert.deepEqual(result, []);
    assert.notEqual(result, empty);
  }
});

test('single element returns a copy containing that element', () => {
  const one = Object.freeze([catalog[0]]);
  for (const { key } of SORT_OPTIONS) {
    const result = sortDestinations(one, key);
    assert.equal(result.length, 1);
    assert.equal(result[0], catalog[0]);
    assert.notEqual(result, one);
  }
});

// (f) clave desconocida, undefined, null y no cadena se tratan como catalog (FR-013)
test('unknown or invalid keys behave as catalog', () => {
  const expected = ids(catalog);
  for (const key of ['nope', '', 'PRICE-ASC', undefined, null, 5, {}, [], true]) {
    assert.deepEqual(ids(sortDestinations(catalog, key)), expected);
  }
  assert.deepEqual(ids(sortDestinations(catalog)), expected);
});

test('validSort returns known keys and catalog for anything else', () => {
  for (const key of ['catalog', 'price-asc', 'price-desc', 'name-asc']) assert.equal(validSort(key), key);
  for (const key of ['nope', '', undefined, null, 5, {}, [], true, NaN]) assert.equal(validSort(key), 'catalog');
  assert.equal(validSort(), 'catalog');
});

// (g) no muta, copia nueva, mismas referencias, idempotente (FR-009)
test('does not mutate a frozen input and returns a different array', () => {
  const before = [...catalog];
  for (const { key } of SORT_OPTIONS) {
    const result = sortDestinations(catalog, key);
    assert.notEqual(result, catalog);
    assert.ok(Array.isArray(result));
  }
  assert.equal(catalog.length, before.length);
  catalog.forEach((d, i) => assert.equal(d, before[i]));
});

test('result holds the same objects by reference', () => {
  for (const { key } of SORT_OPTIONS) {
    const result = sortDestinations(catalog, key);
    assert.equal(result.length, catalog.length);
    for (const d of result) assert.ok(catalog.includes(d));
    for (const d of catalog) assert.ok(result.includes(d));
  }
});

test('is idempotent and deterministic', () => {
  for (const { key } of SORT_OPTIONS) {
    const once = sortDestinations(catalog, key);
    const twice = sortDestinations(once, key);
    assert.deepEqual(ids(twice), ids(once));
    assert.deepEqual(ids(sortDestinations(catalog, key)), ids(once));
  }
});

// (h) SORT_OPTIONS y DEFAULT_SORT
test('SORT_OPTIONS has exactly the four options in contract order', () => {
  assert.deepEqual(SORT_OPTIONS.map((o) => o.key), ['catalog', 'price-asc', 'price-desc', 'name-asc']);
  assert.deepEqual(SORT_OPTIONS.map((o) => o.label), [
    'Orden del catálogo',
    'Precio: menor a mayor',
    'Precio: mayor a menor',
    'Nombre: A a Z'
  ]);
  assert.deepEqual(SORT_OPTIONS.map((o) => o.announce), [
    'Ordenado por el orden del catálogo.',
    'Ordenado por precio, de menor a mayor.',
    'Ordenado por precio, de mayor a menor.',
    'Ordenado por nombre, de la A a la Z.'
  ]);
  for (const o of SORT_OPTIONS) assert.deepEqual(Object.keys(o).sort(), ['announce', 'key', 'label']);
});

test('SORT_OPTIONS is frozen and DEFAULT_SORT is catalog', () => {
  assert.ok(Object.isFrozen(SORT_OPTIONS));
  assert.equal(DEFAULT_SORT, 'catalog');
});

// Historia 2: filterFavorites y combinación con los filtros existentes
const favoriteIds = Object.freeze([8, 2, 5, 3]);
const sameSet = (a, b) => assert.deepEqual([...ids(a)].sort((x, y) => x - y), [...ids(b)].sort((x, y) => x - y));

// (a) filterFavorites según contracts/sorting-module.md §1b
test('filterFavorites with onlyFavorites returns a new array of favorites in entry order', () => {
  const result = filterFavorites(catalog, favoriteIds, true);
  assert.notEqual(result, catalog);
  assert.ok(Array.isArray(result));
  assert.deepEqual(ids(result), [2, 3, 5, 8]);
  for (const d of result) assert.ok(catalog.includes(d));
});

test('filterFavorites without onlyFavorites returns the list as is', () => {
  assert.equal(filterFavorites(catalog, favoriteIds, false), catalog);
});

test('filterFavorites treats non-array favoriteIds as empty', () => {
  for (const bad of [undefined, null, 'abc', 5, {}, true]) {
    assert.deepEqual(filterFavorites(catalog, bad, true), []);
  }
});

test('filterFavorites with no favorites returns an empty array', () => {
  assert.deepEqual(filterFavorites(catalog, Object.freeze([]), true), []);
  assert.deepEqual(filterFavorites(catalog, Object.freeze([999]), true), []);
});

test('filterFavorites does not mutate frozen inputs', () => {
  const beforeCatalog = [...catalog];
  const beforeIds = [...favoriteIds];
  filterFavorites(catalog, favoriteIds, true);
  filterFavorites(catalog, favoriteIds, false);
  assert.deepEqual([...catalog], beforeCatalog);
  assert.deepEqual([...favoriteIds], beforeIds);
});

// (b) cada filtro existente: las cuatro claves dan el mismo conjunto de ids; solo cambia la secuencia
test('every sort key keeps the same id set for each existing filter (FR-007, SC-002)', () => {
  const cases = {
    search: filterDestinations(catalog, { search: 'magdalena' }),
    category: filterDestinations(catalog, { category: 'Cultura' }),
    municipality: filterDestinations(catalog, { municipality: 'Neiva' }),
    maxCost: filterDestinations(catalog, { maxCost: '90000' }),
    favorites: filterFavorites(catalog, favoriteIds, true),
    combined: filterFavorites(filterDestinations(catalog, { category: 'Cultura', maxCost: '120000' }), favoriteIds, true)
  };
  for (const [name, filtered] of Object.entries(cases)) {
    assert.ok(filtered.length > 0, `${name} should not be empty`);
    for (const { key } of SORT_OPTIONS) {
      const sorted = sortDestinations(filtered, key);
      assert.equal(sorted.length, filtered.length, `${name}/${key}`);
      sameSet(sorted, filtered);
    }
  }
});

// (c) categoría «Cultura» + price-asc
test('Cultura with price-asc shows Malecón, Centro de Neiva, Parque Arqueológico', () => {
  const sorted = sortDestinations(filterDestinations(catalog, { category: 'Cultura' }), 'price-asc');
  assert.deepEqual(names(sorted), [
    'Malecón del río Magdalena',
    'Centro de Neiva y tradición opita',
    'Parque Arqueológico de San Agustín'
  ]);
  assert.deepEqual(prices(sorted), [35000, 45000, 120000]);
});

// (d) favoritos + orden de precio
test('favorites with price order shows only favorites sorted by price', () => {
  const asc = sortDestinations(filterFavorites(catalog, favoriteIds, true), 'price-asc');
  assert.deepEqual(ids(asc), [3, 8, 5, 2]);
  const desc = sortDestinations(filterFavorites(catalog, favoriteIds, true), 'price-desc');
  assert.deepEqual(ids(desc), [2, 5, 8, 3]);
});

// (e) combinación sin resultados
test('a combination with no results stays empty under every sort key', () => {
  const none = filterFavorites(filterDestinations(catalog, { category: 'Bienestar', municipality: 'Neiva' }), favoriteIds, true);
  assert.deepEqual(none, []);
  for (const { key } of SORT_OPTIONS) {
    assert.deepEqual(sortDestinations(none, key), []);
  }
});

// Historia 3: conservación de la clave al cambiar de lista (FR-010, garantía 8)
const apiList = Object.freeze([item(11, 'Zorro', 20), item(12, 'Águila', 300), item(13, 'Búho', 150), item(14, 'Cóndor', 300)]);

test('same key price-desc yields the sequence that key defines for each list', () => {
  const key = 'price-desc';
  const local = sortDestinations(catalog, key);
  assert.deepEqual(prices(local), [120000, 95000, 90000, 85000, 70000, 65000, 45000, 35000]);
  const api = sortDestinations(apiList, key);
  assert.deepEqual(ids(api), [12, 14, 13, 11]);
  assert.deepEqual(prices(api), [300, 300, 150, 20]);
  // volver a la lista local tras la otra no altera su resultado
  assert.deepEqual(ids(sortDestinations(catalog, key)), ids(local));
});

test('every key is independent of the list previously sorted', () => {
  for (const { key } of SORT_OPTIONS) {
    const fresh = ids(sortDestinations(apiList, key));
    sortDestinations(catalog, key);
    assert.deepEqual(ids(sortDestinations(apiList, key)), fresh);
  }
});

test('sortDestinations and validSort keep no state between calls', () => {
  const first = ids(sortDestinations(catalog, 'price-asc'));
  sortDestinations(apiList, 'name-asc');
  sortDestinations(catalog, 'nope');
  assert.deepEqual(ids(sortDestinations(catalog, 'price-asc')), first);
  assert.equal(validSort('price-desc'), 'price-desc');
  assert.equal(validSort('nope'), 'catalog');
  assert.equal(validSort('price-desc'), 'price-desc');
  // una clave inválida no recuerda la anterior
  assert.deepEqual(ids(sortDestinations(apiList, 'nope')), ids(apiList));
});

// Historia 4: sortAnnouncement(key, count) (contracts/sorting-module.md, garantías de sortAnnouncement)
test('sortAnnouncement gives each option text with 8 destinations', () => {
  assert.equal(sortAnnouncement('catalog', 8), 'Ordenado por el orden del catálogo. 8 destinos.');
  assert.equal(sortAnnouncement('price-asc', 8), 'Ordenado por precio, de menor a mayor. 8 destinos.');
  assert.equal(sortAnnouncement('price-desc', 8), 'Ordenado por precio, de mayor a menor. 8 destinos.');
  assert.equal(sortAnnouncement('name-asc', 8), 'Ordenado por nombre, de la A a la Z. 8 destinos.');
});

test('sortAnnouncement matches SORT_OPTIONS announce plus the count', () => {
  for (const { key, announce } of SORT_OPTIONS) {
    assert.equal(sortAnnouncement(key, 8), `${announce} 8 destinos.`);
  }
});

test('sortAnnouncement uses the singular with 1 destination', () => {
  for (const { key, announce } of SORT_OPTIONS) {
    assert.equal(sortAnnouncement(key, 1), `${announce} 1 destino.`);
  }
  assert.equal(sortAnnouncement('price-asc', 1), 'Ordenado por precio, de menor a mayor. 1 destino.');
});

test('sortAnnouncement uses the plural with 3 destinations', () => {
  assert.equal(sortAnnouncement('name-asc', 3), 'Ordenado por nombre, de la A a la Z. 3 destinos.');
});

test('sortAnnouncement announces 0 destinos with zero', () => {
  for (const { key, announce } of SORT_OPTIONS) {
    assert.equal(sortAnnouncement(key, 0), `${announce} 0 destinos.`);
  }
});

test('sortAnnouncement returns only the announce for an invalid count and does not throw', () => {
  for (const bad of [NaN, -1, 2.5, undefined, 'abc', '3', null, Infinity, {}, []]) {
    for (const { key, announce } of SORT_OPTIONS) {
      assert.equal(sortAnnouncement(key, bad), announce);
    }
  }
  assert.equal(sortAnnouncement('price-desc'), 'Ordenado por precio, de mayor a menor.');
});

test('sortAnnouncement treats an unknown or missing key as catalog', () => {
  const base = 'Ordenado por el orden del catálogo.';
  for (const key of ['nope', '', 'PRICE-ASC', undefined, null, 5, {}, [], true]) {
    assert.equal(sortAnnouncement(key, 8), `${base} 8 destinos.`);
    assert.equal(sortAnnouncement(key, 1), `${base} 1 destino.`);
    assert.equal(sortAnnouncement(key, NaN), base);
  }
  assert.equal(sortAnnouncement(), base);
});
