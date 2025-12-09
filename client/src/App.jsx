import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable.jsx'
import BlogForm from './components/BlogForm.jsx'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)


  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const blogFormRef = useRef()

  const blogForm = () => (
    <Togglable buttonLabel='new blog' ref={blogFormRef}>
      <BlogForm createBlog={createBlog}/>
    </Togglable>
  )

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      blogService.setToken(user.token)

      window.localStorage.setItem('loggedUser', JSON.stringify(user))
      setUser(user)
      setUsername('')
      setPassword('')
      showNotification('Logged in!', 'success')
    } catch (exception) {
      console.log(exception)
      showNotification('Wrong credentials', 'error')
    }
  }

  const handleLogout = () => {
    blogService.setToken(null)
    setUser(null)
    window.localStorage.removeItem('loggedUser')
    showNotification('Logged out!', 'success')
  }

  const createBlog = async (blogObject) => {
    try {
      blogObject = {
        title: blogObject.title,
        author: blogObject.author,
        url: blogObject.url,
      }
      blogFormRef.current.toggleVisibility()
      const createdBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(createdBlog))
      showNotification(`a new blog ${blogObject.title} by ${blogObject.author} was added`, 'success')

      return true
    } catch (error) {
      showNotification(`Failed to create blog post ${error}`, 'error')
      return false
    }
  }

  const incrementLikes = async (blog) => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
    }

    try {
      const updatedBlogResponse = await blogService.update(blog.id, updatedBlog)

      setBlogs(blogs.map(blog =>
        blog.id === updatedBlogResponse.id ? updatedBlogResponse : blog
      ))
    } catch (error) {
      console.log('failed to update blog', error)
    }
  }

  const handleDeleteBlog = async (id) => {
    if (window.confirm()) {
      try {
        const response = await blogService.deletion(id)
        console.log(response)
        showNotification('Blog deleted!', 'success')
        blogService.getAll().then(blogs =>
          setBlogs(blogs)
        )
      } catch (error) {
        showNotification(error, 'error')
      }
    }
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        <label>
          Username:
          <input
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  )


  return (
    <div>
      <Notification notification={notification}/>
      {user === null ?
        loginForm() :
        <div>
          <p>{user.name} logged-in</p>

          <div>
            <h2>blogs</h2>
            {blogs.toSorted((a, b) => b.likes - a.likes).map(blog =>
              <Blog key={blog.id} blog={blog} incrementLikes={incrementLikes} deleteBlog={handleDeleteBlog} currentUser={user}/>
            )}
          </div>
          <button onClick={handleLogout}>Logout</button>
          {blogForm()}
        </div>
      }
    </div>
  )
}

export default App