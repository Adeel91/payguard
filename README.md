<p align="center">
  <img src="web/public/logo.png" width="140" alt="PayGuard Logo" />
</p>

<h1 align="center">PayGuard</h1>

<p align="center">
  <strong>Paid before signing safety agent for Web3 agent commerce</strong>
</p>

<p align="center">
  CAP Provider Agent • A2A Callable API • Web3 Payment Risk Scan • Contract Intelligence • CROO Provider Runtime • Delivery Proofs
</p>

<p align="center">
  <img src="https://img.shields.io/badge/CROO-Agent%20Commerce-111827?style=for-the-badge" alt="CROO Agent Commerce" />
  <img src="https://img.shields.io/badge/CAP-Provider%20Agent-1f6bff?style=for-the-badge" alt="CAP Provider Agent" />
  <img src="https://img.shields.io/badge/Base-Onchain%20Checks-0052ff?style=for-the-badge" alt="Base" />
  <img src="https://img.shields.io/badge/Ethereum-Supported-627eea?style=for-the-badge" alt="Ethereum" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Viem-EVM%20Client-f59e0b?style=for-the-badge" alt="Viem" />
</p>

<p align="center">
  <a href="https://payguard-hack.vercel.app/">Live App</a>
  ·
  <a href="https://payguard-hack.vercel.app/api/agent/manifest">Agent Manifest</a>
  ·
  <a href="https://payguard-hack.vercel.app/api/cap/capability">CAP Capability</a>
</p>

---

## Overview

**PayGuard** is a paid safety agent that other agents call before approving, signing, or paying onchain.

It is built for the **CROO Agent Hackathon** as a live CAP provider agent for autonomous agent commerce. A buyer agent can call PayGuard before it sends funds, approves tokens, or interacts with a contract. PayGuard reviews the proposed action and returns a clear machine readable decision.

```text
ALLOW
WARN
BLOCK
```

PayGuard is not a recovery tool. It works before the signing moment.

```text
Ask PayGuard before the money moves.
```

---

## Live Links

```text
Live app:
https://payguard-hack.vercel.app

Scan page:
https://payguard-hack.vercel.app/scan

Agent manifest:
https://payguard-hack.vercel.app/api/agent/manifest

CAP capability:
https://payguard-hack.vercel.app/api/cap/capability

CAP order endpoint:
https://payguard-hack.vercel.app/api/cap/order
```

---

## Why PayGuard Exists

Agent commerce needs safety infrastructure.

CROO enables agents to discover, hire, and pay other agents. That creates a new risk surface. Buyer agents may approve tokens, call contracts, or settle payments automatically. A bad approval or malicious contract call can cause loss before a human ever sees it.

PayGuard gives autonomous agents a safety checkpoint.

```text
Buyer agent prepares a payment or approval
        ↓
Buyer agent calls PayGuard
        ↓
PayGuard checks calldata, chain state, contract intelligence, and reputation
        ↓
PayGuard returns ALLOW, WARN, or BLOCK
        ↓
Buyer agent continues only when safe
```

The core use case is simple:

```text
A buyer agent is about to approve unlimited WETH.
PayGuard detects the unlimited approval.
PayGuard returns BLOCK.
The buyer agent stops before signing.
```

---

## What PayGuard Does

PayGuard reviews a proposed Web3 action using multiple layers of analysis.

| Layer                 | What PayGuard checks                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| Calldata decoding     | ERC20 approvals, transfers, transferFrom, NFT operator approvals, unknown calls                    |
| Chain evidence        | Deployed code, bytecode size, native balance, token metadata, token balance, allowance, simulation |
| Contract intelligence | Proxy patterns, source verification, reputation signals, explorer metadata                         |
| Policy engine         | Risk checks, severity scoring, ALLOW/WARN/BLOCK decision                                           |
| AI explanation        | Optional Gemini generated plain English summary and agent instruction                              |
| Delivery proof        | Keccak256 report hash and output hash for CAP order delivery                                       |

