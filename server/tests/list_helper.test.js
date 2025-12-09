const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blogs = require('../utils/list_helper')


describe('dummy test', () => {
  test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    assert.strictEqual(result, 1)
  })
})

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    __v: 0
  }
]

describe('total likes', () => {

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list has multiple blogs, equals the likes of that', () => {
    const result = listHelper.totalLikes(blogs.initialBlogs)
    assert.strictEqual(result, 36)
  })
})

describe('favorite Blog', () => {
  test('when list has only one blog, equals that blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    assert.deepStrictEqual(result, listWithOneBlog[0])
  })

  test('when list has multiple blogs, return the highest liked one', () => {
    const result = listHelper.favoriteBlog(blogs.initialBlogs)
    assert.deepStrictEqual(result, blogs.initialBlogs[2])
  })
})

describe('most Blogs', () => {
  test('returns the author with most blog posts', () => {
    const result = listHelper.mostBlogs(blogs.initialBlogs)
    console.log('mostBlogs', result)
    assert.deepStrictEqual(result, {
      author: "Robert C. Martin",
      blogs: 3
    })
  })
})

describe('most Blogs LODASH edition', () => {
  test('returns the author with most blog posts', () => {
    const result = listHelper.mostBlogsLodash(blogs.initialBlogs)
    assert.deepStrictEqual(result, {
      author: "Robert C. Martin",
      blogs: 3
    })
  })
})

describe('most likes', () => {
  test('returns the author with most likes', () => {
    const result = listHelper.mostLikes(blogs.initialBlogs)
    assert.deepStrictEqual(result, {
      author: "Edsger W. Dijkstra",
      likes: 12
    })
  })
})