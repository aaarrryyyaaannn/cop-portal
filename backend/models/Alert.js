import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['news', 'emergency', 'event'], required: true },
    targetRoles: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date }
}, { timestamps: true })

export default mongoose.model('Alert', alertSchema)
