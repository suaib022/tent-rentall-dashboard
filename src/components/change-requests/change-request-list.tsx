"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { updateChangeRequestStatus, createChangeRequest } from "@/lib/actions/change-requests"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { Plus, Check as CheckIcon, AlertCircle, Calendar } from "lucide-react"

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  try {
    return format(parseISO(dateStr), 'MMMM d, yyyy')
  } catch (e) {
    return dateStr
  }
}

export function ChangeRequestList({ changeRequests, bookings }: { changeRequests: any[], bookings: any[] }) {
  const [open, setOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject', id: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const openRequests = changeRequests.filter(cr => cr.status === 'open' || cr.status === 'in_review')
  const approvedRequests = changeRequests.filter(cr => cr.status === 'approved')
  const rejectedRequests = changeRequests.filter(cr => cr.status === 'rejected')

  const executeAction = async () => {
    if (!confirmAction) return
    setIsLoading(true)
    try {
      if (confirmAction.type === 'approve') {
        await updateChangeRequestStatus(confirmAction.id, 'approved')
      } else {
        await updateChangeRequestStatus(confirmAction.id, 'rejected')
      }
      setConfirmAction(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    const form = e.currentTarget
    try {
      const fd = new FormData(form)
      
      const payload: any = {
        booking_id: fd.get('booking_id'),
        change_type: fd.get('change_type'),
        customer_note: fd.get('customer_note'),
      }
      
      // Extremely basic JSON parsing for requested changes
      const changesRaw = fd.get('requested_changes') as string
      if (changesRaw) {
        try {
          payload.requested_changes = JSON.parse(changesRaw)
        } catch (e) {
          throw new Error("Invalid JSON format in requested changes.")
        }
      } else {
        payload.requested_changes = {}
      }

      await createChangeRequest(payload)
      setOpen(false)
      form.reset()
      setShowSuccess(true)
    } catch (error: any) {
      console.error("Failed to create change request:", error)
      setErrorMessage(error?.message || 'Unknown error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderRequestCard = (cr: any) => (
    <Card key={cr.id} className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-[#10253B]">
              CR #{cr.reference || cr.id.split('-')[0]}
            </h3>
            <Badge variant="outline" className={`
              ${cr.status === 'open' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
              ${cr.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : ''}
              ${cr.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
            `}>
              {cr.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
              {cr.change_type.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="text-sm text-slate-600">
            {cr.bookings && (
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Booking:</span>
                <Link href="/bookings" className="text-blue-600 hover:underline">
                  #{cr.bookings.reference}
                </Link>
                <span className="text-slate-400">({formatDate(cr.bookings.event_date)})</span>
              </div>
            )}
            {cr.customer_note && (
              <div className="truncate max-w-lg mt-2 text-slate-500 italic">
                "{cr.customer_note}"
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px]">
          <Button onClick={() => setSelectedRequest(cr)} variant="outline" className="w-full">
            Details
          </Button>
          {cr.status === 'open' || cr.status === 'in_review' ? (
            <>
              <Button onClick={() => setConfirmAction({ type: 'approve', id: cr.id })} className="bg-green-600 hover:bg-green-700 w-full">
                Approve
              </Button>
              <Button onClick={() => setConfirmAction({ type: 'reject', id: cr.id })} variant="destructive" className="w-full">
                Reject
              </Button>
            </>
          ) : null}
        </div>

      </div>
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger nativeButton render={<Button className="bg-[#d83a2e] hover:bg-[#b02b22]" />}>
            <Plus className="w-4 h-4 mr-2" /> Create Change Request
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Change Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Booking</Label>
                <Select name="booking_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a booking" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookings.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>
                        #{b.reference} - {b.name} ({formatDate(b.event_date)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Change Type</Label>
                <Select name="change_type" required defaultValue="date_change">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_change">Date Change</SelectItem>
                    <SelectItem value="package_upgrade">Package Upgrade</SelectItem>
                    <SelectItem value="guest_count_update">Guest Count Update</SelectItem>
                    <SelectItem value="cancellation">Cancellation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Requested Changes (JSON)</Label>
                <textarea 
                  name="requested_changes" 
                  className="w-full p-2 border rounded-md text-sm font-mono h-24" 
                  placeholder='{"new_date": "2026-12-01"}'
                ></textarea>
                <p className="text-xs text-slate-500">Provide the specific data changes in valid JSON format.</p>
              </div>

              <div className="space-y-2">
                <Label>Customer Note / Reason</Label>
                <textarea 
                  name="customer_note" 
                  className="w-full p-2 border rounded-md text-sm h-24" 
                  placeholder="Explain the reason for the change..."
                ></textarea>
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-200">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} className="bg-[#10253B] hover:bg-slate-800">
                  {isLoading ? 'Creating...' : 'Create Request'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="open" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="open">Open ({openRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="space-y-4">
          {openRequests.length === 0 ? <p className="text-slate-500 py-8 text-center bg-white rounded-xl border border-slate-200">No open change requests.</p> : openRequests.map(renderRequestCard)}
        </TabsContent>
        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.length === 0 ? <p className="text-slate-500 py-8 text-center bg-white rounded-xl border border-slate-200">No approved requests.</p> : approvedRequests.map(renderRequestCard)}
        </TabsContent>
        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.length === 0 ? <p className="text-slate-500 py-8 text-center bg-white rounded-xl border border-slate-200">No rejected requests.</p> : rejectedRequests.map(renderRequestCard)}
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle className="text-xl font-bold">Change Request Details</DialogTitle>
          {selectedRequest && (
            <div className="space-y-6 mt-4">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-sm font-medium text-slate-500 mb-2">Original Booking Target</h4>
                {selectedRequest.bookings ? (
                  <div className="flex justify-between items-center bg-white border rounded-lg p-3">
                    <div>
                      <div className="font-bold text-[#10253B]">Booking #{selectedRequest.bookings.reference}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3" /> {formatDate(selectedRequest.bookings.event_date)}
                      </div>
                    </div>
                    <Link href="/bookings">
                      <Button variant="outline" size="sm">View Booking</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">No associated booking found.</div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Requested Changes</h4>
                <div className="bg-[#10253B] text-slate-300 p-4 rounded-xl text-sm font-mono overflow-x-auto">
                  <pre>{JSON.stringify(selectedRequest.requested_changes, null, 2)}</pre>
                </div>
              </div>

              {selectedRequest.customer_note && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Customer Note</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm whitespace-pre-wrap">
                    {selectedRequest.customer_note}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-sm text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl mb-2">Request Created!</DialogTitle>
          <p className="text-slate-500 mb-6">The change request has been successfully generated.</p>
          <Button onClick={() => setShowSuccess(false)} className="w-full bg-[#10253B] hover:bg-slate-800">
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600">
            Are you sure you want to {confirmAction?.type} this change request?
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant={confirmAction?.type === 'reject' ? 'destructive' : 'default'}
              className={confirmAction?.type === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
              onClick={executeAction}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : confirmAction?.type === 'approve' ? "Yes, Approve" : "Yes, Reject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
