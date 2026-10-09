#!/usr/bin/env python3
"""Generate a simple ElevenLabs → n8n → Supabase workflow JSON."""
import json
from copy import deepcopy

CRED = {"supabaseApi": {"id": "V8O33LSd8sJmwVDm", "name": "Supabase account"}}

COMMON_JS = r"""
function rawInput() {
  const item = $input.first().json;
  let body = item.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; }
  }
  body = body || {};
  const query = item.query || {};
  return Object.assign({}, query, body);
}

function asBool(v) {
  if (v === true || v === false) return v;
  const s = String(v == null ? '' : v).trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}

function asInt(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first_name: 'Guest', last_name: 'Customer' };
  if (parts.length === 1) return { first_name: parts[0], last_name: parts[0] };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

function accessoriesList(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (v == null || v === '') return [];
  return String(v).split(',').map((x) => x.trim()).filter(Boolean);
}

function mapPriority(v) {
  const s = String(v || '').trim().toLowerCase();
  if (s === 'low') return 'low';
  if (s === 'high' || s === 'urgent') return s === 'urgent' ? 'urgent' : 'high';
  return 'normal';
}

function envelope(ok, status, message, reference, data) {
  return { ok, status, message, reference: reference || null, data: data || null };
}

function channelFrom(p) {
  return asBool(p.is_text_only) ? 'chat' : 'voice';
}

function clientIp() {
  const headers = $input.first().json.headers || {};
  return headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown';
}

function productFields(p) {
  const raw = p.tent_style_or_package || p.selected_products || p.tent_style || p.package_name || '';
  const name = String(raw).trim();
  const accessories = accessoriesList(p.accessories);
  return {
    tent_style: name || null,
    package_name: name || null,
    accessories,
  };
}
"""

AVAIL_JS = COMMON_JS + r"""
const p = rawInput();
const date = String(p.date || p.event_date || '').trim();
const missing = [];
if (!date) missing.push('date');
if (missing.length) {
  return [{ json: {
    valid: false,
    http_status: 422,
    error_body: envelope(false, 'validation_error', 'Please provide the event date as YYYY-MM-DD.', null, null),
    payload: null, channel: channelFrom(p), idempotency_key: '', client_ip: clientIp()
  }}];
}
const products = productFields(p);
const payload = {
  conversation_id: p.conversation_id || ('n8n-' + String($execution.id)),
  is_text_only: asBool(p.is_text_only),
  event_date: date,
  guest_count: asInt(p.guest_count),
  tent_style: products.tent_style,
  package_name: products.package_name,
  accessories: products.accessories,
};
return [{ json: {
  valid: true,
  http_status: 200,
  error_body: null,
  payload,
  channel: channelFrom(p),
  idempotency_key: 'availability:' + (payload.conversation_id || 'none') + ':' + date,
  client_ip: clientIp()
}}];
"""

QUOTE_JS = COMMON_JS + r"""
const p = rawInput();
const name = String(p.name || '').trim();
const phone = String(p.phone || '').replace(/\D/g, '');
const email = String(p.email || '').trim().toLowerCase();
const missing = [];
if (!name) missing.push('name');
if (!phone) missing.push('phone');
if (!email) missing.push('email');
if (missing.length) {
  return [{ json: {
    valid: false,
    http_status: 422,
    error_body: envelope(false, 'validation_error', 'I need the customer name, phone, and email to record a quote request.', null, null),
    payload: null, channel: channelFrom(p), idempotency_key: '', client_ip: clientIp()
  }}];
}
const names = splitName(name);
const products = productFields(p);
const eventDate = String(p.event_date || p.date || '').trim() || null;
const payload = {
  conversation_id: p.conversation_id || ('n8n-' + String($execution.id)),
  is_text_only: asBool(p.is_text_only),
  customer: { first_name: names.first_name, last_name: names.last_name, phone, email, name },
  event: {
    type: p.event_type || null,
    date: eventDate,
    guest_count: asInt(p.guest_count),
    town: p.venue_area || null,
    address: p.venue_area || null,
  },
  tent_style: products.tent_style,
  package_name: products.package_name,
  accessories: products.accessories,
  notes: p.customer_notes || null,
};
return [{ json: {
  valid: true,
  http_status: 200,
  error_body: null,
  payload,
  channel: channelFrom(p),
  idempotency_key: 'quote-request:' + (payload.conversation_id || email) + ':' + (eventDate || 'nodate'),
  client_ip: clientIp()
}}];
"""

