import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import firRoutes from './routes/firs.js'
import userRoutes from './routes/users.js'
import evidenceRoutes from './routes/evidence.js'
import reportRoutes from './routes/reports.js'
import workforceRoutes from './routes/workforce.js'
import alertRoutes from './routes/alerts.js'
import criminalRoutes from './routes/criminals.js'

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/firs', firRoutes)
app.use('/api/users', userRoutes)
app.use('/api/evidence', evidenceRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/workforce', workforceRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/criminals', criminalRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

export default app
