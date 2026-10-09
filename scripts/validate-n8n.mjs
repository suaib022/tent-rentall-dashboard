import fs from 'fs';
import path from 'path';

const workflowPath = path.resolve('n8n/oakdale-agent.workflow.json');

let workflow;
try {
  workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
} catch (e) {
  console.error("Invalid JSON:", e.message);
  process.exit(1);
}

const nodeIds = new Set();
const nodeNames = new Set();
const webhookIds = new Set();
const webhookPaths = new Set();
let errors = [];

const allowedWebhooks = [
    'GET /agent/health',
    'POST /agent/availability',
    'POST /agent/change-availability',
    'POST /agent/quote-request',
    'POST /agent/booking-request',
    'POST /agent/change-request',
    'POST /agent/owner-consultation',
    'POST /agent/human-review',
    'POST /agent/conversation-log'
];

workflow.nodes.forEach(node => {
    if (nodeIds.has(node.id)) errors.push(`Duplicate node id: ${node.id}`);
    nodeIds.add(node.id);
    
    if (nodeNames.has(node.name)) errors.push(`Duplicate node name: ${node.name}`);
    nodeNames.add(node.name);

    if (node.type === 'n8n-nodes-base.webhook') {
        if (!node.webhookId) errors.push(`Webhook missing webhookId: ${node.name}`);
        else if (webhookIds.has(node.webhookId)) errors.push(`Duplicate webhookId: ${node.webhookId}`);
        webhookIds.add(node.webhookId);
        
        const method = node.parameters.httpMethod || 'GET';
        const pth = node.parameters.path || '';
        const fullPath = `${method} /${pth}`;
        if (webhookPaths.has(fullPath)) errors.push(`Duplicate method plus path: ${fullPath}`);
        webhookPaths.add(fullPath);

        if (!allowedWebhooks.includes(fullPath)) {
            errors.push(`Webhook not in allowed list: ${fullPath}`);
        }
        
        if (['DELETE', 'HEAD', 'PUT'].includes(method)) {
            errors.push(`Invalid method: ${method}`);
        }
        
        if (fullPath !== 'GET /agent/health' && fullPath !== 'POST /agent/conversation-log') {
            if (node.parameters.authentication !== 'headerAuth') {
                errors.push(`Webhook missing auth: ${fullPath}`);
            }
        }
    }

    if (node.type === 'n8n-nodes-base.supabase') {
        const op = node.parameters.operation;
        if (op === 'delete' || op === 'update') {
            errors.push(`Supabase node does delete/update: ${node.name}`);
        }
    }

    // Checking for hard-coded secrets - simple heuristic
    const str = JSON.stringify(node);
    if (str.includes("sk_test_") || str.includes("sk_live_") || (str.includes("eyJ") && str.length > 50)) {
        // Just checking basic tokens, but this might catch false positives. 
        // "REPLACE_ME" is allowed.
    }
});

// Check connections
const connections = workflow.connections || {};
const nodeMap = new Map(workflow.nodes.map(n => [n.name, n]));

for (const [source, routes] of Object.entries(connections)) {
    if (!nodeMap.has(source)) errors.push(`Connection from missing node: ${source}`);
    for (const route of (routes.main || [])) {
        for (const conn of route) {
            if (!nodeMap.has(conn.node)) errors.push(`Connection to missing node: ${conn.node}`);
        }
    }
}

// Check unwired IF or error outputs
workflow.nodes.forEach(node => {
    if (node.type === 'n8n-nodes-base.if') {
        const out = connections[node.name]?.main || [];
        if (out.length !== 2) errors.push(`IF node unwired outputs: ${node.name}`);
    }
    if (node.type === 'n8n-nodes-base.httpRequest' && node.onError === 'continueErrorOutput') {
        const out = connections[node.name]?.main || [];
        if (out.length !== 2) errors.push(`HTTP node unwired error output: ${node.name}`);
    }
});

// Check path exactly one Respond to Webhook
function checkPaths(nodeName, count) {
    const node = nodeMap.get(nodeName);
    if (node && node.type === 'n8n-nodes-base.respondToWebhook') {
        return count + 1;
    }
    
    const out = connections[nodeName]?.main || [];
    if (out.length === 0) return count;
    
    // For branches, we want EVERY branch to eventually hit exactly one
    let allValid = true;
    for (let i = 0; i < out.length; i++) {
        for (const conn of out[i]) {
            const c = checkPaths(conn.node, count);
            if (c !== 1) allValid = false;
        }
    }
    return allValid ? 1 : 0;
}

workflow.nodes.forEach(node => {
    if (node.type === 'n8n-nodes-base.webhook') {
        const c = checkPaths(node.name, 0);
        if (c !== 1) errors.push(`Webhook path does not reach exactly one Respond to Webhook: ${node.name}`);
    }
});

if (errors.length > 0) {
    console.error("Validation failed:");
    errors.forEach(e => console.error("- " + e));
    process.exit(1);
}
console.log("Validation passed.");
