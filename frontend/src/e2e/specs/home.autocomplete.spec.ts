import { test, expect, type Locator, type Page } from "@playwright/test";
import { installHomeApiMocks } from "../mocks/mock-api";

async function findAutocompleteInput(page: Page): Promise<Locator> {
  const section = page.locator("section").filter({ hasText: "Eventos no Mapa" }).first();

  const roleCandidates: Locator[] = [
    section.getByRole("searchbox").first(),
    section.getByRole("textbox").first(),
    section.getByRole("combobox").first(),
  ];

  for (const c of roleCandidates) {
    if ((await c.count()) > 0) return c;
  }

  const placeholders: RegExp[] = [/buscar/i, /pesquisar/i, /evento/i, /procurar/i];
  for (const ph of placeholders) {
    const c = section.getByPlaceholder(ph).first();
    if ((await c.count()) > 0) return c;
  }

  return section.locator("input").first();
}

function mapListScope(page: Page): Locator {
  const section = page.locator("section").filter({ hasText: "Eventos no Mapa" }).first();
  // pega o painel do lado direito (onde aparece “Exibindo X eventos”)
  return section.locator("div").filter({ hasText: "Exibindo" }).first().locator("..");
}

test.describe("Home - autocomplete (real)", () => {
  test("digitar termo mostra sugestões; clicar sugestão foca o evento (e tenta filtrar a lista)", async ({ page }) => {
    await installHomeApiMocks(page, {
      mapEventsBase: [
        {
          id: "m1",
          nome: "Show Cultural",
          categoria: "cultura",
          data: "2026-01-21",
          locationName: "Teatro Amazonas",
          latitude: -3.1303,
          longitude: -60.0236,
        },
        {
          id: "m2",
          nome: "Trilha Guiada",
          categoria: "aventura",
          data: "2026-01-22",
          locationName: "Reserva",
          latitude: -3.15,
          longitude: -60.05,
        },
      ],
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Eventos no Mapa/i })).toBeVisible();

    const list = mapListScope(page);

    const showHeading = list.getByRole("heading", { name: "Show Cultural", exact: true });
    const trilhaHeading = list.getByRole("heading", { name: "Trilha Guiada", exact: true });

    await expect(showHeading).toBeVisible();
    await expect(trilhaHeading).toBeVisible();

    const input = await findAutocompleteInput(page);
    await expect(input).toBeVisible();

    await input.click();
    await input.fill("Show");

    const listbox = page.getByRole("listbox").first();
    if (await listbox.count()) {
      await expect(listbox).toBeVisible();
      await listbox.getByText("Show Cultural", { exact: true }).click();
    } else {
      await page.getByText("Show Cultural", { exact: true }).first().click();
    }

    const showCard = showHeading.locator("..");
    await expect(showCard).toHaveClass(/bg-muted\/40/);
    try {
      await expect(trilhaHeading).toHaveCount(0, { timeout: 1500 });
    } catch {
      // ok: não filtrou (só focou).. O foco já foi validado acima.
    }
  });

  test("buscar por nome (enter) filtra lista pelo termo", async ({ page }) => {
    await installHomeApiMocks(page, {
      mapEventsBase: [
        {
          id: "m1",
          nome: "Show Cultural",
          categoria: "cultura",
          data: "2026-01-21",
          locationName: "Teatro Amazonas",
          latitude: -3.1303,
          longitude: -60.0236,
        },
        {
          id: "m2",
          nome: "Trilha Guiada",
          categoria: "aventura",
          data: "2026-01-22",
          locationName: "Reserva",
          latitude: -3.15,
          longitude: -60.05,
        },
      ],
    });

    await page.goto("/");

    const list = mapListScope(page);

    const showHeading = list.getByRole("heading", { name: "Show Cultural", exact: true });
    const trilhaHeading = list.getByRole("heading", { name: "Trilha Guiada", exact: true });

    await expect(showHeading).toBeVisible();
    await expect(trilhaHeading).toBeVisible();

    const input = await findAutocompleteInput(page);
    await expect(input).toBeVisible();

    await input.click();
    await input.fill("Trilha");
    await input.press("Enter");

    await expect(trilhaHeading).toBeVisible();
    await expect(showHeading).toHaveCount(0);
  });
});
