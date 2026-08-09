import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Download, FileText, Database, Users, Store, ShoppingCart } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { storeAPI, userAPI, orderAPI, branchAPI } from '@/services/api'

// Returns [start, end) for the selected date range, or null for "all time" / invalid custom range
const resolveDateRange = (dateRange, startDate, endDate) => {
  const now = new Date()
  switch (dateRange) {
    case 'today': {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return [start, now]
    }
    case 'week': {
      const start = new Date(now)
      start.setDate(start.getDate() - 7)
      return [start, now]
    }
    case 'month': {
      const start = new Date(now)
      start.setDate(start.getDate() - 30)
      return [start, now]
    }
    case 'year': {
      const start = new Date(now)
      start.setFullYear(start.getFullYear() - 1)
      return [start, now]
    }
    case 'custom':
      if (!startDate || !endDate) return null
      return [new Date(startDate), new Date(new Date(endDate).setHours(23, 59, 59, 999))]
    default:
      return null
  }
}

const filterByDateRange = (items, range) => {
  if (!range) return items
  const [start, end] = range
  return items.filter((item) => {
    if (!item.createdAt) return false
    const created = new Date(item.createdAt)
    return created >= start && created <= end
  })
}

const ExportsPage = () => {
  const [exportType, setExportType] = useState('stores')
  const [dateRange, setDateRange] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [formatType, setFormatType] = useState('csv')
  const [exporting, setExporting] = useState(false)

  const exportTypes = [
    { value: 'stores', label: 'Stores', icon: Store },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'orders', label: 'Orders', icon: ShoppingCart },
    { value: 'branches', label: 'Branches', icon: Store },
  ]

  // Every store's branches, fetched once and reused by both the orders and branches exports
  const getAllBranchesAcrossStores = async () => {
    const allStores = await storeAPI.getAll()
    const branchArrays = await Promise.all(
      allStores.map((store) => branchAPI.getByStoreId(store.id).catch(() => []))
    )
    return branchArrays.flat()
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const range = resolveDateRange(dateRange, startDate, endDate)
      if (dateRange === 'custom' && !range) {
        toast.error('Please choose a start and end date for a custom range')
        return
      }

      let data = []
      let filename = ''

      switch (exportType) {
        case 'stores':
          data = await storeAPI.getAll()
          filename = `stores-export-${format(new Date(), 'yyyy-MM-dd')}`
          break
        case 'users':
          data = await userAPI.getAll()
          filename = `users-export-${format(new Date(), 'yyyy-MM-dd')}`
          break
        case 'orders': {
          const branches = await getAllBranchesAcrossStores()
          const ordersArrays = await Promise.all(
            branches.map((branch) => orderAPI.getByBranch(branch.id).catch(() => []))
          )
          data = ordersArrays.flat()
          filename = `orders-export-${format(new Date(), 'yyyy-MM-dd')}`
          break
        }
        case 'branches':
          data = await getAllBranchesAcrossStores()
          filename = `branches-export-${format(new Date(), 'yyyy-MM-dd')}`
          break
        default:
          data = []
      }

      data = filterByDateRange(data, range)

      if (data.length === 0) {
        toast.error('No data to export for the selected range')
        return
      }

      if (formatType === 'csv') {
        exportToCSV(data, filename)
      } else if (formatType === 'json') {
        exportToJSON(data, filename)
      }

      toast.success(`Export completed successfully! (${data.length} records)`)
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = Object.keys(data[0])
    const rows = data.map(item => headers.map(header => {
      const value = item[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value)
      return value
    }))

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Exports</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Export system data in various formats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Export Type</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Export Format</Label>
              <Select value={formatType} onValueChange={setFormatType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full"
            >
              <Download className="size-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </CardContent>
        </Card>

        {/* Export Information */}
        <Card>
          <CardHeader>
            <CardTitle>Export Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Available Exports</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Store className="size-4 text-muted-foreground" />
                    <span>Stores - All store information</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span>Users - All user accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShoppingCart className="size-4 text-muted-foreground" />
                    <span>Orders - All order transactions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Store className="size-4 text-muted-foreground" />
                    <span>Branches - All branch information</span>
                  </li>
                </ul>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Export Formats</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• CSV - Comma-separated values for Excel</li>
                  <li>• JSON - JavaScript Object Notation for APIs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ExportsPage

