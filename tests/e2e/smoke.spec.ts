import { test, expect } from "@playwright/test";
import { trackErrors, expectNoBlankScreen } from "./helpers";

for (const path of ["/", "/course/cs-1332", "/built-by-agents", "/about", "/roast", "/versus", "/wall", "/wall/swarm", "/roast?c=CS%201332&go=1", "/versus?a=CS%201332&b=CS%202110&go=1"]) {
  test(`smoke ${path} renders without errors`, async ({ page }) => {
    const errors = trackErrors(page);
    const res = await page.goto(path);
    expect(res?.status(), `${path} HTTP status`).toBeLessThan(400);
    await page.waitForLoadState("networkidle");
    await expectNoBlankScreen(page);
    expect(errors, errors.join("\n")).toEqual([]);
  });
}

test("smoke /scout/cs-1332 starts streaming", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/scout/cs-1332");
  await expect(page.getByText(/exam hunter/i).first()).toBeVisible({ timeout: 15_000 });
  await expectNoBlankScreen(page);
  expect(errors, errors.join("\n")).toEqual([]);
});
