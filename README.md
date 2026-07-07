<p align="center">
  <img src="web/public/logo.png" width="140" alt="PayGuard Logo" />
</p>

<h1 align="center">PayGuard</h1>

<p align="center">
  <strong>Paid before-signing safety and approval repair agent for Web3 agent commerce</strong>
</p>

<p align="center">
  CAP Provider Agent • A2A Callable API • CROO Provider Runtime • Web3 Risk Scan • Safe Approval Fix • Delivery Proofs
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
  ·
  <a href="https://agent.croo.network/agents/47460383-b9cc-486c-a349-68ac98098f4b">CROO Agent Store</a>
</p>

---

## Overview

**PayGuard** is a paid before-signing safety agent for Web3 agent commerce.

It is built for the **CROO Agent Hackathon** as a live CAP provider agent. Buyer agents can hire PayGuard before approving tokens, signing calldata, or paying another agent. PayGuard returns a clear machine-readable decision:

```text
ALLOW
WARN
BLOCK
```

PayGuard also includes a paid repair service for unsafe ERC20 approvals:

```text
FIXED
```

That means PayGuard does not only warn agents before signing. It can also generate safer replacement approval calldata when an approval grants unsafe or unlimited spending authority.

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

Safe Approval Fix endpoint:
https://payguard-hack.vercel.app/api/cap/fix-approval

CROO Agent Store:
https://agent.croo.network/agents/47460383-b9cc-486c-a349-68ac98098f4b

CrooCred report:
https://croocred.axiqo.xyz/r/cc-47460383-20260706100512.html
```

---

## Why PayGuard Exists

Agent commerce needs safety infrastructure.

CROO enables agents to discover, hire, and pay other agents. That creates a new risk surface. Buyer agents may approve tokens, call contracts, or settle payments automatically. A bad approval or malicious contract call can cause loss before a human ever sees it.

PayGuard gives autonomous agents a safety checkpoint.

```text
Buyer agent prepares a payment or approval
        ↓
Buyer agent hires PayGuard on CROO
        ↓
PayGuard checks calldata, chain state, contract intelligence, and reputation
        ↓
PayGuard returns ALLOW, WARN, BLOCK, or FIXED
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

The premium repair use case goes further:

```text
A buyer agent has unsafe unlimited approval calldata.
Buyer agent hires Safe Approval Fix.
PayGuard generates limited approve() replacement calldata.
Buyer agent signs the safer replacement instead of the unsafe original.
```

---

## Paid Services

PayGuard exposes three CROO services.

| Service                    | Price     | Purpose                                                               |
| -------------------------- | --------- | --------------------------------------------------------------------- |
| Token Approval Scan        | 0.05 USDC | Fast before-signing scan for ERC20 approval calldata                  |
| Full Transaction Risk Scan | 0.10 USDC | Full before-signing transaction risk scan with AI explanation         |
| Safe Approval Fix          | 0.50 USDC | Repairs unsafe approval calldata into safer limited approval calldata |

---

## What PayGuard Does

PayGuard reviews proposed Web3 actions using multiple layers of analysis.

| Layer                 | What PayGuard checks                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| Calldata decoding     | ERC20 approvals, transfers, transferFrom, NFT operator approvals, unknown calls                    |
| Chain evidence        | Deployed code, bytecode size, native balance, token metadata, token balance, allowance, simulation |
| Contract intelligence | Proxy patterns, source verification, reputation signals, explorer metadata                         |
| Policy engine         | Risk checks, severity scoring, ALLOW/WARN/BLOCK decision                                           |
| AI explanation        | Optional Gemini-generated plain-English explanation and agent instruction                          |
| Approval repair       | Generates safer limited approve(spender, amount) calldata                                          |
| Delivery proof        | Keccak256 report hash and output hash for CAP order delivery                                       |

PayGuard supports:

```text
Base
Ethereum
```

---

## Service Modes

### Token Approval Scan

Fast scan for token approvals.

```text
Price: 0.05 USDC
Endpoint used internally: POST /api/cap/order
scanMode: approval
AI explanation: disabled
```

Returns:

```text
ALLOW
WARN
BLOCK
```

Use this when the buyer agent only needs to check an ERC20 approval before signing.

---

### Full Transaction Risk Scan

Full before-signing transaction review.

```text
Price: 0.10 USDC
Endpoint used internally: POST /api/cap/order
scanMode: full
AI explanation: enabled when configured
```

