import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handleTurnstileConfig, handleLegalConfig, handleRegister, handleLogin, handleLogout } from './routes/auth'
import { handleAccount } from './routes/account'
import { handleCreditsBalance } from './routes/credits'
import { handleTasks, handleCreateTask, handleTaskStatus } from './routes/tasks'
import { handleImageGenerate } from './routes/image'
import { handleReferences, handleCreateReference, handleDeleteReference } from './routes/references'

const app = new Hono()

// CORS
app.use('/*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))

// Health check
app.get('/health', (c) => c.json({ ok: true }))

// Auth routes
app.get('/api/auth/turnstile-config', handleTurnstileConfig)
app.get('/api/auth/legal-config', handleLegalConfig)
app.post('/api/auth/register', handleRegister)
app.post('/api/auth/login', handleLogin)
app.post('/api/auth/logout', handleLogout)

// Account
app.get('/api/account', handleAccount)

// Credits
app.get('/api/credits/balance', handleCreditsBalance)

// Tasks
app.get('/api/tasks', handleTasks)
app.post('/api/tasks', handleCreateTask)
app.get('/api/tasks/:id', handleTaskStatus)

// Image Generate
app.get('/api/image-generate', handleImageGenerate)

// References
app.get('/api/references/', handleReferences)
app.post('/api/references/', handleCreateReference)
app.delete('/api/references/:id', handleDeleteReference)

export default app
