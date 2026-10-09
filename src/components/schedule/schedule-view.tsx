'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, ArrowRight, User, Package, Tent } from "lucide-react"
import { addDays, format, isWithinInterval, parseISO } from "date-fns"

export function ScheduleView({ bookings, inventory }: { bookings: any[], inventory: any }) {
  // Compute the next 14 days
  const today = new Date()
  const days = Array.from({ length: 14 }).map((_, i) => addDays(today, i))

  return (
    <div className="space-y-12">
      {/* Availability Overview */}
      {/* Upcoming Approved Bookings */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight text-[#10253B]">Upcoming Approved Bookings</h3>
        <div className="space-y-3">
          {bookings.length === 0 && (
            <div className="text-slate-500 italic p-4 bg-slate-50 rounded-lg text-center">
              No approved bookings to display.
            </div>
          )}
          {bookings.map(booking => (
            <Card key={booking.id} className="p-4 border-l-4 border-l-green-500">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">APPROVED</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm mt-2">
                    <div className="flex items-center font-bold text-[#10253B]">
                      <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                      {booking.start_date} {booking.end_date && booking.end_date !== booking.start_date && <><ArrowRight className="inline w-3 h-3 mx-1" />{booking.end_date}</>}
                    </div>
                    <div className="flex items-center text-slate-600">
                      <User className="w-4 h-4 mr-2 text-slate-400" />
                      {booking.name}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 text-sm text-right">
                  {booking.packages && (
                    <div className="flex items-center justify-end text-slate-700">
                      <Package className="w-4 h-4 mr-2 text-slate-400" />
                      {booking.packages.name}
                    </div>
                  )}
                  {booking.addon_accessories_ids?.map((accId: string) => {
                    const accName = inventory?.accessories?.find((a: any) => a.id === accId)?.name
                    if (!accName) return null
                    return (
                      <div key={accId} className="flex items-center justify-end text-slate-700">
                        <Package className="w-4 h-4 mr-2 text-slate-400" />
                        + {accName}
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
