import type { Page } from '@playwright/test'

export const ADMIN = { email: 'admin@ratenest.com', password: 'Admin@123' }
export const OWNER = { email: 'john.owner@ratenest.com', password: 'Owner@123' }
export const USER  = { email: 'alice@ratenest.com', password: 'User@1234' }

export async function loginAs(page: Page, creds: { email: string; password: string }) {
  await page.goto('/login')
  await page.getByLabel('Email address').fill(creds.email)
  await page.locator('#password').fill(creds.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

export async function clearSession(page: Page) {
  // Must be on a page before localStorage is accessible
  await page.goto('/login')
  await page.evaluate(() => {
    localStorage.removeItem('ratenest_token')
    localStorage.removeItem('ratenest_user')
  })
}
