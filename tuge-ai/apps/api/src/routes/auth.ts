import { Context } from 'hono'

// Turnstile config - in production, these would be environment variables
const TURNSTILE_SITE_KEY = '0x4AAAAAAEiW2lUKcb74SjVQ'
const TURNSTILE_SECRET_KEY = 'your-turnstile-secret-key'
const CANONICAL_ORIGIN = 'https://tuge-ai.example.com'

export async function handleTurnstileConfig(c: Context) {
  return c.json({
    siteKey: TURNSTILE_SITE_KEY,
    canonicalOrigin: CANONICAL_ORIGIN,
  })
}

export async function handleLegalConfig(c: Context) {
  return c.json({
    legalVersion: 'internal-beta-v1',
    termsUrl: `${CANONICAL_ORIGIN}/legal/internal-beta-v1/terms`,
    privacyUrl: `${CANONICAL_ORIGIN}/legal/internal-beta-v1/privacy`,
    termsDocumentId: 'terms-v1',
    privacyDocumentId: 'privacy-v1',
  })
}

export async function handleRegister(c: Context) {
  const body = await c.req.json()
  const { username, email, password, inviteCode, legalAccepted, turnstileToken } = body

  // Validate required fields
  if (!username || !email || !password || !inviteCode) {
    return c.json({ message: '缺少必填字段' }, 400)
  }

  // In production: verify turnstile token
  // In production: verify invite code
  // In production: hash password and store in D1

  // Generate user ID
  const userId = generateId()

  return c.json({
    user: {
      id: userId,
      email,
      username,
      role: 'USER',
      status: 'ACTIVE',
    }
  }, 201)
}

export async function handleLogin(c: Context) {
  const body = await c.req.json()
  const { email, password } = body

  if (!email || !password) {
    return c.json({ message: '缺少邮箱或密码' }, 400)
  }

  // In production: verify credentials against D1 database
  // For demo, accept any login
  const userId = generateId()

  // Set session cookie
  const sessionToken = generateSessionToken()
  c.header('Set-Cookie', `__Secure-better-auth.session_token=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax`)

  return c.json({
    user: {
      id: userId,
      email,
      username: email.split('@')[0],
      role: 'USER',
      status: 'ACTIVE',
    }
  })
}

export async function handleLogout(c: Context) {
  c.header('Set-Cookie', '__Secure-better-auth.session_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
  return c.json({ ok: true })
}

function generateId(): string {
  return 'id_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + '.' + Math.random().toString(36).substring(2)
}
