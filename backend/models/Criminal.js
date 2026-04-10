import mongoose from 'mongoose'

const criminalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    aliases: [{ type: String }],
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    lastKnownLocation: { type: String },
    crimesCommitted: [{ type: String }],
    status: { type: String, enum: ['at_large', 'arrested', 'deceased'], default: 'at_large' },
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
}, { timestamps: true })

export default mongoose.model('Criminal', criminalSchema)
