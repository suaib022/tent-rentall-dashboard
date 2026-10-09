import re

with open("src/components/bookings/booking-list.tsx", "r") as f:
    text = f.read()

# I will just write a python script to output the correct file content completely and cleanly.

clean_content = """'use client'

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
import { Calendar, User, Package, Plus, MapPin, Check as CheckIcon } from "lucide-react"

export function BookingList({ bookings, inventory }: { bookings: any[], inventory: any }) {
  const [open, setOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [eventDate, setEventDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const approvedBookings = bookings.filter(b => b.status === 'confirmed')
  const pendingBookings = bookings.filter(b => b.status === 'pending_approval' || b.status === 'tentative')
  const rejectedBookings = bookings.filter(b => b.status === 'cancelled')

  const handleApprove = async (id: string) => {
    await updateBookingStatus(id, 'confirmed')
  }

  const handleReject = async (id: string) => {
    await updateBookingStatus(id, 'cancelled')
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
      }
      const package_id = fd.get('package_id')
      if (package_id && package_id !== 'none') payload.package_id = package_id

      const accessory_ids = fd.getAll('addon_accessories_ids')
      if (accessory_ids.length > 0) payload.addon_accessories_ids = accessory_ids

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
          <div className="flex items-center gap-3">
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
              <Button onClick={() => handleApprove(booking.id)} className="bg-green-600 hover:bg-green-700 w-full">
                Approve
              </Button>
              <Button onClick={() => handleReject(booking.id)} variant="destructive" className="w-full">
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
          <DialogTrigger render={<Button className="bg-[#d83a2e] hover:bg-[#b02b22]" />}>
            <Plus className="w-4 h-4 mr-2" /> Create Booking
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Manual Booking</DialogTitle>
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
                  <Label>Select Package (Optional)</Label>
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
                        <SelectItem key={p.id} value={p.id} label={p.name} title={p.name} textValue={p.name}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <DialogTitle className="text-2xl font-bold tracking-tight text-[#10253B]">Booking Created!</DialogTitle>
              <p className="text-slate-500 text-sm max-w-[250px] mx-auto leading-relaxed">
                The manual booking has been successfully created and added to the schedule for approval.
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
          <TabsTrigger value="bookings">Approved Bookings</TabsTrigger>
          <TabsTrigger value="requests">Booking Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          {approvedBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              No approved bookings found.
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
                  No rejected bookings found.
                </div>
              ) : (
                rejectedBookings.map(renderBookingCard)
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
                    <p><strong>Event Date:</strong> {selectedBooking.event_date || 'N/A'}</p>
                    <p><strong>Start Date:</strong> {selectedBooking.start_date || 'N/A'}</p>
                    <p><strong>End Date:</strong> {selectedBooking.end_date || 'N/A'}</p>
                    <p><strong>Guests:</strong> {selectedBooking.guest_count || 'N/A'}</p>
                    <p><strong>Venue:</strong> {selectedBooking.venue_address || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Package & Items</h4>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  {selectedBooking.packages && (
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-medium text-[#10253B]">{selectedBooking.packages.name}</span>
                      <span className="text-sm text-slate-500">Package</span>
                    </div>
                  )}
                  {selectedBooking.addon_accessories_ids?.map((accId: string) => {
                    const accName = inventory?.accessories?.find((a: any) => a.id === accId)?.name
                    if (!accName) return null
                    return (
                      <div key={accId} className="flex justify-between items-center py-1">
                        <span className="text-sm text-slate-700">{accName}</span>
                        <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">Add-on</span>
                      </div>
                    )
                  })}
                  {!selectedBooking.packages && (!selectedBooking.addon_accessories_ids || selectedBooking.addon_accessories_ids.length === 0) && (
                    <p className="text-sm text-slate-500 italic">No items selected.</p>
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
"""

with open("src/components/bookings/booking-list.tsx", "w") as f:
    f.write(clean_content)

