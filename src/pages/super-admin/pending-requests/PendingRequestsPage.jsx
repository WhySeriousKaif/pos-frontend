import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RefreshCw, Check, X, Clock, Store, Mail, Phone, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { storeAPI } from '@/services/api'

const PendingRequestsPage = () => {
  const [pendingStores, setPendingStores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      const allStores = await storeAPI.getAll()
      const pending = allStores.filter(store => store.storeStatus === 'PENDING')
      setPendingStores(pending)
    } catch (error) {
      console.error('Error fetching pending requests:', error)
      setPendingStores([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (storeId) => {
    try {
      await storeAPI.moderate(storeId, 'ACTIVE')
      await fetchPendingRequests()
      alert('Store approved successfully!')
    } catch (error) {
      console.error('Error approving store:', error)
      alert('Failed to approve store')
    }
  }

  const handleReject = async (storeId) => {
    if (!confirm('Are you sure you want to reject this store request?')) return
    
    try {
      await storeAPI.moderate(storeId, 'BLOCKED')
      await fetchPendingRequests()
      alert('Store request rejected')
    } catch (error) {
      console.error('Error rejecting store:', error)
      alert('Failed to reject store')
    }
  }

  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Pending Requests</h1>
          <p className="text-muted-foreground mt-1">Review and approve store registration requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPendingRequests}>
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Store Requests ({pendingStores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="size-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pending requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingStores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <Store className="size-4" />
                            {store.brand || 'N/A'}
                          </div>
                          {store.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px] mt-1">
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
                        {store.createdAt
                          ? format(new Date(store.createdAt), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(store.id)}
                          >
                            <Check className="size-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(store.id)}
                          >
                            <X className="size-4 mr-2" />
                            Reject
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

export default PendingRequestsPage

