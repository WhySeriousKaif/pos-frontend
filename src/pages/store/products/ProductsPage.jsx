import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, RefreshCw, Eye, Edit, Trash2, Image as ImageIcon, Upload, X } from 'lucide-react'
import { productAPI, userAPI, storeAPI, categoryAPI } from '@/services/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { uploadToCloudinary } from '@/utils/cloudinary'

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [storeId, setStoreId] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    sku: '',
    mrp: '',
    sellingPrice: '',
    brand: '',
    image: '',
    quantity: 0,
    categoryId: '',
    customCategory: '',
  })
  const [editProduct, setEditProduct] = useState({
    name: '',
    description: '',
    sku: '',
    mrp: '',
    sellingPrice: '',
    brand: '',
    image: '',
    quantity: 0,
    categoryId: '',
    customCategory: '',
  })
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)
  const [editImageFile, setEditImageFile] = useState(null)

  // Common categories
  const commonCategories = [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Home & Kitchen',
    'Beauty & Personal Care',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Automotive',
    'Health & Wellness',
    'Office Supplies',
    'Pet Supplies',
  ]

  useEffect(() => {
    fetchStoreId()
  }, [])

  useEffect(() => {
    if (storeId) {
      fetchProducts()
      fetchCategories()
    }
  }, [storeId])

  useEffect(() => {
    filterProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, products])

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

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await productAPI.getByStoreId(storeId)
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getByStoreId(storeId)
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = products.filter((product) =>
      product.name?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.category?.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    )
    setFilteredProducts(filtered)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    filterProducts()
  }

  const getProductImage = (product) => {
    // First check for image from Cloudinary or direct URL
    if (product.image) {
      return product.image
    }
    // Fallback to imageUrl if exists
    if (product.imageUrl) {
      return product.imageUrl
    }
    // Use category-based placeholder images
    const category = product.category?.name?.toLowerCase() || 'product'
    const imageMap = {
      'shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
      't-shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
      'women_dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200',
      'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
      'shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200',
      'home_furniture': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200',
      'home & kitchen': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200',
      'saree': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200',
    }
    return imageMap[category] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200'
  }

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setEditProduct({
      name: product.name || '',
      description: product.description || '',
      sku: product.sku || '',
      mrp: product.mrp?.toString() || '',
      sellingPrice: product.sellingPrice?.toString() || product.price?.toString() || '',
      brand: product.brand || '',
      image: product.image || product.imageUrl || '',
      quantity: product.quantity || 0,
      categoryId: product.category?.id?.toString() || '',
      customCategory: '',
    })
    setEditImagePreview(product.image || product.imageUrl || null)
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (!editProduct.name || !editProduct.sku) {
      alert('Please fill in all required fields (Name, SKU)')
      return
    }

    if (!editingProduct?.id) {
      alert('Product ID not found')
      return
    }

    // Handle category
    let finalCategoryId = null
    if (editProduct.categoryId === 'other') {
      if (!editProduct.customCategory) {
        alert('Please enter a category name')
        return
      }
      try {
        const newCategory = await categoryAPI.create({
          name: editProduct.customCategory,
          storeId: storeId,
        })
        finalCategoryId = newCategory.id
      } catch (error) {
        console.error('Error creating category:', error)
        alert('Failed to create category. Please try again.')
        return
      }
    } else if (editProduct.categoryId) {
      const existingCategory = categories.find(c => c.id.toString() === editProduct.categoryId || c.name === editProduct.categoryId)
      if (existingCategory) {
        finalCategoryId = existingCategory.id
      } else if (commonCategories.includes(editProduct.categoryId)) {
        try {
          const newCategory = await categoryAPI.create({
            name: editProduct.categoryId,
            storeId: storeId,
          })
          finalCategoryId = newCategory.id
        } catch (error) {
          console.error('Error creating category:', error)
          alert('Failed to create category. Please try again.')
          return
        }
      } else {
        finalCategoryId = parseInt(editProduct.categoryId)
      }
    }

    try {
      setUpdating(true)
      const productData = {
        name: editProduct.name,
        description: editProduct.description || '',
        sku: editProduct.sku,
        mrp: editProduct.mrp ? parseFloat(editProduct.mrp) : null,
        sellingPrice: editProduct.sellingPrice ? parseFloat(editProduct.sellingPrice) : null,
        brand: editProduct.brand || '',
        image: editProduct.image || '',
        quantity: parseInt(editProduct.quantity) || 0,
        storeId: storeId,
      }
      if (finalCategoryId) {
        productData.categoryId = finalCategoryId
      }

      await productAPI.update(editingProduct.id, productData)
      setIsEditDialogOpen(false)
      setEditingProduct(null)
      setEditImagePreview(null)
      setEditImageFile(null)
      fetchProducts()
      alert('Product updated successfully!')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    } finally {
      setUpdating(false)
    }
  }

  const handleEditImageUpload = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB')
      return
    }
    try {
      setUploadingImage(true)
      const imageUrl = await uploadToCloudinary(file)
      setEditProduct({ ...editProduct, image: imageUrl })
      setEditImagePreview(imageUrl)
      setEditImageFile(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await productAPI.delete(id)
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB')
      return
    }

    try {
      setUploadingImage(true)
      const imageUrl = await uploadToCloudinary(file)
      // Use the Cloudinary URL for both preview and product data
      setNewProduct({ ...newProduct, image: imageUrl })
      setImagePreview(imageUrl) // Use Cloudinary URL instead of blob URL
      setImageFile(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleRemoveImage = () => {
    setNewProduct({ ...newProduct, image: '' })
    setImagePreview(null)
    setImageFile(null)
  }

  const handleCategoryChange = (value) => {
    if (value === 'other') {
      setNewProduct({ ...newProduct, categoryId: 'other', customCategory: '' })
    } else {
      setNewProduct({ ...newProduct, categoryId: value, customCategory: '' })
    }
  }

  const handleCreateProduct = async () => {
    // Validate required fields
    if (!newProduct.name || !newProduct.name.trim()) {
      alert('Please enter a product name')
      return
    }

    if (!newProduct.sku || !newProduct.sku.trim()) {
      alert('Please enter a SKU (Stock Keeping Unit)')
      return
    }

    // Validate selling price
    if (!newProduct.sellingPrice || parseFloat(newProduct.sellingPrice) <= 0) {
      alert('Please enter a valid selling price (must be greater than 0)')
      return
    }

    // Validate MRP if provided
    if (newProduct.mrp && parseFloat(newProduct.mrp) < 0) {
      alert('MRP cannot be negative')
      return
    }

    // Validate quantity
    const quantity = parseInt(newProduct.quantity) || 0
    if (quantity < 0) {
      alert('Quantity cannot be negative')
      return
    }

    // Handle category - either use existing categoryId or create new one
    let finalCategoryId = null
    if (newProduct.categoryId === 'other') {
      if (!newProduct.customCategory || !newProduct.customCategory.trim()) {
        alert('Please enter a category name')
        return
      }
      // Create new category first
      try {
        const newCategory = await categoryAPI.create({
          name: newProduct.customCategory.trim(),
          storeId: storeId,
        })
        finalCategoryId = newCategory.id
      } catch (error) {
        console.error('Error creating category:', error)
        alert(error.message || 'Failed to create category. Please try again.')
        return
      }
    } else if (newProduct.categoryId) {
      // Check if it's a common category name (string) or existing category ID (number)
      const existingCategory = categories.find(c => c.id.toString() === newProduct.categoryId || c.name === newProduct.categoryId)
      if (existingCategory) {
        finalCategoryId = existingCategory.id
      } else if (commonCategories.includes(newProduct.categoryId)) {
        // Create new category for common category name
        try {
          const newCategory = await categoryAPI.create({
            name: newProduct.categoryId,
            storeId: storeId,
          })
          finalCategoryId = newCategory.id
        } catch (error) {
          console.error('Error creating category:', error)
          alert(error.message || 'Failed to create category. Please try again.')
          return
        }
      } else {
        finalCategoryId = parseInt(newProduct.categoryId)
      }
    } else {
      alert('Please select or enter a category')
      return
    }

    if (!storeId) {
      alert('Store ID not found. Please refresh the page.')
      return
    }

    try {
      setCreating(true)
      const productData = {
        name: newProduct.name.trim(),
        description: (newProduct.description || '').trim(),
        sku: newProduct.sku.trim(),
        mrp: newProduct.mrp ? parseFloat(newProduct.mrp) : null,
        sellingPrice: parseFloat(newProduct.sellingPrice),
        brand: (newProduct.brand || '').trim(),
        image: newProduct.image || '',
        quantity: quantity,
        storeId: storeId,
        categoryId: finalCategoryId,
      }

      await productAPI.create(productData)
      setIsAddDialogOpen(false)
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        sku: '',
        mrp: '',
        sellingPrice: '',
        brand: '',
        image: '',
        quantity: 0,
        categoryId: '',
        customCategory: '',
      })
      setImagePreview(null)
      setImageFile(null)
      fetchProducts()
      fetchCategories() // Refresh categories list
      alert('Product created successfully!')
    } catch (error) {
      console.error('Error creating product:', error)
      const errorMessage = error.message || 'Failed to create product'
      if (errorMessage.includes('SKU') || errorMessage.includes('sku')) {
        alert(`SKU already exists. Please use a unique SKU.\n\nError: ${errorMessage}`)
      } else {
        alert(`Failed to create product: ${errorMessage}`)
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground mt-1">Manage your store products</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="size-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="size-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No products found matching your search' : 'No products available'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead className="w-24">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">#{product.id}</TableCell>
                      <TableCell>
                        <div className="size-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200'
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description || 'No description'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-muted">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{product.sellingPrice?.toFixed(2) || product.price?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-muted">
                          {product.quantity || product.stockQuantity || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
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

      {/* View Product Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>View product information</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="size-32 rounded-md overflow-hidden bg-muted shrink-0">
                  <img
                    src={getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                  <p className="text-muted-foreground mt-1">{selectedProduct.description}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold">₹{selectedProduct.sellingPrice?.toFixed(2) || selectedProduct.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    {selectedProduct.mrp && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">MRP:</span>
                        <span className="line-through text-muted-foreground">₹{selectedProduct.mrp.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{selectedProduct.category?.name || 'Uncategorized'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock:</span>
                      <span>{selectedProduct.quantity || selectedProduct.stockQuantity || 0}</span>
                    </div>
                    {selectedProduct.sku && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SKU:</span>
                        <span>{selectedProduct.sku}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Create a new product for your store</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter product description"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="Enter SKU (unique)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  value={newProduct.categoryId}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Existing categories from backend */}
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                    {/* Common categories */}
                    {commonCategories.map((catName) => {
                      const existingCat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase())
                      if (!existingCat) {
                        return (
                          <SelectItem key={catName} value={catName}>
                            {catName}
                          </SelectItem>
                        )
                      }
                      return null
                    })}
                    {/* Other option */}
                    <SelectItem value="other">Other (Custom)</SelectItem>
                  </SelectContent>
                </Select>
                {/* Show input field when "Other" is selected */}
                {newProduct.categoryId === 'other' && (
                  <Input
                    placeholder="Enter category name"
                    value={newProduct.customCategory}
                    onChange={(e) => setNewProduct({ ...newProduct, customCategory: e.target.value })}
                    className="mt-2"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  placeholder="Enter brand name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Stock Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="mrp">MRP (₹)</Label>
                <Input
                  id="mrp"
                  type="number"
                  step="0.01"
                  value={newProduct.mrp}
                  onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={newProduct.sellingPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                  min="0"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="mt-1 space-y-2">
                  {imagePreview || newProduct.image ? (
                    <div className="flex items-center gap-4">
                      <div className="size-24 rounded-md overflow-hidden bg-muted border">
                        <img
                          src={imagePreview || newProduct.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <label htmlFor="image-upload">
                            <Button variant="outline" size="sm" asChild disabled={uploadingImage}>
                              <span>
                                <Upload className="size-4 mr-2" />
                                {uploadingImage ? 'Uploading...' : 'Change Image'}
                              </span>
                            </Button>
                          </label>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageFileChange}
                            disabled={uploadingImage}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveImage}
                            disabled={uploadingImage}
                          >
                            <X className="size-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                        {newProduct.image && (
                          <p className="text-xs text-muted-foreground">
                            Image uploaded to Cloudinary
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="image-upload">
                        <Button variant="outline" size="sm" asChild disabled={uploadingImage}>
                          <span>
                            <Upload className="size-4 mr-2" />
                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
                          </span>
                        </Button>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                        disabled={uploadingImage}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Upload image to Cloudinary (Max 10MB, JPG/PNG) or leave empty for default
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProduct} disabled={creating}>
                {creating ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  placeholder="Enter product name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-sku">SKU *</Label>
                <Input
                  id="edit-sku"
                  value={editProduct.sku}
                  onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                  placeholder="Enter SKU"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                placeholder="Enter product description"
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-mrp">MRP</Label>
                <Input
                  id="edit-mrp"
                  type="number"
                  value={editProduct.mrp}
                  onChange={(e) => setEditProduct({ ...editProduct, mrp: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-sellingPrice">Selling Price</Label>
                <Input
                  id="edit-sellingPrice"
                  type="number"
                  value={editProduct.sellingPrice}
                  onChange={(e) => setEditProduct({ ...editProduct, sellingPrice: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-quantity">Stock Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={editProduct.quantity}
                  onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editProduct.categoryId}
                  onValueChange={(value) => {
                    if (value === 'other') {
                      setEditProduct({ ...editProduct, categoryId: 'other', customCategory: '' })
                    } else {
                      setEditProduct({ ...editProduct, categoryId: value, customCategory: '' })
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    {commonCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other (Custom)</SelectItem>
                  </SelectContent>
                </Select>
                {editProduct.categoryId === 'other' && (
                  <Input
                    placeholder="Enter custom category"
                    value={editProduct.customCategory}
                    onChange={(e) => setEditProduct({ ...editProduct, customCategory: e.target.value })}
                    className="mt-2"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="edit-brand">Brand</Label>
                <Input
                  id="edit-brand"
                  value={editProduct.brand}
                  onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                  placeholder="Enter brand name"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Product Image</Label>
              {editImagePreview ? (
                <div className="mt-2 space-y-2">
                  <div className="relative size-32 rounded-md overflow-hidden bg-muted">
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <label htmlFor="edit-image-upload">
                      <Button variant="outline" size="sm" asChild disabled={uploadingImage}>
                        <span>
                          <Upload className="size-4 mr-2" />
                          {uploadingImage ? 'Uploading...' : 'Change Image'}
                        </span>
                      </Button>
                    </label>
                    <input
                      id="edit-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleEditImageUpload(file)
                      }}
                      disabled={uploadingImage}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditProduct({ ...editProduct, image: '' })
                        setEditImagePreview(null)
                        setEditImageFile(null)
                      }}
                      disabled={uploadingImage}
                    >
                      <X className="size-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <label htmlFor="edit-image-upload-new">
                    <Button variant="outline" size="sm" asChild disabled={uploadingImage}>
                      <span>
                        <Upload className="size-4 mr-2" />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="edit-image-upload-new"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleEditImageUpload(file)
                    }}
                    disabled={uploadingImage}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProduct} disabled={updating}>
                {updating ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProductsPage

