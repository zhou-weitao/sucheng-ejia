import { Context } from 'hono'

export async function handleReferences(c: Context) {
  // In production: query D1 for user's reference images
  return c.json({ code: 'REFERENCE_NOT_FOUND' }, 404)
}

export async function handleCreateReference(c: Context) {
  const body = await c.req.json()

  // In production: upload to R2, store in D1
  const refId = 'ref_' + Math.random().toString(36).substring(2, 15)

  return c.json({
    id: refId,
    url: body.url || 'https://picsum.photos/200',
    name: body.name || 'Reference',
    createdAt: new Date().toISOString(),
  }, 201)
}

export async function handleDeleteReference(c: Context) {
  const id = c.req.param('id')

  // In production: delete from R2 and D1
  return c.json({ ok: true })
}