PayGuard supports:

```text
Base
Ethereum
```

---

## Who Uses PayGuard

| User               | Why they use it                                      |
| ------------------ | ---------------------------------------------------- |
| CROO buyer agents  | Check payments before paying seller agents           |
| Wallet agents      | Stop dangerous approvals before signing              |
| DeFi agents        | Review approvals and contract calls before execution |
| Agent marketplaces | Add a safety gate before settlement                  |
| Human users        | Understand transaction risk before signing           |
| Apps and wallets   | Add a callable risk engine through API               |

---

## CROO Fit

PayGuard is designed as a paid dependency inside the CROO agent commerce layer.

It exposes:

```text
Public agent manifest
Public CAP capability metadata
Authenticated agent scan endpoint
Authenticated counterparty verification endpoint
Authenticated CAP order endpoint
CROO WebSocket provider runtime
Delivery proof for completed work
```

Capability:

```text
payguard_before_signing_payment_risk_scan
```

Service:

```text
Before Signing Payment Risk Scan
```

Pricing:

```text
0.05 USDC on Base
```

SLA:

```text
30 min
```

Tracks:

```text
Data & Verification Agents
DeFi / On-chain Ops Agents
```

CROO store tags used:

```text
Data & Analytics
DeFi & Trading
Automation & Workflow
```

---

## Why This Is Not Just a Scanner

Most scanners are human facing. PayGuard is agent facing.

| Traditional scanner    | PayGuard                              |
| ---------------------- | ------------------------------------- |
| Human opens a website  | Agent calls an endpoint               |
| Human reads warnings   | Agent receives ALLOW, WARN, or BLOCK  |
| Manual workflow        | A2A composable workflow               |
| Usually not priced     | Paid CAP provider capability          |
| No delivery proof      | Keccak256 delivery proof              |
| No buyer agent context | Buyer agent and seller agent aware    |
| No marketplace runtime | CROO provider listens for paid orders |

PayGuard is built so other agents can hire it before they continue.

---

## CROO Provider Runtime

PayGuard includes a CROO provider worker in:

```text
agent/src/croo-provider.ts
```

The provider connects to CROO over WebSocket and waits for marketplace activity.

Runtime flow:

```text
CROO negotiation created
        ↓
PayGuard provider accepts negotiation
        ↓
CROO creates order
        ↓
Buyer pays order
        ↓
PayGuard provider receives OrderPaid event
        ↓
Provider calls deployed PayGuard CAP endpoint
        ↓
PayGuard returns risk report and delivery proof
        ↓
Provider delivers report to CROO with deliverOrder
```

Run provider locally:

```bash
yarn workspace @payguard/agent croo:provider
```

Expected log:

```text
Starting PayGuard CROO provider...
websocket connected
PayGuard provider connected. Waiting for CROO orders...
```

For 24/7 operation, deploy this provider as a long running worker on Render, Railway, Fly.io, or a VPS. The Vercel app hosts the website and HTTP API. The provider worker keeps the CROO WebSocket connection alive.

---

## Main Demo

The main demo uses a risky WETH approval on Base.

Target contract:

```text
Base WETH
0x4200000000000000000000000000000000000006
```

Demo wallet:

```text
0x0000000000000000000000000000000000000001
```

Risky calldata:

```text
0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
```

Decoded action:

```text
approve(address spender, uint256 amount)
spender = 0x1111111111111111111111111111111111111111
amount = uint256.max
```

Expected result:

```text
Decision: BLOCK
Risk level: CRITICAL
Reason: Unlimited token spending authority
Next action: Do not sign
```

---

## Features

### CAP Provider Agent

PayGuard exposes CAP compatible capability metadata and an order endpoint.

```text
GET  /api/cap/capability
POST /api/cap/order
```

CAP order responses include:

```text
Capability ID
Order ID
Optional escrow ID
Delivery status
Paid status
Risk report
Delivery proof
```

