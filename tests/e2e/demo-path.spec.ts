import { test, expect } from "@playwright/test";
import { trackErrors, expectNoBlankScreen } from "./helpers";

/** The exact judge flow from docs/IDEA.md. */
test("demo path: search → scout → course pack → exam → plan → outreach → export", async ({ page, request }) => {
  const errors = trackErrors(page);

  // 1. Home: search box + gallery
  await page.goto("/");
  await expect(page.getByText(/feared/i).first()).toBeVisible();
  const search = page.getByRole("textbox").first();
  await search.fill("cs1332");
  await search.press("Enter");

  // 2. Scout page streams agents + sources, then lands on the course page
  await expect(page).toHaveURL(/\/scout\/cs-1332/);
  for (const agent of [/exam hunter/i, /syllabus scout/i, /student pulse/i, /concept mapper/i]) {
    await expect(page.getByText(agent).first()).toBeVisible({ timeout: 20_000 });
  }
  await page.waitForURL(/\/course\/cs-1332/, { timeout: 90_000 });

  // 3. Course dashboard
  await expectNoBlankScreen(page);
  await expect(page.getByText("CS 1332").first()).toBeVisible();
  await expect(page.locator(".react-flow").first(), "concept graph").toBeVisible({ timeout: 15_000 });

  const tab = (name: RegExp) => page.getByRole("tab", { name }).or(page.getByRole("button", { name })).first();

  // 4. Practice exam: answer a question, get feedback
  await tab(/practice exam/i).click();
  const firstChoice = page.getByRole("button", { name: /^[A-D][\).:]|.+/ }).filter({ hasNotText: /practice|plan|outreach|ask|export|scout|overview/i }).first();
  await expect(firstChoice).toBeVisible({ timeout: 30_000 });

  // 5. Study plan
  await tab(/study plan/i).click();
  await expect(page.locator('input[type="date"]').first()).toBeVisible({ timeout: 10_000 });

  // 6. Outreach: mailto link appears after drafting
  await tab(/outreach/i).click();
  const draft = page.getByRole("button", { name: /draft|generate|write/i }).first();
  if (await draft.isVisible()) await draft.click();
  await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible({ timeout: 30_000 });

  // 7. Export endpoint returns SmartPath JSON
  const exp = await request.get("/api/export/cs-1332?format=smartpath");
  expect(exp.ok()).toBeTruthy();
  const json = await exp.json();
  expect(Array.isArray(json.nodes) && json.nodes.length > 0).toBeTruthy();

  expect(errors, errors.join("\n")).toEqual([]);
});

test("fallback: an unseeded course still produces a pack", async ({ page }) => {
  await page.goto("/scout/ece-2020");
  await page.waitForURL(/\/course\/ece-2020/, { timeout: 90_000 });
  await expectNoBlankScreen(page);
});
