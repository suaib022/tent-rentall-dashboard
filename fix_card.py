import re

with open("src/components/bookings/booking-list.tsx", "r") as f:
    text = f.read()

old_link = """<Link href="/packages" className="block border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white group">
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
                    </Link>"""

new_link = """<Link href="/packages" className="block border rounded-xl overflow-hidden hover:shadow-md transition-all bg-white group hover:border-[#d83a2e]/30">
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
                    </Link>"""

text = text.replace(old_link, new_link)

with open("src/components/bookings/booking-list.tsx", "w") as f:
    f.write(text)
