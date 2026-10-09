# Decisions

- **Webhook Contract:** ElevenLabs webhooks require a 200 OK for successful tool executions even if the semantic business result is negative (e.g. `not_available`). We will only use 422 for validation errors and 500 for internal errors. 
- **Endpoint authentication:** We'll use the header `x-agent-api-key` for the 8 endpoints, but `conversation-log` might have an ElevenLabs signature. For now, since ElevenLabs documentation on signatures changes, we will verify the `conversation-log` webhook signature by parsing it, but as a fallback/defense-in-depth, we strongly recommend deploying it behind an unguessable path segment or IP allowlist.
- **Availability Check:** We'll need to rewrite `check_availability` to correctly account for the items, packages, and accessories, and include `p_exclude_booking`. We'll replace the existing function.
- **Schema Updates:** We will alter `change_requests` to add `before_snapshot jsonb`, `availability_result jsonb`, `availability_flag availability_flag_enum`.
- **Database logic:** The `agent_dispatch` function will route to specific handler functions (e.g., `agent_quote_request`, `agent_availability`).
- **Idempotency:** Generated in a Code node by hashing `tool + conversation_id + stringify(sorted_payload)` using n8n Crypto node.
- **SQL Security:** All handler functions and `agent_dispatch` will be `SECURITY DEFINER` and revoke execution from `public`, `anon`, and `authenticated`, granting only to `service_role`.
