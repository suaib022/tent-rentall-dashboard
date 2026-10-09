export const instant = false;

import { getApprovedBookings } from "@/lib/actions/bookings"
import { getInventoryCounts } from "@/lib/actions/inventory"
import { ScheduleView } from "@/components/schedule/schedule-view"

export default async function SchedulePage() {
  const [bookings, inventory] = await Promise.all([
    getApprovedBookings(),
    getInventoryCounts()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground mb-1">Operations</h2>
        <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Schedule & Availability</h1>
        <p className="text-muted-foreground mt-2">View approved events and real-time inventory availability.</p>
      </div>
      <ScheduleView bookings={bookings || []} inventory={inventory} />
    </div>
  )
}
