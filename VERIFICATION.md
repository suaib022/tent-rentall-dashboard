# Verification

## Validator Script
`node scripts/validate-n8n.mjs`
**Status:** Passed

## Code-node Tests
`node scripts/test-code-nodes.mjs`
**Status:** Passed

## SQL Tests
**Status:** Skipped
**Reason:** Docker is not running locally (`failed to connect to the docker API`), so a local Supabase instance could not be spun up.
**Exact Commands to run:**
```bash
# If using supabase CLI
supabase start
supabase db push
# Write your SQL tests to scripts/test-sql.sql and run:
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f scripts/test-sql.sql
```

## Local Runtime / Smoke Test
**Status:** Skipped
**Reason:** Local Supabase (Docker) is required to run the agent APIs fully, and Docker is unavailable.
**Exact Commands to run:**
```bash
# Start local n8n via docker
docker run -d --name n8n -p 5678:5678 n8nio/n8n

# In another terminal, import the workflow
docker exec -it n8n n8n import:workflow --input=n8n/oakdale-agent.workflow.json

# Activate the workflow if needed, setup credentials in n8n UI, then run:
export N8N_BASE_URL="http://localhost:5678"
export AGENT_API_KEY="your_test_key"
./scripts/smoke-n8n.sh
```
