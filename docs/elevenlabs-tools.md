# ElevenLabs Tool Definitions

Below are the tool definitions ready to be configured in ElevenLabs for the agent.

## Common Configuration for all tools
- **Method:** POST
- **Headers:**
  - `x-agent-api-key`: [Set as a secret in ElevenLabs]
- **Dynamic Variables (Always send these parameters):**
  - `conversation_id`: `{{system__conversation_id}}`
  - `is_text_only`: `{{system__is_text_only}}`

---

## 1. check_availability
**URL:** `https://<N8N_HOST>/webhook/agent/availability`
**Description:** Use this tool to check if a specific date and inventory is available. Call this when the customer asks for dates or you are building a quote.
**Parameters:**
- `event_date` (string, required): The date of the event in YYYY-MM-DD format (e.g., 2024-07-15).
- `guest_count` (integer, optional): The estimated number of guests.
- `tent_style` (string, optional): The exact catalog name of the tent style (e.g. "Pole Tent").
- `package_name` (string, optional): The exact catalog name of the package.
- `accessories` (array of strings, optional): List of requested accessories.

## 2. check_change_availability
**URL:** `https://<N8N_HOST>/webhook/agent/change-availability`
**Description:** Use this tool to see if a proposed change (reschedule, changing items) to an existing booking is possible before submitting the actual change request.
**Parameters:**
- `booking_reference` (string, required): The booking reference (e.g. B-2024-0010).
- `phone` (string, optional): Customer phone (digits only e.g. 5165550123).
- `email` (string, optional): Customer email.
- `last_name` (string, optional): Customer last name.
- `current_event_date` (string, required): The current date of the event (YYYY-MM-DD).
- `change_type` (string, required): Must be one of: reschedule, change_guest_count, change_location, add_items, remove_items, change_package, cancel, other.
- `new_event_date` (string, optional): The proposed new date (YYYY-MM-DD).

## 3. create_quote_request
**URL:** `https://<N8N_HOST>/webhook/agent/quote-request`
**Description:** Call this tool when a customer wants to get a price quote. It records their information and event details for the team.
**Parameters:**
- `customer` (object, required):
  - `first_name` (string): First name
  - `last_name` (string): Last name
  - `phone` (string): Digits only (e.g. 5165550123)
  - `email` (string): standard email format
- `event` (object, required):
  - `type` (string): Kind of event
  - `date` (string, optional): Date YYYY-MM-DD
  - `guest_count` (integer): Number of guests
  - `town` (string, optional): Venue town
- `tent_style` (string, optional): Name of tent
- `package_name` (string, optional): Name of package
- `accessories` (array of strings, optional): Extras

## 4. create_booking_request
**URL:** `https://<N8N_HOST>/webhook/agent/booking-request`
**Description:** Call this tool to finalize a booking request for the customer. You MUST read back their details and ask for explicit confirmation before calling this.
**Parameters:**
- `customer_confirmed_readback` (boolean, required): Set true only after the customer clearly said yes to the read-back.
- `customer` (object, required): Same structure as quote (first_name, last_name, phone, email).
- `event` (object, required): Same structure as quote, but `date` is required.
- `allow_conflict` (boolean, optional): If the date is known to have a conflict but the customer insists on proceeding, set this to true. Default false.

## 5. create_change_request
**URL:** `https://<N8N_HOST>/webhook/agent/change-request`
**Description:** Call this tool to submit an official change to an existing booking. You MUST read back the change and ask for explicit confirmation before calling this.
**Parameters:**
- `customer_confirmed_readback` (boolean, required): Set true only after the customer clearly said yes to the read-back.
- `booking_reference` (string, required): The booking reference ID.
- `phone` / `email` / `last_name` (string, required): Identity verification details.
- `current_event_date` (string, required): YYYY-MM-DD.
- `change_type` (string, required): type of change.
- `new_event_date` (string, optional): YYYY-MM-DD.
- `allow_conflict` (boolean, optional): True if they insist despite conflict. Default false.
- `details` (string, optional): Detailed explanation of the change.
- `requested_changes` (object, optional): JSON object of the exact changes.

## 6. request_owner_consultation
**URL:** `https://<N8N_HOST>/webhook/agent/owner-consultation`
**Description:** Call this when a customer explicitly requests to speak with the owner, or needs complex consultation outside your abilities.
**Parameters:**
- `customer` (object, optional): `name`, `phone`, `email`
- `topic` (string, required): What the consultation is about.
- `summary` (string, required): Summary of the conversation context.
- `urgency` (string, optional): low, normal, high, urgent.

## 7. flag_for_human_review
**URL:** `https://<N8N_HOST>/webhook/agent/human-review`
**Description:** Call this if you encountered an error, cannot resolve the user's issue, or the user is frustrated and needs human intervention.
**Parameters:**
- `customer` (object, optional): `name`, `phone`, `email`
- `reason` (string, required): The reason for flagging.
- `summary` (string, required): Summary of what happened.
- `severity` (string, optional): low, normal, high, urgent.
