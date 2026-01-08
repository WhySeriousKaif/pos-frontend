import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, RefreshCw, Check, X, Eye, Store, MapPin, Phone, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { storeAPI } from '@/services/api'

const StoresPage = () => {
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchStores()
  }, [])

  useEffect(() => {
    filterStores()
  }, [searchQuery, stores])

  const fetchStores = async () => {
    try {
      setLoading(true)
      const data = await storeAPI.getAll()
      setStores(data || [])
    } catch (error) {
      console.error('Error fetching stores:', error)
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  const filterStores = () => {
    if (!searchQuery.trim()) {
      setFilteredStores(stores)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = stores.filter((store) =>
      store.brand?.toLowerCase().includes(query) ||
      store.description?.toLowerCase().includes(query) ||
      store.contact?.email?.toLowerCase().includes(query) ||
      store.contact?.phone?.toLowerCase().includes(query)
    )
    setFilteredStores(filtered)
  }

  const handleModerateStore = async (storeId, status) => {
    try {
      await storeAPI.moderate(storeId, status)
      await fetchStores()
      alert(`Store ${status === 'ACTIVE' ? 'approved' : 'blocked'} successfully!`)
    } catch (error) {
      console.error('Error moderating store:', error)
      alert('Failed to update store status')
    }
  }

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      BLOCKED: 'bg-red-100 text-red-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING: 'Pending',
      ACTIVE: 'Active',
      BLOCKED: 'Blocked',
    }
    return statusMap[status] || status
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Stores</h1>
          <p className="text-muted-foreground mt-1">Manage all stores in the system</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStores}>
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Stores ({filteredStores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Store className="size-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No stores found matching your search' : 'No stores available'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{store.brand || 'N/A'}</div>
                          {store.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {store.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{store.storeType || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {store.contact?.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="size-4 text-muted-foreground" />
                              <span>{store.contact.email}</span>
                            </div>
                          )}
                          {store.contact?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="size-4 text-muted-foreground" />
                              <span>{store.contact.phone}</span>
                            </div>
                          )}
                          {store.contact?.address && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="size-4 text-muted-foreground" />
                              <span className="truncate max-w-[150px]">{store.contact.address}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            store.storeStatus
                          )}`}
                        >
                          {getStatusLabel(store.storeStatus)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {store.createdAt
                          ? format(new Date(store.createdAt), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {store.storeStatus === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                onClick={() => handleModerateStore(store.id, 'ACTIVE')}
                                title="Approve"
                              >
                                <Check className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                onClick={() => handleModerateStore(store.id, 'BLOCKED')}
                                title="Reject"
                              >
                                <X className="size-4" />
                              </Button>
                            </>
                          )}
                          {store.storeStatus === 'ACTIVE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleModerateStore(store.id, 'BLOCKED')}
                              title="Block Store"
                            >
                              <X className="size-4" />
                            </Button>
                          )}
                          {store.storeStatus === 'BLOCKED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              onClick={() => handleModerateStore(store.id, 'ACTIVE')}
                              title="Activate Store"
                            >
                              <Check className="size-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              // View store details
                              const details = `Store Details\n\nID: ${store.id}\nBrand: ${store.brand || 'N/A'}\nType: ${store.storeType || 'N/A'}\nStatus: ${getStatusLabel(store.storeStatus)}\nDescription: ${store.description || 'N/A'}\n\nContact:\nEmail: ${store.contact?.email || 'N/A'}\nPhone: ${store.contact?.phone || 'N/A'}\nAddress: ${store.contact?.address || 'N/A'}\n\nCreated: ${store.createdAt ? format(new Date(store.createdAt), 'MMM d, yyyy') : 'N/A'}`
                              alert(details)
                            }}
                            title="View Store Details"
                          >
                            <Eye className="size-4" />
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
    </div>
  )
}

export default StoresPage

