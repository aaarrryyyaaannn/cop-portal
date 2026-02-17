import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['officer', 'admin'] } }).select('-password')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', authenticate, requireRole('admin'), [
  body('username').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').isIn(['admin', 'officer']),
  body('officerRole').optional().isIn(['Investigator', 'Supervisor', 'Clerk'])
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

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
      officerRole: role === 'officer' ? (officerRole || 'Clerk') : null
    })

    res.status(201).json(user.toJSON())
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.patch('/:id/reset-password', authenticate, requireRole('admin'), [
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.password = req.body.newPassword
    await user.save()
    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'User removed' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
