import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageIcon, RefreshCw, Download, X } from 'lucide-react'

interface Task {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED'
  businessTier: string
  resolution: string
  aspectRatio: string
  prompt: string
  resultUrl?: string
  error?: string
  createdAt: string
  completedAt?: string
}

interface TasksResponse {
  tasks: Task[]
  summary: {
    total: number
    succeeded: number
    generating: number
    other: number
    today: number
    yesterday: number
  }
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [summary, setSummary] = useState<TaskSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const scope = filter === 'active' ? 'active' : filter === 'completed' ? 'completed' : 'all'
      const response = await fetch(`/api/tasks?scope=${scope}`, { credentials: 'include' })
      if (response.ok) {
        const data: TasksResponse = await response.json()
        setTasks(data.tasks || [])
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">成功</span>
      case 'PROCESSING':
        return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">处理中</span>
      case 'FAILED':
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">失败</span>
      default:
        return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">等待中</span>
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">任务</h1>
          <p className="text-muted-foreground">管理你的图片生成任务</p>
        </div>
        <Button onClick={fetchTasks} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">今日完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.today ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">昨日完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.yesterday ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">成功</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.succeeded ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          全部
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          进行中
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          已完成
        </Button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
          <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">暂无任务</p>
          <a href="/image-studio" className="mt-4 text-primary hover:underline">
            前往图片工作室
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {task.resultUrl ? (
                    <img
                      src={task.resultUrl}
                      alt="Generated"
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {getStatusBadge(task.status)}
                      <span className="text-sm text-muted-foreground">
                        {task.businessTier} • {task.resolution} • {task.aspectRatio}
                      </span>
                    </div>
                    <p className="mb-2 text-sm">{task.prompt}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(task.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  {task.status === 'SUCCEEDED' && task.resultUrl && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="mr-1 h-4 w-4" />
                        下载
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

interface TaskSummary {
  total: number
  succeeded: number
  generating: number
  other: number
  today: number
  yesterday: number
}
