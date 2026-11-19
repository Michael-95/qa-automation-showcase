import { test, expect } from '../support/fixtures';
import { PASSWORD, USERS } from '../data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user reaches the product list @smoke', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(USERS.standard, PASSWORD);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  // Negative paths are table-driven: one row per rule, easy to extend.
  const rejected = [
    { case: 'locked-out user', user: USERS.lockedOut, pass: PASSWORD, message: 'this user has been locked out' },
    { case: 'wrong password', user: USERS.standard, pass: 'not-the-password', message: 'do not match any user' },
    { case: 'missing username', user: '', pass: PASSWORD, message: 'Username is required' },
    { case: 'missing password', user: USERS.standard, pass: '', message: 'Password is required' },
  ];

  for (const row of rejected) {
    test(`rejects ${row.case}`, async ({ page, loginPage }) => {
      await loginPage.login(row.user, row.pass);

      await expect(loginPage.error).toBeVisible();
      await expect(loginPage.error).toContainText(row.message);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }
});

test.describe('Access control', () => {
  for (const path of ['/inventory.html', '/cart.html', '/checkout-step-one.html']) {
    test(`blocks ${path} without a session`, async ({ page, loginPage }) => {
      await page.goto(path);

      await expect(loginPage.submit).toBeVisible();
      await expect(loginPage.error).toContainText('when you are logged in');
    });
  }
});
