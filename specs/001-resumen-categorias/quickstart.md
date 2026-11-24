# Guía de validación: Resumen del catálogo por categoría

Detalle de campos en [contracts/categories.md](contracts/categories.md) y reglas en
[data-model.md](data-model.md).

## Requisitos previos
- Python 3.10+ con las dependencias del backend instaladas: `python -m pip install -r backend/requirements.txt`
  (incluye `httpx2`, que necesita `TestClient`).
- Ejecutar desde la raíz del repositorio, en la rama `001-resumen-categorias`.

## 1. Pruebas automáticas (desde la raíz)
```bash
python -B -m unittest backend.tests.test_category_summary -v
python -B -m unittest discover -s backend/tests -v
```
Resultado esperado: la primera pasa íntegra; la segunda pasa sin modificar las pruebas
existentes (SC-005). Conforme a la constitución (IV), las pruebas nuevas se escriben primero y
se observa su fallo antes de implementar.

## 2. Validación manual con la API en marcha
Desde la raíz (el `README.md` usa `app.main:app` porque se ejecuta desde `backend/`):

```powershell
python -m uvicorn backend.app.main:app --port 8000
curl.exe http://localhost:8000/api/categories
curl.exe -i -X POST http://localhost:8000/api/categories
```
En PowerShell se usa `curl.exe`: `curl` a secas es un alias de `Invoke-WebRequest`.
Esperado: 200 con las cuatro categorías y `total_destinations` 8 (tabla en el contrato); el
`POST` responde 405.

## 3. Trazabilidad requisito → prueba
| Requisito | Qué se comprueba |
|-----------|------------------|
| FR-001, FR-002, FR-003, FR-006 | respuesta del catálogo actual: campos, `currency`, total |
| FR-004, FR-010 | función pura con catálogo vacío y `GET /api/categories` con `DESTINATIONS` vacío (`unittest.mock.patch`): 200, `categories` vacía, total 0 |
| FR-005, SC-002, SC-003 | suma de conteos y min/max recalculados desde `/api/destinations` |
| FR-007 | orden alfabético y dos consultas idénticas |
| FR-008 | catálogo igual antes y después; función no muta su entrada |
| FR-009, SC-005 | suite existente sin cambios; los 4 endpoints siguen respondiendo igual |
| FR-011, casos límite | parámetro extra ignorado; `POST` → 405 |
| FR-012 | una sola categoría con un destino (`min == max`, `count == 1`); categoría nueva en catálogo sintético |
