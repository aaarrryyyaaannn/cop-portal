import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import Evidence from '../models/Evidence.js'
import FIR from '../models/FIR.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = express.Router()

const storage = process.env.VERCEL ? multer.memoryStorage() : multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads')
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + (path.extname(file.originalname) || '.bin'))
  }
})

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

router.get('/', authenticate, async (req, res) => {
  try {
    const { firId } = req.query
    const filter = {}
    if (firId) filter.firId = firId

    if (req.user.role === 'citizen') {
      const firs = await FIR.find({ filedBy: req.user._id }).select('_id')
      filter.firId = { $in: firs.map(f => f._id) }
    }

    const evidence = await Evidence.find(filter).populate('firId', 'firNumber')
    res.json(evidence)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const { firId } = req.body
    if (!firId) return res.status(400).json({ message: 'firId required' })

    const fir = await FIR.findById(firId)
    if (!fir) return res.status(404).json({ message: 'FIR not found' })

    const canAccess = fir.filedBy.toString() === req.user._id.toString() ||
      fir.assignedTo?.toString() === req.user._id.toString() ||
      req.user.role === 'admin' || req.user.role === 'officer'
    if (!canAccess) return res.status(403).json({ message: 'Access denied' })

    const type = req.file.mimetype.startsWith('image') ? 'image' : req.file.mimetype.startsWith('video') ? 'video' : 'document'
    const filePath = req.file.path || `serverless/${Date.now()}-${req.file.originalname}`
    const evidence = await Evidence.create({
      firId,
      name: req.file.originalname,
      type,
      path: filePath,
      size: req.file.size,
      uploadedBy: req.user._id
    })

    await FIR.findByIdAndUpdate(firId, { $push: { evidence: evidence._id } })
    res.status(201).json(evidence)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
