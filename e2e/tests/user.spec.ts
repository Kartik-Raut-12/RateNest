import { test, expect } from '@playwright/test'
import { loginAs, clearSession, USER } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearSession(page)
  await loginAs(page, USER)
  await expect(page).toHaveURL('/stores')
})

test.describe('User — Stores list', () => {
  test('page heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Explore Stores' })).toBeVisible()
  })

  test('at least one store card is displayed', async ({ page }) => {
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 10_000 })
    await expect(page.locator('h2.font-bold').first()).toBeVisible()
  })

  test('search filters stores — no results shows empty state', async ({ page }) => {
    // Wait for initial load before searching (avoids race with in-progress fetch)
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 10_000 })
    await page.getByLabel('Search stores').fill('xzxzxznomatch')
    await expect(page.getByText('No stores found')).toBeVisible({ timeout: 10_000 })
  })

  test('clearing search restores store list', async ({ page }) => {
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 10_000 })
    const searchInput = page.getByLabel('Search stores')
    await searchInput.fill('xzxzxznomatch')
    await expect(page.getByText('No stores found')).toBeVisible()
    // fill('') triggers React onChange; .clear() does not
    await searchInput.fill('')
    await expect(page.locator('h2.font-bold').first()).toBeVisible()
  })

  test('Rating sort button toggles order indicator', async ({ page }) => {
    const ratingBtn = page.getByRole('button', { name: /^rating/i })
    await ratingBtn.click()
    await expect(ratingBtn).toContainText(/↑|↓/)
    await ratingBtn.click()
    await expect(ratingBtn).toContainText(/↑|↓/)
  })

  test('Name sort button toggles order indicator', async ({ page }) => {
    const nameBtn = page.getByRole('button', { name: /^name/i })
    await nameBtn.click()
    await expect(nameBtn).toContainText(/↓/)
    await nameBtn.click()
    await expect(nameBtn).toContainText(/↑/)
  })

  test('star rating input is rendered on each store card', async ({ page }) => {
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 10_000 })
    // StarRatingInput uses aria-label="Rate N out of 5 stars"
    const starBtn = page.locator('[aria-label^="Rate "]').first()
    await expect(starBtn).toBeVisible()
  })

  test('clicking a star submits or updates a rating', async ({ page }) => {
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 10_000 })
    // Click 4-star button on the first store card
    const fourStar = page.locator('[aria-label="Rate 4 out of 5 stars"]').first()
    await expect(fourStar).toBeVisible()
    await fourStar.click()
    await expect(
      page.getByText(/rating submitted|rating updated/i).first()
    ).toBeVisible()
  })
})

test.describe('User — Change Password page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/change-password')
  })

  test('page loads with form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible()
  })

  test('validates current password is required', async ({ page }) => {
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.getByText('Current password is required')).toBeVisible()
  })

  test('validates new password strength rules', async ({ page }) => {
    await page.getByLabel('Current Password').fill('User@1234')
    // exact: true because "Confirm New Password" contains "New Password"
    await page.getByLabel('New Password', { exact: true }).fill('weak')
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.getByText(/needs:/i)).toBeVisible()
  })

  test('validates confirmation password match', async ({ page }) => {
    await page.getByLabel('Current Password').fill('User@1234')
    await page.getByLabel('New Password', { exact: true }).fill('NewPass@123')
    await page.getByLabel('Confirm New Password').fill('Mismatch@123')
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('show/hide toggle works on password field', async ({ page }) => {
    const pwInput = page.locator('#cp-cur')
    await expect(pwInput).toHaveAttribute('type', 'password')
    await page.getByRole('button', { name: /show/i }).first().click()
    await expect(pwInput).toHaveAttribute('type', 'text')
  })
})