Returns:

```text
ALLOW
WARN
BLOCK
```

Use this when the buyer agent wants the complete risk report with decoded calldata, chain evidence, contract intelligence, simulation, reputation checks, policy checks, and optional AI explanation.

---

### Safe Approval Fix

Premium approval repair service.

```text
Price: 0.50 USDC
Endpoint used internally: POST /api/cap/fix-approval
serviceMode: fix_approval
```

Returns:

```text
FIXED
```

Safe Approval Fix generates replacement ERC20 approval calldata.

It returns:

```text
What was wrong
Why it was dangerous
Why the fix is safer
Replacement targetAddress
Replacement transactionData
Signing instructions
Verification checklist
Delivery proof
```

Example:

```text
Unsafe input:
approve(spender, uint256.max)

Safe replacement:
approve(spender, safeAmountRaw)
```

---

## Who Uses PayGuard

| User               | Why they use it                                       |
| ------------------ | ----------------------------------------------------- |
| CROO buyer agents  | Check or repair approvals before paying seller agents |
| Wallet agents      | Stop dangerous approvals before signing               |
| DeFi agents        | Review approvals and contract calls before execution  |
| Agent marketplaces | Add a safety gate before settlement                   |
| Human users        | Understand transaction risk before signing            |
| Apps and wallets   | Add a callable risk engine through API                |

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
Authenticated Safe Approval Fix endpoint
CROO WebSocket provider runtime
Delivery proof for completed work
```

Capability:

```text
payguard_before_signing_payment_risk_scan
```

Primary service:

```text
Full Transaction Risk Scan
```

Service lineup:

```text
Token Approval Scan — 0.05 USDC
Full Transaction Risk Scan — 0.10 USDC
Safe Approval Fix — 0.50 USDC
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

Most scanners are human-facing. PayGuard is agent-facing.

| Traditional scanner    | PayGuard                                    |
| ---------------------- | ------------------------------------------- |
| Human opens a website  | Agent hires a paid provider                 |
| Human reads warnings   | Agent receives ALLOW, WARN, BLOCK, or FIXED |
| Manual workflow        | A2A composable workflow                     |
| Usually not priced     | Paid CROO/CAP service                       |
| No delivery proof      | Keccak256 delivery proof                    |
| No buyer agent context | Buyer agent and seller agent aware          |
| No repair path         | Can generate safer approval calldata        |
| No marketplace runtime | CROO provider listens for paid orders       |

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
Provider checks which PayGuard service was purchased
        ↓
Provider calls the correct deployed PayGuard API route
        ↓
PayGuard returns report and delivery proof
        ↓
Provider delivers report to CROO with deliverOrder
```

Service routing:

```text
Token Approval Scan
        ↓
POST /api/cap/order
scanMode: approval

Full Transaction Risk Scan
        ↓
POST /api/cap/order
scanMode: full

Safe Approval Fix
        ↓
POST /api/cap/fix-approval
serviceMode: fix_approval
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

For 24/7 operation, deploy this provider as a long-running worker on Render, Railway, Fly.io, or a VPS. The Vercel app hosts the website and HTTP API. The provider worker keeps the CROO WebSocket connection alive.

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

Expected scan result:

```text
Decision: BLOCK
Risk level: CRITICAL
Reason: Unlimited token spending authority
Next action: Do not sign
```

Expected fix result:

```text
Decision: FIXED
Replacement targetAddress: 0x4200000000000000000000000000000000000006
Replacement transactionData: approve(spender, safeAmountRaw)
Reason: Limited approval reduces spender authority
```

---

## Features

### CAP Provider Agent

PayGuard exposes CAP-compatible capability metadata and paid order endpoints.

```text
GET  /api/cap/capability
POST /api/cap/order
POST /api/cap/fix-approval
```

CAP order responses include:

```text
Capability ID
Order ID
Optional escrow ID
Delivery status
Paid status
Risk report or fix report
Delivery proof
```

---

### CROO WebSocket Provider

PayGuard includes a CROO SDK provider worker.

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

On paid orders, it calls one of:

```text
POST /api/cap/order
POST /api/cap/fix-approval
```

Then it delivers the result back to CROO using:

```text
client.deliverOrder(...)
```

---

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

---

### EVM Calldata Decoder

PayGuard decodes known payment and approval calls.

