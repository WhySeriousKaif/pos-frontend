import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Save, RefreshCw, User, Upload, X } from 'lucide-react'
import { branchAPI, userAPI } from '@/services/api'

const CashierSettingsPage = () => {
  const [branchInfo, setBranchInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  })
  const [userInfo, setUserInfo] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [branchId, setBranchId] = useState(null)

  useEffect(() => {
    fetchBranchInfo()
  }, [])

  const fetchBranchInfo = async () => {
    try {
      setLoading(true)
      const profile = await userAPI.getProfile()
      setUserInfo(profile)
      const currentBranchId = profile?.branchId || 1
      setBranchId(currentBranchId)
      const branch = await branchAPI.getById(currentBranchId)
      setBranchInfo({
        name: branch.name || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
      })
      
      // Load saved avatar
      const savedAvatar = localStorage.getItem('cashierAvatar')
      if (savedAvatar) {
        setAvatarUrl(savedAvatar)
      }
    } catch (error) {
      console.error('Error fetching branch info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        setAvatarUrl(result)
        // Save to localStorage immediately for preview
        localStorage.setItem('cashierAvatar', result)
        // Dispatch event to update header
        window.dispatchEvent(new CustomEvent('avatarUpdated'))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarUrl(null)
    setAvatarFile(null)
    localStorage.removeItem('cashierAvatar')
    window.dispatchEvent(new CustomEvent('avatarUpdated'))
  }

  const getInitials = () => {
    if (userInfo?.fullName) {
      return userInfo.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (userInfo?.name) {
      return userInfo.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return 'CN'
  }

  const handleSave = async () => {
    if (!branchId) {
      alert('Branch ID not found. Please refresh the page.')
      return
    }

    try {
      setSaving(true)
      await branchAPI.update(branchId, branchInfo)
      alert('Branch information updated successfully!')
      // Refresh branch info after update
      await fetchBranchInfo()
      // Dispatch custom event to notify sidebar to refresh
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
        {/* Profile Image Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Profile Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
                <AvatarImage src={avatarUrl || undefined} alt={userInfo?.fullName || userInfo?.name || "User"} />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <label htmlFor="avatar-upload">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="size-4 mr-2" />
                        {avatarUrl ? 'Change Image' : 'Upload Image'}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  {avatarUrl && (
                    <Button variant="outline" size="sm" onClick={handleRemoveAvatar}>
                      <X className="size-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload a profile image (Max 5MB, JPG/PNG)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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

export default CashierSettingsPage

