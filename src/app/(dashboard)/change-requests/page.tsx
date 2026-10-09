import { getChangeRequests } from "@/lib/actions/change-requests"
import { getBookings } from "@/lib/actions/bookings"
import { ChangeRequestList } from "@/components/change-requests/change-request-list"

export const instant = false

export default async function ChangeRequestsPage() {
  const changeRequests = await getChangeRequests()
  const bookings = await getBookings()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground mb-1">Management</h2>
        <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Change Requests</h1>
        <p className="text-muted-foreground mt-2">Manage customer requested modifications to existing bookings.</p>
      </div>
      <ChangeRequestList changeRequests={changeRequests || []} bookings={bookings || []} />
    </div>
  )
}
