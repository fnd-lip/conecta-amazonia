import { test, expect } from "@playwright/test";
import { installHomeApiMocks } from "../mocks/mock-api";

test.describe("Home - seções por categoria (EventCarouselSection)", () => {
  test("carrega event-types e renderiza uma seção por tipo", async ({ page }) => {
    await installHomeApiMocks(page, {
      eventTypes: [
        { id: 1, nome: "Cultura" },
        { id: 2, nome: "Gastronomia" },
      ],
    });

    await page.goto("/");

    // Evita strict mode: buscamos o heading exato
    await expect(page.getByRole("heading", { name: "Cultura", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Gastronomia", exact: true })).toBeVisible();
  });

  test("quando event-types falha, mostra mensagem de erro", async ({ page }) => {
    await installHomeApiMocks(page, { failEventTypes: true });

    await page.goto("/");

    await expect(page.getByText(/Erro ao carregar categorias/i)).toBeVisible();
  });

  test("quando event-types retorna lista vazia, mostra 'Nenhuma categoria encontrada.'", async ({ page }) => {
    await installHomeApiMocks(page, { eventTypes: [] });

    await page.goto("/");

    await expect(page.getByText(/Nenhuma categoria encontrada/i)).toBeVisible();
  });
});
