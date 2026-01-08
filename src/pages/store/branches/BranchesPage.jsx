import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, RefreshCw, Edit, Trash2, MapPin, Phone, Mail, Users, Building2 } from 'lucide-react'
import { branchAPI, userAPI, storeAPI } from '@/services/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const BranchesPage = () => {
  const [branches, setBranches] = useState([])
  const [filteredBranches, setFilteredBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [storeId, setStoreId] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  })
  const [editBranch, setEditBranch] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  })
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchStoreId()
  }, [])

  useEffect(() => {
    if (storeId) {
      fetchBranches()
    }
  }, [storeId])

  useEffect(() => {
    filterBranches()
  }, [searchQuery, branches])

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

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const data = await branchAPI.getByStoreId(storeId)
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
      setBranches([])
    } finally {
      setLoading(false)
    }
  }

  const filterBranches = () => {
    if (!searchQuery.trim()) {
      setFilteredBranches(branches)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = branches.filter((branch) =>
      branch.name?.toLowerCase().includes(query) ||
      branch.address?.toLowerCase().includes(query) ||
      branch.phone?.toLowerCase().includes(query) ||
      branch.email?.toLowerCase().includes(query)
    )
    setFilteredBranches(filtered)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    filterBranches()
  }

  const handleAddBranch = async () => {
    if (!newBranch.name) {
      alert('Branch name is required')
      return
    }

    if (!storeId) {
      alert('Store ID not found')
      return
    }

    try {
      setCreating(true)
      const branchData = {
        name: newBranch.name,
        address: newBranch.address || '',
        phone: newBranch.phone || '',
        email: newBranch.email || '',
      }

      await branchAPI.create(branchData)
      setIsAddDialogOpen(false)
      setNewBranch({
        name: '',
        address: '',
        phone: '',
        email: '',
      })
      fetchBranches()
      alert('Branch created successfully!')
    } catch (error) {
      console.error('Error creating branch:', error)
      alert(error.message || 'Failed to create branch')
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (branch) => {
    setSelectedBranch(branch)
    setEditBranch({
      name: branch.name || '',
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateBranch = async () => {
    if (!editBranch.name) {
      alert('Branch name is required')
      return
    }

    if (!selectedBranch?.id) {
      alert('Branch ID not found')
      return
    }

    try {
      setUpdating(true)
      const branchData = {
        name: editBranch.name,
        address: editBranch.address || '',
        phone: editBranch.phone || '',
        email: editBranch.email || '',
      }

      await branchAPI.update(selectedBranch.id, branchData)
      setIsEditDialogOpen(false)
      setSelectedBranch(null)
      fetchBranches()
      alert('Branch updated successfully!')
    } catch (error) {
      console.error('Error updating branch:', error)
      alert(error.message || 'Failed to update branch')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteBranch = async (id) => {
    if (!confirm('Are you sure you want to delete this branch?')) return

    try {
      await branchAPI.delete(id)
      fetchBranches()
      alert('Branch deleted successfully!')
    } catch (error) {
      console.error('Error deleting branch:', error)
      alert('Failed to delete branch')
    }
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Branch Management</h1>
          <p className="text-muted-foreground mt-1">Manage your store branches</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchBranches}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="size-4 mr-2" />
            Add Branch
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
                placeholder="Search branches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Branches ({filteredBranches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="size-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No branches found matching your search' : 'No branches available. Create your first branch!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">
                        {branch.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 text-muted-foreground" />
                          <span className="line-clamp-2">{branch.address || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="size-4 text-muted-foreground" />
                          <span>{branch.manager?.fullName || 'Not assigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="size-4 text-muted-foreground" />
                          <span>{branch.phone || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-muted-foreground" />
                          <span>{branch.email || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(branch)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteBranch(branch.id)}
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

      {/* Add Branch Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>Create a new branch for your store</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Branch Name *</Label>
              <Input
                id="name"
                value={newBranch.name}
                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                placeholder="Enter branch name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={newBranch.address}
                onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                placeholder="Enter branch address"
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={newBranch.phone}
                onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newBranch.email}
                onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBranch} disabled={creating}>
                {creating ? 'Creating...' : 'Add Branch'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update branch information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Branch Name *</Label>
              <Input
                id="edit-name"
                value={editBranch.name}
                onChange={(e) => setEditBranch({ ...editBranch, name: e.target.value })}
                placeholder="Enter branch name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={editBranch.address}
                onChange={(e) => setEditBranch({ ...editBranch, address: e.target.value })}
                placeholder="Enter branch address"
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editBranch.phone}
                onChange={(e) => setEditBranch({ ...editBranch, phone: e.target.value })}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editBranch.email}
                onChange={(e) => setEditBranch({ ...editBranch, email: e.target.value })}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBranch} disabled={updating}>
                {updating ? 'Updating...' : 'Update Branch'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BranchesPage

