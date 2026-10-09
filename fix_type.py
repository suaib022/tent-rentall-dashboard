import re

with open("src/components/bookings/booking-list.tsx", "r") as f:
    text = f.read()

# 1. Update props
text = text.replace(
    "export function BookingList({ bookings, inventory }: { bookings: any[], inventory: any }) {",
    "export function BookingList({ bookings, inventory, type = 'event' }: { bookings: any[], inventory: any, type?: 'event' | 'rental' }) {"
)

# 2. Filter bookings by type
text = text.replace(
    "const approvedBookings = bookings.filter(b => b.status === 'confirmed')",
    """const typeFiltered = bookings.filter(b => (b.booking_type || 'event') === type)
  const approvedBookings = typeFiltered.filter(b => b.status === 'confirmed')"""
)
text = text.replace("const pendingBookings = bookings.filter", "const pendingBookings = typeFiltered.filter")
text = text.replace("const rejectedBookings = bookings.filter", "const rejectedBookings = typeFiltered.filter")

# 3. Update the form payload in onSubmit
old_payload = """      const payload: any = {
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
      if (package_id && package_id !== 'none') payload.package_id = package_id"""

new_payload = """      const payload: any = {
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
      }"""
text = text.replace(old_payload, new_payload)

# 4. Update the Select field in the form based on type
old_select = """                <div className="space-y-2">
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
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>"""

new_select = """                <div className="space-y-2">
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
                </div>"""
text = text.replace(old_select, new_select)

# 5. Update title text in the modals
text = text.replace("Create Manual Booking", "{type === 'event' ? 'Create Event Booking' : 'Create Tent Rental'}")
text = text.replace("Booking Created!", "{type === 'event' ? 'Booking Created!' : 'Rental Created!'}")
text = text.replace("The manual booking has been", "The manual request has been")
text = text.replace("Approve Booking?", "{confirmAction?.type === 'approve' ? (type === 'event' ? 'Approve Booking?' : 'Approve Rental?') : (type === 'event' ? 'Reject Booking?' : 'Reject Rental?')}")
text = text.replace("Reject Booking?", "{confirmAction?.type === 'approve' ? (type === 'event' ? 'Approve Booking?' : 'Approve Rental?') : (type === 'event' ? 'Reject Booking?' : 'Reject Rental?')}")
text = text.replace("this booking", "this request")

# 6. Update the Tabs labels
text = text.replace("Approved Bookings", "{type === 'event' ? 'Approved Bookings' : 'Approved Rentals'}")
text = text.replace("Booking Requests", "{type === 'event' ? 'Booking Requests' : 'Rental Requests'}")
text = text.replace("No approved bookings found.", "No approved {type === 'event' ? 'bookings' : 'rentals'} found.")
text = text.replace("No rejected bookings found.", "No rejected {type === 'event' ? 'bookings' : 'rentals'} found.")

# 7. Update the Details Modal to show the Tent if it's a rental
old_pkg_details = """                  {selectedBooking.packages && (
                    <Link href="/packages" className="block border rounded-xl overflow-hidden hover:shadow-md transition-all bg-white group hover:border-[#d83a2e]/30">"""

new_pkg_details = """                  {selectedBooking.packages && type === 'event' && (
                    <Link href="/packages" className="block border rounded-xl overflow-hidden hover:shadow-md transition-all bg-white group hover:border-[#d83a2e]/30">"""

text = text.replace(old_pkg_details, new_pkg_details)

old_pkg_details_2 = """                  {selectedBooking.addon_accessories_ids?.length > 0 && ("""

new_pkg_details_2 = """                  {selectedBooking.tent_id && type === 'rental' && (() => {
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
                  {selectedBooking.addon_accessories_ids?.length > 0 && ("""

text = text.replace(old_pkg_details_2, new_pkg_details_2)

# Update empty state
old_empty = """{!selectedBooking.packages && (!selectedBooking.addon_accessories_ids || selectedBooking.addon_accessories_ids.length === 0) && ("""
new_empty = """{!selectedBooking.packages && !selectedBooking.tent_id && (!selectedBooking.addon_accessories_ids || selectedBooking.addon_accessories_ids.length === 0) && ("""
text = text.replace(old_empty, new_empty)

# 8. Render the tent in the standard card view too
old_card_pkg = """                {booking.packages && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Package className="w-4 h-4 mr-2 text-slate-400" />
                    {booking.packages.name}
                  </div>
                )}"""
new_card_pkg = """                {booking.packages && type === 'event' && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Package className="w-4 h-4 mr-2 text-slate-400" />
                    {booking.packages.name}
                  </div>
                )}
                {booking.tent_id && type === 'rental' && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Package className="w-4 h-4 mr-2 text-slate-400" />
                    {inventory?.tents?.find((t: any) => t.id === booking.tent_id)?.name || 'Tent Rental'}
                  </div>
                )}"""
text = text.replace(old_card_pkg, new_card_pkg)

with open("src/components/bookings/booking-list.tsx", "w") as f:
    f.write(text)

