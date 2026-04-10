import mongoose from 'mongoose'

export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://devkararyan45_db_user:arya1201@copconnect.tot1a9t.mongodb.net/'
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    if (process.env.VERCEL) throw err
    process.exit(1)
  }
}
