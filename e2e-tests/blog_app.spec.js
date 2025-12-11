const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createDefaultBlog } = require('./helper')


describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Ivan Testing',
        username: 'itesting',
        password: 'Testing1'
      }
    })

    await request.post('/api/users', {
      data: {
        name: 'Second Testing',
        username: 'secondtesting',
        password: 'Testing1'
      }
    })

    await page.goto('')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('Login form is shown', async ({ page }) => {
    const username = page.getByLabel('Username:')
    const password = page.getByLabel('Password:')
    const loginButton = page.getByRole('button', { name: 'login' })

    await expect(username).toBeVisible()
    await expect(password).toBeVisible()
    await expect(loginButton).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByLabel('Username:').fill('itesting')
      await page.getByLabel('Password:').fill('Testing1')
      await page.getByRole('button', { name: 'login' }).click()

      const notification = page.locator('.notification.success')
      await expect(notification).toBeVisible()
      await expect(notification).toHaveText('Logged in!')

      const username = page.getByLabel('Username:')
      const password = page.getByLabel('Password:')
      await expect(username).not.toBeVisible()
      await expect(password).not.toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'itesting', 'WrongPassword')
      const notification = page.locator('.notification.error')
      await expect(notification).toBeVisible()
      await expect(notification).toContainText('Wrong credentials')
      await expect(notification).toHaveCSS('color', 'rgb(255, 0, 0)')
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'itesting', 'Testing1')
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new blog' }).click()
      await page.locator('[aria-label="Title"]').fill('Can a blog be created?')
      await page.locator('[aria-label="Author"]').fill('We Hope So')
      await page.locator('[aria-label="Url"]').fill('hopeforever.com')
      await page.getByRole('button', { name: 'create' }).click()

      const blogContainer = page.locator('.blogContainer')
      await expect(blogContainer).toBeVisible()
      await expect(blogContainer).toContainText('Can a blog be created?')
    })
  })

  describe('Blog manipulation', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'itesting', 'Testing1')
      await createDefaultBlog(page)
    })

    test('blog can be liked', async ({ page }) => {
      await page.getByRole('button', { name: 'view' }).first().click()
      const initialLikes = await page.getByTestId('likes-count').first().textContent()
      await page.getByRole('button', { name: 'like' }).first().click()
      await expect(page.getByTestId('likes-count').first()).toHaveText(String(parseInt(initialLikes) + 1))
    })

    test('blog can be deleted by the user who added them', async ({ page }) => {
      const blogContainer = page.locator('.blogContainer')
      await expect(blogContainer).toBeVisible()

      await page.getByRole('button', { name: 'view' }).first().click()
      page.on('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'remove' }).first().click()
      const notification = page.locator('.notification.success')
      await expect(notification).toBeVisible()
      await expect(notification).toHaveText('Blog deleted!')
      await expect(blogContainer).not.toBeVisible()
    })

    test('only the user who added the blog sees the blogs delete button', async ({ page }) =>{
      await page.getByRole('button', { name: 'view' }).first().click()
      const removeButton = page.getByRole('button', { name: 'remove' }).first()
      await expect(removeButton).toBeVisible()
      await page.getByRole('button', { name: 'Logout' }).click()

      await loginWith(page, 'secondtesting', 'Testing1')
      await page.getByRole('button', { name: 'view' }).first().click()
      await expect(removeButton).not.toBeVisible()
    })
  })

  describe('Blog view', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'itesting', 'Testing1')
      await createDefaultBlog(page, 'Blog A')
      await createDefaultBlog(page, 'Blog B')
      await createDefaultBlog(page, 'Blog Last')
    })

    test('check if blogs get sorted dynamically', async ({ page }) => {
      const blogs = await page.locator('.blogContainer').all()
      const blogLast = blogs[blogs.length - 1]
      await expect(blogLast).toContainText('Blog Last')

      await expect(page.locator('.blogContainer').first()).toContainText('Blog A')

      const viewCount = await page.getByRole('button', { name: 'view' }).count()

      for(let i = 0; i < viewCount; i++) {
        await page.getByRole('button', { name: 'view' }).first().click()
      }

      await blogLast.getByRole('button', { name: 'like' }).click()
      await expect(page.locator('.blogContainer').first()).toContainText('Blog Last')

      const targetBlog = page.locator('.blogContainer').filter({
        has: page.getByText('Blog B')
      })

      await targetBlog.getByRole('button', { name: 'like' }).click()
      await expect(targetBlog.getByTestId('likes-count')).toContainText('1')
      await targetBlog.getByRole('button', { name: 'like' }).click()
      await expect(targetBlog.getByTestId('likes-count')).toContainText('2')

      await expect(page.locator('.blogContainer').first()).toContainText('Blog B')
      const finalOrder = await page.locator('.blogContainer [data-testid="blog-title"]').allTextContents()
      await expect(finalOrder).toEqual(['Blog B', 'Blog Last', 'Blog A'])
    })
  })
})