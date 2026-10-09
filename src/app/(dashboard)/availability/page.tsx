export const instant = false;

import { getApprovedBookings } from "@/lib/actions/bookings"
import { getInventoryCounts } from "@/lib/actions/inventory"
import { AvailabilityView } from "@/components/schedule/availability-view"

export default async function AvailabilityPage() {
  const [bookings, inventory] = await Promise.all([
    getApprovedBookings(),
    getInventoryCounts()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground mb-1">Operations</h2>
        <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Real-time Availability</h1>
        <p className="text-muted-foreground mt-2">Check availability for packages and tents across the next 14 days.</p>
      </div>
      <AvailabilityView bookings={bookings || []} inventory={inventory} />
    </div>
  )
}
