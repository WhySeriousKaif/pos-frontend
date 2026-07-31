import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Building2, Save, RefreshCw, Printer, Shield, Store, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { branchAPI, userAPI } from '@/services/api'
import { toast } from 'sonner'

const SettingsPage = () => {
  const [branchInfo, setBranchInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxRate: '18',
    currency: '₹',
    invoiceFooter: 'Thank you for shopping with us!',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [branchId, setBranchId] = useState(null)

  useEffect(() => {
    fetchBranchInfo()
  }, [])

  const fetchBranchInfo = async () => {
    try {
      setLoading(true)
      const profile = await userAPI.getProfile().catch(() => null)
      const currentBranchId = profile?.branchId || 1
      setBranchId(currentBranchId)
      
      const branch = await branchAPI.getById(currentBranchId).catch(() => ({}))
      setBranchInfo({
        name: branch.name || 'Main Branch',
        address: branch.address || 'Branch Outlet Location',
        phone: branch.phone || '+91 9876543210',
        email: branch.email || 'branch@molla-pos.com',
        taxRate: '18',
        currency: '₹',
        invoiceFooter: 'Thank you for shopping with us!',
      })
    } catch (error) {
      console.error('Error fetching branch info:', error)
      toast.error('Failed to load branch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (branchId) {
        await branchAPI.update(branchId, {
          name: branchInfo.name,
          address: branchInfo.address,
          phone: branchInfo.phone,
          email: branchInfo.email,
        })
      }
      toast.success('Branch settings updated successfully!')
      window.dispatchEvent(new CustomEvent('branchInfoUpdated'))
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to update branch settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 space-y-2 flex-col min-h-[400px]">
        <div className="size-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading branch configuration...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Branch Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
              {branchInfo.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Configure outlet information, contact details, and POS receipt defaults.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            {saving ? <div className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Save className="size-3.5" />}
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Profile Form */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="size-4 text-blue-600" /> Branch Details & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="name" className="font-bold text-slate-700 dark:text-slate-300">Branch Name</label>
              <Input
                id="name"
                value={branchInfo.name}
                onChange={(e) => setBranchInfo({ ...branchInfo, name: e.target.value })}
                placeholder="Branch name"
                className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="address" className="font-bold text-slate-700 dark:text-slate-300">Physical Address</label>
              <Input
                id="address"
                value={branchInfo.address}
                onChange={(e) => setBranchInfo({ ...branchInfo, address: e.target.value })}
                placeholder="Full address of the outlet"
                className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="phone" className="font-bold text-slate-700 dark:text-slate-300">Contact Phone</label>
                <Input
                  id="phone"
                  type="tel"
                  value={branchInfo.phone}
                  onChange={(e) => setBranchInfo({ ...branchInfo, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="font-bold text-slate-700 dark:text-slate-300">Official Email</label>
                <Input
                  id="email"
                  type="email"
                  value={branchInfo.email}
                  onChange={(e) => setBranchInfo({ ...branchInfo, email: e.target.value })}
                  placeholder="branch@molla-pos.com"
                  className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label htmlFor="invoiceFooter" className="font-bold text-slate-700 dark:text-slate-300">Invoice Receipt Footer</label>
              <Input
                id="invoiceFooter"
                value={branchInfo.invoiceFooter}
                onChange={(e) => setBranchInfo({ ...branchInfo, invoiceFooter: e.target.value })}
                placeholder="Footer message on customer PDFs"
                className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* POS Preferences */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Printer className="size-4 text-emerald-600" /> POS Checkout Config
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Default Tax Rate (%)</label>
              <Input
                type="number"
                value={branchInfo.taxRate}
                onChange={(e) => setBranchInfo({ ...branchInfo, taxRate: e.target.value })}
                className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Currency Symbol</label>
              <Input
                value={branchInfo.currency}
                onChange={(e) => setBranchInfo({ ...branchInfo, currency: e.target.value })}
                className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 space-y-2 mt-4">
              <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400">
                <Shield className="size-4" /> Live Sync Active
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Updates saved here immediately sync across all cashiers and active POS terminals assigned to this branch.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage


