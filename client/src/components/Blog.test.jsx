import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders content', () => {
  const blog = {
    title: 'Donde esta Alfredo?',
    author: 'Alfonso',
    url: 'Alfonso.com',
    likes: 130
  }

  const { container } = render(<Blog blog={blog} incrementLikes={vi.fn()} deleteBlog={vi.fn()}/>)

  const div = container.querySelector('.blogContainer')
  const details = container.querySelector('.expandedDetails')

  expect(div).toHaveTextContent('Donde esta Alfredo?')
  expect(div).toHaveTextContent('Alfonso')
  expect(details).toHaveStyle('display: none')
})

test('url and likes are shown after "view" is clicked', async () => {
  const blog = {
    title: 'Donde esta Alfredo?',
    author: 'Alfonso',
    url: 'Alfonso.com',
    likes: 130
  }

  render(<Blog blog={blog} incrementLikes={vi.fn()} deleteBlog={vi.fn()}/>)


  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  expect(screen.getByTestId('blog-url')).toHaveTextContent(blog.url)
  expect(screen.getByTestId('blog-likes')).toHaveTextContent(String(blog.likes))

  expect(screen.getByTestId('blog-url')).toBeVisible()
  expect(screen.getByTestId('blog-likes')).toBeVisible()

  await user.click(button)

  expect(screen.getByTestId('blog-url')).not.toBeVisible()
  expect(screen.getByTestId('blog-likes')).not.toBeVisible()
})

test('like button being clicked calls corresponding function correctly', async () => {
  const blog = {
    title: 'Donde esta Alfredo?',
    author: 'Alfonso',
    url: 'Alfonso.com',
    likes: 130
  }

  const mockLikeHandler = vi.fn()

  render(<Blog blog={blog} incrementLikes={mockLikeHandler} deleteBlog={vi.fn()}/>)

  const user = userEvent.setup()

  const button = screen.getByText('like')
  await user.click(button)
  await user.click(button)

  expect(mockLikeHandler.mock.calls).toHaveLength(2)
})