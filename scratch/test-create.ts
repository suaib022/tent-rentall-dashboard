import { createBooking } from "../src/lib/actions/bookings"

async function main() {
  try {
    await createBooking({
      name: "Test Customer",
      email: "test@example.com",
      phone: "123456789",
      event_date: "2026-10-15",
      start_date: "2026-10-15",
      end_date: "2026-10-16",
      venue_address: "123 Test St",
      guest_count: 50,
      package_id: null,
      addon_accessories_ids: []
    })
    console.log("Success!")
  } catch (err) {
    console.error(err)
  }
}
main()
