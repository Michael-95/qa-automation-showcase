import { test, expect } from '../support/fixtures';
import { CATALOGUE_SIZE, PRODUCTS } from '../data/products';
import type { SortOption } from '../pages/InventoryPage';

test.describe('Product list', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('shows the full catalogue with names and prices', async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(CATALOGUE_SIZE);

    const prices = await inventoryPage.prices();
    expect(prices).toHaveLength(CATALOGUE_SIZE);
    for (const price of prices) expect(price).toBeGreaterThan(0);
  });

  const nameSorts: { option: SortOption; label: string; direction: 1 | -1 }[] = [
    { option: 'az', label: 'name A to Z', direction: 1 },
    { option: 'za', label: 'name Z to A', direction: -1 },
  ];
  for (const sort of nameSorts) {
    test(`sorts by ${sort.label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(sort.option);

      const shown = await inventoryPage.names();
      const expected = [...shown].sort((a, b) => sort.direction * a.localeCompare(b));
      expect(shown).toEqual(expected);
    });
  }

  const priceSorts: { option: SortOption; label: string; direction: 1 | -1 }[] = [
    { option: 'lohi', label: 'price low to high', direction: 1 },
    { option: 'hilo', label: 'price high to low', direction: -1 },
  ];
  for (const sort of priceSorts) {
    test(`sorts by ${sort.label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(sort.option);

      const shown = await inventoryPage.prices();
      const expected = [...shown].sort((a, b) => sort.direction * (a - b));
      expect(shown).toEqual(expected);
    });
  }
});

test.describe('Cart badge', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('counts items as they are added and removed @smoke', async ({ inventoryPage }) => {
    await expect(inventoryPage.cartBadge).toBeHidden();

    await inventoryPage.add(PRODUCTS.backpack.slug, PRODUCTS.bikeLight.slug);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.removeButton(PRODUCTS.backpack.slug).click();
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.addButton(PRODUCTS.backpack.slug)).toBeVisible();
  });

  test('keeps the cart after a page reload', async ({ page, inventoryPage }) => {
    await inventoryPage.add(PRODUCTS.boltTShirt.slug);
    await page.reload();

    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.removeButton(PRODUCTS.boltTShirt.slug)).toBeVisible();
  });
});
