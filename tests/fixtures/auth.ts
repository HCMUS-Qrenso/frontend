/**
 * Auth Fixture
 * 
 * Provides authenticated page for tests that require login.
 */

import { test as base, expect, Page } from '@playwright/test'

// Test user credentials - should match a real user in your backend
const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123',
}

// Extend base test with auth fixture
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/auth/login')
    
    // Fill in login form
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    
    // Click login button
    await page.click('button[type="submit"]')
    
    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    
    // Use the authenticated page in tests
    await use(page)
  },
})

export { expect }
export { TEST_USER }
