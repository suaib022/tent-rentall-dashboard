import { getBookings } from "@/lib/actions/bookings"
import { getInventoryCounts } from "@/lib/actions/inventory"
import { BookingList } from "@/components/bookings/booking-list"

export const instant = false

export default async function BookingsPage() {
  const bookings = await getBookings()
  const inventory = await getInventoryCounts()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground mb-1">Management</h2>
        <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Bookings</h1>
        <p className="text-muted-foreground mt-2">Manage all booking and rental requests. Approve pending requests to reserve inventory.</p>
      </div>
      <BookingList bookings={bookings || []} inventory={inventory} />
    </div>
  )
}
