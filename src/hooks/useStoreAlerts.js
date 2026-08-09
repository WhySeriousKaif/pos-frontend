import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { userAPI, productAPI, branchAPI, orderAPI, refundAPI } from '@/services/api'

// Computes real, live alerts for a store (low stock, inactive cashiers, branches with
// no sales today, refund spikes) from actual API data — no separate "notification" table
// on the backend. Shared by the Alerts page and the header notification bell so both
// show the same numbers. Pass pollIntervalMs to keep it refreshing while mounted.
export const useStoreAlerts = (storeId, { pollIntervalMs } = {}) => {
  const [inactiveCashiers, setInactiveCashiers] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [noSaleBranches, setNoSaleBranches] = useState([])
  const [refundSpikes, setRefundSpikes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = useCallback(async () => {
    if (!storeId) return
    try {
      setLoading(true)

      const [allUsers, allProducts, allBranches, allRefunds] = await Promise.all([
        userAPI.getAll().catch(() => []),
        productAPI.getByStoreId(storeId).catch(() => []),
        branchAPI.getByStoreId(storeId).catch(() => []),
        Promise.all(
          (await branchAPI.getByStoreId(storeId).catch(() => [])).map((branch) =>
            refundAPI.getByBranch(branch.id).catch(() => [])
          )
        ).then((results) => results.flat()).catch(() => []),
      ])

      const storeUsers = allUsers.filter(
        (user) => user.storeId === storeId || user.store?.id === storeId
      )

      // 1. Inactive Cashiers - haven't logged in for 7+ days or never logged in
      const cashierRoles = ['ROLE_BRANCH_CASHIER', 'ROLE_CASHIER']
      const cashiers = storeUsers.filter((user) => cashierRoles.includes(user.role))

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const inactive = cashiers
        .filter((cashier) => {
          if (!cashier.lastLoginAt) return true
          return new Date(cashier.lastLoginAt) < sevenDaysAgo
        })
        .map((cashier) => ({
          id: cashier.id,
          fullName: cashier.fullName || 'N/A',
          email: cashier.email || '',
          branchName: cashier.branch?.name || 'N/A',
          lastLogin: cashier.lastLoginAt ? format(new Date(cashier.lastLoginAt), 'MMM d, yyyy, hh:mm a') : 'Never',
          lastLoginDate: cashier.lastLoginAt ? new Date(cashier.lastLoginAt) : null,
        }))
        .sort((a, b) => {
          if (!a.lastLoginDate && !b.lastLoginDate) return 0
          if (!a.lastLoginDate) return -1
          if (!b.lastLoginDate) return 1
          return a.lastLoginDate - b.lastLoginDate
        })
        .slice(0, 10)

      setInactiveCashiers(inactive)

      // 2. Low Stock Products - quantity < 10
      const lowStock = allProducts
        .filter((product) => (product.quantity || 0) < 10)
        .map((product) => ({
          id: product.id,
          name: product.name || 'N/A',
          image: product.image || product.imageUrl || '',
          category: product.category?.name || 'Uncategorized',
          price: product.sellingPrice || product.price || product.mrp || 0,
          quantity: product.quantity || 0,
        }))
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 10)

      setLowStockProducts(lowStock)

      // 3. No Sale Today - branches with no orders today
      const branchesWithNoSales = []
      for (const branch of allBranches) {
        try {
          const todayOrders = await orderAPI.getTodayByBranch(branch.id).catch(() => [])
          if (!todayOrders || todayOrders.length === 0) {
            branchesWithNoSales.push({ id: branch.id, name: branch.name || 'N/A', address: branch.address || 'N/A' })
          }
        } catch {
          branchesWithNoSales.push({ id: branch.id, name: branch.name || 'N/A', address: branch.address || 'N/A' })
        }
      }
      setNoSaleBranches(branchesWithNoSales.slice(0, 10))

      // 4. Refund Spikes - refunds >= 1000 in the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentRefunds = allRefunds
        .filter((refund) => refund.createdAt && new Date(refund.createdAt) >= thirtyDaysAgo)
        .map((refund) => ({
          id: refund.id,
          cashierName: refund.cashier?.fullName || refund.cashier?.email || 'Unknown',
          amount: refund.amount || 0,
          reason: refund.reason || 'No reason provided',
          createdAt: refund.createdAt ? format(new Date(refund.createdAt), 'MMM d, yyyy') : 'N/A',
        }))
        .filter((refund) => refund.amount >= 1000)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10)

      setRefundSpikes(recentRefunds)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  useEffect(() => {
    if (!pollIntervalMs) return undefined
    const interval = setInterval(fetchAlerts, pollIntervalMs)
    return () => clearInterval(interval)
  }, [fetchAlerts, pollIntervalMs])

  return { inactiveCashiers, lowStockProducts, noSaleBranches, refundSpikes, loading, refetch: fetchAlerts }
}
