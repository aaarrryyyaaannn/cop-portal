import express from 'express'
import FIR from '../models/FIR.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import mongoose from 'mongoose'

const router = express.Router()

router.get('/stats', authenticate, requireRole('admin', 'officer'), async (req, res) => {
  try {
    const [total, pending, closed] = await Promise.all([
      FIR.countDocuments(),
      FIR.countDocuments({ status: { $in: ['filed', 'assigned', 'investigation'] } }),
      FIR.countDocuments({ status: 'closed' })
    ])

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthly = await FIR.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    const byCrime = await FIR.aggregate([
      { $group: { _id: '$incident.crimeType', count: { $sum: 1 } } }
    ])

    res.json({
      total,
      pending,
      closed,
      closedRate: total ? Math.round((closed / total) * 100) : 0,
      monthly,
      byCrime
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err.stack || err.toString() })
  }
})

export default router
