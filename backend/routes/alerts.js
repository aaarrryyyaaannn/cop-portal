import express from 'express'
import Alert from '../models/Alert.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, async (req, res) => {
    try {
        const alerts = await Alert.find({
            $or: [
                { targetRoles: { $size: 0 } },
                { targetRoles: req.user.role }
            ],
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gt: new Date() } }
            ]
        }).sort({ createdAt: -1 })
        res.json(alerts)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const alert = await Alert.create({ ...req.body, createdBy: req.user._id })
        // TODO: Emit realtime notification event here
        res.status(201).json(alert)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router
