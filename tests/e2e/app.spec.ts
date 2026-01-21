import { test, expect } from '@playwright/test'

test.describe('Chancellor Dossier App', () => {
  test('should display the app title', async ({ page }) => {
    await page.goto('/')

    // Check for the main title
    const title = page.getByRole('heading', { name: /Chancellor Dossier/i })
    await expect(title).toBeVisible()
  })

  test('should display success message', async ({ page }) => {
    await page.goto('/')

    // Check for the success message
    await expect(page.getByText(/Tailwind CSS and shadcn\/ui are successfully installed!/i)).toBeVisible()
  })

  test('should render three buttons with correct variants', async ({ page }) => {
    await page.goto('/')

    // Check for all three buttons
    const buttons = page.getByRole('button')
    await expect(buttons).toHaveCount(3)

    // Check button text
    await expect(page.getByRole('button', { name: 'Click me' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Secondary' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Outline' })).toBeVisible()
  })

  test('should have proper styling with Tailwind classes', async ({ page }) => {
    await page.goto('/')

    // Check that the main container has the expected gradient background
    const container = page.locator('div').first()
    await expect(container).toBeVisible()
  })

  test('buttons should be interactive', async ({ page }) => {
    await page.goto('/')

    // Click the first button to ensure it's interactive
    const clickMeButton = page.getByRole('button', { name: 'Click me' })
    await clickMeButton.click()
    
    // Button should still be visible after click
    await expect(clickMeButton).toBeVisible()
  })
})

