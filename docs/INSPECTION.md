# Inspection Report

## n8n Workflow (`n8n-workflow-crud.json`)

**Nodes:**
- `Webhook`, `Webhook1`, `Webhook2`, `Webhook3`, `Webhook4`, `Webhook5` (Type: `n8n-nodes-base.webhook`, Version: 2.1)
- `Sticky Note1` to `Sticky Note6` (Type: `n8n-nodes-base.stickyNote`, Version: 1)
- `Get a row`, `Create a row`, `Update a row`, `Delete a row` (Type: `n8n-nodes-base.supabase`, Version: 1)
- `Respond to Webhook`, `Respond to Webhook1`, `Respond to Webhook2` (Type: `n8n-nodes-base.respondToWebhook`, Version: 1.4)
- `Edit Fields`, `Edit Fields1` (Type: `n8n-nodes-base.set`, Version: 3.4)

**Webhook Methods and Paths:**
- `GET /07aaa04d-6c73-416f-82e2-1e6ededeacc4`
- `POST /07aaa04d-6c73-416f-82e2-1e6ededeacc4`
- `PUT /07aaa04d-6c73-416f-82e2-1e6ededeacc4`
- `PATCH /07aaa04d-6c73-416f-82e2-1e6ededeacc4`
- `DELETE /07aaa04d-6c73-416f-82e2-1e6ededeacc4`
- `HEAD /07aaa04d-6c73-416f-82e2-1e6ededeacc4`

**Supabase Credential Reference:**
- `id`: `V8O33LSd8sJmwVDm`
- `name`: `Supabase account`

**Settings:**
- `executionOrder`: `"v1"`
- `binaryMode`: `"separate"`

## Supabase Schema
**Tables:**
- `customers`, `tent_styles`, `packages`, `addon_packages`, `accessories`, `inventory_items`, `catalog_inventory_map`, `availability_blocks`
- `quote_requests`, `quote_items`, `bookings`, `booking_items`, `booking_tasks`, `payments`, `events`
- `change_requests`, `review_items`, `conversations`, `agent_requests`, `notifications`, `audit_log`, `rate_limits`, `settings`

**Missing columns to add in migration:**
- `change_requests`: `before_snapshot`, `availability_result`, `availability_flag`
