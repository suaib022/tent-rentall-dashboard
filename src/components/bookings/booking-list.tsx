'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { updateBookingStatus, createBooking } from "@/lib/actions/bookings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { Calendar, User, Package, Plus, MapPin, Check as CheckIcon } from "lucide-react"


const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  try {
    return format(parseISO(dateStr), 'MMMM d, yyyy')
  } catch (e) {
    return dateStr
  }
}

export function BookingList({ bookings, inventory, type = 'event' }: { bookings: any[], inventory: any, type?: 'event' | 'rental' }) {
  const [open, setOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject', id: string } | null>(null)
  const [eventDate, setEventDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const typeFiltered = bookings.filter(b => (b.booking_type || 'event') === type)
  const approvedBookings = typeFiltered.filter(b => b.status === 'confirmed')
  const pendingBookings = [...typeFiltered.filter(b => b.status === 'pending_approval' || b.status === 'tentative')].reverse()
  const rejectedBookings = typeFiltered.filter(b => b.status === 'cancelled')

  const checkAvailability = (targetBooking: any) => {
    const startStr = targetBooking.start_date || targetBooking.event_date
    if (!startStr) return
    const endStr = targetBooking.end_date || startStr
    
    const datesToCheck: string[] = []
    let currentStr = startStr
    while (currentStr <= endStr) {
      datesToCheck.push(currentStr)
      const d = new Date(currentStr)
      d.setUTCDate(d.getUTCDate() + 1)
      currentStr = d.toISOString().split('T')[0]
    }
    
    const approved = bookings.filter((b: any) => (b.status === 'confirmed' || b.status === 'completed') && b.id !== targetBooking.id)
    
    for (const dateStr of datesToCheck) {
      const overlapping = approved.filter((b: any) => {
        const bStart = b.start_date || b.event_date
        const bEnd = b.end_date || bStart
        return dateStr >= bStart && dateStr <= bEnd
      })

      if (type === 'event' && targetBooking.package_id) {
        const usedCount = overlapping.filter((b: any) => b.package_id === targetBooking.package_id).length
        const pkg = inventory.packages.find((p: any) => p.id === targetBooking.package_id)
        if (pkg && pkg.quantity - usedCount <= 0) {
          const displayDate = new Date(dateStr).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })
          throw new Error(`The package "${pkg.name}" is fully booked and unavailable on ${displayDate}.`)
        }
      } else if (type === 'rental' && targetBooking.tent_id) {
        const usedCount = overlapping.filter((b: any) => b.tent_id === targetBooking.tent_id).length
        const tent = inventory.tents.find((t: any) => t.id === targetBooking.tent_id)
        if (tent && tent.quantity - usedCount <= 0) {
          const displayDate = new Date(dateStr).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })
          throw new Error(`The tent "${tent.name}" is fully booked and unavailable on ${displayDate}.`)
        }
      }
    }
  }

  const executeAction = async () => {
    if (!confirmAction) return
    setIsLoading(true)
    setErrorMessage(null)
    try {
      if (confirmAction.type === 'approve') {
        const b = bookings.find(x => x.id === confirmAction.id)
        if (b) checkAvailability(b)
        await updateBookingStatus(confirmAction.id, 'confirmed')
      } else {
        await updateBookingStatus(confirmAction.id, 'cancelled')
      }
      setConfirmAction(null)
    } catch (error: any) {
      console.error("Action failed:", error)
      setErrorMessage(error?.message || 'Unknown error occurred.')
      setConfirmAction(null)
    } finally {
      setIsLoading(false)
    }
  }

  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    const form = e.currentTarget
    try {
      const fd = new FormData(form)
      
      const payload: any = {
        name: fd.get('name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        event_date: fd.get('event_date'),
        start_date: fd.get('start_date') || fd.get('event_date'),
        end_date: fd.get('end_date'),
        venue_address: fd.get('venue_address'),
        guest_count: Number(fd.get('guest_count')),
        booking_type: type,
      }
      
      if (type === 'event') {
        const package_id = fd.get('package_id')
        if (package_id && package_id !== 'none') payload.package_id = package_id
      } else {
        const tent_id = fd.get('tent_id')
        if (tent_id && tent_id !== 'none') payload.tent_id = tent_id
      }

      const accessory_ids = fd.getAll('addon_accessories_ids')
      if (accessory_ids.length > 0) payload.addon_accessories_ids = accessory_ids

      // --- AVAILABILITY CHECK ---
      checkAvailability(payload)
      // ---------------------------

      await createBooking(payload)
      setOpen(false)
      setEventDate('')
      setEndDate('')
      form.reset()
      setShowSuccess(true)
    } catch (error: any) {
      console.error("Failed to create booking:", error)
      setErrorMessage(error?.message || 'Unknown error occurred while creating booking.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderBookingCard = (booking: any) => (
    <Card key={booking.id} className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center flex-wrap gap-3">
            <h3 className="font-bold text-lg text-[#10253B]">
              {type === 'event' ? 'Booking' : 'Rental'} #{booking.reference || booking.id.split('-')[0]}
            </h3>
            {booking.created_at && (
              <span className="text-xs text-slate-400 font-medium">
                Requested {format(parseISO(booking.created_at), "MMM d, yyyy 'at' h:mm:ss a")}
              </span>
            )}
            <Badge variant={
              booking.status === 'confirmed' ? 'default' :
              booking.status === 'pending_approval' ? 'secondary' :
              booking.status === 'cancelled' ? 'destructive' : 'outline'
            }>
              {booking.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline">{booking.payment_status?.toUpperCase() || 'UNPAID'}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-center text-sm text-slate-600">
              <User className="w-4 h-4 mr-2 text-slate-400" />
              {booking.name}
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              {booking.event_date ? (
                <span>
                  Event: {booking.event_date} 
                  {booking.start_date && booking.end_date && (
                    <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                      {Math.max(1, Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24)))} days
                    </span>
                  )}
                  {booking.start_date && !booking.end_date && (
                    <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full">1 day</span>
                  )}
                </span>
              ) : (
                <span className="italic text-slate-400">Date not set</span>
              )}
            </div>
            {booking.packages && (
              <div className="flex items-center text-sm text-slate-600">
                <Package className="w-4 h-4 mr-2 text-slate-400" />
                {booking.packages.name}
              </div>
            )}
            {booking.venue_address && (
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                {booking.venue_address}
              </div>
            )}
            {booking.addon_accessories_ids?.map((accId: string) => {
              const accName = inventory?.accessories?.find((a: any) => a.id === accId)?.name
              if (!accName) return null
              return (
                <div key={accId} className="flex items-center text-sm text-slate-600">
                  <Package className="w-4 h-4 mr-2 text-slate-400" />
                  + {accName}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px]">
          <Button onClick={() => setSelectedBooking(booking)} variant="outline" className="w-full">
            Details
          </Button>
          {booking.status === 'pending_approval' || booking.status === 'tentative' ? (
            <>
              <Button onClick={() => setConfirmAction({ type: 'approve', id: booking.id })} className="bg-green-600 hover:bg-green-700 w-full">
                Approve
              </Button>
              <Button onClick={() => setConfirmAction({ type: 'reject', id: booking.id })} variant="destructive" className="w-full">
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
            <Plus className="w-4 h-4 mr-2" /> Create Booking
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{type === 'event' ? 'Create Event Booking' : 'Create Tent Rental'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Customer Full Name</Label>
                  <Input name="name" required />
                </div>
                <div className="space-y-2">
                  <Label>Customer Email</Label>
                  <Input name="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Customer Phone</Label>
                  <Input name="phone" />
                </div>
                
                <div className="space-y-2">
                  <Label>Event Date</Label>
                  <Input 
                    name="event_date" 
                    type="date" 
                    required 
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    value={eventDate}
                    onChange={(e) => {
                      setEventDate(e.target.value);
                      if (!endDate || endDate < e.target.value) {
                        setEndDate(e.target.value);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Guest Count</Label>
                  <Input name="guest_count" type="number" defaultValue={50} />
                </div>
                <div className="space-y-2">
                  <Label>Venue Address</Label>
                  <Input name="venue_address" placeholder="123 Main St, City" />
                </div>
                
                <div className="space-y-2">
                  <Label>Start Date (Rental Period)</Label>
                  <Input name="start_date" type="date" required readOnly value={eventDate} className="bg-slate-50 cursor-not-allowed" title="Start date automatically matches Event Date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Rental Period)</Label>
                  <Input 
                    name="end_date" 
                    type="date" 
                    required 
                    value={endDate}
                    min={eventDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{type === 'event' ? 'Select Package' : 'Select Tent'}</Label>
                  {type === 'event' ? (
                    <Select name="package_id" defaultValue="none">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a package...">
                          {(val: any) => {
                            if (!val || val === 'none') return "Custom Request / None";
                            const pkg = inventory?.packages?.find((p: any) => p.id === val);
                            return pkg ? pkg.name : "Select a package...";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Custom Request / None</SelectItem>
                        {inventory?.packages?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select name="tent_id" defaultValue="none">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tent...">
                          {(val: any) => {
                            if (!val || val === 'none') return "Custom Request / None";
                            const t = inventory?.tents?.find((p: any) => p.id === val);
                            return t ? t.name : "Select a tent...";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Custom Request / None</SelectItem>
                        {inventory?.tents?.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-3 md:col-span-3 border-t pt-4">
                  <Label>Add-on Accessories (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    {inventory?.accessories?.map((a: any) => (
                      <label key={a.id} className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" name="addon_accessories_ids" value={a.id} className="mt-1 w-4 h-4 text-[#d83a2e] rounded border-slate-300 focus:ring-[#d83a2e]" />
                        <span className="text-sm font-medium text-slate-700 leading-tight">{a.name}</span>
                      </label>
                    ))}
                    {inventory?.accessories?.length === 0 && (
                      <span className="text-sm text-slate-500 italic md:col-span-3">No accessories available in inventory.</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="mr-2" disabled={isLoading}>Cancel</Button>
                <Button type="submit" className="bg-[#10253B]" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Booking"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-sm sm:max-w-md p-6 text-center border-0 shadow-lg">
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <CheckIcon className="w-8 h-8" strokeWidth={3} />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-[#10253B]">{type === 'event' ? 'Booking Created!' : 'Rental Created!'}</DialogTitle>
              <p className="text-slate-500 text-sm max-w-[250px] mx-auto leading-relaxed">
                The manual request has been successfully created and added to the schedule for approval.
              </p>
              <Button onClick={() => setShowSuccess(false)} className="w-full mt-6 bg-[#10253B] hover:bg-[#1a3a5c]">
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Error Modal */}
        <Dialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage(null)}>
          <DialogContent className="max-w-sm sm:max-w-md p-6 text-center border-0 shadow-lg">
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                <div className="text-3xl font-bold">!</div>
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-[#10253B]">Submission Failed</DialogTitle>
              <p className="text-slate-500 text-sm max-w-[300px] mx-auto leading-relaxed break-words">
                {errorMessage}
              </p>
              <Button onClick={() => setErrorMessage(null)} variant="outline" className="w-full mt-6 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                Close & Try Again
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bookings">{type === 'event' ? 'Approved Bookings' : 'Approved Rentals'}</TabsTrigger>
          <TabsTrigger value="requests">{type === 'event' ? 'Booking Requests' : 'Rental Requests'}</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          {approvedBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              No approved {type === 'event' ? 'bookings' : 'rentals'} found.
            </div>
          ) : (
            approvedBookings.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-[#10253B]">Pending Requests</h3>
            <div className="space-y-6">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                  No pending requests found.
                </div>
              ) : (
                pendingBookings.map(renderBookingCard)
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-[#10253B]">Rejected / Cancelled</h3>
            <div className="space-y-6">
              {rejectedBookings.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                  No rejected {type === 'event' ? 'bookings' : 'rentals'} found.
                </div>
              ) : (
                rejectedBookings.map(renderBookingCard)
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Modal */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && !isLoading && setConfirmAction(null)}>
        <DialogContent className="max-w-sm p-6 text-center border-0 shadow-lg bg-white">
          <div className="flex flex-col items-center justify-center space-y-4 py-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${confirmAction?.type === 'approve' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {confirmAction?.type === 'approve' ? <CheckIcon className="w-8 h-8" strokeWidth={3} /> : <div className="text-4xl font-bold">!</div>}
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-[#10253B]">
              {confirmAction?.type === 'approve' 
                ? (type === 'event' ? 'Approve Booking?' : 'Approve Rental?') 
                : (type === 'event' ? 'Reject Booking?' : 'Reject Rental?')}
            </DialogTitle>
            <p className="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed">
              {confirmAction?.type === 'approve' 
                ? 'Are you sure you want to approve this request? This will reserve the inventory for these dates.' 
                : 'Are you sure you want to reject this request? The customer will not receive the items.'}
            </p>
            <div className="flex gap-3 w-full mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                className={`flex-1 ${confirmAction?.type === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                disabled={isLoading}
                onClick={executeAction}
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle className="text-xl font-bold">Booking Details</DialogTitle>
          {selectedBooking && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Customer Info</h4>
                  <div className="text-sm">
                    <p className="font-medium">{selectedBooking.name}</p>
                    <p>{selectedBooking.email}</p>
                    <p>{selectedBooking.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Event Info</h4>
                  <div className="text-sm">
                    <p><strong>Event Date:</strong> {formatDate(selectedBooking.event_date)}</p>
                    <p><strong>Start Date:</strong> {formatDate(selectedBooking.start_date)}</p>
                    <p><strong>End Date:</strong> {formatDate(selectedBooking.end_date)}</p>
                    <p><strong>Guests:</strong> {selectedBooking.guest_count || 'N/A'}</p>
                    <p><strong>Venue:</strong> {selectedBooking.venue_address || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Package & Items</h4>
                <div className="space-y-4">
                  {selectedBooking.packages && type === 'event' && (
                    <Link href="/packages" className="block border rounded-xl overflow-hidden hover:shadow-md transition-all bg-white group hover:border-[#d83a2e]/30">
                      <div className="flex flex-col sm:flex-row p-3 gap-4 items-start sm:items-center">
                        <div className="w-full sm:w-28 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                          {selectedBooking.packages.image_url ? (
                            <img src={selectedBooking.packages.image_url} alt={selectedBooking.packages.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs bg-slate-50">No image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-lg text-[#10253B] group-hover:text-[#d83a2e] transition-colors mb-1 truncate">{selectedBooking.packages.name}</h5>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                            {selectedBooking.packages.guest_max && (
                              <span>Up to {selectedBooking.packages.guest_max} guests</span>
                            )}
                            {selectedBooking.packages.tent_size && (
                              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>{selectedBooking.packages.tent_size}</span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          {selectedBooking.packages.price_type === 'custom_quote' ? (
                            <span className="font-bold text-[#10253B]">Custom Quote</span>
                          ) : selectedBooking.packages.price_cents ? (
                            <span className="font-bold text-[#10253B]">From ${(selectedBooking.packages.price_cents / 100).toFixed(2)}</span>
                          ) : null}
                          <div className="text-xs text-[#d83a2e] font-semibold uppercase tracking-wider mt-1">Package</div>
                        </div>
                      </div>
                    </Link>
                  )}
                  {selectedBooking.tent_id && type === 'rental' && (() => {
                    const tent = inventory.tents.find((t: any) => t.id === selectedBooking.tent_id)
                    if (!tent) return null
                    return (
                      <Link href="/tents" className="block border rounded-xl overflow-hidden hover:shadow-md transition-all bg-white group hover:border-[#d83a2e]/30">
                        <div className="flex flex-col sm:flex-row p-3 gap-4 items-start sm:items-center">
                          <div className="w-full sm:w-28 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                            {tent.image_url ? (
                              <img src={tent.image_url} alt={tent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs bg-slate-50">No image</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-lg text-[#10253B] group-hover:text-[#d83a2e] transition-colors mb-1 truncate">{tent.name}</h5>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>Tent Rental</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="font-bold text-[#10253B]">From ${(tent.price_cents / 100).toFixed(2)}</span>
                            <div className="text-xs text-[#d83a2e] font-semibold uppercase tracking-wider mt-1">Tent</div>
                          </div>
                        </div>
                      </Link>
                    )
                  })()}
                  {selectedBooking.addon_accessories_ids?.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h5 className="font-medium text-slate-700 mb-2 text-sm">Add-on Accessories</h5>
                      <div className="space-y-2">
                        {selectedBooking.addon_accessories_ids.map((accId: string) => {
                          const acc = inventory?.accessories?.find((a: any) => a.id === accId)
                          if (!acc) return null
                          return (
                            <div key={accId} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                              <div className="flex items-center gap-3">
                                {acc.image_url ? (
                                  <img src={acc.image_url} alt={acc.name} className="w-10 h-10 rounded object-cover bg-white shrink-0 border border-slate-200" />
                                ) : (
                                  <div className="w-10 h-10 rounded bg-white shrink-0 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">No img</div>
                                )}
                                <span className="text-sm text-slate-700 font-medium">{acc.name}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {!selectedBooking.packages && !selectedBooking.tent_id && (!selectedBooking.addon_accessories_ids || selectedBooking.addon_accessories_ids.length === 0) && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-500 italic text-sm">
                      No items selected.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


    </div>
  )
}
