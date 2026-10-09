import fs from 'fs';
import path from 'path';

const workflowPath = path.resolve('n8n/oakdale-agent.workflow.json');
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

// Find the code nodes
const normNode = workflow.nodes.find(n => n.name.includes('Normalize'));
const normCode = normNode.parameters.jsCode;
const errCode = workflow.nodes.find(n => n.name.includes('Code build 422 envelope')).parameters.jsCode;
const rpcErrCode = workflow.nodes.find(n => n.name.includes('Code build 500 envelope')).parameters.jsCode;
const rpcSuccCode = workflow.nodes.find(n => n.name.includes('Code build envelope')).parameters.jsCode;

function runNode(code, jsonInput) {
    const fn = new Function('$json', code);
    return fn(jsonInput);
}

let errors = [];

function assert(condition, message) {
    if (!condition) {
        errors.push(message);
        console.error("FAIL: " + message);
    }
}

console.log("Testing Normalization Code Node...");
// 1. Missing conversation_id
let res = runNode(normCode, { body: { } });
assert(res.valid === false && res.http_status === 422, "missing conversation_id should fail");

// 2. Bad date
res = runNode(normCode, { body: { conversation_id: "123", event: { date: "12/12/2026" } } });
assert(res.valid === false, "bad date format should fail");

// 3. Past date
res = runNode(normCode, { body: { conversation_id: "123", event: { date: "2000-01-01" } } });
assert(res.valid === false, "past date should fail");

// 4. guest_count 0
res = runNode(normCode, { body: { conversation_id: "123", event: { guest_count: 0 } } });
assert(res.valid === false, "guest_count 0 should fail");

// 5. Phone and email normalization
res = runNode(normCode, { body: { conversation_id: "123", customer: { phone: "(516) 555-0123", email: " TEST@Example.com " } } });
assert(res.valid === true, "valid payload should pass");
assert(res.payload.customer.phone === "+15165550123", "phone should be normalized to E.164");
assert(res.payload.customer.email === "test@example.com", "email should be lowercased and trimmed");

// 6. Channel derivation
res = runNode(normCode, { body: { conversation_id: "123", is_text_only: true } });
assert(res.channel === "chat", "is_text_only true -> chat");
res = runNode(normCode, { body: { conversation_id: "123", is_text_only: false } });
assert(res.channel === "voice", "is_text_only false -> voice");

// 7. Idempotency key stability
let inputA = { body: { conversation_id: "1", a: 1, b: 2 } };
let inputB = { body: { conversation_id: "1", b: 2, a: 1 } };
let resA = runNode(normCode, inputA);
let resB = runNode(normCode, inputB);
assert(resA.sortedPayload === resB.sortedPayload, "sorted payloads should match regardless of key order");

console.log("Testing Envelope Code Nodes...");
let errEnv = runNode(errCode, { http_status: 422, message: "bad input" });
assert(errEnv.http_status === 422 && errEnv.body.ok === false && errEnv.body.message === "bad input", "422 envelope failed");

let rpcErrEnv = runNode(rpcErrCode, {});
assert(rpcErrEnv.http_status === 500 && rpcErrEnv.body.ok === false, "500 envelope failed");

let rpcSuccEnv = runNode(rpcSuccCode, { http_status: 200, body: { ok: true, message: "Success" } });
assert(rpcSuccEnv.http_status === 200 && rpcSuccEnv.body.ok === true, "RPC success envelope failed");

if (errors.length > 0) {
    console.error(`\nCompleted with ${errors.length} errors.`);
    process.exit(1);
} else {
    console.log("All Code node tests passed!");
}
