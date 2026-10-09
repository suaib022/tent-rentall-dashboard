# Agent API Contract

All agent requests must be authenticated using the `x-agent-api-key` header matching the `AGENT_API_KEY` environment variable.

All endpoints return a standardized envelope:
```json
{
  "ok": true,
  "status": "received",
  "reference": "Q-2026-0001",
  "message": "Your request has been recorded.",
  "data": null
}
```
If validation fails, the API returns a 422 HTTP status and `ok: false` with a natural language `message` that the agent can read back safely. If a server error occurs, it returns `ok: false` with a generic failure message and logs an agent error.

## Idempotency
All requests must include an `Idempotency-Key` header (or have one generated based on tool + conversation_id + payload). Duplicate requests within 10 minutes return the cached response.

## Endpoints

### POST /api/agent/availability
Checks inventory availability. Never commits business rows.
**Payload:**
- `event_date` (string, ISO date)
- `end_date` (optional string, ISO date)
- `guest_count` (optional integer)
- `tent_style` (optional string)
- `package_name` (optional string)
- `accessories` (optional string[])
**Returns Status:** `tentatively_available`, `not_available`, `needs_review`

### POST /api/agent/quote-request
Records a new quote.
**Payload:**
- `customer`: { `first_name`, `last_name`, `phone`, `email` }
- `event`: { `type`, `date`, `guest_count`, `town`, `address` }
- `package_name`, `tent_style`, `accessories`
- `budget_range`, `notes`
**Returns Status:** `received`

### POST /api/agent/booking-request
Creates a booking pending approval. Requires `customer_confirmed_readback: true`.
**Returns Status:** `pending_approval`

### POST /api/agent/change-request
Logs a change request for an existing booking.
**Payload:**
- `booking_reference`
- `customer`: { `last_name`, `phone`, `email` }
- `change_type`: "reschedule" | "change_guest_count" | "add_items" | "remove_items" | "cancel" | "other"
- `details`
**Returns Status:** `open` or triggers a `human_review` if identity is ambiguous.

### POST /api/agent/owner-consultation
Flags a request directly for the owner.
**Payload:** `customer`, `topic`, `summary`, `urgency`

### POST /api/agent/human-review
Failsafe tool to flag issues.
**Payload:** `reason`, `summary`, `severity`, `customer`, `error_context`
