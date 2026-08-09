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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  RefreshCw,
  Package,
  AlertCircle,
  CheckCircle2,
  Plus,
  Edit,
  ArrowUpDown,
  Tag,
  Boxes,
} from 'lucide-react'
import { inventoryAPI, productAPI, userAPI } from '@/services/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const InventoryPage = () => {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [branchId, setBranchId] = useState(null)
  const [storeId, setStoreId] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [products, setProducts] = useState([])
  const [newInventory, setNewInventory] = useState({
    productId: '',
    quantity: '',
  })

  useEffect(() => {
    fetchBranchId()
  }, [])

  useEffect(() => {
    if (branchId) {
      fetchInventory()
    }
  }, [branchId])

  useEffect(() => {
    if (storeId) {
      fetchProducts()
    }
  }, [storeId])

  useEffect(() => {
    filterInventory()
  }, [searchQuery, inventory])

  const fetchProducts = async () => {
    try {
      const data = await productAPI.getByStoreId(storeId)
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }

  const fetchBranchId = async () => {
    try {
      const profile = await userAPI.getProfile()
      if (profile?.branchId) {
        setBranchId(profile.branchId)
      } else {
        setBranchId(1)
      }
      if (profile?.storeId) {
        setStoreId(profile.storeId)
      }
    } catch (error) {
      console.error('Error fetching branch ID:', error)
      setBranchId(1)
    }
  }

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const data = branchId ? await inventoryAPI.getByBranch(branchId).catch(() => []) : await inventoryAPI.getAll().catch(() => [])
      setInventory(data || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Failed to load inventory')
      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  const filterInventory = () => {
    if (!searchQuery.trim()) {
      setFilteredInventory(inventory)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = inventory.filter(item => {
      const productName = item.product?.name?.toLowerCase() || ''
      const sku = item.product?.sku?.toLowerCase() || ''
      const category = item.product?.category?.name?.toLowerCase() || ''

      return (
        productName.includes(query) ||
        sku.includes(query) ||
        category.includes(query)
      )
    })
    setFilteredInventory(filtered)
  }

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Out of Stock', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' }
    if (quantity < 10) return { label: 'Low Stock', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' }
    return { label: 'In Stock', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' }
  }

  const handleAddInventory = async () => {
    try {
      if (!newInventory.productId) {
        toast.error('Please select a product')
        return
      }

      if (!newInventory.quantity) {
        toast.error('Please enter a quantity')
        return
      }

      const quantity = parseInt(newInventory.quantity)
      if (Number.isNaN(quantity) || quantity <= 0) {
        toast.error('Quantity must be a positive number')
        return
      }

      await inventoryAPI.create({
        branchId: branchId || 1,
        productId: parseInt(newInventory.productId),
        quantity,
      })

      setIsAddDialogOpen(false)
      setNewInventory({ productId: '', quantity: '' })
      fetchInventory()
      toast.success('Inventory item added successfully!')
    } catch (error) {
      console.error('Error adding inventory:', error)
      toast.error('Failed to add inventory item')
    }
  }

  const handleOpenEdit = (item) => {
    setSelectedItem(item)
    setEditQuantity(item.quantity?.toString() || '0')
    setIsEditDialogOpen(true)
  }

  const handleUpdateStock = async () => {
    if (!selectedItem) return
    try {
      const q = parseInt(editQuantity)
      if (Number.isNaN(q) || q < 0) {
        toast.error('Please enter a valid stock level')
        return
      }

      await inventoryAPI.update(selectedItem.id, {
        ...selectedItem,
        quantity: q,
      })

      setIsEditDialogOpen(false)
      fetchInventory()
      toast.success(`Updated stock quantity for ${selectedItem.product?.name || 'item'}`)
    } catch (error) {
      console.error('Error updating stock:', error)
      toast.error('Failed to update stock quantity')
    }
  }

  const summary = {
    totalItems: inventory.length,
    inStock: inventory.filter(item => (item.quantity || 0) >= 10).length,
    lowStock: inventory.filter(item => (item.quantity || 0) > 0 && (item.quantity || 0) < 10).length,
    outOfStock: inventory.filter(item => (item.quantity || 0) === 0).length,
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Branch Inventory</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {inventory.length} Stock Units
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor branch stock levels, reorder alerts, and update product quantities.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="default"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-10 px-4 gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="size-4" /> Add Stock Item
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={fetchInventory}
            className="text-sm font-bold border-slate-200 dark:border-slate-700 h-10 px-4 gap-2 cursor-pointer"
          >
            <RefreshCw className="size-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</p>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{summary.totalItems}</div>
            </div>
            <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Boxes className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sufficient Stock</p>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">{summary.inStock}</div>
            </div>
            <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Warnings</p>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1.5">{summary.lowStock}</div>
            </div>
            <div className="size-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
              <AlertCircle className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Out of Stock</p>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1.5">{summary.outOfStock}</div>
            </div>
            <div className="size-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertCircle className="size-6" />
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
              placeholder="Search product name, SKU or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-16 space-y-3 flex-col">
              <div className="size-9 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Fetching inventory items...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Package className="size-14 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Inventory Found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">No items found matching your search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                  <TableRow className="border-slate-100 dark:border-slate-800">
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Product</TableHead>
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">SKU</TableHead>
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Category</TableHead>
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200 text-right">Stock Quantity</TableHead>
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200 text-right">Price</TableHead>
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200">Status</TableHead>
                    <TableHead className="py-4 text-sm font-bold text-slate-800 dark:text-slate-200 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInventory.map((item) => {
                    const stockStatus = getStockStatus(item.quantity || 0)
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <TableCell className="py-4 font-bold text-sm text-slate-900 dark:text-white">
                          {item.product?.name || 'Inventory Product'}
                        </TableCell>
                        <TableCell className="py-4 text-sm font-mono text-slate-500">{item.product?.sku || 'SKU-N/A'}</TableCell>
                        <TableCell className="py-4 text-sm text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Tag className="size-3.5 text-slate-400" />
                            {item.product?.category?.name || 'General'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right text-sm font-black text-slate-900 dark:text-white">
                          {item.quantity || 0}
                        </TableCell>
                        <TableCell className="py-4 text-right text-sm font-bold text-slate-900 dark:text-white">
                          ₹{item.product?.sellingPrice?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className={cn('px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide', stockStatus.className)}>
                            {stockStatus.label}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            className="h-9 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 gap-1.5 cursor-pointer"
                          >
                            <Edit className="size-4" /> Adjust Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Inventory Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">Add Product to Inventory</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Select catalog product and specify starting stock amount.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Select Catalog Product</label>
              <Select
                value={newInventory.productId}
                onValueChange={(val) => setNewInventory({ ...newInventory, productId: val })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name} (SKU: {p.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Stock Quantity</label>
              <Input
                type="number"
                placeholder="Initial quantity"
                value={newInventory.quantity}
                onChange={(e) => setNewInventory({ ...newInventory, quantity: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(false)} className="text-xs font-bold">
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddInventory} className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white">
              Add Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">Update Stock Level</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Adjust current stock quantity for <span className="font-bold text-slate-900 dark:text-white">{selectedItem?.product?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">New Quantity</label>
              <Input
                type="number"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                className="h-9 text-xs"
                placeholder="Enter stock count"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)} className="text-xs font-bold">
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdateStock} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InventoryPage


