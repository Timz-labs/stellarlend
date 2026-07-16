# StellarLend Architecture

## System Overview

StellarLend is a two-tier system: a NestJS API that orchestrates business logic
and a Soroban smart contract layer that enforces trustless fund custody.

```
Browser (Next.js)
      │
      │ REST API calls
      ▼
NestJS API (apps/api)
      │                    ┌─────────────────────┐
      ├── Auth Service      │  PostgreSQL          │
      ├── Loan Service  ────│  Users               │
      └── Stellar Service   │  LoanRequests        │
              │             │  Loans               │
              │             └─────────────────────┘
              │ Soroban RPC
              ▼
      Stellar Network
      ┌─────────────────────────────┐
      │  Oracle Contract            │
      │  set_price / get_price      │
      └──────────────┬──────────────┘
                     │ price feeds
      ┌──────────────▼──────────────┐
      │  Lending Contract           │
      │  request_loan               │
      │  fund_loan                  │
      │  repay                      │
      │  liquidate                  │
      │  claim_defaulted            │
      └─────────────────────────────┘
```

## Component Responsibilities

### NestJS API (`apps/api`)
- JWT authentication and user management
- Builds unsigned Soroban XDR transactions for frontend signing
- Submits signed transactions to Stellar RPC
- Persists loan state to PostgreSQL for fast queries
- Validates request parameters before building contract calls

### Lending Contract (`contracts/lending`)
- Holds borrower collateral in escrow
- Enforces 150% minimum collateral ratio via oracle prices
- Computes fixed interest at funding time
- Executes liquidation when health factor < 110%
- Returns collateral on full repayment or to lender on default

### Oracle Contract (`contracts/oracle`)
- Provides USD price feeds for collateral and borrow tokens
- Admin-controlled for testnet; designed to be replaced with Band Protocol on mainnet

### PostgreSQL (`prisma/schema.prisma`)
- Source of truth for user accounts and wallet links
- Mirrors on-chain loan state for fast UI queries
- Stores transaction hashes for auditability

### Next.js Frontend (`apps/frontend`)
- Connects to Stellar wallets via Stellar Wallets Kit (Freighter)
- Fetches unsigned XDR from API, signs with wallet, submits back
- Displays real-time loan health factors and balances

## Loan State Machine

```
Requested → Active → Repaid
    │           │
    │           ├──→ Liquidated (health factor < 110%)
    │           └──→ Defaulted (term expired, lender claims)
    │
    └──→ Cancelled (borrower cancels before funding)
```

## Security Model

- All funds held in Soroban contract — no custodian
- Every state change requires `require_auth()` from the appropriate party
- Interest computed at funding time — no oracle manipulation after funding
- Liquidation threshold (110%) gives buffer above minimum ratio (150%)
- 5% liquidation bonus incentivizes timely liquidation
