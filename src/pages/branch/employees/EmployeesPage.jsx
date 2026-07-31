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
  ShieldCheck,
  Mail,
  Phone,
} from 'lucide-react'
import { userAPI, shiftReportAPI, employeeAPI } from '@/services/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [branchId, setBranchId] = useState(null)
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
        setBranchId(1)
      }
    } catch (error) {
      console.error('Error fetching branch ID:', error)
      setBranchId(1)
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const allUsers = await userAPI.getAll().catch(() => [])
      const branchEmployees = (allUsers || []).filter(user => 
        !branchId || user.branchId === branchId || user.branch?.id === branchId
      )
      
      try {
        const shifts = branchId ? await shiftReportAPI.getByBranch(branchId).catch(() => []) : []
        const activeShiftCashiers = new Set()
        shifts.forEach(shift => {
          if (shift.shiftStart && !shift.shiftEnd) {
            activeShiftCashiers.add(shift.cashier?.id)
          }
        })
        
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
      toast.error('Failed to load employees')
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
    if (!role) return 'Cashier'
    return role.replace('ROLE_', '').replace(/_/g, ' ')
  }

  const handleAddEmployee = async () => {
    try {
      if (!newEmployee.fullName || !newEmployee.email || !newEmployee.password) {
        toast.error('Please fill all required fields (Name, Email, Password)')
        return
      }
      
      await employeeAPI.createBranchEmployee(branchId || 1, newEmployee)
      setIsAddDialogOpen(false)
      setNewEmployee({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'ROLE_BRANCH_CASHIER',
      })
      fetchEmployees()
      toast.success('Employee added successfully!')
    } catch (error) {
      console.error('Error adding employee:', error)
      toast.error(`Error adding employee: ${error.message || 'Server error'}`)
    }
  }

  const summary = {
    total: employees.length,
    active: employees.filter(emp => emp.isActive).length,
    cashiers: employees.filter(emp => emp.role?.includes('CASHIER')).length,
    managers: employees.filter(emp => emp.role?.includes('MANAGER')).length,
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Branch Staff</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
              {employees.length} Staff Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage cashiers, floor staff, shift schedules, and branch credentials.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <Plus className="size-4" /> Add New Staff
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEmployees}
            className="text-xs font-bold border-slate-200 dark:border-slate-700 gap-1.5"
          >
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Staff</p>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.total}</div>
            </div>
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">On Active Shift</p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary.active}</div>
            </div>
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <UserCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">POS Cashiers</p>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{summary.cashiers || summary.total}</div>
            </div>
            <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Managers</p>
              <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">{summary.managers || 1}</div>
            </div>
            <div className="size-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by staff name, email, phone, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12 space-y-2 flex-col">
              <div className="size-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Loading branch staff...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Users className="size-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Staff Members Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">No employees match your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow className="border-slate-100 dark:border-slate-800">
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Staff Member</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Role</TableHead>
                    <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">Shift Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <TableCell className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="size-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow">
                          {(employee.fullName || employee.name || 'S')[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{employee.fullName || employee.name || 'Staff Member'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: #{employee.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="size-3 text-slate-400" />
                          {employee.email || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="size-3 text-slate-400" />
                          {employee.phone || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                          {getRoleDisplay(employee.role)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {employee.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                            <UserCheck className="size-3" /> On Shift
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            <UserX className="size-3" /> Offline
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">Register New Staff Member</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Enter employee information and login credentials.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
              <Input
                placeholder="Staff full name"
                value={newEmployee.fullName}
                onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
              <Input
                type="email"
                placeholder="staff@molla-pos.com"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
              <Input
                type="tel"
                placeholder="+91 9876543210"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Password *</label>
              <Input
                type="password"
                placeholder="Assign account password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Role *</label>
              <Select
                value={newEmployee.role}
                onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROLE_BRANCH_CASHIER">Branch Cashier</SelectItem>
                  <SelectItem value="ROLE_CASHIER">Standard Cashier</SelectItem>
                  <SelectItem value="ROLE_BRANCH_MANAGER">Branch Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(false)} className="text-xs font-bold">
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddEmployee} className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white">
              Create Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmployeesPage


