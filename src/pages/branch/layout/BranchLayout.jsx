import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  ShoppingCart,
  RefreshCw,
  CreditCard,
  Package,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Building2,
  Sun,
  Moon,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useDispatch } from 'react-redux'
import { logoutUser } from '@/store/slices/authSlice'
import { branchAPI, userAPI } from '@/services/api'
import { useTheme } from '@/contexts/ThemeContext'

const BranchLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [branchInfo, setBranchInfo] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { darkMode, toggleTheme } = useTheme()

  React.useEffect(() => {
    fetchBranchInfo()
    fetchCurrentUser()
  }, [])

  // Listen for branch info updates from settings page
  React.useEffect(() => {
    const handleBranchInfoUpdate = () => {
      fetchBranchInfo()
    }
    
    window.addEventListener('branchInfoUpdated', handleBranchInfoUpdate)
    
    return () => {
      window.removeEventListener('branchInfoUpdated', handleBranchInfoUpdate)
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const profile = await userAPI.getProfile()
      setCurrentUser(profile)
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchBranchInfo = async () => {
    try {
      const userProfile = await userAPI.getProfile()
      if (userProfile?.branchId) {
        const branch = await branchAPI.getById(userProfile.branchId)
        setBranchInfo(branch)
      } else {
        // No branch assigned - show placeholder
        console.warn('Branch ID not found in user profile')
        setBranchInfo({
          name: 'Branch Not Assigned',
          address: 'Please contact store admin to assign you to a branch',
        })
      }
    } catch (error) {
      console.error('Error fetching branch info:', error)
      // Only show error if it's not a 404 (branch doesn't exist)
      if (error.message && !error.message.includes('404')) {
        setBranchInfo({
          name: 'Error Loading Branch',
          address: 'Failed to load branch information',
        })
      } else {
        setBranchInfo({
          name: 'Branch Not Found',
          address: 'Please contact store admin to assign you to a branch',
        })
      }
    }
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/branch',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      path: '/branch/orders',
    },
    {
      id: 'refunds',
      label: 'Refunds',
      icon: RefreshCw,
      path: '/branch/refunds',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      path: '/branch/transactions',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      path: '/branch/inventory',
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      path: '/branch/employees',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      path: '/branch/customers',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      path: '/branch/reports',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/branch/settings',
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
    return location.pathname === path
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="h-14 sm:h-16 bg-card border-b border-border sticky top-0 z-10 px-2 sm:px-4 py-2 shrink-0">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-full">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
              {currentUser?.fullName || currentUser?.name || 'Branch Manager'}
            </h1>
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col bg-card border-r">
            <SheetHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="size-5" />
                  Branch Manager
                </SheetTitle>
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

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Button
                    key={item.id}
                    variant={active ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 h-11',
                      active && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <Icon className="size-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                )
              })}
            </nav>

            <div className="p-4 border-t space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Branch Info
                </h3>
                {branchInfo ? (
                  <div className="space-y-1 text-xs">
                    <p className="font-medium">
                      <span className="text-muted-foreground">Name:</span>{' '}
                      {branchInfo.name || 'N/A'}
                    </p>
                    <p className="text-muted-foreground line-clamp-2">
                      <span className="font-medium">Address:</span>{' '}
                      {branchInfo.address || 'N/A'}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Loading...</p>
                )}
              </div>

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

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-background">{children}</div>
      </div>
    </div>
  )
}

export default BranchLayout

