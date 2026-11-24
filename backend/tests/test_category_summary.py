"""Pruebas de GET /api/categories y de la función pura summarize_categories."""

import copy
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app.main import DESTINATIONS, app


def dest(dest_id, category, price):
    return {"id": dest_id, "name": f"Destino {dest_id}", "category": category, "price": price}


def summarize(destinations):
    # Importación diferida: si la función no existe, falla cada prueba por separado.
    from backend.app.main import summarize_categories
    return summarize_categories(destinations)


EXPECTED_CATEGORIES = [
    {"category": "Aventura", "count": 2, "min_price": 70000, "max_price": 90000},
    {"category": "Bienestar", "count": 1, "min_price": 65000, "max_price": 65000},
    {"category": "Cultura", "count": 3, "min_price": 35000, "max_price": 120000},
    {"category": "Naturaleza", "count": 2, "min_price": 85000, "max_price": 95000},
]


class CategoriesEndpointTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()

    # T002
    def test_current_catalog_summary(self):
        response = self.client.get("/api/categories")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_destinations"], 8)
        self.assertEqual(data["currency"], "COP")
        self.assertEqual(data["categories"], EXPECTED_CATEGORIES)

    def test_prices_are_integers(self):
        data = self.client.get("/api/categories").json()
        for item in data["categories"]:
            self.assertIs(type(item["min_price"]), int)
            self.assertIs(type(item["max_price"]), int)
            self.assertIs(type(item["count"]), int)
        self.assertIs(type(data["total_destinations"]), int)

    # T004
    def test_two_consecutive_calls_are_identical(self):
        first = self.client.get("/api/categories")
        second = self.client.get("/api/categories")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.json(), second.json())

    # T005
    def test_empty_catalog_returns_200(self):
        with patch("backend.app.main.DESTINATIONS", []):
            response = self.client.get("/api/categories")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(),
                         {"total_destinations": 0, "currency": "COP", "categories": []})

    def test_extra_query_parameter_is_ignored(self):
        base = self.client.get("/api/categories")
        extra = self.client.get("/api/categories?x=1")
        self.assertEqual(extra.status_code, 200)
        self.assertEqual(base.json(), extra.json())

    def test_other_methods_return_405(self):
        for method in ("post", "put", "patch", "delete"):
            with self.subTest(method=method):
                response = getattr(self.client, method)("/api/categories")
                self.assertEqual(response.status_code, 405)
                self.assertEqual(response.json(), {"detail": "Method Not Allowed"})


class CoherenceTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()

    # T011: referencia recalculada sin llamar a summarize_categories
    def test_summary_is_coherent_with_destinations(self):
        destinations = self.client.get("/api/destinations").json()["destinations"]
        summary = self.client.get("/api/categories").json()

        reference = {}
        for item in destinations:
            reference.setdefault(item["category"], []).append(item["price"])

        names = [c["category"] for c in summary["categories"]]
        self.assertEqual(len(names), len(set(names)))
        self.assertEqual(set(names), set(reference))

        total = sum(c["count"] for c in summary["categories"])
        self.assertEqual(total, summary["total_destinations"])
        self.assertEqual(total, len(destinations))

        for entry in summary["categories"]:
            prices = reference[entry["category"]]
            self.assertEqual(entry["count"], len(prices))
            self.assertEqual(entry["min_price"], min(prices))
            self.assertEqual(entry["max_price"], max(prices))
            self.assertIn(entry["min_price"], prices)
            self.assertIn(entry["max_price"], prices)

    # T012 (a)
    def test_new_category_appears_without_code_changes(self):
        catalog = [dest("a", "Cultura", 30000), dest("b", "Gastronomía", 45000),
                   dest("c", "Gastronomía", 25000)]
        with patch("backend.app.main.DESTINATIONS", catalog):
            data = self.client.get("/api/categories").json()
        by_name = {c["category"]: c for c in data["categories"]}
        self.assertIn("Gastronomía", by_name)
        self.assertEqual(by_name["Gastronomía"],
                         {"category": "Gastronomía", "count": 2,
                          "min_price": 25000, "max_price": 45000})
        self.assertEqual(data["total_destinations"], 3)

    # T012 (b): SC-004
    def test_summary_is_smaller_than_destinations(self):
        summary = self.client.get("/api/categories").content
        full = self.client.get("/api/destinations").content
        self.assertLess(len(summary), len(full))


