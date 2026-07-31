import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Calendar, TrendingUp, Users, Package, RotateCcw, FileSpreadsheet, Sparkles } from 'lucide-react'
import { orderAPI, inventoryAPI, userAPI, refundAPI, customerAPI } from '@/services/api'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  exportSalesReportPDF,
  exportInventoryReportPDF,
  exportStaffReportPDF,
  exportCustomerReportPDF,
  exportRefundsReportPDF,
} from '@/utils/reportPdfGenerator'

const ReportsPage = () => {
  const [downloading, setDownloading] = useState(null)

  const downloadCSV = (filename, headers, rows) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportCSV = async (type) => {
    try {
      setDownloading(`${type}_csv`)
      toast.info(`Generating ${type.toUpperCase()} CSV report...`)

      const profile = await userAPI.getProfile().catch(() => ({}))
      const branchId = profile?.branchId || 1

      if (type === 'sales' || type === 'daily') {
        const orders = type === 'daily'
          ? await orderAPI.getTodayByBranch(branchId).catch(() => [])
          : await orderAPI.getByBranch(branchId).catch(() => [])
        const headers = ['Order ID', 'Date', 'Customer', 'Payment Type', 'Status', 'Total Amount (INR)']
        const rows = orders.map(o => [
          o.id,
          o.createdAt ? format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm') : '',
          `"${typeof o.customer === 'string' ? o.customer : (o.customer?.name || 'Walk-in')}"`,
          o.paymentType || 'CASH',
          o.status || 'COMPLETED',
          o.totalAmount || 0,
        ])
        downloadCSV(`branch_${type}_report`, headers, rows)
      } else if (type === 'inventory') {
        const inv = await inventoryAPI.getByBranch(branchId).catch(() => [])
        const headers = ['Inventory ID', 'Product Name', 'SKU', 'Category', 'Stock Quantity', 'Unit Price (INR)']
        const rows = inv.map(i => [
          i.id,
          `"${i.product?.name || 'Product'}"`,
          i.product?.sku || '',
          `"${i.product?.category?.name || 'General'}"`,
          i.quantity || 0,
          i.product?.sellingPrice || 0,
        ])
        downloadCSV('branch_inventory_report', headers, rows)
      } else if (type === 'employee') {
        const users = await userAPI.getAll().catch(() => [])
        const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role']
        const rows = users.map(u => [
          u.id,
          `"${u.fullName || u.name || 'Staff'}"`,
          u.email || '',
          u.phone || '',
          u.role || '',
        ])
        downloadCSV('branch_staff_report', headers, rows)
      } else if (type === 'customer') {
        const customers = await customerAPI.getAll().catch(() => [])
        const headers = ['Customer ID', 'Name', 'Email', 'Phone']
        const rows = customers.map(c => [
          c.id,
          `"${c.name || c.fullName || 'Customer'}"`,
          c.email || '',
          c.phone || '',
        ])
        downloadCSV('branch_customer_report', headers, rows)
      } else if (type === 'refund') {
        const refunds = await refundAPI.getByBranch(branchId).catch(() => [])
        const headers = ['Refund ID', 'Order ID', 'Date', 'Amount (INR)', 'Reason', 'Payment Type']
        const rows = refunds.map(r => [
          r.id,
          r.orderId || '',
          r.createdAt ? format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm') : '',
          r.amount || 0,
          `"${r.reason || ''}"`,
          r.paymentType || 'CASH',
        ])
        downloadCSV('branch_refund_report', headers, rows)
      }

      toast.success(`${type.toUpperCase()} CSV downloaded!`)
    } catch (error) {
      console.error(`Error generating ${type} CSV:`, error)
      toast.error('Failed to generate CSV report')
    } finally {
      setDownloading(null)
    }
  }

  const handleExportPDF = async (type) => {
    try {
      setDownloading(`${type}_pdf`)
      toast.info(`Generating ${type.toUpperCase()} Formatted PDF Report...`)

      const profile = await userAPI.getProfile().catch(() => ({}))
      const branchId = profile?.branchId || 1

      if (type === 'sales' || type === 'daily') {
        const orders = type === 'daily'
          ? await orderAPI.getTodayByBranch(branchId).catch(() => [])
          : await orderAPI.getByBranch(branchId).catch(() => [])
        exportSalesReportPDF(orders)
      } else if (type === 'inventory') {
        const inv = await inventoryAPI.getByBranch(branchId).catch(() => [])
        exportInventoryReportPDF(inv)
      } else if (type === 'employee') {
        const users = await userAPI.getAll().catch(() => [])
        const orders = await orderAPI.getByBranch(branchId).catch(() => [])
        exportStaffReportPDF(users, orders)
      } else if (type === 'customer') {
        const customers = await customerAPI.getAll().catch(() => [])
        exportCustomerReportPDF(customers)
      } else if (type === 'refund') {
        const refunds = await refundAPI.getByBranch(branchId).catch(() => [])
        exportRefundsReportPDF(refunds)
      }

      toast.success(`${type.toUpperCase()} Formatted PDF Table Downloaded!`)
    } catch (error) {
      console.error(`Error generating ${type} PDF:`, error)
      toast.error('Failed to generate PDF report table')
    } finally {
      setDownloading(null)
    }
  }

  const reports = [
    { id: 'sales', title: 'Sales Performance', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10', description: 'Comprehensive log of order sales, payment types, and order statuses.' },
    { id: 'daily', title: 'Daily Shift Summary', icon: Calendar, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10', description: 'Live today sales breakdown and register transaction totals.' },
    { id: 'inventory', title: 'Stock & Inventory Audit', icon: Package, color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10', description: 'Current stock levels, SKU codes, product categories, and unit valuation.' },
    { id: 'employee', title: 'Staff Performance', icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10', description: 'Branch employee list, credentials, active shifts, and cashier logs.' },
    { id: 'customer', title: 'Customer Analytics', icon: FileText, color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10', description: 'Registered client contact directories and purchasing activity metrics.' },
    { id: 'refund', title: 'Refund Audit Trail', icon: RotateCcw, color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10', description: 'Returned items breakdown, refund reasons, and financial deduction logs.' },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reports & Business Intelligence</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              CSV & PDF Table Export Ready
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate instant CSV data files or beautifully formatted PDF report tables for branch auditing.</p>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((r) => {
          const Icon = r.icon
          const isCsvLoading = downloading === `${r.id}_csv`
          const isPdfLoading = downloading === `${r.id}_pdf`
          return (
            <Card key={r.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{r.title}</CardTitle>
                <div className={`size-11 rounded-xl flex items-center justify-center ${r.color}`}>
                  <Icon className="size-6" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500 min-h-[40px]">{r.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    disabled={isCsvLoading || isPdfLoading}
                    onClick={() => handleExportCSV(r.id)}
                    variant="outline"
                    className="w-full h-10 border-slate-200 dark:border-slate-700 text-xs font-bold gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="size-4 text-emerald-600" />
                    {isCsvLoading ? 'Exporting...' : 'Export CSV'}
                  </Button>
                  <Button
                    disabled={isCsvLoading || isPdfLoading}
                    onClick={() => handleExportPDF(r.id)}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 cursor-pointer"
                  >
                    <FileText className="size-4" />
                    {isPdfLoading ? 'Exporting...' : 'Export PDF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default ReportsPage
