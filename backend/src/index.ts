import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import adminRoutes from './routes/admin.routes'
import storeRoutes from './routes/store.routes'
import ratingRoutes from './routes/rating.routes'
import ownerRoutes from './routes/owner.routes'

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`))
    }
  },
  credentials: true,
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/owner', ownerRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' })
})

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app
