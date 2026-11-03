import { expect, type Page } from "@playwright/test";

/** Fail the test on any uncaught page error or console error (ignores noisy dev warnings). */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon|Download the React DevTools|hydrat/i.test(m.text())) errors.push(`console: ${m.text()}`);
  });
  return errors;
}

export async function expectNoBlankScreen(page: Page) {
  const text = (await page.locator("body").innerText()).trim();
  expect(text.length, "page rendered (not blank)").toBeGreaterThan(40);
  await expect(page.locator("body")).not.toContainText(/Application error|Unhandled Runtime Error|Internal Server Error/i);
}