BOOKING_JS = COMMON_JS + r"""
const p = rawInput();
const name = String(p.name || '').trim();
const phone = String(p.phone || '').replace(/\D/g, '');
const email = String(p.email || '').trim().toLowerCase();
const eventDate = String(p.event_date || p.date || '').trim();
const venue = String(p.venue_address || '').trim();
const guestCount = asInt(p.guest_count);
const selected = String(p.selected_products || p.tent_style_or_package || '').trim();
const confirmed = asBool(p.customer_confirmed_readback);
const missing = [];
if (!name) missing.push('name');
if (!phone) missing.push('phone');
if (!email) missing.push('email');
if (!eventDate) missing.push('event_date');
if (!venue) missing.push('venue_address');
if (!guestCount) missing.push('guest_count');
if (!selected) missing.push('selected_products');
if (!confirmed) missing.push('customer_confirmed_readback');
if (missing.length) {
  return [{ json: {
    valid: false,
    http_status: 422,
    error_body: envelope(false, 'validation_error', 'Please confirm all booking details, including read-back confirmation, before I can submit the request.', null, { missing }),
    payload: null, channel: channelFrom(p), idempotency_key: '', client_ip: clientIp()
  }}];
}
const names = splitName(name);
const products = productFields(p);
const payload = {
  conversation_id: p.conversation_id || ('n8n-' + String($execution.id)),
  is_text_only: asBool(p.is_text_only),
  customer_confirmed_readback: true,
  customer: { first_name: names.first_name, last_name: names.last_name, phone, email, name },
  event: {
    type: p.event_type || null,
    date: eventDate,
    guest_count: guestCount,
    town: venue,
    address: venue,
  },
  tent_style: products.tent_style,
  package_name: products.package_name,
  accessories: products.accessories,
  notes: p.customer_notes || null,
  event_date: eventDate,
};
return [{ json: {
  valid: true,
  http_status: 200,
  error_body: null,
  payload,
  channel: channelFrom(p),
  idempotency_key: 'booking-request:' + (payload.conversation_id || email) + ':' + eventDate,
  client_ip: clientIp()
}}];
"""

CHANGE_JS = COMMON_JS + r"""
const p = rawInput();
const contact = String(p.contact_info || p.phone || p.email || '').trim();
const requested = String(p.requested_changes || '').trim();
const confirmed = asBool(p.customer_confirmed_readback);
const missing = [];
if (!contact) missing.push('contact_info');
if (!requested) missing.push('requested_changes');
if (!confirmed) missing.push('customer_confirmed_readback');
if (missing.length) {
  return [{ json: {
    valid: false,
    http_status: 422,
    error_body: envelope(false, 'validation_error', 'I need contact info, the requested changes, and confirmation of the read-back.', null, { missing }),
    payload: null, channel: channelFrom(p), idempotency_key: '', client_ip: clientIp()
  }}];
}
const email = contact.includes('@') ? contact.toLowerCase() : (p.email || null);
const phone = contact.includes('@') ? (p.phone || null) : String(contact).replace(/\D/g, '');
const names = splitName(p.name || '');
const lower = requested.toLowerCase();
let change_type = 'other';
if (lower.includes('cancel')) change_type = 'cancel';
else if (lower.includes('resched') || lower.includes('date')) change_type = 'reschedule';
else if (lower.includes('guest')) change_type = 'change_guest_count';
else if (lower.includes('location') || lower.includes('address') || lower.includes('venue')) change_type = 'change_location';
else if (lower.includes('package')) change_type = 'change_package';
else if (lower.includes('add')) change_type = 'add_items';
else if (lower.includes('remove')) change_type = 'remove_items';
const eventDate = String(p.event_date || p.date || '').trim() || null;
const payload = {
  conversation_id: p.conversation_id || ('n8n-' + String($execution.id)),
  is_text_only: asBool(p.is_text_only),
  customer_confirmed_readback: true,
  booking_reference: p.booking_reference || null,
  phone,
  email,
  last_name: names.last_name,
  current_event_date: eventDate,
  new_event_date: eventDate,
  event_date: eventDate,
  change_type,
  details: requested,
  requested_changes: { description: requested },
};
return [{ json: {
  valid: true,
  http_status: 200,
  error_body: null,
  payload,
  channel: channelFrom(p),
  idempotency_key: 'change-request:' + (payload.conversation_id || contact) + ':' + (p.booking_reference || 'noref'),
  client_ip: clientIp(),
  skip_availability: !eventDate || change_type === 'cancel' || change_type === 'remove_items' || change_type === 'change_location'
}}];
"""

