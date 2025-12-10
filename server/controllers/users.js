const User = require("../models/user")
const bcrypt = require("bcrypt")
const usersRouter = require("express").Router()

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body

  if (!password) {
    return response.status(400).json({ error: "Password is required" })
  }

  if (!username) {
    return response.status(400).json({ error: "Username is required" })
  }

  if (password.length < 8) {
    return response
      .status(400)
      .json({ error: "Password must be at least 8 characters long" })
  }

  if (!/[A-Z]/.test(password)) {
    return response
      .status(400)
      .json({ error: "Password must contain at least one uppercase letter" })
  }

  if (!/[0-9]/.test(password)) {
    return response
      .status(400)
      .json({ error: "Password must contain at least one number" })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    url: 1,
    title: 1,
    author: 1,
  })

  response.json(users)
})

usersRouter.get("/:id", async (request, response) => {
  const user = await User.findById(request.params.id).populate("blogs", {
    url: 1,
    title: 1,
    author: 1,
  })

  response.json(user)
})

module.exports = usersRouter
