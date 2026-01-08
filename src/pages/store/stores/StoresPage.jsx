import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, Edit, MapPin, Phone, Mail, Building2, Calendar } from 'lucide-react'
import { storeAPI, userAPI } from '@/services/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

const StoresPage = () => {
  const [storeInfo, setStoreInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    brand: '',
    description: '',
    storeType: '',
    contact: {
      address: '',
      phone: '',
      email: '',
    },
  })
  const [createForm, setCreateForm] = useState({
    brand: '',
    description: '',
    storeType: '',
    contact: {
      address: '',
      phone: '',
      email: '',
    },
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchStoreInfo()
  }, [])

  const fetchStoreInfo = async () => {
    try {
      setLoading(true)
      const stores = await storeAPI.getByAdmin()
      if (stores && stores.length > 0) {
        const store = stores[0]
        setStoreInfo(store)
        setEditForm({
          brand: store.brand || '',
          description: store.description || '',
          storeType: store.storeType || '',
          contact: {
            address: store.contact?.address || '',
            phone: store.contact?.phone || '',
            email: store.contact?.email || '',
          },
        })
      }
    } catch (error) {
      console.error('Error fetching store info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (!storeInfo?.id) {
        alert('Store ID not found')
        return
      }

      await storeAPI.update(storeInfo.id, editForm)
      await fetchStoreInfo()
      setIsEditDialogOpen(false)
      // Dispatch event to update sidebar
      window.dispatchEvent(new CustomEvent('storeInfoUpdated'))
      alert('Store information updated successfully!')
    } catch (error) {
      console.error('Error updating store:', error)
      alert('Failed to update store information')
    }
  }

  const handleInputChange = (field, value) => {
    if (field.startsWith('contact.')) {
      const contactField = field.replace('contact.', '')
      setEditForm((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [contactField]: value,
        },
      }))
    } else {
      setEditForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleCreateInputChange = (field, value) => {
    if (field.startsWith('contact.')) {
      const contactField = field.replace('contact.', '')
      setCreateForm((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [contactField]: value,
        },
      }))
    } else {
      setCreateForm((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleCreateStore = async () => {
    if (!createForm.brand) {
      alert('Store name is required')
      return
    }

    try {
      setCreating(true)
      const storeData = {
        brand: createForm.brand,
        description: createForm.description || '',
        storeType: createForm.storeType || '',
        contact: createForm.contact,
      }

      await storeAPI.create(storeData)
      setIsCreateDialogOpen(false)
      setCreateForm({
        brand: '',
        description: '',
        storeType: '',
        contact: {
          address: '',
          phone: '',
          email: '',
        },
      })
      await fetchStoreInfo()
      // Dispatch event to update sidebar
      window.dispatchEvent(new CustomEvent('storeInfoUpdated'))
      alert('Store created successfully!')
    } catch (error) {
      console.error('Error creating store:', error)
      alert(error.message || 'Failed to create store')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full overflow-auto p-4 sm:p-6 flex items-center justify-center">
        <RefreshCw className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!storeInfo) {
    return (
      <div className="h-full overflow-auto p-4 sm:p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Building2 className="size-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Store Found</h2>
              <p className="text-muted-foreground mb-4">
                You need to create a store first to manage it.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Store
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Store Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Store</DialogTitle>
              <DialogDescription>Create your store to get started</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="create-brand">Store Name *</Label>
                <Input
                  id="create-brand"
                  value={createForm.brand}
                  onChange={(e) => handleCreateInputChange('brand', e.target.value)}
                  placeholder="Enter store name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-storeType">Store Type</Label>
                <Input
                  id="create-storeType"
                  value={createForm.storeType}
                  onChange={(e) => handleCreateInputChange('storeType', e.target.value)}
                  placeholder="e.g., Retail Store, Online Store"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  value={createForm.description}
                  onChange={(e) => handleCreateInputChange('description', e.target.value)}
                  placeholder="Enter store description"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-4">Contact Information</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="create-address">Address</Label>
                    <Textarea
                      id="create-address"
                      value={createForm.contact.address}
                      onChange={(e) => handleCreateInputChange('contact.address', e.target.value)}
                      placeholder="Enter store address"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-phone">Phone</Label>
                    <Input
                      id="create-phone"
                      type="tel"
                      value={createForm.contact.phone}
                      onChange={(e) => handleCreateInputChange('contact.phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-email">Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={createForm.contact.email}
                      onChange={(e) => handleCreateInputChange('contact.email', e.target.value)}
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateStore} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Store'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Store Management</h1>
          <p className="text-muted-foreground mt-1">Manage your store information</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStoreInfo}>
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Store Information</CardTitle>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="size-4 mr-2" />
              Edit Details
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Store Name</Label>
                <p className="text-lg font-medium mt-1">{storeInfo.brand || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Store Type</Label>
                <p className="mt-1">
                  <span className="px-2 py-1 rounded text-sm font-medium bg-muted">
                    {storeInfo.storeType || 'Not specified'}
                  </span>
                </p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{storeInfo.description || 'No description provided'}</p>
              </div>
              {storeInfo.createdAt && (
                <div>
                  <Label className="text-muted-foreground">Store Created On</Label>
                  <p className="mt-1 flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    {new Date(storeInfo.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              {storeInfo.contact?.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-muted-foreground">Address</Label>
                    <p className="mt-1">{storeInfo.contact.address}</p>
                  </div>
                </div>
              )}
              {storeInfo.contact?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="size-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="mt-1">{storeInfo.contact.phone}</p>
                  </div>
                </div>
              )}
              {storeInfo.contact?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="size-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="mt-1">{storeInfo.contact.email}</p>
                  </div>
                </div>
              )}
              {!storeInfo.contact?.address && !storeInfo.contact?.phone && !storeInfo.contact?.email && (
                <p className="text-muted-foreground">No contact information available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Store Details</DialogTitle>
            <DialogDescription>Update your store information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="brand">Store Name *</Label>
              <Input
                id="brand"
                value={editForm.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Enter store name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="storeType">Store Type</Label>
              <Input
                id="storeType"
                value={editForm.storeType}
                onChange={(e) => handleInputChange('storeType', e.target.value)}
                placeholder="e.g., Retail Store, Online Store"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter store description"
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-4">Contact Information</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={editForm.contact.address}
                    onChange={(e) => handleInputChange('contact.address', e.target.value)}
                    placeholder="Enter store address"
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editForm.contact.phone}
                    onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.contact.email}
                    onChange={(e) => handleInputChange('contact.email', e.target.value)}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StoresPage