```text
approve(address spender, uint256 amount)
transfer(address to, uint256 amount)
transferFrom(address from, address to, uint256 amount)
setApprovalForAll(address operator, bool approved)
```

Unknown calls are still reported with the function selector.

---

### Safe Approval Fix

PayGuard can generate safer replacement calldata for unsafe ERC20 approvals.

Input:

```text
chain
tokenAddress
spenderAddress
safeAmountRaw
purpose
currentTransactionData optional
walletAddress optional
```

Output:

```text
decision: FIXED
replacement.targetAddress
replacement.transactionData
replacement.functionName
replacement.spenderAddress
replacement.safeAmountRaw
whatWasWrong
whyThisIsDangerous
whyThisFixIsSafer
signingInstructions
verificationChecklist
deliveryProof
```

---

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
Read-only simulation result
```

---

### Contract Intelligence

PayGuard checks contract-level risk signals.

```text
EIP-1967 implementation slot
EIP-1967 admin slot
EIP-1967 beacon slot
ERC-1167 minimal proxy bytecode
Sourcify verification status
GoPlus address reputation
GoPlus token reputation
Blockscout explorer metadata
```

---

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

---

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

AI is enabled for the Full Transaction Risk Scan and disabled for the cheaper Token Approval Scan.

If AI is disabled or unavailable, PayGuard still returns the deterministic rule-based report.

---

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
        ROUTER["Service router"]
        SDK["CROO SDK"]
    end

    subgraph Web["web · Next.js on Vercel"]
        UI["Scan UI"]
        MANIFEST["GET /api/agent/manifest"]
        SCAN["POST /api/agent/scan"]
        VERIFY["POST /api/agent/verify-counterparty"]
        CAPABILITY["GET /api/cap/capability"]
        ORDER["POST /api/cap/order"]
        FIX["POST /api/cap/fix-approval"]
    end

    subgraph Core["core · PayGuard Engine"]
        DECODER["Calldata decoder"]
        EVIDENCE["Chain evidence"]
        CONTRACT["Contract intelligence"]
        POLICY["Policy checks"]
        SCORE["Risk scoring"]
        FIXER["Safe approval fix"]
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
    WORKER --> ROUTER
    ROUTER --> ORDER
    ROUTER --> FIX
    WORKER --> SDK

    BUYER --> MANIFEST
    BUYER --> SCAN
    WALLET --> SCAN
    MARKET --> CAPABILITY

    UI --> SCAN
    SCAN --> DECODER
    ORDER --> DECODER
    FIX --> FIXER
    VERIFY --> POLICY

    DECODER --> EVIDENCE
    EVIDENCE --> CONTRACT
    CONTRACT --> POLICY
    POLICY --> SCORE
    SCORE --> AI
    SCORE --> PROOF
    FIXER --> PROOF

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
│   │   ├── remote-demo.ts
│   │   └── croo/
│   │       ├── env.ts
│   │       ├── fix-approval.ts
│   │       ├── handlers.ts
│   │       ├── input.ts
│   │       ├── payguard-client.ts
│   │       ├── reports.ts
│   │       └── types.ts
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
│   │   │   ├── fix-approval.ts
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
│   │   │   │   ├── fix-approval/
│   │   │   │   │   ├── input.ts
│   │   │   │   │   └── route.ts
│   │   │   │   └── order/
│   │   │   │       ├── input.ts
│   │   │   │       └── route.ts
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
Authenticated Safe Approval Fix endpoint
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
Safe approval fix generation
CAP proof generation
Service response creation
```

### `agent`

The agent runtime and CROO provider.

It provides:

```text
PayGuard API client
Local service runner
Remote CAP demo
CROO WebSocket provider
CROO service routing
End-to-end verification script
```

---

## API Reference

Replace `https://YOUR_DEPLOYED_APP_URL` with the deployed app URL.

---

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

Returns the PayGuard paid capability metadata.

The default published CAP capability price represents the default Full Transaction Risk Scan:

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
      "amount": "0.10",
      "currency": "USDC",
      "network": "base"
    }
  }
}
```

CROO Store services may have different prices:

```text
Token Approval Scan — 0.05 USDC
Full Transaction Risk Scan — 0.10 USDC
Safe Approval Fix — 0.50 USDC
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

### CAP Order: Full Transaction Risk Scan

