import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, RefreshCw, Check, X, Eye, Store, MapPin, Phone, Mail, Hash, Calendar, Tag, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { storeAPI } from '@/services/api'

const StoresPage = () => {
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)

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
      PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400',
      ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400',
      BLOCKED: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Stores</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all stores in the system</p>
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
                            onClick={() => setSelectedStore(store)}
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

      {/* Store Details Dialog */}
      <Dialog open={!!selectedStore} onOpenChange={(open) => !open && setSelectedStore(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {selectedStore && (
            <>
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-6 text-white">
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
                      <Store className="size-7" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <DialogTitle className="text-xl font-black text-white leading-tight truncate">
                        {selectedStore.brand || 'N/A'}
                      </DialogTitle>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            selectedStore.storeStatus === 'ACTIVE'
                              ? 'bg-blue-400/25 text-blue-50'
                              : selectedStore.storeStatus === 'PENDING'
                              ? 'bg-amber-400/25 text-amber-50'
                              : 'bg-red-400/25 text-red-50'
                          }`}
                        >
                          {getStatusLabel(selectedStore.storeStatus)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-blue-100/80">
                          <Hash className="size-3" />
                          {selectedStore.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="px-6 py-5 space-y-5">
                {selectedStore.description && (
                  <div className="flex items-start gap-3">
                    <FileText className="size-4 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-600 dark:text-slate-300">{selectedStore.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                      <Tag className="size-3.5" /> Type
                    </div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedStore.storeType || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                      <Calendar className="size-3.5" /> Created
                    </div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedStore.createdAt ? format(new Date(selectedStore.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/10 pt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                    Contact
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Mail className="size-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-200 truncate">
                        {selectedStore.contact?.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Phone className="size-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-200">
                        {selectedStore.contact?.phone || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                        <MapPin className="size-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-200">
                        {selectedStore.contact?.address || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StoresPage