### CROO WebSocket Provider

PayGuard also includes a CROO SDK provider worker.

```text
agent/src/croo-provider.ts
```

It handles:

```text
NegotiationCreated
OrderCreated
OrderPaid
OrderCompleted
OrderRejected
OrderExpired
```

On paid orders, it calls:

```text
POST /api/cap/order
```

Then delivers the report back to CROO using:

```text
client.deliverOrder(...)
```

### A2A Callable API

Other agents can call PayGuard directly.

```text
GET  /api/agent/manifest
POST /api/agent/scan
POST /api/agent/verify-counterparty
```

Authenticated endpoints use:

```text
Authorization: Bearer PAYGUARD_AGENT_API_KEY
```

### EVM Calldata Decoder

PayGuard decodes known payment and approval calls.

```text
approve(address spender, uint256 amount)
transfer(address to, uint256 amount)
transferFrom(address from, address to, uint256 amount)
setApprovalForAll(address operator, bool approved)
```

Unknown calls are still reported with the function selector.

### Live Chain Evidence

PayGuard reads live chain data through RPC.

```text
Contract bytecode
Contract bytecode size
Native balance
ERC20 name
ERC20 symbol
ERC20 decimals
Wallet token balance
Current allowance when available
Read only simulation result
```

### Contract Intelligence

PayGuard checks contract level risk signals.

```text
EIP 1967 implementation slot
EIP 1967 admin slot
EIP 1967 beacon slot
ERC 1167 minimal proxy bytecode
Sourcify verification status
GoPlus address reputation
GoPlus token reputation
Blockscout explorer metadata
```

### Policy Scoring

PayGuard converts checks into a risk score and decision.

Examples of policy checks:

```text
Target contract exists
Simulation succeeds
Approval amount is limited
Current allowance is readable
Contract source is verified
Contract reputation has no known risk flags
Proxy implementation is visible
Explorer metadata is available
```

Critical failures can force a `BLOCK`.

### AI Explanation

When enabled, PayGuard asks Gemini for a structured explanation.

The AI output includes:

```text
Title
Plain English summary
User risk explanation
Agent instruction
Safer alternative
```

If AI is disabled or unavailable, PayGuard still returns the deterministic rule based report.

### Delivery Proof

CAP orders include a deterministic delivery proof.

```json
{
  "type": "keccak256_report_hash",
  "verifier": "payguard_core_v1",
  "capabilityId": "payguard_before_signing_payment_risk_scan",
  "requestId": "cap_order_001",
  "reportHash": "0x...",
  "outputHash": "0x...",
  "generatedAt": "2026-07-05T12:38:21.284Z"
}
```

The proof hashes canonical JSON output using `keccak256`.

---

## System Architecture

