import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Store, Activity, AlertTriangle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { storeAPI } from '@/services/api'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    blockedStores: 0,
    pendingRequests: 0,
  })
  const [registrationData, setRegistrationData] = useState([])
  const [statusData, setStatusData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const allStores = await storeAPI.getAll()

      // Calculate statistics
      const totalStores = allStores.length
      const activeStores = allStores.filter(
        store => store.storeStatus === 'ACTIVE'
      ).length
      const blockedStores = allStores.filter(
        store => store.storeStatus === 'BLOCKED'
      ).length
      const pendingRequests = allStores.filter(
        store => store.storeStatus === 'PENDING'
      ).length

      setStats({
        totalStores,
        activeStores,
        blockedStores,
        pendingRequests,
      })

      // Store registrations for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return format(date, 'MMM dd')
      })

      const registrationsByDay = {}
      last7Days.forEach(day => {
        registrationsByDay[day] = 0
      })

      allStores.forEach(store => {
        if (store.createdAt) {
          const storeDate = format(new Date(store.createdAt), 'MMM dd')
          if (registrationsByDay.hasOwnProperty(storeDate)) {
            registrationsByDay[storeDate] += 1
          }
        }
      })

      setRegistrationData(
        last7Days.map(day => ({
          date: day,
          registrations: registrationsByDay[day] || 0,
        }))
      )

      // Store status distribution
      const statusCounts = {
        PENDING: pendingRequests,
        ACTIVE: activeStores,
        BLOCKED: blockedStores,
      }

      setStatusData([
        { name: 'Pending', value: statusCounts.PENDING, color: '#FF8042' },
        { name: 'Active', value: statusCounts.ACTIVE, color: '#00C49F' },
        { name: 'Blocked', value: statusCounts.BLOCKED, color: '#FF4444' },
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#FF8042', '#00C49F', '#FF4444']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of all stores and system statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Stores</p>
                <p className="text-2xl font-bold mt-1">{stats.totalStores}</p>
                <p className="text-xs text-muted-foreground mt-1">from last month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Store className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Stores</p>
                <p className="text-2xl font-bold mt-1">{stats.activeStores}</p>
                <p className="text-xs text-muted-foreground mt-1">currently operational</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Activity className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blocked Stores</p>
                <p className="text-2xl font-bold mt-1">{stats.blockedStores}</p>
                <p className="text-xs text-muted-foreground mt-1">suspended accounts</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="size-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold mt-1">{stats.pendingRequests}</p>
                <p className="text-xs text-muted-foreground mt-1">awaiting approval</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="size-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Registrations (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="registrations" fill="#10b981" name="Registrations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SuperAdminDashboard

