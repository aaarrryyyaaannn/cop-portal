import express from 'express'
import { body, validationResult } from 'express-validator'
import FIR from '../models/FIR.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = express.Router()

function getNextFirNumber() {
  const year = new Date().getFullYear()
  return `FIR-${year}-${Date.now().toString().slice(-6)}`
}

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, crimeType, search } = req.query
    const filter = {}

    if (req.user.role === 'citizen') {
      filter.filedBy = req.user._id
    } else if (req.user.role === 'officer') {
      filter.$or = [{ filedBy: req.user._id }, { assignedTo: req.user._id }]
    }

    if (status && status !== 'all') filter['status'] = status
    if (crimeType && crimeType !== 'all') filter['incident.crimeType'] = crimeType
    if (search) {
      filter.$or = [
        { firNumber: { $regex: search, $options: 'i' } },
        { 'complainant.name': { $regex: search, $options: 'i' } }
      ]
    }

    const firs = await FIR.find(filter)
      .populate('assignedTo', 'name email')
      .populate('filedBy', 'name')
      .sort({ createdAt: -1 })

    res.json(firs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/:id', authenticate, async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.id)
      .populate('assignedTo', 'name email phone')
      .populate('filedBy', 'name')
    if (!fir) return res.status(404).json({ message: 'FIR not found' })

    const isOwner = fir.filedBy?._id?.toString() === req.user._id.toString()
    const isAssigned = fir.assignedTo?._id?.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'
    const isOfficer = req.user.role === 'officer'

    if (!isOwner && !isAssigned && !isAdmin && !isOfficer) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(fir)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/track/:firNumber', authenticate, async (req, res) => {
  try {
    const fir = await FIR.findOne({ firNumber: req.params.firNumber })
      .populate('assignedTo', 'name email phone')
      .populate('filedBy', 'name')
    if (!fir) return res.status(404).json({ message: 'FIR not found' })

    const isOwner = fir.filedBy?._id?.toString() === req.user._id.toString()
    const isAssigned = fir.assignedTo?._id?.toString() === req.user._id.toString()
    const isStaff = ['admin', 'officer'].includes(req.user.role)

    if (!isOwner && !isAssigned && !isStaff) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(fir)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', authenticate, [
  body('complainant.name').notEmpty(),
  body('complainant.phone').notEmpty(),
  body('complainant.address').notEmpty(),
  body('incident.date').notEmpty(),
  body('incident.location').notEmpty(),
  body('incident.description').notEmpty(),
  body('incident.crimeType').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { complainant, incident } = req.body
    const firNumber = getNextFirNumber()

    const fir = await FIR.create({
      firNumber,
      complainant: {
        name: complainant.name,
        email: complainant.email || '',
        phone: complainant.phone,
        address: complainant.address
      },
      incident: {
        date: incident.date,
        time: incident.time || '',
        location: incident.location,
        description: incident.description,
        crimeType: incident.crimeType
      },
      filedBy: req.user._id,
      status: 'filed',
      timeline: [{ status: 'filed', desc: 'FIR filed by complainant', date: new Date() }]
    })

    const populated = await FIR.findById(fir._id)
      .populate('assignedTo', 'name email')
      .populate('filedBy', 'name')

    res.status(201).json(populated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.patch('/:id/status', authenticate, requireRole('admin', 'officer'), async (req, res) => {
  try {
    const { status } = req.body
    if (!['filed', 'assigned', 'investigation', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const fir = await FIR.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status },
        $push: {
          timeline: {
            status,
            desc: `Status updated to ${status}`,
            date: new Date()
          }
        }
      },
      { new: true }
    ).populate('assignedTo', 'name email')

    if (!fir) return res.status(404).json({ message: 'FIR not found' })
    res.json(fir)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.patch('/:id/assign', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { officerId } = req.body
    const fir = await FIR.findByIdAndUpdate(
      req.params.id,
      {
        $set: { assignedTo: officerId, status: 'assigned' },
        $push: {
          timeline: {
            status: 'assigned',
            desc: 'Case assigned to officer',
            date: new Date()
          }
        }
      },
      { new: true }
    ).populate('assignedTo', 'name email phone')

    if (!fir) return res.status(404).json({ message: 'FIR not found' })
    res.json(fir)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
