import { Context } from 'hono'

export async function handleTasks(c: Context) {
  const query = c.req.query()
  const scope = query.scope || 'all'

  // In production: query D1 for user's tasks
  // For demo, return empty
  return c.json({
    ownerUserId: 'ncCKTpxseIl78d2MnpheLGnEOFoFvBDC',
    tasks: [],
    summary: {
      total: 0,
      succeeded: 0,
      generating: 0,
      other: 0,
      today: 0,
      yesterday: 0,
    },
  })
}

export async function handleCreateTask(c: Context) {
  const body = await c.req.json()
  const { prompt, businessTier, resolution, aspectRatio, referenceImageIds } = body

  if (!prompt) {
    return c.json({ message: '缺少提示词' }, 400)
  }

  // In production: create task in D1, queue for processing
  const taskId = 'task_' + Math.random().toString(36).substring(2, 15)

  return c.json({
    id: taskId,
    userId: 'ncCKTpxseIl78d2MnpheLGnEOFoFvBDC',
    status: 'PENDING',
    businessTier: businessTier || 'normal',
    resolution: resolution || '1K',
    aspectRatio: aspectRatio || '1:1',
    prompt,
    createdAt: new Date().toISOString(),
  }, 201)
}

export async function handleTaskStatus(c: Context) {
  const id = c.req.param('id')

  // In production: query D1 for task status
  return c.json({
    id,
    status: 'PENDING',
  })
}
