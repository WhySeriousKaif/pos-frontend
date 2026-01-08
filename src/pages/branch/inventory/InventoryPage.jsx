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
} from 'lucide-react'
import { inventoryAPI, productAPI, userAPI } from '@/services/api'
import { cn } from '@/lib/utils'

const InventoryPage = () => {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [branchId, setBranchId] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [newInventory, setNewInventory] = useState({
    productId: '',
    quantity: '',
  })

  useEffect(() => {
    fetchBranchId()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (branchId) {
      fetchInventory()
    }
  }, [branchId])

  const fetchProducts = async () => {
    try {
      const data = await productAPI.getAll()
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  useEffect(() => {
    filterInventory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, inventory])

  const fetchBranchId = async () => {
    try {
      const profile = await userAPI.getProfile()
      if (profile?.branchId) {
        setBranchId(profile.branchId)
      }
    } catch (error) {
      console.error('Error fetching branch ID:', error)
    }
  }

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const data = await inventoryAPI.getByBranch(branchId)
      setInventory(data || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
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
    if (quantity === 0) return { label: 'Out of Stock', className: 'bg-red-100 text-red-800' }
    if (quantity < 10) return { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' }
    return { label: 'In Stock', className: 'bg-green-100 text-green-800' }
  }

  const handleAddInventory = async () => {
    try {
      if (!newInventory.productId || !newInventory.quantity) {
        alert('Please fill all required fields')
        return
      }
      
      await inventoryAPI.create({
        branchId: branchId,
        productId: parseInt(newInventory.productId),
        quantity: parseInt(newInventory.quantity),
      })
      
      setIsAddDialogOpen(false)
      setNewInventory({ productId: '', quantity: '' })
      fetchInventory()
      alert('Inventory item added successfully!')
    } catch (error) {
      console.error('Error adding inventory:', error)
      alert(`Error adding inventory: ${error.message}`)
    }
  }

  const summary = {
    totalItems: inventory.length,
    inStock: inventory.filter(item => (item.quantity || 0) > 0).length,
    lowStock: inventory.filter(item => (item.quantity || 0) > 0 && (item.quantity || 0) < 10).length,
    outOfStock: inventory.filter(item => (item.quantity || 0) === 0).length,
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage branch inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="size-4 mr-2" /> Add Item
          </Button>
          <Button variant="outline" size="sm" onClick={fetchInventory}>
            <RefreshCw className="size-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <CheckCircle2 className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.inStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.lowStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertCircle className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by product name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                {searchQuery ? 'No items found' : 'No inventory items available'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.quantity || 0)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{item.product?.sku || 'N/A'}</TableCell>
                      <TableCell>{item.product?.category?.name || 'Uncategorized'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.quantity || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{item.product?.sellingPrice?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', stockStatus.className)}>
                          {stockStatus.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8">
                          <Edit className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Inventory Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>
              Add a new product to the branch inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product</label>
              <Select
                value={newInventory.productId}
                onValueChange={(value) => setNewInventory({ ...newInventory, productId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} (SKU: {product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={newInventory.quantity}
                onChange={(e) => setNewInventory({ ...newInventory, quantity: e.target.value })}
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddInventory}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InventoryPage