```text
POST /api/cap/order
Authorization: Bearer PAYGUARD_AGENT_API_KEY
```

```bash
curl -X POST https://YOUR_DEPLOYED_APP_URL/api/cap/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AGENT_API_KEY" \
  -d '{
    "requestId": "full_scan_001",
    "buyerAgentId": "croo_buyer_agent",
    "sellerAgentId": "croo_seller_agent",
    "scanMode": "full",
    "action": {
      "chain": "base",
      "walletAddress": "0x0000000000000000000000000000000000000001",
      "targetAddress": "0x4200000000000000000000000000000000000006",
      "transactionData": "0x095ea7b30000000000000000000001111111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      "valueWei": "0",
      "purpose": "Full risk scan before signing"
    },
    "cap": {
      "orderId": "local_order_001",
      "buyerAddress": "0x0000000000000000000000000000000000000001",
      "paymentTokenAddress": "0x4200000000000000000000000000000000000006",
      "paymentAmountRaw": "100000"
    }
  }'
```

---

### CAP Order: Token Approval Scan

```text
POST /api/cap/order
Authorization: Bearer PAYGUARD_AGENT_API_KEY
```

```bash
curl -X POST https://YOUR_DEPLOYED_APP_URL/api/cap/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AGENT_API_KEY" \
  -d '{
    "requestId": "approval_scan_001",
    "buyerAgentId": "croo_buyer_agent",
    "sellerAgentId": "croo_seller_agent",
    "scanMode": "approval",
    "action": {
      "chain": "base",
      "walletAddress": "0x0000000000000000000000000000000000000001",
      "targetAddress": "0x4200000000000000000000000000000000000006",
      "transactionData": "0x095ea7b30000000000000000000001111111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      "valueWei": "0",
      "purpose": "Check this token approval before signing"
    },
    "cap": {
      "orderId": "local_order_002",
      "buyerAddress": "0x0000000000000000000000000000000000000001",
      "paymentTokenAddress": "0x4200000000000000000000000000000000000006",
      "paymentAmountRaw": "50000"
    }
  }'
```

---

### CAP Order: Safe Approval Fix

```text
POST /api/cap/fix-approval
Authorization: Bearer PAYGUARD_AGENT_API_KEY
```

```bash
curl -X POST https://YOUR_DEPLOYED_APP_URL/api/cap/fix-approval \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AGENT_API_KEY" \
  -d '{
    "requestId": "safe_approval_fix_001",
    "buyerAgentId": "croo_buyer_agent",
    "sellerAgentId": "payguard_provider_agent",
    "fix": {
      "chain": "base",
      "walletAddress": "0x0000000000000000000000000000000000000001",
      "tokenAddress": "0x4200000000000000000000000000000000000006",
      "spenderAddress": "0x1111111111111111111111111111111111111111",
      "safeAmountRaw": "100000000000000000",
      "currentTransactionData": "0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      "purpose": "Replace unlimited WETH approval with limited approval"
    },
    "cap": {
      "orderId": "local_order_003",
      "buyerAddress": "0x0000000000000000000000000000000000000001",
      "paymentTokenAddress": "0x4200000000000000000000000000000000000006",
      "paymentAmountRaw": "500000"
    }
  }'
```

Expected response includes:

