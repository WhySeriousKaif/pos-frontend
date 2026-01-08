import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Store,
  FileText,
  Clock,
  Download,
  Settings,
  Menu,
  X,
  LogOut,
  Search,
  Bell,
  User,
  ShoppingCart,
  Sun,
  Moon,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '@/store/slices/authSlice'
import { userAPI } from '@/services/api'
import { useTheme } from '@/contexts/ThemeContext'

const SuperAdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { darkMode, toggleTheme } = useTheme()

  React.useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const profile = await userAPI.getProfile()
      setCurrentUser(profile)
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/super-admin',
    },
    {
      id: 'stores',
      label: 'Stores',
      icon: Store,
      path: '/super-admin/stores',
    },
    {
      id: 'subscription-plans',
      label: 'Subscription Plans',
      icon: FileText,
      path: '/super-admin/subscription-plans',
    },
    {
      id: 'pending-requests',
      label: 'Pending Requests',
      icon: Clock,
      path: '/super-admin/pending-requests',
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: ShoppingCart,
      path: '/super-admin/sales',
    },
    {
      id: 'exports',
      label: 'Exports',
      icon: Download,
      path: '/super-admin/exports',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/super-admin/settings',
    },
  ]

  const handleNavigate = (path) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/auth/login')
  }

  const isActive = (path) => {
    if (path === '/super-admin' || path === '/super-admin/') {
      return location.pathname === '/super-admin' || location.pathname === '/super-admin/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b bg-card flex items-center justify-between px-4 sm:px-6 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <h1 className="text-xl font-bold">Super Admin Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 border rounded-md px-3 py-1.5 bg-background">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stores, users..."
              className="outline-none bg-transparent text-sm w-48 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          <div className="flex items-center gap-2">
            <User className="size-4" />
            <div className="hidden sm:block text-sm">
              <div className="font-medium text-foreground">{currentUser?.fullName || user?.fullName || 'Admin'}</div>
              <div className="text-xs text-muted-foreground">
                {currentUser?.email || user?.email || 'admin@pos.com'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Store className="size-6 text-primary" />
              <span className="text-lg font-bold">Super Admin</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="size-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
          <div className="p-4 border-t">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Store className="size-6 text-primary" />
                <span>Super Admin</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      active
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
            <div className="p-4 border-t">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  )
}

export default SuperAdminLayout

