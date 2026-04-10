import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { connectDB } from './config/db.js'
import app from './app.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

await connectDB()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

