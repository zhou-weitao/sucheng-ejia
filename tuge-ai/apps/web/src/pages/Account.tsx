import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { User, Mail, Shield, Clock } from 'lucide-react'

interface AccountProps {
  user: { id: string; username: string; email: string; role: string; status: string } | null
}

export default function Account({ user }: AccountProps) {
  if (!user) return null

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">账户设置</h1>
        <p className="text-muted-foreground">管理你的账户信息</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-xl font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid gap-4 pt-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">邮箱</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">角色</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">状态</p>
                  <p className="text-sm text-muted-foreground">{user.status}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>安全设置</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              密码修改和其他安全设置功能开发中...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
