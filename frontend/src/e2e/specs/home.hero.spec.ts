import { test, expect } from "@playwright/test";
import { installHomeApiMocks } from "../mocks/mock-api";

test.describe("Home - Hero (highlights)", () => {
  test("carrega highlights e mostra 'Próximos eventos'", async ({ page }) => {
    await installHomeApiMocks(page, {
      failHighlights: false,
      highlights: [
        {
          id: "h1",
          nome: "Festival do Açaí",
          categoria: "gastronomia",
          data: "2026-01-20",
          locationName: "Manaus",
          latitude: -3.119,
          longitude: -60.021,
        },
      ],
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Próximos eventos/i })).toBeVisible();

    await expect(page.getByText(/Festival do Açaí/i)).toBeVisible();
  });

  test("quando highlights falham, mantém a página e mostra estado de erro", async ({ page }) => {
    await installHomeApiMocks(page, { failHighlights: true });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Próximos eventos/i })).toBeVisible();

    await expect(page.getByText(/Erro ao carregar eventos/i)).toBeVisible();
  });
});