```text
decision: FIXED
serviceMode: fix_approval
replacement.targetAddress
replacement.transactionData
whatWasWrong
whyThisIsDangerous
whyThisFixIsSafer
signingInstructions
verificationChecklist
deliveryProof
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

## Response Shapes

### Scan Response

A successful scan response is designed for both humans and agents.

```json
{
  "service": "PayGuard",
  "version": "0.1.0",
  "requestId": "approval_scan_001",
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
  },
  "cap": {
    "status": "DELIVERED",
    "paid": true,
    "scanMode": "approval"
  }
}
```

---

### Safe Approval Fix Response

```json
{
  "service": "PayGuard",
  "version": "0.1.0",
  "requestId": "safe_approval_fix_001",
  "buyerAgentId": "croo_buyer_agent",
  "sellerAgentId": "payguard_provider_agent",
  "status": "completed",
  "canContinue": true,
  "report": {
    "scanType": "FIX_UNSAFE_APPROVAL",
    "decision": "FIXED",
    "canContinue": true,
    "riskReduced": true,
    "summary": "PayGuard generated safer replacement approval calldata using a limited approval amount instead of unlimited token spending authority.",
    "whatWasWrong": "The original approval appears to grant unlimited token spending authority.",
    "whyThisIsDangerous": "If the spender address is malicious, compromised, or later upgraded into unsafe behavior, the wallet can lose more tokens than intended because the approval is not limited to this task.",
    "whyThisFixIsSafer": "The replacement calldata keeps the same token contract and spender but replaces the unlimited approval amount with the requested safeAmountRaw.",
    "replacement": {
      "chain": "base",
      "targetAddress": "0x4200000000000000000000000000000000000006",
      "transactionData": "0x095ea7b3...",
      "functionName": "approve",
      "spenderAddress": "0x1111111111111111111111111111111111111111",
      "safeAmountRaw": "100000000000000000"
    },
    "nextAction": "Use the replacement targetAddress and transactionData for signing instead of the unsafe unlimited approval."
  },
  "cap": {
    "status": "DELIVERED",
    "paid": true,
    "serviceMode": "fix_approval"
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

When running through the CROO provider, the provider reads CROO order metadata and forwards payment data into the PayGuard CAP response.

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

CROO_TOKEN_APPROVAL_SERVICE_ID=replace_with_token_approval_service_id
CROO_FIX_APPROVAL_SERVICE_ID=replace_with_safe_approval_fix_service_id

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

Vercel hosts the website and HTTP API. Render runs the long-lived CROO provider process.

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

CROO_TOKEN_APPROVAL_SERVICE_ID=replace_with_token_approval_service_id
CROO_FIX_APPROVAL_SERVICE_ID=replace_with_safe_approval_fix_service_id
```

No Render env var is needed for Full Transaction Risk Scan because it is the default service mode.

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
| `yarn fix`                                     | Format and auto-fix lint                            |
| `yarn verify`                                  | Format check, lint, typecheck, and build everything |
| `yarn verify:remote`                           | Run the remote CAP demo                             |
| `yarn workspace @payguard/agent croo:provider` | Start the CROO provider worker                      |

---

## CROO Agent Store Listing

### Agent Name

```text
PayGuard
```

### One Liner

```text
Paid before-signing safety and approval repair agent for Web3 agent commerce.
```

### Agent Description

```text
PayGuard is a paid before-signing safety and approval repair agent for Web3 agent commerce.

Buyer agents call PayGuard before approving tokens, signing calldata, or paying another agent. PayGuard decodes the transaction, checks live chain evidence, contract verification, reputation signals, simulation result, and policy risk.

It returns a machine-readable ALLOW, WARN, or BLOCK decision with evidence and delivery proof, so the buyer agent knows whether to continue or stop before funds move.

PayGuard also includes Safe Approval Fix, a premium service that converts unsafe or unlimited ERC20 approvals into safer limited approval calldata.
```

---

### Service 1: Token Approval Scan

```text
Price:
0.05 USDC
```

```text
Description:
Fast before-signing scan for ERC20 token approvals. PayGuard checks approval calldata, spender address, unlimited approval risk, token metadata, allowance evidence, contract intelligence, and returns ALLOW, WARN, or BLOCK with delivery proof.
```

```text
Requirements:
Paste plain text or JSON for a token approval transaction.

Required fields:
chain: base or ethereum
walletAddress: wallet preparing to sign
targetAddress: token contract address
transactionData: approval calldata starting with 0x
purpose: why this approval is being requested

Plain text example:

chain: base
walletAddress: 0x0000000000000000000000000000000000000001
targetAddress: 0x4200000000000000000000000000000000000006
transactionData: 0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
purpose: Check this token approval before signing
```

```text
Deliverable:
PayGuard returns a JSON approval risk report with ALLOW, WARN, or BLOCK, decoded approval details, spender risk, allowance evidence, policy checks, contract intelligence, and delivery proof.
```

---

### Service 2: Full Transaction Risk Scan

```text
Price:
0.10 USDC
```

```text
Description:
Full before-signing Web3 transaction risk scan. PayGuard checks calldata, target contract evidence, token behavior, simulation results, reputation signals, AI explanation, and returns ALLOW, WARN, or BLOCK with delivery proof.
```

```text
Requirements:
Paste plain text or JSON for the transaction you want checked before signing.

Required fields:
chain: base or ethereum
walletAddress: wallet preparing to sign
targetAddress: contract or recipient address
transactionData: calldata starting with 0x
purpose: why this transaction is being considered

Plain text example:

chain: base
walletAddress: 0x0000000000000000000000000000000000000001
targetAddress: 0x4200000000000000000000000000000000000006
transactionData: 0x095ea7b30000000000000000000001111111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
purpose: Check this transaction before signing
```

```text
Deliverable:
PayGuard returns a JSON transaction risk report with ALLOW, WARN, or BLOCK, decoded action, chain evidence, policy checks, contract intelligence, AI explanation, and delivery proof.
```

---

### Service 3: Safe Approval Fix

```text
Price:
0.50 USDC
```

```text
Description:
PayGuard repairs unsafe ERC20 approval calldata by generating a safer limited-approval replacement. If an approval grants unlimited spending authority, PayGuard returns replacement approve() calldata using the requested safeAmountRaw, explains what was wrong, why the fix is safer, and includes signing instructions plus delivery proof.
```

```text
Requirements:
Paste plain text or JSON for the unsafe approval you want fixed.

Required fields:
chain: base or ethereum
tokenAddress: token contract address
spenderAddress: spender address to approve
safeAmountRaw: limited approval amount in raw token units
purpose: why this replacement approval is needed

Optional fields:
walletAddress: wallet preparing to sign
currentTransactionData: original unsafe approval calldata

Plain text example:

chain: base
walletAddress: 0x0000000000000000000000000000000000000001
tokenAddress: 0x4200000000000000000000000000000000000006
spenderAddress: 0x1111111111111111111111111111111111111111
safeAmountRaw: 100000000000000000
currentTransactionData: 0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
purpose: Replace unlimited WETH approval with limited approval
```

```text
Deliverable:
PayGuard returns a JSON fix report with decision FIXED, what was wrong, why it was dangerous, why the replacement is safer, replacement targetAddress, replacement transactionData, signing instructions, verification checklist, and delivery proof.
```

---

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

Safe Approval Fix:
https://payguard-hack.vercel.app/api/cap/fix-approval

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
8. Explain that PayGuard can also repair unsafe approvals.
9. Show Safe Approval Fix returning replacement approve() calldata.
10. Open the agent manifest endpoint.
11. Open the CAP capability endpoint.
12. Open CROO Agent Store.
13. Show PayGuard listed as LIVE.
14. Show the three paid services:
    - Token Approval Scan
    - Full Transaction Risk Scan
    - Safe Approval Fix
15. Show the CROO provider terminal connected.
16. Explain that the provider listens for paid CROO orders and delivers reports.
17. Explain that buyer agents stop on BLOCK and can use Safe Approval Fix for safer replacement calldata.
```

---

## Security Model

PayGuard is a pre-execution risk analysis and approval repair tool.

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
Return machine-readable decisions
Generate safer limited approval calldata
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
Agent uses Safe Approval Fix when an unsafe approval should be replaced
```

---

## Current Limitations

PayGuard is a hackathon implementation and should be treated as an MVP safety checkpoint.

Current limitations:

```text
No formal third-party security audit
No guaranteed detection of every malicious contract
No full ABI discovery for arbitrary contracts
No transaction submission
No private mempool monitoring
No fund recovery
Third-party checks depend on RPC, Sourcify, GoPlus, Blockscout, and Gemini availability
Paid status depends on CROO payment transaction metadata
CROO provider must run as a long-lived worker to stay online
Safe Approval Fix generates replacement calldata but does not sign or submit it
```

---

## Design Principles

1. **Before signing first**  
   The most valuable warning is the one that happens before funds move.

2. **Agent-readable by default**  
   Every result must be usable by another autonomous agent.

3. **Clear decisions**  
   Agents should not parse vague text. They need ALLOW, WARN, BLOCK, or FIXED.

4. **Evidence-based reports**  
   Decisions should include decoded calldata, chain evidence, contract intelligence, and policy checks.

5. **Repair when possible**  
   For unsafe approvals, PayGuard can generate safer replacement calldata instead of only warning.

6. **Commerce-aware**  
   PayGuard is designed as a paid dependency in agent-to-agent workflows.

7. **Honest execution**  
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
PayGuard returns ALLOW, WARN, BLOCK, or FIXED
        ↓
Agent continues only when safe
```

The result is a practical A2A security primitive for autonomous commerce: paid, callable, machine-readable, repair-capable, and delivered with proof.

---

## License

MIT License.
