const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const blogs = require('../utils/list_helper')
const helper = require('../utils/list_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

let user
let token

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = blogs.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('Testing1', 10)
  user = new User({ username: 'root', passwordHash })
  await user.save()

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'root',
      password: 'Testing1'
    })

  token = loginResponse.body.token
})

describe('Read: existing blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, blogs.initialBlogs.length)
  })

  test('unique identifier is called "id"', async () => {
    const response = await api.get('/api/blogs')

    response.body.forEach(blog => {
      assert(blog.id)
      assert(!blog._id)
    })
  })
})

describe('Create: new blogs', () => {

  test('successfully create a blog post', async () => {
    const newBlog = {
      title: 'Dancing in the rain', author: 'Chimpi T. Chompa', url: 'https://chimpichompa.com/',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogs.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    assert(titles.includes('Dancing in the rain'))
  })

  test('when likes property is missing, it defaults to value 0', async () => {
    const newBlog = {
      title: 'Dancing in the rain', author: 'Chimpi T. Chompa', url: 'https://chimpichompa.com/',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await helper.blogsInDb()

    assert.strictEqual(blogs[blogs.length - 1].likes, 0)
  })

  test('when title or url missing: respond with 400 Bad Request', async () => {
    const newBlog = {
      author: 'Chimpi T. Chompa', likes: 13,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })
})

describe('Delete: existing Blogs', () => {
  test('a blog can be deleted', async () => {
    // const blogsAtStart = await blogs.blogsInDb()

    const newBlog = {
      title: 'Dancing in the rain', author: 'Chimpi T. Chompa', url: 'https://chimpichompa.com/',
    }

    const blogToDelete = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterCreation = await blogs.blogsInDb()
    assert.strictEqual(blogsAfterCreation.length, blogs.initialBlogs.length + 1)

    await api
      .delete(`/api/blogs/${blogToDelete.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await blogs.blogsInDb()
    const contents = blogsAtEnd.map(b => b.id)
    assert(!contents.includes(blogToDelete.id))

    assert.strictEqual(blogsAtEnd.length, blogs.initialBlogs.length)
  })
})

describe('Update: existing Blogs', () => {
  test('update the amount of likes correctly', async () => {
    const blogsAtStart = await blogs.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 38 })
      .expect(200)

    const updatedBlog = await Blog.findById(blogToUpdate.id)
    assert.strictEqual(updatedBlog.likes, 38)
  })
})

describe('Users: Create', () => {
  test('Valid user data success to create user', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ivanpo1',
      name: 'Ivan Poppino',
      password: 'Chimichurri1'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('No username fails to create user', async () => {
    const usersAtStart = await helper.usersInDb()

    const noUsername = {
      username: '',
      name: 'testing',
      password: 'Chimichurri1'
    }

    const response = await api
      .post('/api/users')
      .send(noUsername)
      .expect(400)

    assert.strictEqual(
      response.body.error,
      'Username is required'
    )

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('No password fails to create user', async () => {
    const usersAtStart = await helper.usersInDb()

    const noPassword = {
      username: 'testing ',
      name: 'testingTheTest',
      password: ''
    }

    const response = await api
      .post('/api/users')
      .send(noPassword)
      .expect(400)

    assert.strictEqual(
      response.body.error,
      'Password is required'
    )

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('Too short of username fails to create user', async () => {
    const usersAtStart = await helper.usersInDb()

    const usernameTooShort = {
      username: 'tes',
      name: 'testingTheTest',
      password: 'Testing1'
    }

    const response = await api
      .post('/api/users')
      .send(usernameTooShort)
      .expect(400)

    assert.ok(
      response.body.error.includes('is shorter than the minimum allowed length')
    )

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

  })

  test('Invalid characters fails to create user', async () => {
    const usersAtStart = await helper.usersInDb()

    const invalidCharacters = {
      username: '{"test"}',
      name: 'testingTheTest',
      password: 'Testing1'
    }

    const response = await api
      .post('/api/users')
      .send(invalidCharacters)
      .expect(400)

    assert.ok(
      response.body.error.includes('Password contains invalid characters')
    )

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

  })
})

after(async () => {
  await mongoose.connection.close()
})
