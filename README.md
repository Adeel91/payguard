<h1 align="center">PayGuard</h1>

<p align="center">
  <strong>Paid before signing safety agent for Web3 agent commerce</strong>
</p>

<p align="center">
  CAP Provider Agent • A2A Callable API • Web3 Payment Risk Scan • Contract Intelligence • Delivery Proofs
</p>

<p align="center">
  <img src="https://img.shields.io/badge/CROO-Agent%20Commerce-111827?style=for-the-badge" alt="CROO Agent Commerce" />
  <img src="https://img.shields.io/badge/CAP-Provider%20Agent-7c3aed?style=for-the-badge" alt="CAP Provider Agent" />
  <img src="https://img.shields.io/badge/Base-Onchain%20Checks-0052ff?style=for-the-badge" alt="Base" />
  <img src="https://img.shields.io/badge/Ethereum-Supported-627eea?style=for-the-badge" alt="Ethereum" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Viem-EVM%20Client-f59e0b?style=for-the-badge" alt="Viem" />
</p>

<p align="center">
  <a href="https://payguard-hack.vercel.app/">Live App</a>
  ·
  <a href="https://payguard-hack.vercel.app//api/agent/manifest">Agent Manifest</a>
  ·
  <a href="https://payguard-hack.vercel.app//api/cap/capability">CAP Capability</a>
</p>

---

## Overview

**PayGuard** is a paid safety agent that other agents call before approving, signing, or paying onchain.

It is built for the **CROO Agent Hackathon** as a CAP provider agent for autonomous agent commerce. A buyer agent can call PayGuard before it sends funds, approves tokens, or interacts with a contract. PayGuard reviews the proposed action and returns a clear machine readable decision.

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
Delivery proof for completed work
```

Capability:

```text
payguard_before_signing_payment_risk_scan
```

Pricing:

```text
0.05 USDC on Base
```

Tracks:

```text
Data & Verification Agents
DeFi / On-chain Ops Agents
```

---

## Why This Is Not Just a Scanner

Most scanners are human facing. PayGuard is agent facing.

| Traditional scanner    | PayGuard                             |
| ---------------------- | ------------------------------------ |
| Human opens a website  | Agent calls an endpoint              |
| Human reads warnings   | Agent receives ALLOW, WARN, or BLOCK |
| Manual workflow        | A2A composable workflow              |
| Usually not priced     | Paid CAP provider capability         |
| No delivery proof      | Keccak256 delivery proof             |
| No buyer agent context | Buyer agent and seller agent aware   |

PayGuard is built so other agents can hire it before they continue.

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

    subgraph Web["web · Next.js"]
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
    BUYER --> MANIFEST
    BUYER --> SCAN
    BUYER --> ORDER
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
```

---

## Repository Structure

```text
payguard/
├── agent/
│   ├── src/
│   │   ├── client.ts
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

The agent proof and remote client.

It provides:

```text
PayGuard API client
Local service runner
Remote CAP demo
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
      "transactionData": "0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
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

During local testing, a CAP order can return:

```json
{
  "paid": false
}
```

That is intentional.

PayGuard only reports `paid: true` when a real CROO payment transaction hash is present.

```env
CROO_PAYMENT_TX_HASH=0x_real_payment_transaction_hash
```

Optional CAP metadata:

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

```env
PAYGUARD_SERVICE_URL=http://localhost:3000
PAYGUARD_AGENT_API_KEY=replace_with_same_secret_as_web

BASE_RPC_URL=https://mainnet.base.org
ETHEREUM_RPC_URL=https://ethereum-rpc.publicnode.com

PAYGUARD_AI_ENABLED=true
GEMINI_API_KEY=replace_with_new_rotated_gemini_key
GEMINI_MODEL=gemini-2.5-flash

CROO_CAP_ORDER_ID=
CROO_ESCROW_ID=
CROO_PAYMENT_TX_HASH=
```

For deployed testing:

```env
PAYGUARD_SERVICE_URL=https://YOUR_DEPLOYED_APP_URL
```

Generate a strong API key:

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

Do not set `PAYGUARD_SERVICE_URL` in Vercel. That variable is only used by the local agent client.

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

| Script               | Description                                         |
| -------------------- | --------------------------------------------------- |
| `yarn dev:web`       | Run the Next.js web app                             |
| `yarn build:web`     | Build the web app                                   |
| `yarn build:core`    | Build the shared core package                       |
| `yarn build:agent`   | Build the agent package                             |
| `yarn typecheck`     | Typecheck core and agent                            |
| `yarn lint`          | Run web lint plus core and agent typechecks         |
| `yarn fix`           | Format and auto fix lint                            |
| `yarn verify`        | Format check, lint, typecheck, and build everything |
| `yarn verify:remote` | Run the remote CAP demo                             |

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
PayGuard is a callable CAP provider agent that buyer agents use before approving, signing, or paying. It decodes calldata, reads live chain evidence, checks contract verification and reputation, simulates the action, applies policy scoring, and returns ALLOW, WARN, or BLOCK with a delivery proof.
```

### Price

```text
0.05 USDC on Base
```

### Tracks

```text
Data & Verification Agents
DeFi / On-chain Ops Agents
```

### Public Endpoints

```text
Manifest:
https://YOUR_DEPLOYED_APP_URL/api/agent/manifest

CAP capability:
https://YOUR_DEPLOYED_APP_URL/api/cap/capability
```

### Authenticated Endpoints

```text
Agent scan:
https://YOUR_DEPLOYED_APP_URL/api/agent/scan

CAP order:
https://YOUR_DEPLOYED_APP_URL/api/cap/order

Counterparty check:
https://YOUR_DEPLOYED_APP_URL/api/agent/verify-counterparty
```

---

## Demo Script

Use this flow for the demo video.

```text
1. Open the deployed PayGuard app
2. Explain that PayGuard is called before signing or payment
3. Open the agent manifest endpoint
4. Open the CAP capability endpoint
5. Run the remote demo against the deployed URL
6. Show the buyer agent requesting a WETH approval scan
7. Show PayGuard decoding the approval calldata
8. Show the unlimited approval risk
9. Show the BLOCK decision
10. Show the CAP order status as DELIVERED
11. Show the delivery proof hash
12. Explain that a buyer agent stops before signing when PayGuard returns BLOCK
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
   Local delivery and real paid settlement are represented separately.

---

## License

MIT License.

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