class SummarizeCategoriesTests(unittest.TestCase):
    # T003
    def test_single_destination_category(self):
        result = summarize([dest("a", "Cultura", 50000)])
        self.assertEqual(result["total_destinations"], 1)
        self.assertEqual(len(result["categories"]), 1)
        item = result["categories"][0]
        self.assertEqual(item["count"], 1)
        self.assertEqual(item["min_price"], item["max_price"])
        self.assertEqual(item["min_price"], 50000)

    def test_empty_catalog(self):
        self.assertEqual(summarize([]),
                         {"total_destinations": 0, "currency": "COP", "categories": []})

    def test_same_price_destinations_both_counted(self):
        result = summarize([dest("a", "Cultura", 40000), dest("b", "Cultura", 40000)])
        self.assertEqual(result["categories"],
                         [{"category": "Cultura", "count": 2,
                           "min_price": 40000, "max_price": 40000}])

    def test_category_without_destinations_not_listed(self):
        result = summarize([dest("a", "Cultura", 10), dest("b", "Aventura", 20)])
        names = [c["category"] for c in result["categories"]]
        self.assertEqual(names, ["Aventura", "Cultura"])
        self.assertNotIn("Naturaleza", names)

    # T004
    def test_categories_sorted_without_normalizing(self):
        catalog = [dest("a", "cultura", 10), dest("b", "Cultura", 20),
                   dest("c", "Aventura", 30), dest("d", "cultura", 15)]
        result = summarize(catalog)
        self.assertEqual([c["category"] for c in result["categories"]],
                         sorted({"cultura", "Cultura", "Aventura"}))
        by_name = {c["category"]: c for c in result["categories"]}
        self.assertEqual(by_name["cultura"]["count"], 2)
        self.assertEqual(by_name["Cultura"]["count"], 1)
        self.assertEqual(result["total_destinations"], 4)


class NoMutationAndRegressionTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()

    # T014 (a)
    def test_destinations_unchanged_after_category_calls(self):
        # Catálogo propio y desordenado: detecta mutaciones no idempotentes
        # (append) y reordenamientos in situ (sort), sin depender del estado
        # que dejen otras pruebas en el catálogo real.
        own = [dest("c", "Cultura", 30), dest("a", "Aventura", 20),
               dest("b", "Cultura", 10), dest("d", "Bienestar", 5)]
        before = copy.deepcopy(own)
        with patch("backend.app.main.DESTINATIONS", own):
            for _ in range(3):
                self.assertEqual(self.client.get("/api/categories").status_code, 200)
        self.assertEqual(before, own)

    def test_real_catalog_unchanged_after_category_calls(self):
        before = copy.deepcopy(DESTINATIONS)
        for _ in range(3):
            self.assertEqual(self.client.get("/api/categories").status_code, 200)
        self.assertEqual(before, DESTINATIONS)

    # T014 (b)
    def test_summarize_does_not_mutate_input(self):
        catalog = [dest("c", "Cultura", 30), dest("a", "Aventura", 20),
                   dest("b", "Cultura", 10), dest("d", "Bienestar", 5)]
        before = copy.deepcopy(catalog)
        summarize(catalog)
        self.assertEqual(before, catalog)
        self.assertEqual([d["id"] for d in before], [d["id"] for d in catalog])

    # T014 (c)
    def test_existing_endpoints_keep_shape(self):
        root = self.client.get("/")
        self.assertEqual(root.status_code, 200)
        self.assertEqual(set(root.json()), {"message", "docs"})

        listing = self.client.get("/api/destinations")
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(set(listing.json()), {"destinations", "total"})
        required = {"id", "name", "municipality", "category", "price", "days", "tags"}
        for item in listing.json()["destinations"]:
            self.assertTrue(required.issubset(item))

        first_id = listing.json()["destinations"][0]["id"]
        detail = self.client.get(f"/api/destinations/{first_id}")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(set(detail.json()), {"destination"})
        self.assertTrue(required.issubset(detail.json()["destination"]))

        rec = self.client.post("/api/recommendations", json={
            "days": 2, "budget": 200000, "interests": ["naturaleza"]})
        self.assertEqual(rec.status_code, 200)
        data = rec.json()
        for key in ("itinerary", "estimated_total", "remaining_budget"):
            self.assertIn(key, data)


if __name__ == "__main__":
    unittest.main()