```mermaid
graph TD
    subgraph Callers["Callers"]
        HUMAN["Human user"]
        BUYER["CROO buyer agent"]
        WALLET["Wallet agent"]
        MARKET["Agent marketplace"]
    end

    subgraph CROO["CROO"]
        STORE["Agent Store"]
        WS["CROO WebSocket"]
        ORDERBOOK["Orders and settlement"]
    end

    subgraph Provider["agent · CROO Provider"]
        WORKER["croo-provider.ts"]
        SDK["CROO SDK"]
    end

    subgraph Web["web · Next.js on Vercel"]
        UI["Scan UI"]
        MANIFEST["GET /api/agent/manifest"]
        SCAN["POST /api/agent/scan"]
        VERIFY["POST /api/agent/verify-counterparty"]
        CAPABILITY["GET /api/cap/capability"]
        ORDER["POST /api/cap/order"]
    end

    subgraph Core["core · PayGuard Engine"]
        DECODER["Calldata decoder"]
        EVIDENCE["Chain evidence"]
        CONTRACT["Contract intelligence"]
        POLICY["Policy checks"]
        SCORE["Risk scoring"]
        AI["AI explanation"]
        PROOF["Delivery proof"]
    end

    subgraph External["External services"]
        RPC["Base / Ethereum RPC"]
        SOURCIFY["Sourcify"]
        GOPLUS["GoPlus"]
        BLOCKSCOUT["Blockscout"]
        GEMINI["Gemini"]
    end

    HUMAN --> UI
    BUYER --> STORE
    STORE --> WS
    WS --> WORKER
    WORKER --> SDK
    WORKER --> ORDER
    BUYER --> MANIFEST
    BUYER --> SCAN
    WALLET --> SCAN
    MARKET --> CAPABILITY

    UI --> SCAN
    SCAN --> DECODER
    ORDER --> DECODER
    VERIFY --> POLICY

    DECODER --> EVIDENCE
    EVIDENCE --> CONTRACT
    CONTRACT --> POLICY
    POLICY --> SCORE
    SCORE --> AI
    SCORE --> PROOF

    EVIDENCE --> RPC
    CONTRACT --> SOURCIFY
    CONTRACT --> GOPLUS
    CONTRACT --> BLOCKSCOUT
    AI --> GEMINI

    WORKER --> ORDERBOOK
```

---

## Repository Structure

```text
payguard/
├── agent/
│   ├── src/
│   │   ├── client.ts
│   │   ├── croo-provider.ts
│   │   ├── index.ts
│   │   └── remote-demo.ts
│   ├── package.json
│   └── tsconfig.json
│
├── core/
│   ├── src/
│   │   ├── ai/
│   │   │   └── explanation.ts
│   │   ├── blockchain/
│   │   │   ├── abi.ts
│   │   │   ├── chains.ts
│   │   │   ├── client.ts
│   │   │   ├── evidence.ts
│   │   │   └── simulation.ts
│   │   ├── cap/
│   │   │   ├── capability.ts
│   │   │   └── proof.ts
│   │   ├── intelligence/
│   │   │   ├── contract.ts
│   │   │   ├── proxy.ts
│   │   │   ├── reputation.ts
│   │   │   └── verification.ts
│   │   ├── policy/
│   │   │   ├── checks.ts
│   │   │   └── scoring.ts
│   │   ├── protocols/
│   │   │   ├── base.ts
│   │   │   ├── bootstrap.ts
│   │   │   ├── decoder.ts
│   │   │   ├── erc20.ts
│   │   │   ├── erc721.ts
│   │   │   ├── erc1155.ts
│   │   │   ├── index.ts
│   │   │   ├── registry.ts
│   │   │   └── unknown.ts
│   │   ├── report/
│   │   │   └── builder.ts
│   │   ├── service/
│   │   │   ├── cap.ts
│   │   │   ├── counterparty.ts
│   │   │   └── response.ts
│   │   ├── index.ts
│   │   └── types.ts
│   ├── package.json
│   └── tsconfig.json
│
├── web/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/
│   │   │   │   ├── manifest/route.ts
│   │   │   │   ├── scan/route.ts
│   │   │   │   └── verify-counterparty/route.ts
│   │   │   ├── cap/
│   │   │   │   ├── capability/route.ts
│   │   │   │   └── order/route.ts
│   │   │   └── scan/route.ts
│   │   ├── scan/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── public/
│   │   └── logo.png
│   ├── package.json
│   └── next.config.ts
│
├── .env.example
├── .prettierrc.json
├── package.json
├── vercel.json
└── yarn.lock
```

---

## Package Roles

### `web`

The Next.js app.

It provides:

```text
Landing page
Scan page
Public manifest endpoint
CAP capability endpoint
Authenticated scan endpoint
Authenticated CAP order endpoint
Authenticated counterparty endpoint
```

### `core`

The shared PayGuard engine.

It owns:

```text
Types
Decoding
Chain evidence
Contract intelligence
Policy checks
Scoring
AI explanation
CAP proof generation
Service response creation
```

### `agent`

The agent runtime and proof package.

It provides:

```text
PayGuard API client
Local service runner
Remote CAP demo
CROO WebSocket provider
End to end verification script
```

---

## API Reference

Replace `https://YOUR_DEPLOYED_APP_URL` with the deployed app URL.

### Agent Manifest

```text
GET /api/agent/manifest
```

Public endpoint.

```bash
curl https://YOUR_DEPLOYED_APP_URL/api/agent/manifest
```

Returns:

```text
Service metadata
Provider type
Supported capabilities
CAP endpoint metadata
Input schema
Output schema
Supported chains
```

---

### CAP Capability

```text
GET /api/cap/capability
```

Public endpoint.

```bash
curl https://YOUR_DEPLOYED_APP_URL/api/cap/capability
```

Returns the PayGuard paid capability.

```json
{
  "provider": {
    "name": "PayGuard",
    "type": "paid_security_agent",
    "network": "base"
  },
  "capability": {
    "id": "payguard_before_signing_payment_risk_scan",
    "name": "PayGuard",
    "version": "1.0.0",
    "category": "web3_payment_safety",
    "pricing": {
      "model": "fixed",
      "amount": "0.05",
      "currency": "USDC",
      "network": "base"
    }
  }
}
```

---

### Agent Scan

```text
POST /api/agent/scan
Authorization: Bearer PAYGUARD_AGENT_API_KEY
```

Callable by another agent.

```bash
curl -X POST https://YOUR_DEPLOYED_APP_URL/api/agent/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AGENT_API_KEY" \
  -d '{
    "requestId": "scan_001",
    "buyerAgentId": "croo_buyer_agent",
    "sellerAgentId": "croo_seller_agent",
    "action": {
      "chain": "base",
      "walletAddress": "0x0000000000000000000000000000000000000001",
      "targetAddress": "0x4200000000000000000000000000000000000006",
      "transactionData": "0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      "valueWei": "0",
      "purpose": "Approve WETH before paying seller agent"
    }
  }'
```

---

### CAP Order

```text
POST /api/cap/order
Authorization: Bearer PAYGUARD_AGENT_API_KEY
```

Creates a CAP order style response with the PayGuard report and delivery proof.

```bash
curl -X POST https://YOUR_DEPLOYED_APP_URL/api/cap/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AGENT_API_KEY" \
  -d '{
    "requestId": "cap_order_001",
    "buyerAgentId": "croo_buyer_agent",
    "sellerAgentId": "croo_seller_agent",
    "action": {
      "chain": "base",
      "walletAddress": "0x0000000000000000000000000000000000000001",
      "targetAddress": "0x4200000000000000000000000000000000000006",
      "transactionData": "0x095ea7b30000000000000000000001111111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      "valueWei": "0",
      "purpose": "CAP paid safety scan before approval"
    },
    "cap": {
      "orderId": "local_order_001",
      "buyerAddress": "0x0000000000000000000000000000000000000001",
      "paymentTokenAddress": "0x4200000000000000000000000000000000000006",
      "paymentAmountRaw": "50000"
    }
  }'
```

---

### Counterparty Verification

```text
POST /api/agent/verify-counterparty
Authorization: Bearer PAYGUARD_AGENT_API_KEY
```

Checks a proposed counterparty payment request.

```bash
curl -X POST https://YOUR_DEPLOYED_APP_URL/api/agent/verify-counterparty \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AGENT_API_KEY" \
  -d '{
    "requestId": "counterparty_001",
    "buyerAgentId": "croo_buyer_agent",
    "sellerAgentId": "croo_seller_agent",
    "recipientAddress": "0x3333333333333333333333333333333333333333",
    "paymentTokenAddress": "0x4200000000000000000000000000000000000006",
    "paymentAmountRaw": "50000"
  }'
```

---

## Response Shape

A successful scan response is designed for both humans and agents.

```json
{
  "ok": true,
  "service": "PayGuard",
  "version": "0.1.0",
  "requestId": "remote_scan_001",
  "buyerAgentId": "croo_buyer_agent",
  "sellerAgentId": "croo_seller_agent",
  "status": "completed",
  "canContinue": false,
  "report": {
    "decision": "BLOCK",
    "canContinue": false,
    "riskScore": 100,
    "riskLevel": "CRITICAL",
    "summary": "PayGuard found high risk signals and recommends stopping this action.",
    "decodedAction": {
      "type": "ERC20_APPROVE",
      "functionName": "approve",
      "spender": "0x1111111111111111111111111111111111111111",
      "amountRaw": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      "unlimited": true
    },
    "nextAction": "Do not sign this action until the requester, spender, and contract behavior are verified."
  }
}
```

---

## CAP Payment Status

During local endpoint testing, a CAP order can return:

```json
{
  "paid": false
}
```

That is intentional.

PayGuard only reports `paid: true` when a real CROO payment transaction hash is present.

When running through the CROO provider, the provider reads the CROO order metadata and forwards payment data into the PayGuard CAP response.

Optional local CAP metadata:

```env
CROO_CAP_ORDER_ID=real_order_id
CROO_ESCROW_ID=real_escrow_id
CROO_PAYMENT_TX_HASH=real_payment_tx_hash
```

---

## Environment Variables

### `web/.env.local`

```env
BASE_RPC_URL=https://mainnet.base.org
ETHEREUM_RPC_URL=https://ethereum-rpc.publicnode.com

PAYGUARD_AGENT_API_KEY=replace_with_strong_random_secret

PAYGUARD_AI_ENABLED=true
GEMINI_API_KEY=replace_with_new_rotated_gemini_key
GEMINI_MODEL=gemini-2.5-flash

CROO_CAP_ORDER_ID=
CROO_ESCROW_ID=
CROO_PAYMENT_TX_HASH=
```

### `agent/.env`

For local remote demos and CROO provider runtime:

```env
PAYGUARD_SERVICE_URL=https://payguard-hack.vercel.app
PAYGUARD_AGENT_API_KEY=replace_with_same_secret_as_web

CROO_API_URL=https://api.croo.network
CROO_WS_URL=wss://api.croo.network/ws
CROO_API_KEY=replace_with_croo_key
CROO_SDK_KEY=replace_with_croo_key

CROO_CAP_ORDER_ID=
CROO_ESCROW_ID=
CROO_PAYMENT_TX_HASH=
```

Generate a strong PayGuard API key:

```bash
openssl rand -hex 32
```

Never commit:

```text
.env
.env.local
web/.env.local
agent/.env
```

---

## Vercel Deployment

This is a Yarn workspace monorepo. Vercel must build from the repository root because `web` depends on `@payguard/core`.

### Vercel Settings

```text
Root Directory: .
Framework Preset: Next.js
Install Command: yarn install
Build Command: yarn build:core && yarn build:web
Output Directory: web/.next
```

### `vercel.json`

```json
{
  "installCommand": "yarn install",
  "buildCommand": "yarn build:core && yarn build:web",
  "outputDirectory": "web/.next",
  "framework": "nextjs"
}
```

### Required Vercel Environment Variables

```env
BASE_RPC_URL=https://mainnet.base.org
ETHEREUM_RPC_URL=https://ethereum-rpc.publicnode.com
PAYGUARD_AGENT_API_KEY=replace_with_strong_random_secret
PAYGUARD_AI_ENABLED=true
GEMINI_API_KEY=replace_with_new_rotated_gemini_key
GEMINI_MODEL=gemini-2.5-flash
```

Optional:

```env
CROO_CAP_ORDER_ID=
CROO_ESCROW_ID=
CROO_PAYMENT_TX_HASH=
```

Do not set `PAYGUARD_SERVICE_URL` in Vercel. That variable is used by the provider and local agent clients.

---

## Render Provider Deployment

Vercel hosts the website and HTTP API. Render can run the long lived CROO provider process.

Create a Render Background Worker or Web Service with these settings:

```text
Name:
payguard-croo-provider

Runtime:
Node

Build Command:
yarn install && yarn build:core && yarn build:agent

Start Command:
yarn workspace @payguard/agent croo:provider
```

Required Render environment variables:

```env
PAYGUARD_SERVICE_URL=https://payguard-hack.vercel.app
PAYGUARD_AGENT_API_KEY=replace_with_same_secret_as_vercel

CROO_API_URL=https://api.croo.network
CROO_WS_URL=wss://api.croo.network/ws
CROO_API_KEY=replace_with_croo_key
CROO_SDK_KEY=replace_with_croo_key
```

Expected provider logs:

```text
Starting PayGuard CROO provider...
websocket connected
PayGuard provider connected. Waiting for CROO orders...
```

When this worker is running, the CROO Agent Store should show PayGuard as online.

---

## Local Development

### Prerequisites

```text
Node.js 20+
Yarn 1.x
```

### Install

```bash
git clone https://github.com/Adeel91/payguard.git
cd payguard
yarn install
```

### Run Web App

```bash
yarn dev:web
```

Open:

```text
http://localhost:3000
http://localhost:3000/scan
```

### Run Local Agent Proof

```bash
yarn dev:agent
```

### Run CROO Provider Locally

```bash
yarn workspace @payguard/agent croo:provider
```

Expected result:

```text
PayGuard provider connected. Waiting for CROO orders...
```

### Run Remote CAP Demo

Start the web app first:

```bash
yarn dev:web
```

In another terminal:

```bash
yarn verify:remote
```

Expected result:

```text
PayGuard remote CAP demo passed.
```

---

## Main Scripts

| Script                                         | Description                                         |
| ---------------------------------------------- | --------------------------------------------------- |
| `yarn dev:web`                                 | Run the Next.js web app                             |
| `yarn build:web`                               | Build the web app                                   |
| `yarn build:core`                              | Build the shared core package                       |
| `yarn build:agent`                             | Build the agent package                             |
| `yarn typecheck`                               | Typecheck core and agent                            |
| `yarn lint`                                    | Run web lint plus core and agent typechecks         |
| `yarn fix`                                     | Format and auto fix lint                            |
| `yarn verify`                                  | Format check, lint, typecheck, and build everything |
| `yarn verify:remote`                           | Run the remote CAP demo                             |
| `yarn workspace @payguard/agent croo:provider` | Start the CROO provider worker                      |

---

## CROO Agent Store Listing

### Name

```text
PayGuard
```

### One Liner

```text
Paid before signing safety agent for Web3 agent commerce.
```

### Description

```text
PayGuard is a paid before-signing safety agent for Web3 agent commerce.

Buyer agents call PayGuard before approving tokens, signing calldata, or paying another agent. PayGuard decodes the transaction, checks live chain evidence, contract verification, reputation signals, simulation result, and policy risk.

It returns a machine-readable ALLOW, WARN, or BLOCK decision with evidence and delivery proof, so the buyer agent knows whether to continue or stop before funds move.
```

### Service

```text
Before Signing Payment Risk Scan
```

### Service Description

```text
Reviews a proposed EVM transaction or agent payment before signing. PayGuard decodes calldata, checks live chain evidence, contract verification, reputation signals, simulation result, and policy risk, then returns ALLOW, WARN, or BLOCK with delivery proof.
```

### Requirements

```text
Provide the transaction to scan before signing.

Required fields:
chain: base or ethereum
walletAddress: wallet preparing to sign
targetAddress: contract or recipient address
transactionData: calldata starting with 0x
purpose: why this action is being considered

Agents may send the same fields as JSON.
```

### Deliverable

```text
PayGuard returns a JSON risk report with ALLOW, WARN, or BLOCK decision, risk score, decoded action, evidence, next action, and delivery proof.
```

