import { test, expect } from "@playwright/test";
import { installHomeApiMocks } from "../mocks/mock-api";

test("home abre", async ({ page }) => {
  await installHomeApiMocks(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Próximos eventos/i })).toBeVisible();

  await expect(page.getByText("Festival do Açaí")).toBeVisible();

  await expect(page.getByRole("heading", { name: /Eventos no Mapa/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Planeje sua visita/i })).toBeVisible();
});
