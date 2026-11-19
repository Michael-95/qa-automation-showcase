import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

/**
 * WCAG 2.1 A/AA scans with axe-core.
 *
 * Every run attaches the full axe report and adds a per-impact count to
 * the HTML report. Sauce Demo is a third-party practice site with known
 * issues we cannot fix, so the gate is opt-in:
 *   A11Y_STRICT=1  -> fail on any critical or serious violation
 * On a product you own, run strict from day one.
 */
const STRICT = process.env.A11Y_STRICT === '1';

const pages = [
  { name: 'login', path: '/' },
  { name: 'product list', path: '/inventory.html' },
  { name: 'cart', path: '/cart.html' },
];

for (const target of pages) {
  test(`${target.name} page meets WCAG 2.1 AA`, async ({ page }, testInfo) => {
    await page.goto(target.path);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    await testInfo.attach(`axe-${target.name}.json`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    const byImpact: Record<string, number> = {};
    for (const v of results.violations) {
      byImpact[v.impact ?? 'unknown'] = (byImpact[v.impact ?? 'unknown'] ?? 0) + 1;
      testInfo.annotations.push({ type: `a11y:${v.impact}`, description: `${v.id} (${v.nodes.length} nodes): ${v.help}` });
    }
    testInfo.annotations.push({ type: 'a11y:summary', description: JSON.stringify(byImpact) });

    if (STRICT) {
      const blocking = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      expect(blocking.map((v) => v.id), 'critical/serious WCAG violations').toEqual([]);
    }
  });
}
