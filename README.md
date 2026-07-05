# PayGuard

PayGuard is a pre payment safety agent for Web3 users and CROO agent commerce.

It reviews a payment, token approval, contract call, or agent payment before funds move. The product gives the caller a clear decision and a machine readable report that can be used by wallets, apps, or autonomous agents.

PayGuard returns one of three decisions.

```text
ALLOW
WARN
BLOCK
```

PayGuard is not a fund recovery product. It is a before signing safety checkpoint.

## Product thesis

Web3 signing flows are still too opaque.

A user or agent can be asked to approve tokens, call a contract, or pay another party without enough context about what the action actually does. PayGuard adds a dedicated safety review before the action is signed.

The goal is simple.

```text
Your wallet should ask first.
```

## CROO agent commerce use case

PayGuard is designed for the CROO Agent Hackathon as a safety layer for agent commerce.

A CROO buyer agent can hire PayGuard before paying another agent or executing an on chain action. PayGuard scans the requested action and returns a structured report.

If the decision is `ALLOW`, the buyer agent can continue.

If the decision is `WARN` or `BLOCK`, the buyer agent pauses the payment and asks for manual review or a safer alternative.

## Example agent flow

```text
Buyer agent prepares a payment

Buyer agent asks PayGuard to review the action

PayGuard decodes the calldata and scores the risk

PayGuard returns ALLOW, WARN, or BLOCK

Buyer agent continues only when the report says ALLOW
```

This makes PayGuard a before payment guardrail for autonomous commerce.

## What PayGuard checks today

PayGuard currently checks the following inputs.

1. Chain selection

2. Wallet address format

3. Recipient or contract address format

4. Raw EVM transaction calldata

5. Payment purpose text

6. ERC20 approve calls

7. ERC20 transfer calls

8. ERC20 transferFrom calls

9. setApprovalForAll calls

10. Unknown contract calls

## EVM calldata decoding

The shared core package uses `viem` to decode known EVM calldata patterns.

The current decoder recognizes these functions.

```text
approve(address spender, uint256 amount)

transfer(address to, uint256 amount)

transferFrom(address from, address to, uint256 amount)

setApprovalForAll(address operator, bool approved)
```

When a known function is decoded, PayGuard extracts useful details for the report.

```text
Function name

Spender address

Recipient address

Source address

Operator address

Approval amount

Unlimited approval status
```

When calldata cannot be matched to a known payment function, PayGuard reports it as an unknown contract call and includes the function selector.

## Decisions

### ALLOW

The action appears low risk based on the current checks.

The caller can continue after confirming the recipient and amount.

### WARN

The action has warning signs.

The caller should review the reasons before signing or paying.

### BLOCK

The action looks risky.

The caller should stop the payment or signing flow and verify the request manually.

## Demo scenarios

The scan page includes demo presets that show the core PayGuard behavior.

### Safe transfer

A standard ERC20 transfer to a recipient.

Expected result:

```text
ALLOW or low risk WARN
```

### Risky approval

An ERC20 approve call with an unlimited approval amount.

Expected result:

```text
BLOCK
```

### Invalid recipient

A payment request with an invalid recipient address.

Expected result:

```text
WARN or BLOCK
```

### Unknown contract call

A calldata payload with an unknown selector.

Expected result:

```text
WARN
```

## Repository structure

```text
payguard
  package.json
  yarn.lock
  README.md

  web
    app
      landing page
      scan page
      api scan route

    components
      layout components
      reusable ui components

  agent
    src
      CROO agent proof

  core
    src
      shared scan engine
```

## Architecture

PayGuard is built as a Yarn workspace monorepo with three packages.

```text
web

agent

core
```

### web

The `web` package is the Next.js application.

It includes the landing page, the scan page, the API route, and reusable UI components.

The scan page allows a user to enter a chain, wallet address, recipient or contract address, transaction data, and purpose. It calls the scan API route, which then calls the shared core scanner.

