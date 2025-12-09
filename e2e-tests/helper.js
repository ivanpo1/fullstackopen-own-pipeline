const loginWith = async (page, username, password)  => {
  await page.getByLabel('Username:').fill(username)
  await page.getByLabel('Password:').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createDefaultBlog = async (page, title = 'Default Blog') => {
  await page.getByRole('button', { name: 'new blog' }).click()
  await page.locator('[aria-label="Title"]').fill(title)
  await page.locator('[aria-label="Author"]').fill('Testing purposes')
  await page.locator('[aria-label="Url"]').fill('url.testing.com')
  await page.getByRole('button', { name: 'create' }).click()
  await page.getByTestId('blog-title').getByText(title).waitFor()
}

const verifyBlog = async () => {

}

export { loginWith, createDefaultBlog }