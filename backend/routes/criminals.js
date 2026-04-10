import express from 'express'
import Criminal from '../models/Criminal.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, async (req, res) => {
    try {
        const criminals = await Criminal.find().sort({ createdAt: -1 })
        res.json(criminals)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

router.post('/', authenticate, requireRole('admin', 'officer'), async (req, res) => {
    try {
        const criminal = await Criminal.create(req.body)
        res.status(201).json(criminal)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router
