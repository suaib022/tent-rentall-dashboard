import json
import uuid

def gen_id():
    return str(uuid.uuid4())

workflow = {
  "name": "Oakdale Agent API",
  "nodes": [],
  "pinData": {},
  "connections": {},
  "active": False,
  "settings": {
    "executionOrder": "v1"
  },
  "versionId": gen_id(),
  "meta": {},
  "nodeGroups": [],
  "tags": []
}

endpoints = [
    {"name": "health", "method": "GET", "auth": False},
    {"name": "availability", "method": "POST", "auth": True},
    {"name": "change-availability", "method": "POST", "auth": True},
    {"name": "quote-request", "method": "POST", "auth": True},
    {"name": "booking-request", "method": "POST", "auth": True},
    {"name": "change-request", "method": "POST", "auth": True},
    {"name": "owner-consultation", "method": "POST", "auth": True},
    {"name": "human-review", "method": "POST", "auth": True},
    {"name": "conversation-log", "method": "POST", "auth": False, "raw": True},
]

y_pos = 100

normalize_code = """
const body = typeof $json.body === 'string' ? JSON.parse($json.body) : $json.body || {};
let conversation_id = body.conversation_id;
const is_text_only = body.is_text_only === true;
const channel = is_text_only ? 'chat' : 'voice';
const client_ip = $json.headers ? ($json.headers['x-forwarded-for'] || $json.headers['x-real-ip'] || 'unknown') : 'unknown';

let valid = true;
let message = 'OK';
let http_status = 200;

if (!conversation_id) {
    valid = false;
    message = 'conversation_id is required';
    http_status = 422;
}

if (body.customer) {
    if (body.customer.phone) {
        let p = String(body.customer.phone).replace(/[^0-9+]/g, '');
        if (p.length === 10 && !p.startsWith('+')) p = '+1' + p;
        body.customer.phone = p;
    }
    if (body.customer.email) body.customer.email = String(body.customer.email).toLowerCase().trim();
}
if (body.event && body.event.guest_count !== undefined) {
    let gc = parseInt(body.event.guest_count);
    if (isNaN(gc) || gc < 1 || gc > 2000) {
        valid = false;
        message = 'guest_count must be between 1 and 2000';
        http_status = 422;
    } else {
        body.event.guest_count = gc;
    }
}
if (body.event && body.event.date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.event.date)) {
        valid = false;
        message = 'date must be YYYY-MM-DD';
        http_status = 422;
    } else if (new Date(body.event.date) < new Date(new Date().toISOString().split('T')[0])) {
        valid = false;
        message = 'date cannot be in the past';
        http_status = 422;
    }
}
if (body.notes && body.notes.length > 2000) body.notes = body.notes.substring(0, 2000);

if (body.accessories && Array.isArray(body.accessories)) {
    body.accessories = body.accessories.map(a => String(a));
}
if (body.add_items && Array.isArray(body.add_items)) {
    body.add_items = body.add_items.map(a => String(a));
}
if (body.remove_items && Array.isArray(body.remove_items)) {
    body.remove_items = body.remove_items.map(a => String(a));
}

let sortedPayload = '';
try {
    sortedPayload = JSON.stringify(body, Object.keys(body).sort());
} catch(e) {}

return {
    valid,
    http_status,
    payload: body,
    idempotency_key: '',
    channel,
    client_ip,
    message,
    sortedPayload
};
"""

error_envelope_code = """
return {
    http_status: $json.http_status,
    body: {
        ok: false,
        status: 'validation_error',
        message: $json.message,
        reference: null,
        data: null
    }
};
"""

rpc_error_envelope = """
return {
    http_status: 500,
    body: {
        ok: false,
        status: 'error',
        message: "I'm having trouble right now. The team will follow up.",
        reference: null,
        data: null
    }
};
"""

