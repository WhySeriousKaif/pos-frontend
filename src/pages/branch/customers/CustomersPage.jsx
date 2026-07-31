import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Search,
  RefreshCw,
  Users,
  Plus,
  Edit,
  ShoppingCart,
  Mail,
  Phone,
  UserCheck,
  TrendingUp,
} from 'lucide-react'
import { customerAPI, orderAPI } from '@/services/api'
import { toast } from 'sonner'

const CustomersPage = () => {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [searchQuery, customers])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await customerAPI.getAll().catch(() => [])
      const customersWithOrders = await Promise.all(
        (data || []).map(async (customer) => {
          try {
            const orders = await orderAPI.getByCustomerId(customer.id).catch(() => [])
            return {
              ...customer,
              orderCount: orders?.length || 0,
              totalSpent: orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0,
            }
          } catch (err) {
            return {
              ...customer,
              orderCount: 0,
              totalSpent: 0,
            }
          }
        })
      )
      setCustomers(customersWithOrders)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = customers.filter(customer => {
      const name = customer.name?.toLowerCase() || customer.fullName?.toLowerCase() || ''
      const email = customer.email?.toLowerCase() || ''
      const phone = customer.phone?.toLowerCase() || ''

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
      )
    })
    setFilteredCustomers(filtered)
  }

  const handleAddCustomer = async () => {
    try {
      if (!newCustomer.name) {
        toast.error('Customer name is required')
        return
      }
      
      await customerAPI.create(newCustomer)
      setIsAddDialogOpen(false)
      setNewCustomer({ name: '', email: '', phone: '' })
      fetchCustomers()
      toast.success('Customer added successfully!')
    } catch (error) {
      console.error('Error adding customer:', error)
      toast.error('Failed to add customer')
    }
  }

  const summary = {
    total: customers.length,
    withOrders: customers.filter(c => c.orderCount > 0).length,
    totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Branch Customers</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
              {customers.length} Registered
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Directory of clients, purchase histories, contact info, and total spend.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="default"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-10 px-4 gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="size-4" /> Add Customer
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={fetchCustomers}
            className="text-sm font-bold border-slate-200 dark:border-slate-700 h-10 px-4 gap-2 cursor-pointer"
          >
            <RefreshCw className="size-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</p>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{summary.total}</div>
            </div>
            <div className="size-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600">
              <Users className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repeat Buyers</p>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">{summary.withOrders}</div>
            </div>
            <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <UserCheck className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifetime Customer Value</p>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1.5">₹{summary.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
              <TrendingUp className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search customer name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-16 space-y-3 flex-col">
              <div className="size-9 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Loading branch customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Users className="size-14 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Customers Found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">No customers match your search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                  <TableRow className="border-slate-100 dark:border-slate-800">
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Customer</TableHead>
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Email Address</TableHead>
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Phone</TableHead>
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Orders</TableHead>
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200 text-right">Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <TableCell className="py-4 font-bold text-sm text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
                          {(customer.name || customer.fullName || 'C')[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-bold">{customer.name || customer.fullName || 'Customer'}</span>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="size-4 text-slate-400" />
                          {customer.email || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-2">
                          <Phone className="size-4 text-slate-400" />
                          {customer.phone || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {customer.orderCount || 0} Orders
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right text-sm font-black text-slate-900 dark:text-white">
                        ₹{(customer.totalSpent || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Add New Customer</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">Create a customer profile for branch checkout records.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
              <Input
                placeholder="Customer full name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
              <Input
                type="tel"
                placeholder="+91 9876543210"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="h-10 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-sm font-bold h-10 px-4">
              Cancel
            </Button>
            <Button onClick={handleAddCustomer} className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white h-10 px-4">
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CustomersPage



