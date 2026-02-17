import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d'

function generateToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  )
}

router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, password } = req.body
    const user = await User.findOne({ $or: [{ username }, { email: username }] })
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }

    const valid = await user.comparePassword(password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }

    if (user.status !== 'Active') {
      return res.status(401).json({ message: 'Account is inactive' })
    }

    const token = generateToken(user)
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        officerRole: user.officerRole
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/register', [
  body('username').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').isIn(['admin', 'officer', 'citizen'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password, name, role, officerRole } = req.body
    if (await User.findOne({ $or: [{ username }, { email }] })) {
      return res.status(400).json({ message: 'Username or email already exists' })
    }

    const user = await User.create({
      username,
      email,
      password,
      name,
      role,
      officerRole: role === 'officer' ? officerRole || 'Clerk' : null
    })

    const token = generateToken(user)
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

router.post('/refresh', authenticate, (req, res) => {
  const token = generateToken(req.user)
  res.json({ token })
})

export default router
