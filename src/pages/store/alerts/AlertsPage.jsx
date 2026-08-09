import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { RefreshCw, User, MapPin, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { userAPI, storeAPI } from '@/services/api'
import { useStoreAlerts } from '@/hooks/useStoreAlerts'

const AlertsPage = () => {
  const [storeId, setStoreId] = useState(null)
  const { inactiveCashiers, lowStockProducts, noSaleBranches, refundSpikes, loading, refetch: fetchAlerts } =
    useStoreAlerts(storeId)

  useEffect(() => {
    fetchStoreId()
  }, [])

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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="size-8 animate-spin mx-auto mb-4 text-slate-500 dark:text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">Loading alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Alerts</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor important alerts and notifications</p>
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
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
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
                            <User className="size-4 text-slate-500 dark:text-slate-400" />
                            <span>{cashier.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{cashier.fullName}</div>
                            {cashier.email && (
                              <div className="text-sm text-slate-500 dark:text-slate-400">{cashier.email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-slate-500 dark:text-slate-400" />
                            <span>{cashier.branchName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
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
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
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
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Stock: {product.quantity} units
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="size-4 text-slate-500 dark:text-slate-400" />
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
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
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
                            <MapPin className="size-4 text-slate-500 dark:text-slate-400" />
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
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
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
                            <div className="text-xs text-slate-500 dark:text-slate-400">{refund.createdAt}</div>
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

