import { test, expect } from '@playwright/test'
import { loginAs, clearSession, ADMIN, OWNER, USER } from './helpers'

test.beforeEach(async ({ page }) => {
  await clearSession(page)
})

test.describe('Routing — unauthenticated', () => {
  test('redirects /admin/dashboard to /login', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('redirects /stores to /login', async ({ page }) => {
    await page.goto('/stores')
    await expect(page).toHaveURL('/login')
  })

  test('redirects /owner/dashboard to /login', async ({ page }) => {
    await page.goto('/owner/dashboard')
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Login — form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('shows required-field errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('shows invalid email format error', async ({ page }) => {
    await page.getByLabel('Email address').fill('notanemail')
    await page.locator('#password').fill('somepass')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Invalid email format')).toBeVisible()
  })
})

test.describe('Login — wrong credentials', () => {
  test('shows error toast and stays on /login', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email address').fill(ADMIN.email)
    await page.locator('#password').fill('Wrong@Pass1')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Invalid email or password')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Login — success by role', () => {
  test('admin lands on /admin/dashboard', async ({ page }) => {
    await loginAs(page, ADMIN)
    await expect(page).toHaveURL('/admin/dashboard')
  })

  test('normal user lands on /stores', async ({ page }) => {
    await loginAs(page, USER)
    await expect(page).toHaveURL('/stores')
  })

  test('store owner lands on /owner/dashboard', async ({ page }) => {
    await loginAs(page, OWNER)
    await expect(page).toHaveURL('/owner/dashboard')
  })
})

test.describe('Session', () => {
  test('session persists after page refresh', async ({ page }) => {
    await loginAs(page, USER)
    await expect(page).toHaveURL('/stores')
    await page.reload()
    await expect(page).toHaveURL('/stores')
    await expect(page.getByText('Explore Stores')).toBeVisible()
  })

  test('logout clears session and redirects to /login', async ({ page }) => {
    await loginAs(page, ADMIN)
    await expect(page).toHaveURL('/admin/dashboard')
    await page.getByRole('button', { name: 'Logout' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('cannot access protected route after logout', async ({ page }) => {
    await loginAs(page, ADMIN)
    await page.getByRole('button', { name: 'Logout' }).click()
    await expect(page).toHaveURL('/login')
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL('/login')
  })
})
