import { test, expect } from '../support/fixtures';
import { PRODUCTS } from '../data/products';
import { sumMoney } from '../support/money';

const customer = { firstName: 'Test', lastName: 'Buyer', postalCode: '16000' };

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('completes an order and the totals add up @smoke', async ({ inventoryPage, cartPage, checkoutPage }) => {
    const basket = [PRODUCTS.backpack, PRODUCTS.bikeLight];
    await inventoryPage.add(...basket.map((p) => p.slug));
    await inventoryPage.openCart();

    await expect(cartPage.itemNames).toHaveText(basket.map((p) => p.name));
    await cartPage.checkout();
    await checkoutPage.fillCustomer(customer);

    // Business rule: item total = sum of lines, total = item total + tax.
    const summary = await checkoutPage.summary();
    expect(summary.lineItems).toEqual(basket.map((p) => p.price));
    expect(summary.itemTotal).toBe(sumMoney(summary.lineItems));
    expect(summary.tax).toBeGreaterThan(0);
    expect(summary.total).toBe(sumMoney([summary.itemTotal, summary.tax]));

    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  const missing = [
    { field: 'first name', data: { lastName: 'Buyer', postalCode: '16000' }, message: 'First Name is required' },
    { field: 'last name', data: { firstName: 'Test', postalCode: '16000' }, message: 'Last Name is required' },
    { field: 'postal code', data: { firstName: 'Test', lastName: 'Buyer' }, message: 'Postal Code is required' },
  ];

  for (const row of missing) {
    test(`requires ${row.field}`, async ({ page, inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.add(PRODUCTS.boltTShirt.slug);
      await inventoryPage.openCart();
      await cartPage.checkout();

      await checkoutPage.fillCustomer(row.data);

      await expect(checkoutPage.error).toContainText(row.message);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }
});
