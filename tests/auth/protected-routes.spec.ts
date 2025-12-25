/**
 * Protected Routes E2E Tests
 *
 * Tests that unauthenticated users are redirected from protected routes.
 */

import { test, expect } from '@playwright/test'

test.describe('Protected Routes', () => {
  test('should redirect /admin to login when not authenticated', async ({ page }) => {
    // Try to access admin without login
    await page.goto('/admin/dashboard')

    // Should redirect to login page
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should redirect /admin/menu to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/menu/items')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should redirect /admin/tables to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/tables/list')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should redirect /admin/orders to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/orders')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should redirect /admin/staff to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/staff')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should preserve redirect URL in query params', async ({ page }) => {
    const targetUrl = '/admin/menu/categories'
    await page.goto(targetUrl)

    // Should redirect to login with redirect param
    await expect(page).toHaveURL(/\/auth\/login/)

    // URL should contain redirect query param
    const url = new URL(page.url())
    const redirect = url.searchParams.get('redirect')
    expect(redirect).toBeTruthy()
  })
})

test.describe('Public Routes', () => {
  test('should allow access to home page', async ({ page }) => {
    await page.goto('/')

    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/auth\/login/)
  })

  test('should allow access to login page', async ({ page }) => {
    await page.goto('/auth/login')

    // Should stay on login page
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should allow access to forgot password page', async ({ page }) => {
    await page.goto('/auth/forgot-password')

    // Should stay on forgot password page
    await expect(page).toHaveURL(/\/auth\/forgot-password/)
  })
})
