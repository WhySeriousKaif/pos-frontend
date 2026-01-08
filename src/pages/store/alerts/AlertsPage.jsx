import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { RefreshCw, User, MapPin, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { 
  userAPI, 
  productAPI, 
  branchAPI, 
  orderAPI, 
  refundAPI, 
  storeAPI 
} from '@/services/api'

const AlertsPage = () => {
  const [inactiveCashiers, setInactiveCashiers] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [noSaleBranches, setNoSaleBranches] = useState([])
  const [refundSpikes, setRefundSpikes] = useState([])
  const [loading, setLoading] = useState(true)
  const [storeId, setStoreId] = useState(null)

  useEffect(() => {
    fetchStoreId()
  }, [])

  useEffect(() => {
    if (storeId) {
      fetchAlerts()
    }
  }, [storeId])

  const fetchStoreId = async () => {
    try {
      const profile = await userAPI.getProfile()
      if (profile?.storeId) {
        setStoreId(profile.storeId)
      } else {
        const stores = await storeAPI.getByAdmin()
        if (stores && stores.length > 0) {
          setStoreId(stores[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching store ID:', error)
    }
  }

  const fetchAlerts = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [allUsers, allProducts, allBranches, allRefunds] = await Promise.all([
        userAPI.getAll().catch(() => []),
        productAPI.getByStoreId(storeId).catch(() => []),
        branchAPI.getByStoreId(storeId).catch(() => []),
        // Get refunds from all branches
        Promise.all(
          (await branchAPI.getByStoreId(storeId).catch(() => [])).map(branch =>
            refundAPI.getByBranch(branch.id).catch(() => [])
          )
        ).then(results => results.flat()).catch(() => []),
      ])

      // Filter store employees
      const storeUsers = allUsers.filter(user => 
        user.storeId === storeId || user.store?.id === storeId
      )

      // 1. Inactive Cashiers - Cashiers who haven't logged in for 7+ days or never logged in
      const cashierRoles = ['ROLE_BRANCH_CASHIER', 'ROLE_CASHIER']
      const cashiers = storeUsers.filter(user => 
        cashierRoles.includes(user.role)
      )
      
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const inactive = cashiers
        .filter(cashier => {
          if (!cashier.lastLoginAt) return true // Never logged in
          const lastLogin = new Date(cashier.lastLoginAt)
          return lastLogin < sevenDaysAgo
        })
        .map(cashier => ({
          id: cashier.id,
          fullName: cashier.fullName || 'N/A',
          email: cashier.email || '',
          branchName: cashier.branch?.name || 'N/A',
          lastLogin: cashier.lastLoginAt ? format(new Date(cashier.lastLoginAt), 'MMM d, yyyy, hh:mm a') : 'Never',
          lastLoginDate: cashier.lastLoginAt ? new Date(cashier.lastLoginAt) : null,
        }))
        .sort((a, b) => {
          // Sort by last login date (null/never first, then oldest first)
          if (!a.lastLoginDate && !b.lastLoginDate) return 0
          if (!a.lastLoginDate) return -1
          if (!b.lastLoginDate) return 1
          return a.lastLoginDate - b.lastLoginDate
        })
        .slice(0, 10) // Limit to top 10

      setInactiveCashiers(inactive)

      // 2. Low Stock Products - Products with quantity < 10
      const lowStock = allProducts
        .filter(product => (product.quantity || 0) < 10)
        .map(product => ({
          id: product.id,
          name: product.name || 'N/A',
          image: product.image || product.imageUrl || '',
          category: product.category?.name || 'Uncategorized',
          price: product.sellingPrice || product.price || product.mrp || 0,
          quantity: product.quantity || 0,
        }))
        .sort((a, b) => a.quantity - b.quantity) // Sort by quantity (lowest first)
        .slice(0, 10) // Limit to top 10

      setLowStockProducts(lowStock)

      // 3. No Sale Today - Branches with no orders today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const branchesWithNoSales = []
      
      for (const branch of allBranches) {
        try {
          const todayOrders = await orderAPI.getTodayByBranch(branch.id).catch(() => [])
          if (!todayOrders || todayOrders.length === 0) {
            branchesWithNoSales.push({
              id: branch.id,
              name: branch.name || 'N/A',
              address: branch.address || 'N/A',
            })
          }
        } catch (error) {
          // If we can't fetch orders, assume no sales
          branchesWithNoSales.push({
            id: branch.id,
            name: branch.name || 'N/A',
            address: branch.address || 'N/A',
          })
        }
      }

      setNoSaleBranches(branchesWithNoSales.slice(0, 10)) // Limit to top 10

      // 4. Refund Spikes - Recent refunds with high amounts (> $1000 or top 10)
      const recentRefunds = allRefunds
        .filter(refund => {
          if (!refund.createdAt) return false
          const refundDate = new Date(refund.createdAt)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return refundDate >= thirtyDaysAgo
        })
        .map(refund => ({
          id: refund.id,
          cashierName: refund.cashier?.fullName || refund.cashier?.email || 'Unknown',
          amount: refund.amount || 0,
          reason: refund.reason || 'No reason provided',
          createdAt: refund.createdAt ? format(new Date(refund.createdAt), 'MMM d, yyyy') : 'N/A',
        }))
        .filter(refund => refund.amount >= 1000) // Filter refunds >= $1000
        .sort((a, b) => b.amount - a.amount) // Sort by amount (highest first)
        .slice(0, 10) // Limit to top 10

      setRefundSpikes(recentRefunds)

    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProductImage = (product) => {
    if (product.image) return product.image
    if (product.imageUrl) return product.imageUrl
    
    // Fallback based on category
    const categoryImages = {
      'Watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
      'Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
      'saree': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100',
    }
    return categoryImages[product.category] || 'https://via.placeholder.com/100'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground mt-1">Monitor important alerts and notifications</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAlerts}>
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inactive Cashiers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Inactive Cashiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inactiveCashiers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="size-12 mx-auto mb-2 opacity-50" />
                <p>No inactive cashiers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>FullName</TableHead>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactiveCashiers.map((cashier) => (
                      <TableRow key={cashier.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            <span>{cashier.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{cashier.fullName}</div>
                            {cashier.email && (
                              <div className="text-sm text-muted-foreground">{cashier.email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-muted-foreground" />
                            <span>{cashier.branchName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {cashier.lastLogin}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-yellow-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="size-12 mx-auto mb-2 opacity-50" />
                <p>All products are well stocked</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="font-medium truncate">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Stock: {product.quantity} units
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="size-4 text-muted-foreground" />
                            <span className="text-sm">{product.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(product.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* No Sale Today */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-red-600" />
              No Sale Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {noSaleBranches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="size-12 mx-auto mb-2 opacity-50" />
                <p>All branches have sales today</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {noSaleBranches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell>{branch.id}</TableCell>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-muted-foreground" />
                            <span className="text-sm">{branch.address}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refund Spike */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-5 text-orange-600" />
              Refund Spike
            </CardTitle>
          </CardHeader>
          <CardContent>
            {refundSpikes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="size-12 mx-auto mb-2 opacity-50" />
                <p>No high-value refunds in the last 30 days</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cashier Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refundSpikes.map((refund) => (
                      <TableRow key={refund.id}>
                        <TableCell>{refund.id}</TableCell>
                        <TableCell className="font-medium">{refund.cashierName}</TableCell>
                        <TableCell className="font-medium text-red-600">
                          {formatCurrency(refund.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="text-sm truncate">{refund.reason}</div>
                            <div className="text-xs text-muted-foreground">{refund.createdAt}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AlertsPage

