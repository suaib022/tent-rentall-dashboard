# n8n Agent API Contract

This document outlines the API contract for the Oakdale Agent API hosted in n8n.

## Base URL
Production: `https://<N8N_HOST>/webhook/agent`

## Authentication
All endpoints (except `/health` and `/conversation-log`) require the `x-agent-api-key` header.
```
x-agent-api-key: YOUR_SECRET_KEY
```

## Common Request Envelope
Every request MUST include `conversation_id`. `is_text_only` can be provided (true/false) to infer the channel.

## Common Response Envelope
Responses return a standard envelope and HTTP 200 (unless validation fails).

```json
{
  "ok": true,
  "status": "tentatively_available",
  "message": "Speakable text here",
  "reference": "B-2024-0001",
  "data": null
}
```

## Endpoints

### 1. Availability
`POST /availability`
Checks if inventory and date are free.

**Request:**
```json
{
  "conversation_id": "123",
  "event_date": "2024-06-15",
  "guest_count": 50,
  "tent_style": "Pole Tent",
  "accessories": ["Lighting"]
}
```
**Response:**
```json
{
  "ok": true,
  "status": "tentatively_available",
  "message": "That date is tentatively available. This is not a confirmed booking and nothing is held yet.",
  "reference": null,
  "data": null
}
```

### 2. Change Availability
`POST /change-availability`
Proposes a change to an existing booking.

**Request:**
```json
{
  "conversation_id": "123",
  "booking_reference": "B-2024-0010",
  "phone": "5165550123",
  "change_type": "reschedule",
  "current_event_date": "2024-06-15",
  "new_event_date": "2024-06-22"
}
```

### 3. Quote Request
`POST /quote-request`
Generates a quote request for review.

**Request:**
```json
{
  "conversation_id": "123",
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "5165550123"
  },
  "event": {
    "type": "Wedding",
    "date": "2024-08-10",
    "guest_count": 100
  }
}
```

### 4. Booking Request
`POST /booking-request`
Submits a booking for team approval. `customer_confirmed_readback` must be `true`.

**Request:**
```json
{
  "conversation_id": "123",
  "customer_confirmed_readback": true,
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "5165550123"
  },
  "event": {
    "date": "2024-08-10",
    "guest_count": 100
  },
  "allow_conflict": false
}
```

### 5. Change Request
`POST /change-request`
Submits a confirmed change request. `customer_confirmed_readback` must be `true`.

**Request:**
```json
{
  "conversation_id": "123",
  "customer_confirmed_readback": true,
  "booking_reference": "B-2024-0010",
  "phone": "5165550123",
  "change_type": "reschedule",
  "new_event_date": "2024-06-22"
}
```

### 6. Owner Consultation
`POST /owner-consultation`

**Request:**
```json
{
  "conversation_id": "123",
  "customer": {
    "name": "Jane Doe",
    "phone": "5165550123"
  },
  "topic": "Custom Venue Setup",
  "summary": "Customer needs owner advice on steep hill setup."
}
```

### 7. Human Review
`POST /human-review`
Flag conversation for a human.

**Request:**
```json
{
  "conversation_id": "123",
  "reason": "Customer is frustrated",
  "summary": "Agent repeatedly misunderstood the date"
}
```

### 8. Conversation Log
`POST /conversation-log` (No Auth required for testing, ElevenLabs uses signature)
Saves the post-call log.
