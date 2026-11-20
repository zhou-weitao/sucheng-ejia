import { Context } from 'hono'

export async function handleAccount(c: Context) {
  // In production: get user from session, query D1
  // For demo, return mock data
  const mockUser = {
    id: 'ncCKTpxseIl78d2MnpheLGnEOFoFvBDC',
    email: 'weitaozhou058@gmail.com',
    username: '18013146951',
    usernameOriginal: '18013146951',
    role: 'USER',
    status: 'ACTIVE'
  }

  return c.json({ user: mockUser })
}
