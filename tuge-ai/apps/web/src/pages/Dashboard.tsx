import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageIcon, CreditCard, Clock, CheckCircle } from 'lucide-react'

interface DashboardProps {
  user: { id: string; username: string; email: string } | null
}

interface CreditsInfo {
  account: {
    userId: string
    balanceInteger: number
  }
  pricing: Array<{
    businessTier: string
    resolution: string
    priceInteger: number
  }>
}

interface TaskSummary {
  total: number
  succeeded: number
  generating: number
  other: number
  today: number
  yesterday: number
}

export default function Dashboard({ user }: DashboardProps) {
  const [credits, setCredits] = useState<CreditsInfo | null>(null)
  const [tasks, setTasks] = useState<TaskSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [creditsRes, tasksRes] = await Promise.all([
        fetch('/api/credits/balance', { credentials: 'include' }),
        fetch('/api/tasks?scope=active', { credentials: 'include' }),
      ])

      if (creditsRes.ok) {
        setCredits(await creditsRes.json())
      }
      if (tasksRes.ok) {
        setTasks(await tasksRes.json())
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">欢迎回来，{user?.username}</h1>
        <p className="text-muted-foreground">这里是你的工作台概览</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">积分余额</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits?.account.balanceInteger ?? 0}</div>
            <p className="text-xs text-muted-foreground">可用积分</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总任务数</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">全部生成任务</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日完成</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks?.succeeded ?? 0}</div>
            <p className="text-xs text-muted-foreground">成功生成</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生成中</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks?.generating ?? 0}</div>
            <p className="text-xs text-muted-foreground">正在处理</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">快速开始</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>图片工作室</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                上传参考图，输入提示词，让AI为你生成独特的图片
              </p>
              <a
                href="/image-studio"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                前往图片工作室
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>任务历史</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                查看你所有的生成任务，下载已完成的图片
              </p>
              <a
                href="/tasks"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                查看任务
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
