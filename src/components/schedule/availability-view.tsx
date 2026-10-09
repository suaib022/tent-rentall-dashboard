'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { addDays, format, parseISO } from "date-fns"
import { Search, Calendar as CalendarIcon, X } from "lucide-react"

export function AvailabilityView({ bookings, inventory }: { bookings: any[], inventory: any }) {
  const [startDate, setStartDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  let days: Date[] = []
  if (startDate) {
    days = [parseISO(startDate)]
  } else {
    const today = new Date()
    days = Array.from({ length: 14 }).map((_, i) => addDays(today, i))
  }

  const filteredPackages = inventory.packages.filter((pkg: any) => {
    if (!searchQuery) return true;
    return searchQuery === `pkg_${pkg.id}`;
  })
  
  const filteredTents = inventory.tents.filter((tent: any) => {
    if (!searchQuery) return true;
    return searchQuery === `tent_${tent.id}`;
  })

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <select 
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          >
            <option value="">All Packages & Tents</option>
            <optgroup label="Packages">
              {inventory.packages.map((p: any) => (
                <option key={`pkg_${p.id}`} value={`pkg_${p.id}`}>{p.name}</option>
              ))}
            </optgroup>
            <optgroup label="Tents">
              {inventory.tents.map((t: any) => (
                <option key={`tent_${t.id}`} value={`tent_${t.id}`}>{t.name}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div className="relative w-full md:w-64">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="date"
            className="pl-9 pr-9"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          {startDate && (
            <button 
              type="button" 
              onClick={() => setStartDate('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#10253B]">
        Daily Availability Overview {startDate ? `(${format(parseISO(startDate), 'MMM d, yyyy')})` : '(Next 14 Days)'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd')
          
          const overlapping = bookings.filter(b => {
            if (!b.start_date && !b.event_date) return false
            const startStr = b.start_date || b.event_date
            const endStr = b.end_date || startStr
            // Using string comparison (yyyy-MM-dd) is safe and avoids timezone/time-of-day bugs
            return dateStr >= startStr && dateStr <= endStr
          })

          const packageUsage: Record<string, number> = {}
          const tentUsage: Record<string, number> = {}
          
          overlapping.forEach(b => {
            // Count package usage
            if (b.package_id) {
              packageUsage[b.package_id] = (packageUsage[b.package_id] || 0) + 1
            }
            // If we needed to count tent usage directly:
            if (b.tent_id || b.tent_style_id) {
              const tid = b.tent_id || b.tent_style_id
              tentUsage[tid] = (tentUsage[tid] || 0) + 1
            }
          })

          return (
            <Card key={dateStr} className="p-4 border-slate-200">
              <div className="font-bold text-[#10253B] border-b pb-2 mb-3 flex items-center justify-between">
                <span>{format(date, 'MMM d, yyyy')}</span>
                <Badge variant="outline" className="text-xs bg-slate-50">{overlapping.length} Bookings</Badge>
              </div>
              <div className="space-y-4 text-sm">
                
                {filteredPackages.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-700 mb-2">Packages</h4>
                    {filteredPackages.map((pkg: any) => {
                      const used = packageUsage[pkg.id] || 0
                      const available = pkg.quantity - used
                      return (
                        <div key={pkg.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            {pkg.image_url ? (
                              <img src={pkg.image_url} alt={pkg.name} className="w-8 h-8 rounded object-cover shrink-0 bg-slate-100" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-slate-100 shrink-0 flex items-center justify-center text-[8px] text-slate-400">No img</div>
                            )}
                            <span className="text-slate-700 font-medium truncate text-sm" title={pkg.name}>{pkg.name}</span>
                          </div>
                          <span className={`font-mono font-bold shrink-0 ${available <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {available}/{pkg.quantity}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {filteredTents.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-700 mb-2">Tents</h4>
                    {filteredTents.map((tent: any) => {
                      const used = tentUsage[tent.id] || 0;
                      const available = tent.quantity - used;
                      return (
                        <div key={tent.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            {tent.image_url ? (
                              <img src={tent.image_url} alt={tent.name} className="w-8 h-8 rounded object-cover shrink-0 bg-slate-100" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-slate-100 shrink-0 flex items-center justify-center text-[8px] text-slate-400">No img</div>
                            )}
                            <span className="text-slate-700 font-medium truncate text-sm" title={tent.name}>{tent.name}</span>
                          </div>
                          <span className={`font-mono font-bold shrink-0 ${available <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {available}/{tent.quantity}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {filteredPackages.length === 0 && filteredTents.length === 0 && (
                  <div className="text-slate-400 italic">No matching items found.</div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
