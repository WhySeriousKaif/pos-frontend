import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logoutUser } from '@/store/slices/authSlice'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { 
  ShoppingCart, 
  Clock, 
  RefreshCw, 
  Users, 
  Wallet, 
  X, 
  LogOut,
  ArrowRight,
  Settings
} from 'lucide-react'
import { userAPI, branchAPI } from '@/services/api'
import { cn } from '@/lib/utils'

const PosSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [userInfo, setUserInfo] = useState(null)
  const [branchInfo, setBranchInfo] = useState(null)
  const [showBranchInfo, setShowBranchInfo] = useState(false) // Toggle between user and branch info
  const [loading, setLoading] = useState(false)

  // Fetch user info on mount (default)
  useEffect(() => {
    fetchUserInfo()
    // Check if branch info should be shown (from localStorage)
    const shouldShowBranch = localStorage.getItem('cashierShowBranchInfo') === 'true'
    setShowBranchInfo(shouldShowBranch)
    if (shouldShowBranch) {
      fetchBranchInfo()
    }
  }, [])

  // Refetch when sidebar opens (in case it was updated while closed)
  useEffect(() => {
    if (isOpen) {
      fetchUserInfo()
      if (showBranchInfo) {
        fetchBranchInfo()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, showBranchInfo])

  // Listen for branch info updates from settings page
  useEffect(() => {
    const handleBranchInfoUpdate = () => {
      fetchBranchInfo()
      setShowBranchInfo(true)
      localStorage.setItem('cashierShowBranchInfo', 'true')
    }
    
    window.addEventListener('branchInfoUpdated', handleBranchInfoUpdate)
    
    return () => {
      window.removeEventListener('branchInfoUpdated', handleBranchInfoUpdate)
    }
  }, [])

  const fetchUserInfo = async () => {
    try {
      const userProfile = await userAPI.getProfile()
      setUserInfo(userProfile)
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const fetchBranchInfo = async () => {
    try {
      setLoading(true)
      // Try to get user profile first to get branch ID
      const userProfile = await userAPI.getProfile()
      
      if (userProfile?.branchId) {
        // Fetch branch details using branchId
        const branch = await branchAPI.getById(userProfile.branchId)
        setBranchInfo(branch)
      } else {
        // Fallback: Use default branch ID 1 for testing
        try {
          const branch = await branchAPI.getById(1)
          setBranchInfo(branch)
        } catch (err) {
          // If branch fetch fails, use fallback data
          setBranchInfo({
            name: 'Branch',
            address: 'Address not available'
          })
        }
      }
    } catch (error) {
      console.error('Error fetching branch info:', error)
      // Set fallback branch info for testing
      setBranchInfo({
        name: 'Branch',
        address: 'Address not available'
      })
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    {
      id: 'order-history',
      label: 'Order History',
      icon: Clock,
      path: '/cashier/orders',
    },
    {
      id: 'returns-refunds',
      label: 'Returns/Refunds',
      icon: RefreshCw,
      path: '/cashier/returns',
    },
    {
      id: 'pos-terminal',
      label: 'POS Terminal',
      icon: ShoppingCart,
      path: '/cashier',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      path: '/cashier/customers',
    },
    {
      id: 'shift-summary',
      label: 'Shift Summary',
      icon: Wallet,
      path: '/cashier/shift-summary',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/cashier/settings',
    },
  ]

  const handleNavigate = (path) => {
    navigate(path)
    onClose()
  }

  const handleEndShift = async () => {
    try {
      // Dispatch logout action to clear Redux state
      await dispatch(logoutUser())
      // Navigate to login
      navigate('/auth/login')
    } catch (error) {
      console.error('Error during logout:', error)
      // Navigate anyway
      navigate('/auth/login')
    }
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col bg-card border-r">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">POS System</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
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
          {/* User Info or Branch Info Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {showBranchInfo ? 'Branch Info' : 'Cashier Info'}
            </h3>
            {showBranchInfo ? (
              loading ? (
              <p className="text-xs text-muted-foreground">Loading...</p>
            ) : branchInfo ? (
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
              <p className="text-xs text-muted-foreground">No branch info available</p>
              )
            ) : (
              userInfo ? (
                <div className="space-y-1 text-xs">
                  <p className="font-medium">
                    <span className="text-muted-foreground">Name:</span>{' '}
                    {userInfo.fullName || userInfo.name || 'N/A'}
                  </p>
                  <p className="text-muted-foreground line-clamp-2">
                    <span className="font-medium">Email:</span>{' '}
                    {userInfo.email || 'N/A'}
                  </p>
                  {userInfo.phone && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Phone:</span>{' '}
                      {userInfo.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Loading...</p>
              )
            )}
          </div>

          {/* End Shift Button */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-11 border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
            onClick={handleEndShift}
          >
            <ArrowRight className="size-5" />
            <span className="text-sm font-medium">End Shift & Logout</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default PosSidebar

