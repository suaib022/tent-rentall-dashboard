import re

with open("src/components/bookings/booking-list.tsx", "r") as f:
    text = f.read()

# 1. Add imports
if "from 'date-fns'" not in text:
    text = text.replace("import { Calendar", "import { format, parseISO } from 'date-fns'\nimport Link from 'next/link'\nimport { Calendar")

# 2. Add formatDate function inside BookingList
if "const formatDate =" not in text:
    text = text.replace("export function BookingList", """
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  try {
    return format(parseISO(dateStr), 'MMMM d, yyyy')
  } catch (e) {
    return dateStr
  }
}

export function BookingList""")

# 3. Format the dates in the Details Modal
# We will just replace the exact lines
old_dates = """<p><strong>Event Date:</strong> {selectedBooking.event_date || 'N/A'}</p>
                    <p><strong>Start Date:</strong> {selectedBooking.start_date || 'N/A'}</p>
                    <p><strong>End Date:</strong> {selectedBooking.end_date || 'N/A'}</p>"""

new_dates = """<p><strong>Event Date:</strong> {formatDate(selectedBooking.event_date)}</p>
                    <p><strong>Start Date:</strong> {formatDate(selectedBooking.start_date)}</p>
                    <p><strong>End Date:</strong> {formatDate(selectedBooking.end_date)}</p>"""

text = text.replace(old_dates, new_dates)

# 4. Replace the Package & Items section
old_pkg_section = """<div className="bg-slate-50 p-4 rounded-lg space-y-2">
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
                </div>"""

new_pkg_section = """<div className="space-y-4">
                  {selectedBooking.packages && (
                    <Link href="/packages" className="block border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white group">
                      <div className="flex p-3 gap-4 items-center">
                        <div className="w-20 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          {selectedBooking.packages.image_url ? (
                            <img src={selectedBooking.packages.image_url} alt={selectedBooking.packages.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No image</div>
                          )}
                        </div>
                        <div>
                          <h5 className="font-bold text-[#10253B] group-hover:text-[#d83a2e] transition-colors">{selectedBooking.packages.name}</h5>
                          <p className="text-sm text-slate-500">Package</p>
                        </div>
                      </div>
                    </Link>
                  )}
                  {selectedBooking.addon_accessories_ids?.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h5 className="font-medium text-slate-700 mb-2 text-sm">Add-on Accessories</h5>
                      <div className="space-y-2">
                        {selectedBooking.addon_accessories_ids.map((accId: string) => {
                          const accName = inventory?.accessories?.find((a: any) => a.id === accId)?.name
                          if (!accName) return null
                          return (
                            <div key={accId} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                              <span className="text-sm text-slate-600 font-medium">{accName}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {!selectedBooking.packages && (!selectedBooking.addon_accessories_ids || selectedBooking.addon_accessories_ids.length === 0) && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-500 italic text-sm">
                      No items selected.
                    </div>
                  )}
                </div>"""

text = text.replace(old_pkg_section, new_pkg_section)

with open("src/components/bookings/booking-list.tsx", "w") as f:
    f.write(text)
