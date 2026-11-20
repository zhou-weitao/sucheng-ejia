import { Link, useLocation, Outlet } from 'react-router-dom'
import { LayoutDashboard, ImageIcon, Settings, LogOut, User, CreditCard } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  user: { id: string; email: string; username: string; role: string } | null
  setUser: (user: null) => void
}

const navItems = [
  { href: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/tasks', label: '任务', icon: ImageIcon },
  { href: '/image-studio', label: '图片工作室', icon: ImageIcon },
  { href: '/account', label: '账户', icon: User },
]

export default function DashboardLayout({ user, setUser }: DashboardLayoutProps) {
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (error) {
      console.error('Logout failed:', error)
    }
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            <span className="font-semibold">图格AI</span>
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-64 border-t p-4">
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted p-3">
            <User className="h-8 w-8 rounded-full bg-muted-foreground/20" />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.username}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
