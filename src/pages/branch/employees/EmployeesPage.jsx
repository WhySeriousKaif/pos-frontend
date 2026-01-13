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
  Users,
  Plus,
  Edit,
  UserCheck,
  UserX,
} from 'lucide-react'
import { userAPI, shiftReportAPI, employeeAPI } from '@/services/api'

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [branchId, setBranchId] = useState(null) // Start with null instead of 1
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'ROLE_BRANCH_CASHIER',
  })

  useEffect(() => {
    fetchBranchId()
  }, [])

  useEffect(() => {
    if (branchId) {
      fetchEmployees()
    }
  }, [branchId])

  useEffect(() => {
    filterEmployees()
  }, [searchQuery, employees])

  const fetchBranchId = async () => {
    try {
      const profile = await userAPI.getProfile()
      if (profile?.branchId) {
        setBranchId(profile.branchId)
      } else {
        console.error('Branch ID not found in user profile. Branch manager must be assigned to a branch.')
        alert('Branch not found. Please make sure your user is assigned to a branch.')
      }
    } catch (error) {
      console.error('Error fetching branch ID:', error)
      alert('Failed to fetch branch information. Please refresh the page.')
    }
  }

  const fetchEmployees = async () => {
    if (!branchId) {
      console.error('Cannot fetch employees: branchId is not set')
      return
    }

    try {
      setLoading(true)
      // Fetch all users and filter by branch
      const allUsers = await userAPI.getAll()
      const branchEmployees = (allUsers || []).filter(user => 
        user.branchId === branchId || user.branch?.id === branchId
      )
      
      // Fetch active shifts to determine who's currently working
      try {
        const shifts = await shiftReportAPI.getByBranch(branchId)
        const activeShiftCashiers = new Set()
        shifts.forEach(shift => {
          if (shift.shiftStart && !shift.shiftEnd) {
            activeShiftCashiers.add(shift.cashier?.id)
          }
        })
        
        // Add isActive property to employees
        const employeesWithStatus = branchEmployees.map(emp => ({
          ...emp,
          isActive: activeShiftCashiers.has(emp.id),
        }))
        
        setEmployees(employeesWithStatus)
      } catch (err) {
        setEmployees(branchEmployees.map(emp => ({ ...emp, isActive: false })))
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const filterEmployees = () => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = employees.filter(employee => {
      const name = employee.fullName?.toLowerCase() || employee.name?.toLowerCase() || ''
      const email = employee.email?.toLowerCase() || ''
      const phone = employee.phone?.toLowerCase() || ''
      const role = employee.role?.toLowerCase() || ''

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        role.includes(query)
      )
    })
    setFilteredEmployees(filtered)
  }

  const getRoleDisplay = (role) => {
    if (!role) return 'N/A'
    return role.replace('ROLE_', '').replace(/_/g, ' ')
  }

  const handleAddEmployee = async () => {
    if (!branchId) {
      alert('Branch ID not found. Please refresh the page.')
      return
    }

    try {
      if (!newEmployee.fullName || !newEmployee.email || !newEmployee.password) {
        alert('Please fill all required fields (Name, Email, Password)')
        return
      }
      
      await employeeAPI.createBranchEmployee(branchId, newEmployee)
      setIsAddDialogOpen(false)
      setNewEmployee({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'ROLE_BRANCH_CASHIER',
      })
      fetchEmployees()
      alert('Employee added successfully!')
    } catch (error) {
      console.error('Error adding employee:', error)
      alert(`Error adding employee: ${error.message}`)
    }
  }

  const summary = {
    total: employees.length,
    active: employees.filter(emp => emp.isActive).length,
    cashiers: employees.filter(emp => 
      emp.role?.includes('CASHIER')
    ).length,
    managers: employees.filter(emp => 
      emp.role?.includes('MANAGER')
    ).length,
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage branch employees</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="size-4 mr-2" /> Add Employee
          </Button>
          <Button variant="outline" size="sm" onClick={fetchEmployees}>
            <RefreshCw className="size-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <UserCheck className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cashiers</CardTitle>
            <Users className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.cashiers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Users className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summary.managers}</div>
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
              placeholder="Search by name, email, phone, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                {searchQuery ? 'No employees found' : 'No employees available'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.fullName || employee.name || 'N/A'}
                    </TableCell>
                    <TableCell>{employee.email || 'N/A'}</TableCell>
                    <TableCell>{employee.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-muted">
                        {getRoleDisplay(employee.role)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {employee.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          <UserCheck className="size-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          <UserX className="size-3" />
                          Offline
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Edit className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>
              Add a new employee to the branch
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name *</label>
              <Input
                placeholder="Enter full name"
                value={newEmployee.fullName}
                onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password *</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role *</label>
              <Select
                value={newEmployee.role}
                onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROLE_BRANCH_CASHIER">Branch Cashier</SelectItem>
                  <SelectItem value="ROLE_CASHIER">Cashier</SelectItem>
                  <SelectItem value="ROLE_BRANCH_MANAGER">Branch Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmployeesPage

