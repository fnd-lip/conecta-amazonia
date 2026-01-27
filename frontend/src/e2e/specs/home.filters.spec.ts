import { test, expect, type Page } from "@playwright/test";
import { installHomeApiMocks } from "../mocks/mock-api";

async function openCategoriaSelect(page: Page) {
  const mapSection = page.locator("section", { hasText: "Eventos no Mapa" });
  await expect(mapSection).toBeVisible();

  const trigger = mapSection.locator('[data-slot="select-trigger"]').first();
  await expect(trigger).toBeVisible();

  await trigger.click();

  await expect(page.getByRole("listbox")).toBeVisible();
}

test.describe("Home - filtros do mapa", () => {
  test.beforeEach(async ({ page }) => {
    await installHomeApiMocks(page);
    await page.goto("/");
  });

  test("filtrar por categoria via Select", async ({ page }) => {
    await openCategoriaSelect(page);

    await page.getByRole("option", { name: "Cultura" }).click();

    await expect(page.getByText("Show Cultural")).toBeVisible();
    await expect(page.getByText("Trilha Guiada")).not.toBeVisible();
  });

  test("filtrar por dataInicio/dataFim (inputs type=date)", async ({ page }) => {
    const mapSection = page.locator("section", { hasText: "Eventos no Mapa" });
    const dates = mapSection.locator('input[type="date"]');

    await expect(dates).toHaveCount(2);

    // dataInicio = 2026-01-22, dataFim = 2026-01-22 => deve sobrar só "Trilha Guiada"
    await dates.nth(0).fill("2026-01-22");
    await dates.nth(1).fill("2026-01-22");

    await expect(page.getByText("Trilha Guiada")).toBeVisible();
    await expect(page.getByText("Show Cultural")).not.toBeVisible();
  });

  test("quando filtros não encontram nada, mostra mensagem vazia", async ({ page }) => {
    const mapSection = page.locator("section", { hasText: "Eventos no Mapa" });
    const dates = mapSection.locator('input[type="date"]');

    await dates.nth(0).fill("2030-01-01");
    await dates.nth(1).fill("2030-01-02");

    await expect(
      page.getByText("Nenhum evento encontrado com esses filtros.")
    ).toBeVisible();
  });
});
