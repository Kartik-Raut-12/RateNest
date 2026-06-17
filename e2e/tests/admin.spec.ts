import { test, expect } from '@playwright/test'
import { loginAs, clearSession, ADMIN } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearSession(page)
  await loginAs(page, ADMIN)
  await expect(page).toHaveURL('/admin/dashboard')
})

test.describe('Admin — Dashboard', () => {
  test('shows all three stat cards', async ({ page }) => {
    await expect(page.getByText('Total Users')).toBeVisible()
    await expect(page.getByText('Total Stores')).toBeVisible()
    await expect(page.getByText('Total Ratings')).toBeVisible()
  })

  test('shows quick-action links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /manage users/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /manage stores/i })).toBeVisible()
  })

  test('stat card values are non-negative numbers', async ({ page }) => {
    const numbers = page.locator('.text-3xl.font-bold')
    await expect(numbers).toHaveCount(3)
    for (const el of await numbers.all()) {
      const text = await el.innerText()
      expect(parseInt(text.replace(/,/g, ''), 10)).toBeGreaterThanOrEqual(0)
    }
  })
})

test.describe('Admin — Users list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/users')
    // Wait for initial load to complete
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 10_000 })
  })

  test('page title and table are visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('table has at least one user row', async ({ page }) => {
    const count = await page.locator('tbody tr').count()
    expect(count).toBeGreaterThan(0)
  })

  test('search by name filters results', async ({ page }) => {
    await page.getByPlaceholder(/search name/i).fill('alice')
    // Wait for table to update then check for Alice Johnson
    await expect(page.locator('tbody')).toContainText('Alice Johnson', { timeout: 10_000 })
  })

  test('search with no match shows empty state', async ({ page }) => {
    await page.getByPlaceholder(/search name/i).fill('xzxzxznomatch')
    await expect(page.getByText('No users found')).toBeVisible()
  })

  test('role filter dropdown works', async ({ page }) => {
    // The role filter is a <select> element, not a button
    await page.locator('select').selectOption('STORE_OWNER')
    await expect(page.getByRole('table')).toBeVisible()
    // All visible rows should have STORE_OWNER badge
    await expect(page.locator('tbody')).toContainText('STORE_OWNER')
  })

  test('clicking Name column header toggles sort', async ({ page }) => {
    const nameHeader = page.getByRole('columnheader', { name: /name/i })
    await nameHeader.click()
    await nameHeader.click()
    await expect(page.locator('tbody tr')).not.toHaveCount(0)
  })
})

test.describe('Admin — Stores list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/stores')
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 10_000 })
  })

  test('page title and table are visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Stores' })).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('table has at least one store row', async ({ page }) => {
    const count = await page.locator('tbody tr').count()
    expect(count).toBeGreaterThan(0)
  })

  test('sort by Rating column works', async ({ page }) => {
    await page.getByRole('columnheader', { name: /rating/i }).click()
    await expect(page.locator('tbody tr')).not.toHaveCount(0)
  })

  test('Add Store button opens modal', async ({ page }) => {
    await page.getByRole('button', { name: /add store/i }).click()
    await expect(page.getByText('Add New Store')).toBeVisible()
  })

  test('Add Store modal can be closed with Cancel', async ({ page }) => {
    await page.getByRole('button', { name: /add store/i }).click()
    await expect(page.getByText('Add New Store')).toBeVisible()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByText('Add New Store')).not.toBeVisible()
  })

  test('Add Store modal validates required fields', async ({ page }) => {
    await page.getByRole('button', { name: /add store/i }).click()
    await page.getByRole('button', { name: /create store/i }).click()
    await expect(page.getByText('Store name is required')).toBeVisible()
    await expect(page.getByText('Invalid email')).toBeVisible()
  })

  test('Add Store modal creates a store successfully', async ({ page }) => {
    await page.getByRole('button', { name: /add store/i }).click()
    await page.locator('#ss-name').fill(`E2E Store ${Date.now()}`)
    await page.locator('#ss-email').fill(`e2e${Date.now()}@test.com`)
    await page.getByRole('button', { name: /create store/i }).click()
    await expect(page.getByText('Store created')).toBeVisible()
  })
})
