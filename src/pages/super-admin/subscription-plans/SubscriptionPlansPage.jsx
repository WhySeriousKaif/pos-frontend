import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, RefreshCw, Check, X } from 'lucide-react'
// Format currency utility
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const SubscriptionPlansPage = () => {
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'Basic Plan',
      price: 1299,
      branches: 10,
      users: 50,
      products: 1000,
      features: ['API integrations', 'Advanced reporting', 'Email support'],
      isActive: true,
    },
    {
      id: 2,
      name: 'Pro Plan',
      price: 2999,
      branches: 100,
      users: 500,
      products: 9000,
      features: ['API integrations', 'Advanced reporting', 'Shift management', 'Priority support'],
      isActive: true,
    },
    {
      id: 3,
      name: 'Advance Plan',
      price: 4999,
      branches: 400,
      users: 5000,
      products: 50000,
      features: ['All Pro features', 'Custom integrations', 'Dedicated support', 'Custom branding'],
      isActive: true,
    },
  ])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    branches: '',
    users: '',
    products: '',
    features: '',
    isActive: true,
  })
  const [editPlan, setEditPlan] = useState({
    name: '',
    price: '',
    branches: '',
    users: '',
    products: '',
    features: '',
    isActive: true,
  })

  const handleAddPlan = () => {
    if (!newPlan.name || !newPlan.price) {
      alert('Please fill in all required fields')
      return
    }

    const features = newPlan.features.split(',').map(f => f.trim()).filter(f => f)
    const plan = {
      id: plans.length + 1,
      name: newPlan.name,
      price: parseFloat(newPlan.price),
      branches: parseInt(newPlan.branches) || 0,
      users: parseInt(newPlan.users) || 0,
      products: parseInt(newPlan.products) || 0,
      features,
      isActive: newPlan.isActive,
    }

    setPlans([...plans, plan])
    setIsAddDialogOpen(false)
    setNewPlan({
      name: '',
      price: '',
      branches: '',
      users: '',
      products: '',
      features: '',
      isActive: true,
    })
    alert('Plan added successfully! (Backend API to be implemented)')
  }

  const handleEdit = (plan) => {
    setSelectedPlan(plan)
    setEditPlan({
      name: plan.name,
      price: plan.price.toString(),
      branches: plan.branches.toString(),
      users: plan.users.toString(),
      products: plan.products.toString(),
      features: plan.features.join(', '),
      isActive: plan.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdatePlan = () => {
    if (!editPlan.name || !editPlan.price) {
      alert('Please fill in all required fields')
      return
    }

    const features = editPlan.features.split(',').map(f => f.trim()).filter(f => f)
    const updatedPlans = plans.map(plan =>
      plan.id === selectedPlan.id
        ? {
            ...plan,
            name: editPlan.name,
            price: parseFloat(editPlan.price),
            branches: parseInt(editPlan.branches) || 0,
            users: parseInt(editPlan.users) || 0,
            products: parseInt(editPlan.products) || 0,
            features,
            isActive: editPlan.isActive,
          }
        : plan
    )

    setPlans(updatedPlans)
    setIsEditDialogOpen(false)
    setSelectedPlan(null)
    alert('Plan updated successfully! (Backend API to be implemented)')
  }

  const handleDeletePlan = (id) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    setPlans(plans.filter(plan => plan.id !== id))
    alert('Plan deleted successfully! (Backend API to be implemented)')
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground mt-1">Manage subscription plans for stores</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.isActive ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.isActive && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Branches:</span>
                  <span className="font-medium">{plan.branches}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Users:</span>
                  <span className="font-medium">{plan.users}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Products:</span>
                  <span className="font-medium">{plan.products.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t pt-4 mb-4">
                <p className="text-sm font-medium mb-2">Features:</p>
                <ul className="space-y-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(plan)}
                >
                  <Edit className="size-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Plans ({plans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Branches</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{formatCurrency(plan.price)}/month</TableCell>
                    <TableCell>{plan.branches}</TableCell>
                    <TableCell>{plan.users}</TableCell>
                    <TableCell>{plan.products.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          plan.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeletePlan(plan.id)}
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
        </CardContent>
      </Card>

      {/* Add Plan Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Subscription Plan</DialogTitle>
            <DialogDescription>Create a new subscription plan for stores</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                placeholder="e.g., Basic Plan"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Monthly Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                  placeholder="1299"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="branches">Max Branches</Label>
                <Input
                  id="branches"
                  type="number"
                  value={newPlan.branches}
                  onChange={(e) => setNewPlan({ ...newPlan, branches: e.target.value })}
                  placeholder="10"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="users">Max Users</Label>
                <Input
                  id="users"
                  type="number"
                  value={newPlan.users}
                  onChange={(e) => setNewPlan({ ...newPlan, users: e.target.value })}
                  placeholder="50"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="products">Max Products</Label>
                <Input
                  id="products"
                  type="number"
                  value={newPlan.products}
                  onChange={(e) => setNewPlan({ ...newPlan, products: e.target.value })}
                  placeholder="1000"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input
                id="features"
                value={newPlan.features}
                onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                placeholder="API integrations, Advanced reporting, Email support"
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={newPlan.isActive}
                onChange={(e) => setNewPlan({ ...newPlan, isActive: e.target.checked })}
                className="size-4"
              />
              <Label htmlFor="isActive">Active Plan</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPlan}>Add Plan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>Update subscription plan details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Plan Name *</Label>
              <Input
                id="edit-name"
                value={editPlan.name}
                onChange={(e) => setEditPlan({ ...editPlan, name: e.target.value })}
                placeholder="e.g., Basic Plan"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Monthly Price ($) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editPlan.price}
                  onChange={(e) => setEditPlan({ ...editPlan, price: e.target.value })}
                  placeholder="1299"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-branches">Max Branches</Label>
                <Input
                  id="edit-branches"
                  type="number"
                  value={editPlan.branches}
                  onChange={(e) => setEditPlan({ ...editPlan, branches: e.target.value })}
                  placeholder="10"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-users">Max Users</Label>
                <Input
                  id="edit-users"
                  type="number"
                  value={editPlan.users}
                  onChange={(e) => setEditPlan({ ...editPlan, users: e.target.value })}
                  placeholder="50"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-products">Max Products</Label>
                <Input
                  id="edit-products"
                  type="number"
                  value={editPlan.products}
                  onChange={(e) => setEditPlan({ ...editPlan, products: e.target.value })}
                  placeholder="1000"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-features">Features (comma-separated)</Label>
              <Input
                id="edit-features"
                value={editPlan.features}
                onChange={(e) => setEditPlan({ ...editPlan, features: e.target.value })}
                placeholder="API integrations, Advanced reporting"
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="edit-isActive"
                type="checkbox"
                checked={editPlan.isActive}
                onChange={(e) => setEditPlan({ ...editPlan, isActive: e.target.checked })}
                className="size-4"
              />
              <Label htmlFor="edit-isActive">Active Plan</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePlan}>Update Plan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SubscriptionPlansPage

