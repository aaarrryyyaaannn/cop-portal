import 'dotenv/config'
import mongoose from 'mongoose'
import User from './models/User.js'
import FIR from './models/FIR.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://devkararyan45_db_user:arya1201@copconnect.tot1a9t.mongodb.net/'

async function seed() {
  await mongoose.connect(MONGODB_URI)

  const admin = await User.findOne({ role: 'admin' })
  if (!admin) {
    await User.create({
      username: 'admin',
      email: 'admin@police.gov.in',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    })
    console.log('Created admin user: admin / admin123')
  }

  const officer = await User.findOne({ role: 'officer' })
  if (!officer) {
    await User.create({
      username: 'officer1',
      email: 'sharma@police.gov.in',
      password: 'officer123',
      name: 'Officer Sharma',
      role: 'officer',
      officerRole: 'Investigator'
    })
    console.log('Created officer: officer1 / officer123')
  }

  const citizen = await User.findOne({ role: 'citizen' })
  if (!citizen) {
    await User.create({
      username: 'citizen1',
      email: 'raj@example.com',
      password: 'citizen123',
      name: 'Raj Kumar',
      role: 'citizen'
    })
    console.log('Created citizen: citizen1 / citizen123')
  }

  const firCount = await FIR.countDocuments()
  if (firCount === 0) {
    const u = await User.findOne({ role: 'citizen' })
    const o = await User.findOne({ role: 'officer' })
    await FIR.create({
      firNumber: 'FIR-2025-001',
      complainant: { name: 'Raj Kumar', email: 'raj@example.com', phone: '9876543210', address: 'Mumbai' },
      incident: {
        date: new Date('2025-02-10'),
        time: '14:30',
        location: 'Sector 5',
        description: 'Theft of mobile phone',
        crimeType: 'Theft'
      },
      status: 'investigation',
      filedBy: u._id,
      assignedTo: o._id,
      timeline: [
        { status: 'filed', desc: 'FIR filed by complainant', date: new Date('2025-02-10') },
        { status: 'assigned', desc: 'Assigned to Officer Sharma', date: new Date('2025-02-11') },
        { status: 'investigation', desc: 'Investigation ongoing', date: new Date('2025-02-12') }
      ]
    })
    console.log('Created sample FIR')
  }

  await mongoose.disconnect()
  console.log('Seed complete')
}

seed().catch(console.error)
