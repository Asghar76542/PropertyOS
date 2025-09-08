import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should navigate to the login page and see the login form', async ({ page }) => {
    // Start from the home page
    await page.goto('/');

    // The middleware should redirect to the login page
    await page.waitForURL('/login');

    // Check for the heading
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

    // Check for the email and password inputs
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Check for the login button
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