rpc_success_envelope = """
return {
    http_status: $json.http_status,
    body: typeof $json.body === 'string' ? JSON.parse($json.body) : $json.body
};
"""

for i, ep in enumerate(endpoints):
    prefix = f"{ep['name'].capitalize()} "
    x_pos = 100
    
    if ep['name'] == 'health':
        wh_id = gen_id()
        wh_node = {
            "parameters": {
                "httpMethod": "GET",
                "path": "agent/health",
                "responseMode": "responseNode",
                "options": {}
            },
            "id": gen_id(),
            "name": prefix + "Webhook",
            "type": "n8n-nodes-base.webhook",
            "typeVersion": 2.1,
            "position": [x_pos, y_pos],
            "webhookId": wh_id
        }
        resp_node = {
            "parameters": {
                "respondWith": "json",
                "responseBody": '{"ok": true, "time": "{{$now}}"}',
                "options": {}
            },
            "id": gen_id(),
            "name": prefix + "Respond",
            "type": "n8n-nodes-base.respondToWebhook",
            "typeVersion": 1.4,
            "position": [x_pos + 300, y_pos]
        }
        workflow['nodes'].extend([wh_node, resp_node])
        workflow['connections'][wh_node['name']] = {"main": [[{"node": resp_node['name'], "type": "main", "index": 0}]]}
        y_pos += 250
        continue

    # Other endpoints
    wh_opts = {}
    if ep.get('raw'):
        wh_opts["rawBody"] = True
    
    wh_node = {
        "parameters": {
            "httpMethod": ep['method'],
            "path": f"agent/{ep['name']}",
            "responseMode": "responseNode",
            "options": wh_opts
        },
        "id": gen_id(),
        "name": prefix + "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 2.1,
        "position": [x_pos, y_pos],
        "webhookId": gen_id()
    }
    if ep['auth']:
        wh_node["parameters"]["authentication"] = "headerAuth"
        wh_node["credentials"] = {
            "httpHeaderAuth": {
                "id": "REPLACE_ME",
                "name": "Oakdale Agent Key"
            }
        }
    
    x_pos += 250
    norm_node = {
        "parameters": {
            "jsCode": normalize_code
        },
        "id": gen_id(),
        "name": prefix + "Normalize and validate",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [x_pos, y_pos]
    }
    
    x_pos += 250
    if_node = {
        "parameters": {
            "conditions": {
                "options": {
                    "caseSensitive": True,
                    "leftValue": "",
                    "typeValidation": "strict"
                },
                "conditions": [
                    {
                        "id": gen_id(),
                        "leftValue": "={{ $json.valid }}",
                        "rightValue": True,
                        "operator": {
                            "type": "boolean",
                            "operation": "true",
                            "singleValue": True
                        }
                    }
                ],
                "combinator": "and"
            },
            "options": {}
        },
        "id": gen_id(),
        "name": prefix + "IF valid",
        "type": "n8n-nodes-base.if",
        "typeVersion": 3.2,
        "position": [x_pos, y_pos]
    }
    
    # False path (422)
    err_env = {
        "parameters": {
            "jsCode": error_envelope_code
        },
        "id": gen_id(),
        "name": prefix + "Code build 422 envelope",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [x_pos + 250, y_pos + 150]
    }
    
    # True path
    crypto_node = {
        "parameters": {
            "action": "hash",
            "type": "SHA256",
            "value": f"={ep['name']}:{{{{ $json.payload.conversation_id }}}}:{{{{ $json.sortedPayload }}}}",
            "dataPropertyName": "idempotency_key",
            "encoding": "hex"
        },
        "id": gen_id(),
        "name": prefix + "Crypto idempotency",
        "type": "n8n-nodes-base.crypto",
        "typeVersion": 1.1,
        "position": [x_pos + 250, y_pos - 100]
    }

    req_node = {
        "parameters": {
            "method": "POST",
            "url": "http://127.0.0.1:54321/rest/v1/rpc/agent_dispatch",
            "sendBody": True,
            "bodyParameters": {
                "parameters": [
                    {"name": "p_tool", "value": ep['name']},
                    {"name": "p_payload", "value": "={{ $json.payload }}"},
                    {"name": "p_idempotency_key", "value": "={{ $json.idempotency_key }}"},
                    {"name": "p_channel", "value": "={{ $json.channel }}"},
                    {"name": "p_client_ip", "value": "={{ $json.client_ip }}"}
                ]
            },
            "options": {
                "timeout": 8000
            },
            "authentication": "predefinedCredentialType",
            "nodeCredentialType": "supabaseApi"
        },
        "id": gen_id(),
        "name": prefix + "HTTP Request RPC agent_dispatch",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": [x_pos + 500, y_pos - 100],
        "credentials": {
            "supabaseApi": {
                "id": "V8O33LSd8sJmwVDm",
                "name": "Supabase account"
            }
        },
        "onError": "continueErrorOutput",
        "retryOnFail": True,
        "maxTries": 2
    }
    # Supabase HTTP URL needs to be dynamic based on env, but we can just use the standard format or let the credential handle it. Wait, the prompt says "{SUPABASE_URL}/rest/v1/rpc/agent_dispatch".
    req_node["parameters"]["url"] = "={{ $env.SUPABASE_URL }}/rest/v1/rpc/agent_dispatch"
    
    succ_env = {
        "parameters": {
            "jsCode": rpc_success_envelope
        },
        "id": gen_id(),
        "name": prefix + "Code build envelope",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [x_pos + 750, y_pos - 150]
    }
    
    rpc_err_env = {
        "parameters": {
            "jsCode": rpc_error_envelope
        },
        "id": gen_id(),
        "name": prefix + "Code build 500 envelope",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [x_pos + 750, y_pos - 50]
    }
    
    respond_node = {
        "parameters": {
            "respondWith": "json",
            "responseBody": "={{ JSON.stringify($json.body) }}",
            "responseCode": "={{ $json.http_status }}",
            "options": {}
        },
        "id": gen_id(),
        "name": prefix + "Respond to Webhook",
        "type": "n8n-nodes-base.respondToWebhook",
        "typeVersion": 1.4,
        "position": [x_pos + 1000, y_pos]
    }

    workflow['nodes'].extend([wh_node, norm_node, if_node, err_env, crypto_node, req_node, succ_env, rpc_err_env, respond_node])
    
    workflow['connections'][wh_node['name']] = {"main": [[{"node": norm_node['name'], "type": "main", "index": 0}]]}
    workflow['connections'][norm_node['name']] = {"main": [[{"node": if_node['name'], "type": "main", "index": 0}]]}
    
    workflow['connections'][if_node['name']] = {
        "main": [
            [{"node": crypto_node['name'], "type": "main", "index": 0}], # true
            [{"node": err_env['name'], "type": "main", "index": 0}]      # false
        ]
    }
    
    workflow['connections'][crypto_node['name']] = {"main": [[{"node": req_node['name'], "type": "main", "index": 0}]]}
    
    workflow['connections'][req_node['name']] = {
        "main": [
            [{"node": succ_env['name'], "type": "main", "index": 0}], # success
            [{"node": rpc_err_env['name'], "type": "main", "index": 0}] # error
        ]
    }
    
    workflow['connections'][err_env['name']] = {"main": [[{"node": respond_node['name'], "type": "main", "index": 0}]]}
    workflow['connections'][succ_env['name']] = {"main": [[{"node": respond_node['name'], "type": "main", "index": 0}]]}
    workflow['connections'][rpc_err_env['name']] = {"main": [[{"node": respond_node['name'], "type": "main", "index": 0}]]}
    
    y_pos += 400

with open("n8n/oakdale-agent.workflow.json", "w") as f:
    json.dump(workflow, f, indent=2)

print("Generated n8n JSON")
