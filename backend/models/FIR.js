import mongoose from 'mongoose'

const firSchema = new mongoose.Schema({
  firNumber: { type: String, unique: true, required: true },
  complainant: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  incident: {
    date: { type: Date, required: true },
    time: { type: String },
    location: { type: String, required: true },
    description: { type: String, required: true },
    crimeType: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['filed', 'assigned', 'investigation', 'closed'],
    default: 'filed'
  },
  filedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  evidence: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }],
  timeline: [{
    status: String,
    desc: String,
    date: { type: Date, default: Date.now }
  }],
  syncStatus: { type: String, enum: ['synced', 'pending'], default: 'synced' }
}, { timestamps: true })

export default mongoose.model('FIR', firSchema)
