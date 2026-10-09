"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { updateQuoteStatus, createQuote } from "@/lib/actions/quotes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { Calendar, User, Package, Plus, MapPin, Check as CheckIcon, Tent } from "lucide-react"

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  try {
    return format(parseISO(dateStr), 'MMMM d, yyyy')
  } catch (e) {
    return dateStr
  }
}

export function QuoteList({ quotes, inventory }: { quotes: any[], inventory: any }) {
  const [open, setOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'accept' | 'decline', id: string } | null>(null)
  const [eventDate, setEventDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const newQuotes = quotes.filter(q => q.status === 'new' || q.status === 'sent')
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted')
  const declinedQuotes = quotes.filter(q => q.status === 'declined')

  const executeAction = async () => {
    if (!confirmAction) return
    setIsLoading(true)
    try {
      if (confirmAction.type === 'accept') {
        await updateQuoteStatus(confirmAction.id, 'accepted')
      } else {
        await updateQuoteStatus(confirmAction.id, 'declined')
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
        name: fd.get('name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        event_date: fd.get('event_date'),
        venue_address: fd.get('venue_address'),
        guest_count: Number(fd.get('guest_count')),
      }
      
      const package_id = fd.get('package_id')
      if (package_id && package_id !== 'none') payload.package_id = package_id
      
      const tent_style_id = fd.get('tent_style_id')
      if (tent_style_id && tent_style_id !== 'none') payload.tent_style_id = tent_style_id

      await createQuote(payload)
      setOpen(false)
      setEventDate('')
      form.reset()
      setShowSuccess(true)
    } catch (error: any) {
      console.error("Failed to create quote:", error)
      setErrorMessage(error?.message || 'Unknown error occurred while creating quote.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderQuoteCard = (quote: any) => (
    <Card key={quote.id} className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-[#10253B]">
              Quote #{quote.reference || quote.id.split('-')[0]}
            </h3>
            <Badge variant="outline" className={`
              ${quote.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
              ${quote.status === 'sent' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
              ${quote.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : ''}
              ${quote.status === 'declined' ? 'bg-slate-50 text-slate-700 border-slate-200' : ''}
            `}>
              {quote.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Event Date: {formatDate(quote.event_date)}</span>
            </div>
            {quote.venue_address && (
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate" title={quote.venue_address}>{quote.venue_address}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>{quote.guest_count || 'N/A'} Guests</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px]">
          <Button onClick={() => setSelectedQuote(quote)} variant="outline" className="w-full">
            Details
          </Button>
          {quote.status === 'new' || quote.status === 'sent' ? (
            <>
              <Button onClick={() => setConfirmAction({ type: 'accept', id: quote.id })} className="bg-green-600 hover:bg-green-700 w-full">
                Accept Quote
              </Button>
              <Button onClick={() => setConfirmAction({ type: 'decline', id: quote.id })} variant="destructive" className="w-full">
                Decline Quote
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
            <Plus className="w-4 h-4 mr-2" /> Create Quote Request
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Quote Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onChange={(e) => setEventDate(e.target.value)}
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
                  <Label>Select Package (Optional)</Label>
                  <Select name="package_id" defaultValue="none">
                    <SelectTrigger>
                      <SelectValue placeholder="No Package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- No Package --</SelectItem>
                      {inventory.packages.map((pkg: any) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} ({pkg.quantity} total)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Tent Style (Optional)</Label>
                  <Select name="tent_style_id" defaultValue="none">
                    <SelectTrigger>
                      <SelectValue placeholder="No Tent Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- No Tent Style --</SelectItem>
                      {inventory.tents.map((tent: any) => (
                        <SelectItem key={tent.id} value={tent.id}>
                          {tent.name} ({tent.quantity} total)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-200">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} className="bg-[#10253B] hover:bg-slate-800">
                  {isLoading ? 'Creating...' : 'Create Quote'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="new">New & Sent ({newQuotes.length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({acceptedQuotes.length})</TabsTrigger>
          <TabsTrigger value="declined">Declined ({declinedQuotes.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="space-y-4">
          {newQuotes.length === 0 ? <p className="text-slate-500 py-8 text-center bg-white rounded-xl border border-slate-200">No active quotes.</p> : newQuotes.map(renderQuoteCard)}
        </TabsContent>
        <TabsContent value="accepted" className="space-y-4">
          {acceptedQuotes.length === 0 ? <p className="text-slate-500 py-8 text-center bg-white rounded-xl border border-slate-200">No accepted quotes.</p> : acceptedQuotes.map(renderQuoteCard)}
        </TabsContent>
        <TabsContent value="declined" className="space-y-4">
          {declinedQuotes.length === 0 ? <p className="text-slate-500 py-8 text-center bg-white rounded-xl border border-slate-200">No declined quotes.</p> : declinedQuotes.map(renderQuoteCard)}
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      <Dialog open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle className="text-xl font-bold">Quote Details</DialogTitle>
          {selectedQuote && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Customer Info</h4>
                  <div className="text-sm">
                    {/* Assuming we might have customer relations in quotes table, if not fallback to quote email */}
                    <p className="font-medium">Customer</p>
                    <p>{selectedQuote.email || 'No email'}</p>
                    <p>{selectedQuote.phone || 'No phone'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Event Info</h4>
                  <div className="text-sm">
                    <p><strong>Event Date:</strong> {formatDate(selectedQuote.event_date)}</p>
                    <p><strong>Guests:</strong> {selectedQuote.guest_count || 'N/A'}</p>
                    <p><strong>Venue:</strong> {selectedQuote.venue_address || 'N/A'}</p>
                    <p><strong>Budget Range:</strong> {selectedQuote.budget_range || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Requested Items</h4>
                <div className="space-y-4">
                  {selectedQuote.packages && (
                    <Link href="/packages" className="block border rounded-xl overflow-hidden hover:shadow-md transition-all bg-white group hover:border-[#d83a2e]/30">
                      <div className="flex flex-col sm:flex-row p-3 gap-4 items-start sm:items-center">
                        <div className="w-full sm:w-28 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                          {selectedQuote.packages.image_url ? (
                            <img src={selectedQuote.packages.image_url} alt={selectedQuote.packages.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs bg-slate-50">No image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-lg text-[#10253B] group-hover:text-[#d83a2e] transition-colors mb-1 truncate">{selectedQuote.packages.name}</h5>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                            {selectedQuote.packages.guest_max && (
                              <span>Up to {selectedQuote.packages.guest_max} guests</span>
                            )}
                            {selectedQuote.packages.tent_size && (
                              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>{selectedQuote.packages.tent_size}</span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-xs text-[#d83a2e] font-semibold uppercase tracking-wider mt-1">Package</div>
                        </div>
                      </div>
                    </Link>
                  )}
                  {selectedQuote.tent_styles && (
                    <Link href="/tents" className="block border rounded-xl overflow-hidden hover:shadow-md transition-all bg-white group hover:border-[#d83a2e]/30">
                      <div className="flex flex-col sm:flex-row p-3 gap-4 items-start sm:items-center">
                        <div className="w-full sm:w-28 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                          {selectedQuote.tent_styles.image_url ? (
                            <img src={selectedQuote.tent_styles.image_url} alt={selectedQuote.tent_styles.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs bg-slate-50">No image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-lg text-[#10253B] group-hover:text-[#d83a2e] transition-colors mb-1 truncate">{selectedQuote.tent_styles.name}</h5>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>Tent Style</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-xs text-[#d83a2e] font-semibold uppercase tracking-wider mt-1">Tent</div>
                        </div>
                      </div>
                    </Link>
                  )}
                  {!selectedQuote.packages && !selectedQuote.tent_styles && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-500 italic text-sm">
                      No specific items requested.
                    </div>
                  )}
                </div>
              </div>

              {selectedQuote.message && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Customer Message</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm whitespace-pre-wrap">
                    {selectedQuote.message}
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
          <DialogTitle className="text-2xl mb-2">Quote Created!</DialogTitle>
          <p className="text-slate-500 mb-6">The quote request has been successfully generated.</p>
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
            Are you sure you want to {confirmAction?.type} this quote?
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant={confirmAction?.type === 'decline' ? 'destructive' : 'default'}
              className={confirmAction?.type === 'accept' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
              onClick={executeAction}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : confirmAction?.type === 'accept' ? "Yes, Accept" : "Yes, Decline"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
