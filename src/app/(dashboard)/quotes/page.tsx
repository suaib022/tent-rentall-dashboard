import { getQuotes } from "@/lib/actions/quotes"
import { getInventoryCounts } from "@/lib/actions/inventory"
import { QuoteList } from "@/components/quotes/quote-list"

export const instant = false

export default async function QuotesPage() {
  const quotes = await getQuotes()
  const inventory = await getInventoryCounts()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground mb-1">Sales & Leads</h2>
        <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Quotes</h1>
        <p className="text-muted-foreground mt-2">Manage all customer quote requests and convert them into bookings.</p>
      </div>
      <QuoteList quotes={quotes || []} inventory={inventory} />
    </div>
  )
}
