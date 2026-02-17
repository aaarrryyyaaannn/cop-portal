import app from '../backend/app.js'
import { connectDB } from '../backend/config/db.js'

let dbConnected = false
async function ensureDb() {
  if (!dbConnected) {
    await connectDB()
    dbConnected = true
  }
}

export default async function handler(req, res) {
  await ensureDb()
  return app(req, res)
}
