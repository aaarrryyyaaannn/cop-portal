import mongoose from 'mongoose'

const evidenceSchema = new mongoose.Schema({
  firId: { type: mongoose.Schema.Types.ObjectId, ref: 'FIR', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['image', 'document', 'video'], required: true },
  path: { type: String, required: true },
  size: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accessLog: [{ userId: mongoose.Schema.Types.ObjectId, accessedAt: Date }]
}, { timestamps: true })

export default mongoose.model('Evidence', evidenceSchema)
