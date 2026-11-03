import { test, expect } from "@playwright/test";

for (const path of ["/", "/course/cs-1332"]) {
  test(`mobile ${path}: no horizontal scroll`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "horizontal overflow px").toBeLessThanOrEqual(1);
  });
}
