import express from 'express'
import Task from '../models/Task.js'
import User from '../models/User.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const officers = await User.find({ role: 'officer' }).select('-password')
        const tasks = await Task.find({ status: { $ne: 'completed' } })

        const workforce = officers.map(off => {
            const activeTasks = tasks.filter(t => t.assignedTo.toString() === off._id.toString())
            return { ...off.toObject(), taskCount: activeTasks.length }
        })

        res.json(workforce)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.toString() })
    }
})

router.get('/tasks', authenticate, async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id }
        const tasks = await Task.find(filter)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
        res.json(tasks)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

router.post('/tasks', authenticate, requireRole('admin'), async (req, res) => {
    try {
        if (!req.body.assignedTo) {
            return res.status(400).json({ message: 'assignedTo is required' })
        }
        const task = await Task.create({ ...req.body, createdBy: req.user._id })
        res.status(201).json(task)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
})

router.put('/tasks/:id', authenticate, async (req, res) => {
    try {
        const { status } = req.body
        const task = await Task.findById(req.params.id)
        if (!task) return res.status(404).json({ message: 'Task not found' })
        if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' })
        }
        task.status = status
        await task.save()
        res.json(task)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

export default router
