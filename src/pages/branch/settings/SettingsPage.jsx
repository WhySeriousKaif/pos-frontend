import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Building2, Save, RefreshCw } from 'lucide-react'
import { branchAPI, userAPI } from '@/services/api'

const SettingsPage = () => {
  const [branchInfo, setBranchInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [branchId, setBranchId] = useState(1)

  useEffect(() => {
    fetchBranchInfo()
  }, [])

  const fetchBranchInfo = async () => {
    try {
      setLoading(true)
      const profile = await userAPI.getProfile()
      const currentBranchId = profile?.branchId || 1
      setBranchId(currentBranchId)
      const branch = await branchAPI.getById(currentBranchId)
      setBranchInfo({
        name: branch.name || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
      })
    } catch (error) {
      console.error('Error fetching branch info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await branchAPI.update(branchId, branchInfo)
      alert('Branch information updated successfully!')
      // Refresh branch info after update
      await fetchBranchInfo()
      // Dispatch custom event to notify layout to refresh
      window.dispatchEvent(new CustomEvent('branchInfoUpdated'))
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(`Error saving settings: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage branch settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="size-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Branch Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Branch Name</label>
              <Input
                id="name"
                value={branchInfo.name}
                onChange={(e) => setBranchInfo({ ...branchInfo, name: e.target.value })}
                placeholder="Enter branch name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">Address</label>
              <Input
                id="address"
                value={branchInfo.address}
                onChange={(e) => setBranchInfo({ ...branchInfo, address: e.target.value })}
                placeholder="Enter branch address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                <Input
                  id="phone"
                  type="tel"
                  value={branchInfo.phone}
                  onChange={(e) => setBranchInfo({ ...branchInfo, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={branchInfo.email}
                  onChange={(e) => setBranchInfo({ ...branchInfo, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Additional system settings will be available here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage

