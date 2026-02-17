import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import firRoutes from './routes/firs.js'
import userRoutes from './routes/users.js'
import evidenceRoutes from './routes/evidence.js'
import reportRoutes from './routes/reports.js'

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/firs', firRoutes)
app.use('/api/users', userRoutes)
app.use('/api/evidence', evidenceRoutes)
app.use('/api/reports', reportRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

export default app