OWNER_JS = COMMON_JS + r"""
const p = rawInput();
const name = String(p.name || '').trim();
const phone = String(p.phone || '').replace(/\D/g, '');
const email = String(p.email || '').trim().toLowerCase();
const topic = String(p.topic || '').trim();
const missing = [];
if (!name) missing.push('name');
if (!phone) missing.push('phone');
if (!email) missing.push('email');
if (!topic) missing.push('topic');
if (missing.length) {
  return [{ json: {
    valid: false,
    http_status: 422,
    error_body: envelope(false, 'validation_error', 'I need name, phone, email, and the topic to request an owner consultation.', null, { missing }),
    payload: null, channel: channelFrom(p), idempotency_key: '', client_ip: clientIp()
  }}];
}
const payload = {
  conversation_id: p.conversation_id || ('n8n-' + String($execution.id)),
  is_text_only: asBool(p.is_text_only),
  customer: { name, phone, email },
  topic,
  summary: topic + (p.preferred_contact_method ? (' Preferred contact: ' + p.preferred_contact_method) : ''),
  urgency: mapPriority(p.urgency),
  preferred_contact_method: p.preferred_contact_method || null,
};
return [{ json: {
  valid: true,
  http_status: 200,
  error_body: null,
  payload,
  channel: channelFrom(p),
  idempotency_key: 'owner-consultation:' + (payload.conversation_id || phone),
  client_ip: clientIp()
}}];
"""

REVIEW_JS = COMMON_JS + r"""
const p = rawInput();
const reason = String(p.reason || '').trim();
const summary = String(p.summary || '').trim();
const severity = String(p.severity || '').trim().toLowerCase();
const missing = [];
if (!reason) missing.push('reason');
if (!summary) missing.push('summary');
if (!severity) missing.push('severity');
if (missing.length) {
  return [{ json: {
    valid: false,
    http_status: 422,
    error_body: envelope(false, 'validation_error', 'I need a reason, summary, and severity to flag this for human review.', null, { missing }),
    payload: null, channel: channelFrom(p), idempotency_key: '', client_ip: clientIp()
  }}];
}
const contact = String(p.contact_info || '').trim();
const email = contact.includes('@') ? contact.toLowerCase() : null;
const phone = contact && !contact.includes('@') ? String(contact).replace(/\D/g, '') : null;
const payload = {
  conversation_id: p.conversation_id || ('n8n-' + String($execution.id)),
  is_text_only: asBool(p.is_text_only),
  reason,
  summary,
  severity: mapPriority(severity),
  error_context: p.error_context || null,
  customer: { name: p.name || null, phone, email },
};
return [{ json: {
  valid: true,
  http_status: 200,
  error_body: null,
  payload,
  channel: channelFrom(p),
  idempotency_key: 'human-review:' + (payload.conversation_id || reason),
  client_ip: clientIp()
}}];
"""


def webhook(wid, name, path, method, pos):
    params = {
        "httpMethod": method,
        "path": path,
        "responseMode": "responseNode",
        "options": {},
    }
    return {
        "parameters": params,
        "id": wid,
        "name": name,
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 2.1,
        "position": pos,
        "webhookId": wid,
    }


def code(nid, name, js, pos):
    return {
        "parameters": {"jsCode": js.strip() + "\n"},
        "id": nid,
        "name": name,
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": pos,
    }


def if_bool(nid, name, pos, left_expr, cond_id):
    return {
        "parameters": {
            "conditions": {
                "options": {
                    "caseSensitive": True,
                    "leftValue": "",
                    "typeValidation": "strict",
                },
                "conditions": [
                    {
                        "id": cond_id,
                        "leftValue": left_expr,
                        "rightValue": True,
                        "operator": {
                            "type": "boolean",
                            "operation": "true",
                            "singleValue": True,
                        },
                    }
                ],
                "combinator": "and",
            },
            "options": {},
        },
        "id": nid,
        "name": name,
        "type": "n8n-nodes-base.if",
        "typeVersion": 3.2,
        "position": pos,
    }