### core

The `core` package contains the shared PayGuard engine.

It owns the scan input type, report type, decision logic, EVM decoding, risk scoring, and report generation.

Both the web app and the CROO agent proof import from this package.

### agent

The `agent` package is the CROO agent proof.

It creates a sample buyer agent request, sends the action into the PayGuard core scanner, and prints a service style JSON response that another agent could consume.

## Service style output

A PayGuard response is designed to be readable by both humans and agents.

```json
{
  "service": "PayGuard",
  "version": "0.1.0",
  "requestId": "demo_scan_001",
  "buyerAgentId": "croo_buyer_agent_demo",
  "sellerAgentId": "croo_seller_agent_demo",
  "status": "completed",
  "canContinue": false,
  "report": {
    "decision": "BLOCK",
    "riskScore": 95,
    "summary": "This action looks risky and should not continue without manual review.",
    "reasons": [
      "Decoded ERC20 approve call. Token approvals can create spending risk.",
      "Unlimited token approval detected."
    ],
    "nextAction": "Stop the payment or signing flow and verify the request manually.",
    "checkedAt": "2026 01 01T00:00:00.000Z",
    "decodedCall": {
      "kind": "erc20Approve",
      "functionName": "approve",
      "spenderAddress": "0x5555555555555555555555555555555555555555",
      "amount": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      "isUnlimitedApproval": true
    }
  }
}
```

## Local setup

Install dependencies from the repository root.

```bash
yarn install
```

Run the web app.

```bash
yarn dev:web
```

Open the app.

```text
http://localhost:3000
```

Open the scan page.

```text
http://localhost:3000/scan
```

Run the CROO agent proof.

```bash
yarn dev:agent
```

Build the web app.

```bash
yarn build:web
```

Run lint.

```bash
yarn lint
```

Format the repository.

```bash
yarn format
```

## Main commands

```text
yarn dev:web

yarn build:web

yarn lint

yarn format

yarn dev:agent
```

## Deployment

Deploy the full monorepo to GitHub.

In Vercel, use this setup.

```text
Repository: payguard

Root Directory: web

Framework: Next.js

Install Command: yarn install

Build Command: yarn build

Output Directory: default
```

The web app should be deployed from the monorepo, not as a separate standalone repository, because it depends on the shared `@payguard/core` package.

## Current limitations

PayGuard is an MVP safety checkpoint. It is intentionally focused on before signing review.

It does not yet perform live transaction simulation, token metadata lookup, contract reputation scoring, balance checks, current allowance checks, or full ABI discovery.

It also does not recover funds after a bad transaction. The product works before the signing moment, not after loss has happened.

## Future roadmap

Potential next improvements include the following.

1. Live token metadata lookup

2. Token decimal formatting

3. Current allowance checks

4. Wallet balance checks

5. Contract reputation signals

6. Transaction simulation

7. Deeper ERC721 and ERC1155 support

8. CROO service marketplace integration

9. Signed PayGuard reports

10. Webhook callbacks for buyer agents

11. Policy rules for autonomous agent payments

12. Risk profiles for different caller types

## Hackathon demo script

1. Open the landing page

2. Explain that PayGuard checks a payment before funds move

3. Open the scan page

4. Run the Safe transfer preset

5. Show that PayGuard decodes the calldata

6. Run the Risky approval preset

7. Show the unlimited approval warning

8. Run the Unknown contract call preset

9. Show the unknown selector warning

10. Run the CROO agent proof with `yarn dev:agent`

11. Show the machine readable JSON response

12. Explain that a CROO buyer agent can pause payment when PayGuard returns WARN or BLOCK

## Summary

PayGuard is a before payment safety checkpoint for Web3 users, wallets, and CROO agents.

It turns opaque signing requests into clear decisions and structured reports.

For humans, it explains the risk.

For agents, it returns machine readable JSON.

The core idea is simple.

```text
Ask PayGuard before the money moves.
```
