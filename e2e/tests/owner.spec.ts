import { test, expect } from '@playwright/test'
import { loginAs, clearSession, OWNER } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearSession(page)
  await loginAs(page, OWNER)
  await expect(page).toHaveURL('/owner/dashboard')
})

test.describe('Owner — Dashboard', () => {
  test('page loads with store info section', async ({ page }) => {
    // Wait for API to complete (loading skeletons disappear)
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 10_000 })
    // Shows either store name (h1) or "No store assigned yet"
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('shows average rating or unrated state', async ({ page }) => {
    // Wait for a known element that only appears in the fully-loaded state
    await expect(
      page.getByText('Customer Ratings').or(page.getByText('No store assigned yet'))
    ).toBeVisible({ timeout: 15_000 })

    const hasRating = await page.locator('.text-3xl.font-bold').first().isVisible().catch(() => false)
    const hasNoRating = await page.getByText('No ratings').isVisible().catch(() => false)
    const hasNoStore = await page.getByText('No store assigned yet').isVisible().catch(() => false)
    expect(hasRating || hasNoRating || hasNoStore).toBe(true)
  })

  test('shows raters table or empty state', async ({ page }) => {
    await expect(
      page.getByText('Customer Ratings').or(page.getByText('No store assigned yet'))
    ).toBeVisible({ timeout: 15_000 })

    const hasTable = await page.getByRole('table').isVisible().catch(() => false)
    const hasEmpty = await page.getByText('No reviews yet').isVisible().catch(() => false)
    const hasNoStore = await page.getByText('No store assigned yet').isVisible().catch(() => false)
    expect(hasTable || hasEmpty || hasNoStore).toBe(true)
  })

  test('navbar shows Owner role links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Change Password' })).toBeVisible()
  })
})

test.describe('Owner — Change Password', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/owner/change-password')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible()
  })

  test('validates current password required', async ({ page }) => {
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.getByText('Current password is required')).toBeVisible()
  })

  test('validates new password requirements', async ({ page }) => {
    await page.getByLabel('Current Password').fill('Owner@123')
    // exact: true because "Confirm New Password" contains "New Password"
    await page.getByLabel('New Password', { exact: true }).fill('short')
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.getByText(/needs:/i)).toBeVisible()
  })

  test('validates confirmation must match', async ({ page }) => {
    await page.getByLabel('Current Password').fill('Owner@123')
    await page.getByLabel('New Password', { exact: true }).fill('NewOwner@123')
    await page.getByLabel('Confirm New Password').fill('Different@123')
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('confirmation dialog appears on valid form and can be cancelled', async ({ page }) => {
    await page.getByLabel('Current Password').fill('Owner@123')
    await page.getByLabel('New Password', { exact: true }).fill('NewOwner@456')
    await page.getByLabel('Confirm New Password').fill('NewOwner@456')
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.getByText('Change password?')).toBeVisible()
    // Cancel to avoid changing the password in test DB
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByText('Change password?')).not.toBeVisible()
  })
})

test.describe('Owner — Navigation', () => {
  test('navbar logout works', async ({ page }) => {
    await page.getByRole('button', { name: 'Logout' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('cannot access admin routes — redirects to /unauthorized', async ({ page }) => {
    // Authenticated owner visiting an ADMIN-only route → ProtectedRoute sends to /unauthorized
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL('/unauthorized')
  })

  test('cannot access user routes — redirects to /unauthorized', async ({ page }) => {
    // Authenticated owner visiting a USER-only route → ProtectedRoute sends to /unauthorized
    await page.goto('/stores')
    await expect(page).toHaveURL('/unauthorized')
  })
})