def iff(nid, name, pos, cond_id):
    return if_bool(nid, name, pos, "={{ $json.valid }}", cond_id)


def if_available(nid, name, pos, cond_id):
    return {
        "parameters": {
            "conditions": {
                "options": {
                    "caseSensitive": True,
                    "leftValue": "",
                    "typeValidation": "strict",
                },
                "conditions": [
                    {
                        "id": cond_id,
                        "leftValue": "={{ ($json.body && $json.body.status) || $json.status }}",
                        "rightValue": "not_available",
                        "operator": {
                            "type": "string",
                            "operation": "notEquals",
                        },
                    }
                ],
                "combinator": "and",
            },
            "options": {},
        },
        "id": nid,
        "name": name,
        "type": "n8n-nodes-base.if",
        "typeVersion": 3.2,
        "position": pos,
    }


def rpc(nid, name, tool, pos, payload_expr="={{ $json.payload }}", key_expr="={{ $json.idempotency_key }}", channel_expr="={{ $json.channel }}", ip_expr="={{ $json.client_ip }}"):
    return {
        "parameters": {
            "method": "POST",
            "url": "={{ $env.SUPABASE_URL }}/rest/v1/rpc/agent_dispatch",
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": "={{ JSON.stringify({ p_tool: '" + tool + "', p_payload: " + payload_expr.replace('={{ ', '').replace(' }}', '') + ", p_idempotency_key: " + key_expr.replace('={{ ', '').replace(' }}', '') + ", p_channel: " + channel_expr.replace('={{ ', '').replace(' }}', '') + ", p_client_ip: " + ip_expr.replace('={{ ', '').replace(' }}', '') + " }) }}",
            "options": {"timeout": 8000},
            "authentication": "predefinedCredentialType",
            "nodeCredentialType": "supabaseApi",
        },
        "id": nid,
        "name": name,
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": pos,
        "credentials": deepcopy(CRED),
    }


def rpc_params(nid, name, tool, pos, payload_expr, key_expr, channel_expr, ip_expr):
    return {
        "parameters": {
            "method": "POST",
            "url": "={{ $env.SUPABASE_URL }}/rest/v1/rpc/agent_dispatch",
            "sendBody": True,
            "bodyParameters": {
                "parameters": [
                    {"name": "p_tool", "value": tool},
                    {"name": "p_payload", "value": payload_expr},
                    {"name": "p_idempotency_key", "value": key_expr},
                    {"name": "p_channel", "value": channel_expr},
                    {"name": "p_client_ip", "value": ip_expr},
                ]
            },
            "options": {"timeout": 8000},
            "authentication": "predefinedCredentialType",
            "nodeCredentialType": "supabaseApi",
        },
        "id": nid,
        "name": name,
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": pos,
        "credentials": deepcopy(CRED),
    }


def respond(nid, name, pos, body_expr="={{ JSON.stringify($json.body || $json.error_body || $json) }}", code_expr="={{ $json.http_status || 200 }}"):
    return {
        "parameters": {
            "respondWith": "json",
            "responseBody": body_expr,
            "responseCode": code_expr,
            "options": {},
        },
        "id": nid,
        "name": name,
        "type": "n8n-nodes-base.respondToWebhook",
        "typeVersion": 1.4,
        "position": pos,
    }


def respond_error(nid, name, pos):
    return respond(
        nid,
        name,
        pos,
        "={{ JSON.stringify($json.error_body) }}",
        "={{ $json.http_status }}",
    )


def respond_rpc(nid, name, pos):
    return respond(
        nid,
        name,
        pos,
        "={{ JSON.stringify($json.body || $json) }}",
        "={{ $json.http_status || 200 }}",
    )


def sticky(nid, text, pos, h=220, w=240, color=7):
    return {
        "parameters": {"content": text, "height": h, "width": w, "color": color},
        "id": nid,
        "name": "Note " + nid[:8],
        "type": "n8n-nodes-base.stickyNote",
        "position": pos,
        "typeVersion": 1,
    }


def conn(src, dst, index=0):
    return {src: {"main": [[{"node": dst, "type": "main", "index": index}]]}}


