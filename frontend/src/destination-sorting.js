export const SORT_OPTIONS = Object.freeze([
  Object.freeze({ key: 'catalog', label: 'Orden del catálogo', announce: 'Ordenado por el orden del catálogo.' }),
  Object.freeze({ key: 'price-asc', label: 'Precio: menor a mayor', announce: 'Ordenado por precio, de menor a mayor.' }),
  Object.freeze({ key: 'price-desc', label: 'Precio: mayor a menor', announce: 'Ordenado por precio, de mayor a menor.' }),
  Object.freeze({ key: 'name-asc', label: 'Nombre: A a Z', announce: 'Ordenado por nombre, de la A a la Z.' })
]);

export const DEFAULT_SORT = 'catalog';

export function validSort(key) {
  return SORT_OPTIONS.some((option) => option.key === key) ? key : DEFAULT_SORT;
}

export function sortAnnouncement(key, count) {
  const { announce } = SORT_OPTIONS.find((option) => option.key === validSort(key));
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) return announce;
  return `${announce} ${count} ${count === 1 ? 'destino' : 'destinos'}.`;
}

const collator = new Intl.Collator('es', { sensitivity: 'base' });

// Array.prototype.sort es estable: los empates conservan el orden de entrada.
export function sortDestinations(destinations, key) {
  const copy = [...destinations];
  switch (validSort(key)) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return copy.sort((a, b) => collator.compare(a.name, b.name));
    default:
      return copy;
  }
}