### Price

```text
0.05 USDC
```

### SLA

```text
30 min
```

### Require Fund Transfer

```text
No
```

### Tracks

```text
Data & Verification Agents
DeFi / On-chain Ops Agents
```

### Tags

```text
Data & Analytics
DeFi & Trading
Automation & Workflow
```

### Public Endpoints

```text
Manifest:
https://payguard-hack.vercel.app/api/agent/manifest

CAP capability:
https://payguard-hack.vercel.app/api/cap/capability
```

### Authenticated Endpoints

```text
Agent scan:
https://payguard-hack.vercel.app/api/agent/scan

CAP order:
https://payguard-hack.vercel.app/api/cap/order

Counterparty check:
https://payguard-hack.vercel.app/api/agent/verify-counterparty
```

---

## Demo Script

Use this flow for the demo video.

```text
1. Open the deployed PayGuard app.
2. Explain that PayGuard is called before signing or payment.
3. Open the scan page.
4. Click Risky approval.
5. Run the scan.
6. Show the BLOCK decision.
7. Show decoded ERC20 approval and unlimited spending risk.
8. Open the agent manifest endpoint.
9. Open the CAP capability endpoint.
10. Open CROO Agent Store.
11. Show PayGuard listed as LIVE.
12. Show the service card: Before Signing Payment Risk Scan.
13. Show the CROO provider terminal connected.
14. Explain that the provider listens for CROO orders and delivers PayGuard reports.
15. Explain that buyer agents stop when PayGuard returns BLOCK.
```

---

## Security Model

PayGuard is a pre execution risk analysis tool.

It does not:

```text
Custody funds
Sign transactions
Submit transactions
Guarantee contract safety
Recover stolen funds
Replace wallet security
Replace smart contract audits
```

It does:

```text
Review proposed actions before signing
Decode dangerous approval patterns
Read live chain evidence
Check contract verification and reputation
Return a machine readable decision
Deliver CAP order results through CROO
Give agents a reason to stop before loss happens
```

The safest integration pattern is:

```text
Agent prepares action
Agent calls PayGuard
Agent receives report
Agent continues only if decision is ALLOW
Agent pauses or asks for review if decision is WARN or BLOCK
```

---

## Current Limitations

PayGuard is a hackathon implementation and should be treated as an MVP safety checkpoint.

Current limitations:

```text
No formal third party security audit
No guaranteed detection of every malicious contract
No full ABI discovery for arbitrary contracts
No transaction submission
No private mempool monitoring
No fund recovery
Third party checks depend on RPC, Sourcify, GoPlus, Blockscout, and Gemini availability
Paid status depends on CROO payment transaction metadata
CROO provider must run as a long lived worker to stay online
```

---

## Design Principles

1. **Before signing first**  
   The most valuable warning is the one that happens before funds move.

2. **Agent readable by default**  
   Every result must be usable by another autonomous agent.

3. **Clear decisions**  
   Agents should not parse vague text. They need ALLOW, WARN, or BLOCK.

4. **Evidence based reports**  
   Decisions should include decoded calldata, chain evidence, contract intelligence, and policy checks.

5. **Commerce aware**  
   PayGuard is designed as a paid dependency in agent to agent workflows.

6. **Honest execution**  
   Local delivery, CROO provider delivery, and real paid settlement are represented separately.

---

## What PayGuard Proves

PayGuard proves that agent commerce needs paid safety infrastructure.

In a CROO flow, a buyer agent should not blindly approve tokens, sign calldata, or settle payments. It should call a specialized safety agent first.

PayGuard is that agent.

```text
Agent prepares action
        ↓
PayGuard reviews the action
        ↓
PayGuard returns ALLOW, WARN, or BLOCK
        ↓
Agent continues only when safe
```

The result is a practical A2A security primitive for autonomous commerce: paid, callable, machine readable, and delivered with proof.

---

## License

MIT License.