def merge_conn(d, src, targets):
    """targets is list of lists of destinations per output."""
    d[src] = {"main": [[{"node": t, "type": "main", "index": 0} for t in outs] for outs in targets]}


def main():
    nodes = []
    connections = {}
    X = [0, 260, 520, 780, 1040, 1300, 1560]
    ROW = 280

    def simple_lane(
        y,
        note_id,
        note_text,
        wh_id,
        wh_name,
        path,
        method,
        map_id,
        map_name,
        map_js,
        if_id,
        if_name,
        if_cond_id,
        rpc_id,
        rpc_name,
        tool,
        ok_id,
        ok_name,
        err_id,
        err_name,
    ):
        nodes.extend(
            [
                sticky(note_id, note_text, [-320, y - 40], h=200, w=280),
                webhook(wh_id, wh_name, path, method, [X[0], y]),
                code(map_id, map_name, map_js, [X[1], y]),
                iff(if_id, if_name, [X[2], y], if_cond_id),
                rpc_params(
                    rpc_id,
                    rpc_name,
                    tool,
                    [X[3], y],
                    "={{ $json.payload }}",
                    "={{ $json.idempotency_key }}",
                    "={{ $json.channel }}",
                    "={{ $json.client_ip }}",
                ),
                respond_rpc(ok_id, ok_name, [X[4], y]),
                respond_error(err_id, err_name, [X[3], y + 140]),
            ]
        )
        merge_conn(connections, wh_name, [[map_name]])
        merge_conn(connections, map_name, [[if_name]])
        merge_conn(connections, if_name, [[rpc_name], [err_name]])
        merge_conn(connections, rpc_name, [[ok_name]])

    simple_lane(
        0,
        "a2e37c00-5326-4bdd-9604-c3f6593d639f",
        "## 1. check_availability\nGET `/webhook/agent/check_availability`",
        "19ce17e5-b6f6-4cfb-8ba5-929239d26451",
        "WH check_availability",
        "agent/check_availability",
        "GET",
        "7ade794a-3df9-494d-aea7-155e78f59592",
        "Map Availability",
        AVAIL_JS,
        "4dadf68e-a4e1-4d83-8412-a75bb39e9262",
        "IF Availability Valid",
        "3fc9d872-40d5-421c-bc94-8e57ef25f0b3",
        "6546a45c-4a14-4ff8-be87-d04be160267b",
        "RPC Availability",
        "availability",
        "d2937a4c-f47e-476a-8596-2dec2461ce80",
        "Respond Availability",
        "2e06210e-a1cc-425c-8629-39d0c4ee296c",
        "Respond Availability Error",
    )

    simple_lane(
        ROW,
        "9609d60b-5bdc-4eb2-8967-b843e85489f1",
        "## 2. create_quote_request\nPOST `/webhook/agent/create_quote_request`",
        "9ed09ae0-ec82-4b97-9f17-0e9462375eab",
        "WH create_quote_request",
        "agent/create_quote_request",
        "POST",
        "b23cc44e-e0cb-420c-8ea8-b59881be377b",
        "Map Quote",
        QUOTE_JS,
        "f2c2f7ce-1433-423f-a1b0-4985eca64262",
        "IF Quote Valid",
        "a8013fce-c65b-4d47-ae10-8774bc83ac74",
        "54e5aab5-1a86-46af-92a4-d98b0ba7fdd9",
        "RPC Quote",
        "quote-request",
        "7bdb5285-388e-42c5-995e-f07be1ddfa63",
        "Respond Quote",
        "b1aa63b0-85ff-4451-9e52-eca599eae20e",
        "Respond Quote Error",
    )

    # Booking: Map -> valid? -> check availability -> date open? -> create
    y = ROW * 2
    nodes += [
        sticky(
            "8b3ba053-17c9-4f71-82ee-7add51322f85",
            "## 3. create_booking_request\nPOST — availability check, then booking",
            [-320, y - 40],
            h=240,
            w=280,
        ),
        webhook("e4cfe883-f385-4203-bbfe-13f01409ea2f", "WH create_booking_request", "agent/create_booking_request", "POST", [X[0], y]),
        code("e2cbae4b-8c3e-45cf-81dd-d7c1cc03cce6", "Map Booking", BOOKING_JS, [X[1], y]),
        iff("b0bb7ac0-763f-4ddc-892e-48d210c496ff", "IF Booking Valid", [X[2], y], "6ff07517-5b5f-403c-993e-0a4f814896f0"),
        rpc_params(
            "30fdbfa3-5c80-4d6c-a1dd-fd5db4b1e9c6",
            "RPC Booking Availability",
            "availability",
            [X[3], y],
            "={{ $json.payload }}",
            "={{ 'precheck-booking:' + $json.idempotency_key }}",
            "={{ $json.channel }}",
            "={{ $json.client_ip }}",
        ),
        if_available("be0f2d12-6e2d-43e7-842f-40fd356d4017", "IF Booking Date Open", [X[4], y], "08fd6e3b-414b-41dd-819e-9c3b773e0d29"),
        rpc_params(
            "79739226-a834-4f12-b2ad-e0578bbff6ec",
            "RPC Booking Create",
            "booking-request",
            [X[5], y],
            "={{ $('Map Booking').item.json.payload }}",
            "={{ $('Map Booking').item.json.idempotency_key }}",
            "={{ $('Map Booking').item.json.channel }}",
            "={{ $('Map Booking').item.json.client_ip }}",
        ),
        respond_rpc("562d6181-c76a-48fa-8a03-edfc7404173c", "Respond Booking", [X[6], y]),
        respond_error("628da07f-24b6-4628-b6b3-c8f6bbfbb518", "Respond Booking Error", [X[3], y + 140]),
        respond_rpc("3f4f0e23-38c6-4bb7-b323-24b2196f9d9c", "Respond Booking Unavailable", [X[5], y + 140]),
    ]
    merge_conn(connections, "WH create_booking_request", [["Map Booking"]])
    merge_conn(connections, "Map Booking", [["IF Booking Valid"]])
    merge_conn(connections, "IF Booking Valid", [["RPC Booking Availability"], ["Respond Booking Error"]])
    merge_conn(connections, "RPC Booking Availability", [["IF Booking Date Open"]])
    merge_conn(connections, "IF Booking Date Open", [["RPC Booking Create"], ["Respond Booking Unavailable"]])
    merge_conn(connections, "RPC Booking Create", [["Respond Booking"]])

    # Change: same straight line. SQL also re-checks. Skip extra date-less branch by always creating after open/needs_review; cancel still goes through availability which may 422 without date — Map sets skip by using a fake check via IF skip in-line at X[3]
    y = ROW * 3
    nodes += [
        sticky(
            "268c8267-43c3-4cf0-bd4d-1283fd287601",
            "## 4. create_change_request\nPOST — availability check, then change",
            [-320, y - 40],
            h=240,
            w=280,
        ),
        webhook("9e4f816a-d74d-45d1-b314-d12c0e6fc8b5", "WH create_change_request", "agent/create_change_request", "POST", [X[0], y]),
        code("f8459f53-82d1-4b56-9c8f-17dc2cf4b0ca", "Map Change", CHANGE_JS, [X[1], y]),
        iff("5799c4ed-8092-4673-9c9e-272421246e5b", "IF Change Valid", [X[2], y], "8c0306e9-9dc1-4442-9d9b-b70cd6002737"),
        if_bool(
            "081c4f5d-7edd-41c9-9381-8405e06dc868",
            "IF Skip Change Availability",
            [X[3], y],
            "={{ $json.skip_availability }}",
            "985d7457-87ce-443b-9e7d-68abf5ae6184",
        ),
        rpc_params(
            "41c5a7eb-97cf-4632-a212-e019d411e0b2",
            "RPC Change Availability",
            "availability",
            [X[4], y + 140],
            "={{ $('Map Change').item.json.payload }}",
            "={{ 'precheck-change:' + $('Map Change').item.json.idempotency_key }}",
            "={{ $('Map Change').item.json.channel }}",
            "={{ $('Map Change').item.json.client_ip }}",
        ),
        if_available("25a75a37-40a4-4181-97ff-c5342fd7fcdf", "IF Change Date Open", [X[5], y + 140], "e4e16ead-13ef-4441-b747-910f7460593d"),
        rpc_params(
            "267ffc22-2f89-409c-a490-13b4101413fb",
            "RPC Change Create",
            "change-request",
            [X[5], y],
            "={{ $('Map Change').item.json.payload }}",
            "={{ $('Map Change').item.json.idempotency_key }}",
            "={{ $('Map Change').item.json.channel }}",
            "={{ $('Map Change').item.json.client_ip }}",
        ),
        respond_rpc("e04d5e39-acc7-44a1-bd74-5b7d07dc70d4", "Respond Change", [X[6], y]),
        respond_error("be416a96-7429-4881-a915-0162914f21f0", "Respond Change Error", [X[2], y + 140]),
        respond_rpc("1544ecef-cf99-4c58-ab5d-2701f05f04af", "Respond Change Unavailable", [X[6], y + 140]),
    ]
    merge_conn(connections, "WH create_change_request", [["Map Change"]])
    merge_conn(connections, "Map Change", [["IF Change Valid"]])
    merge_conn(connections, "IF Change Valid", [["IF Skip Change Availability"], ["Respond Change Error"]])
    merge_conn(connections, "IF Skip Change Availability", [["RPC Change Create"], ["RPC Change Availability"]])
    merge_conn(connections, "RPC Change Availability", [["IF Change Date Open"]])
    merge_conn(connections, "IF Change Date Open", [["RPC Change Create"], ["Respond Change Unavailable"]])
    merge_conn(connections, "RPC Change Create", [["Respond Change"]])

    simple_lane(
        ROW * 4,
        "26c48ce7-3721-43c4-a60d-1466a6a768c7",
        "## 5. request_owner_consultation\nPOST `/webhook/agent/request_owner_consultation`",
        "2bb35af1-7cbc-4cd5-8241-16419b7981a2",
        "WH request_owner_consultation",
        "agent/request_owner_consultation",
        "POST",
        "aba8f399-b94c-4a16-852d-1d6087b4250f",
        "Map Owner",
        OWNER_JS,
        "f017aaee-33c0-41af-a06f-fa800f0db073",
        "IF Owner Valid",
        "ca61db54-a30b-4121-9e28-8bc6607434ee",
        "dfb39175-6bbf-484e-b18c-58d6a21276a9",
        "RPC Owner",
        "owner-consultation",
        "5d4be905-a6fa-4ede-b944-b186f8c52363",
        "Respond Owner",
        "d2bcd2d6-4c45-481c-b2fb-c0ef5f49ccaa",
        "Respond Owner Error",
    )

    simple_lane(
        ROW * 5,
        "4ae6188c-134a-460c-ba29-4fed022512fc",
        "## 6. flag_for_human_review\nPOST `/webhook/agent/flag_for_human_review`",
        "385d20b0-7ac0-439a-beec-3623c1a74ee5",
        "WH flag_for_human_review",
        "agent/flag_for_human_review",
        "POST",
        "fd1255fc-5366-444e-b9f3-69081b91f1a8",
        "Map Review",
        REVIEW_JS,
        "3a231fb9-fc0f-4f14-84a9-891f5e020473",
        "IF Review Valid",
        "2e9493c2-ccc9-4615-a436-9e9c01c46df6",
        "0d6b9f25-5b36-4b51-bc01-8d8516fd34db",
        "RPC Review",
        "human-review",
        "c008232c-68b2-4f46-9b21-90e553cdec2a",
        "Respond Review",
        "cca8cac1-2397-49e8-9a6c-4fe9bb5662eb",
        "Respond Review Error",
    )

    workflow = {
        "name": "ElevenLabs Agent Tools",
        "nodes": nodes,
        "pinData": {},
        "connections": connections,
        "active": False,
        "settings": {"executionOrder": "v1", "binaryMode": "separate"},
        "versionId": "927a3a8f-6cf0-4b24-b97c-45e05576f3e3",
        "meta": {
            "templateCredsSetupCompleted": True,
            "instanceId": "4e5c14efa635f7230558a2d8b195d39df85ef5219301451f731ff2c1566986c6",
        },
        "nodeGroups": [],
        "id": "d4b96fe3-5877-47e0-90c8-135279b4c71f",
        "tags": [],
    }

    out = "/Users/safi0219/PC/projects/Tent_Rentall/n8n-workflow-crud.json"
    with open(out, "w") as f:
        json.dump(workflow, f, indent=2)
        f.write("\n")
    print("wrote", out, "nodes", len(nodes), "connections", len(connections))


if __name__ == "__main__":
    main()
