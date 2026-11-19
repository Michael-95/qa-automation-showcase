import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PASSWORD, USERS } from '../data/users';
import { STORAGE_STATE } from '../support/constants';

/**
 * Log in once through the real UI and save the session.
 * Authenticated projects start from this state, so each test skips
 * the login screen but still begins with an empty cart.
 */
setup('authenticate as standard user', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(USERS.standard, PASSWORD);
  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: STORAGE_STATE });
});
