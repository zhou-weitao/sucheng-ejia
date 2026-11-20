import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface TurnstileConfig {
  siteKey: string
  canonicalOrigin: string
}

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileReady, setTurnstileReady] = useState(false)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    loadTurnstile()
  }, [])

  const loadTurnstile = async () => {
    try {
      const configRes = await fetch('/api/auth/turnstile-config')
      const config: TurnstileConfig = await configRes.json()

      if (!config.siteKey) {
        setError('无法加载验证服务')
        return
      }

      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      script.onload = () => {
        if (window.turnstile && turnstileRef.current) {
          widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
            sitekey: config.siteKey,
            callback: (token: string) => {
              setTurnstileToken(token)
              setError('')
            },
            'error-callback': () => {
              setTurnstileToken(null)
              setError('验证失败，请重试')
            },
            'expired-callback': () => {
              setTurnstileToken(null)
            },
          })
          setTurnstileReady(true)
        }
      }
    } catch (err) {
      setError('无法加载验证组件')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!turnstileToken) {
      setError('请完成人机验证')
      return
    }

    if (!legalAccepted) {
      setError('请接受服务条款')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          email,
          password,
          inviteCode,
          legalAccepted,
          turnstileToken,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || '注册失败')
      }

      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">注册</CardTitle>
          <CardDescription>创建新账号</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteCode">邀请码</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="legal"
                checked={legalAccepted}
                onCheckedChange={(checked) => setLegalAccepted(checked === true)}
              />
              <Label htmlFor="legal" className="text-sm">
                我已阅读并同意服务条款和隐私政策
              </Label>
            </div>

            <div ref={turnstileRef} className="flex justify-center" />

            <Button type="submit" className="w-full" disabled={loading || !turnstileReady}>
              {loading ? '注册中...' : '注册'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            已有账号？{' '}
            <Link to="/login" className="text-primary hover:underline">
              登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: object) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}
