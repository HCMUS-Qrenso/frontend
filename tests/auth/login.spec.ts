/**
 * Login E2E Tests
 * 
 * Tests for the login flow.
 * Note: Uses #email / #password selectors (id-based, not name-based)
 */

import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
  })

  test('should display login form', async ({ page }) => {
    // Check form elements exist using ID selectors
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation error for empty form submission', async ({ page }) => {
    // Click submit without filling form
    await page.click('button[type="submit"]')
    
    // Should stay on login page due to validation
    await expect(page).toHaveURL(/\/auth\/login/)
    
    // Form validation error should appear
    await expect(page.locator('text=Vui lòng nhập email')).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    // Fill with invalid email
    await page.fill('#email', 'invalid-email')
    await page.fill('#password', 'password123')
    await page.click('button[type="submit"]')
    
    // Should show email validation error
    await expect(page.locator('text=Email không hợp lệ')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill with wrong credentials
    await page.fill('#email', 'wrong@example.com')
    await page.fill('#password', 'wrongpassword123')
    await page.click('button[type="submit"]')
    
    // Wait for API response and error message
    await page.waitForTimeout(2000)
    
    // Should still be on login page (login failed)
    expect(page.url()).toContain('/auth/login')
  })

  test('should have forgot password link', async ({ page }) => {
    const forgotLink = page.locator('a[href*="forgot-password"]')
    await expect(forgotLink).toBeVisible()
    
    await forgotLink.click()
    await expect(page).toHaveURL(/forgot-password/)
  })
})

test.describe('Login - Successful Login', () => {
  // Note: This test requires a valid test user in the database
  // Uncomment and update credentials to enable
  
  test.skip('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    
    // Fill with valid credentials
    await page.fill('#email', 'test@example.com')
    await page.fill('#password', 'Password123')
    await page.click('button[type="submit"]')
    
    // Should redirect to admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    expect(page.url()).toContain('/admin')
  })
})
