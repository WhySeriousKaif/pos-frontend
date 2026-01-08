import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Store,
  Building2,
  Package,
  Tag,
  Users,
  Bell,
  ShoppingCart,
  CreditCard,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  TrendingUp,
  Sun,
  Moon,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '@/store/slices/authSlice'
import { storeAPI, userAPI } from '@/services/api'
import { useTheme } from '@/contexts/ThemeContext'

const StoreAdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [storeInfo, setStoreInfo] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { darkMode, toggleTheme } = useTheme()

  React.useEffect(() => {
    fetchStoreInfo()
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

  const fetchStoreInfo = async () => {
    try {
      const stores = await storeAPI.getByAdmin()
      if (stores && stores.length > 0) {
        setStoreInfo(stores[0])
      }
    } catch (error) {
      console.error('Error fetching store info:', error)
      setStoreInfo({
        name: 'Store',
        brand: 'Brand',
      })
    }
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/store',
    },
    {
      id: 'stores',
      label: 'Stores',
      icon: Store,
      path: '/store/stores',
    },
    {
      id: 'branches',
      label: 'Branches',
      icon: Building2,
      path: '/store/branches',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      path: '/store/products',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Tag,
      path: '/store/categories',
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      path: '/store/employees',
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      path: '/store/alerts',
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: TrendingUp,
      path: '/store/sales',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      path: '/store/transactions',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      path: '/store/reports',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/store/settings',
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
    // Exact match for dashboard
    if (path === '/store' || path === '/store/') {
      return location.pathname === '/store' || location.pathname === '/store/'
    }
    // For other paths, check if current path starts with the menu path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="h-14 sm:h-16 bg-card border-b border-border sticky top-0 z-10 px-2 sm:px-4 py-2 shrink-0">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-full">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <Store className="size-5 text-primary" />
            <h1 className="text-lg sm:text-xl font-bold text-foreground">POS Admin</h1>
          </div>
          
          <div className="flex-1 max-w-md mx-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleTheme}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="size-5" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="flex items-center gap-2 px-2">
              <Users className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium hidden sm:inline text-foreground">
                {currentUser?.fullName || currentUser?.name || 'Store Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col bg-card border-r">
            <SheetHeader className="p-4 pb-2">
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </SheetHeader>

            <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Button
                    key={item.id}
                    variant={active ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 h-11 text-foreground',
                      active && 'bg-accent text-accent-foreground',
                      !active && 'hover:bg-muted text-foreground'
                    )}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <Icon className="size-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                )
              })}
            </nav>

            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11 border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="size-5" />
                <span className="text-sm font-medium">Logout</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col w-64 bg-card border-r">
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Button
                  key={item.id}
                  variant={active ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-11 text-foreground',
                    active && 'bg-accent text-accent-foreground',
                    !active && 'hover:bg-muted text-foreground'
                  )}
                  onClick={() => handleNavigate(item.path)}
                >
                  <Icon className="size-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-11 border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="size-5" />
              <span className="text-sm font-medium">Logout</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-background">{children}</div>
      </div>
    </div>
  )
}

export default StoreAdminLayout

