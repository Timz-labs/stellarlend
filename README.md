# StellarLend

Fixed-rate peer-to-peer lending protocol on Stellar Soroban.

**Live Demo:** https://stellarlend.vercel.app (Stellar Testnet)

---

## Deployed Contracts (Stellar Testnet)

| Contract | ID |
|---|---|
| Lending | `CCEJCHUANEQRTC2YQ7PEDH773I272DRLRWKAFZS4MBXWUXXARMFYM6MI` |
| Oracle  | `CBOE6DS7WYIS6LDQ5OAC3XUZG3LYLL5WNTO2CYTY5GSS2RAKG7JQWMSX` |

🔍 [Lending on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCEJCHUANEQRTC2YQ7PEDH773I272DRLRWKAFZS4MBXWUXXARMFYM6MI)
🔍 [Oracle on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBOE6DS7WYIS6LDQ5OAC3XUZG3LYLL5WNTO2CYTY5GSS2RAKG7JQWMSX)

---

## Why StellarLend?

Existing Stellar lending protocols (Blend, K2) use floating-rate pool models.
StellarLend is different — **fixed-rate, peer-to-peer, term-based lending**.

- Borrower and lender agree on a fixed rate at loan creation — no surprises
- Lenders choose individual loans to fund (not a shared pool)
- 30/60/90 day fixed terms with clear repayment schedules
- 150% minimum collateral ratio enforced on-chain
- Automatic liquidation at 110% health factor with 5% liquidator bonus

---

## Feature Matrix

### ✅ Implemented

| Area | Feature | Notes |
|---|---|---|
| **Auth** | JWT login & registration | `apps/api/src/auth` |
| **Auth** | Password hashing (bcrypt) | 12 salt rounds |
| **Auth** | Stellar wallet linking | Public key stored per user |
| **Lending** | Loan request with collateral lock | Collateral held in Soroban contract |
| **Lending** | Oracle-validated collateral ratio | 150% minimum enforced on-chain |
| **Lending** | Fixed interest rate computation | Computed at funding time |
| **Lending** | P2P loan funding | Lender transfers directly to borrower |
| **Lending** | Full and partial repayment | Collateral released on full repayment |
| **Lending** | Automatic liquidation | Health factor < 110% triggers liquidation |
| **Lending** | Liquidation bonus | 5% bonus for liquidators |
| **Lending** | Default claim | Lender claims collateral after term expires |
| **Lending** | Loan cancellation | Borrower cancels before funding, collateral returned |
| **Oracle** | Admin price feeds | Token prices in 7-decimal USD format |
| **API** | Build unsigned XDR | Never touches private keys |
| **API** | Submit signed transactions | Frontend signs, API submits |
| **API** | Loan state persistence | PostgreSQL + Prisma |
| **Frontend** | Landing page | Protocol overview, contract links |
| **Frontend** | Borrow form | Interest rate slider, term selector, summary |
| **Frontend** | Lend marketplace | Browse and fund open requests |
| **Frontend** | Dashboard | Active loans, health factors, history |
| **Frontend** | Freighter wallet support | Via Stellar Wallets Kit |
| **DevOps** | Full Docker Compose stack | postgres + api + frontend |
| **DevOps** | Health check ordering | API waits for DB healthy |
| **Tests** | Auth service tests | Jest unit tests |
| **Tests** | Loan service tests | Jest unit tests with mocks |

### 🗓️ Planned (Roadmap)

| Area | Feature | Priority |
|---|---|---|
| **Lending** | Partial repayment tracking | High |
| **Lending** | Multi-collateral support | High |
| **Lending** | Interest rate negotiation | Medium |
| **Oracle** | Band Protocol integration | High |
| **CI/CD** | GitHub Actions pipeline | High |
| **Frontend** | Mobile responsive improvements | Medium |
| **Frontend** | Admin monitoring dashboard | Medium |
| **Compliance** | KYC hooks for regulated markets | Low |
| **Infra** | Mainnet deployment | High |
| **Governance** | Protocol parameter voting | Low |

---

## Architecture

```
Browser (Next.js)
      │ REST
      ▼
NestJS API ──── PostgreSQL
      │          Users, Loans
      │ Soroban RPC
      ▼
Stellar Network
  ┌──────────┐    ┌──────────────────┐
  │  Oracle  │───▶│ Lending Contract │
  │ Contract │    │ request_loan     │
  │ get_price│    │ fund_loan        │
  └──────────┘    │ repay            │
                  │ liquidate        │
                  │ claim_defaulted  │
                  └──────────────────┘
```

**Loan State Machine:**
```
Requested → Active → Repaid
    │           ├──→ Liquidated (health < 110%)
    │           └──→ Defaulted (term expired)
    └──→ Cancelled (unfunded)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Rust, Soroban SDK 26.1.0 |
| Backend API | NestJS, TypeScript, Passport JWT |
| Database | PostgreSQL 16, Prisma ORM |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Wallet | Stellar Wallets Kit, Freighter |
| DevOps | Docker, Docker Compose |

---

## Project Structure

```
StellarLend/
├── contracts/
│   ├── lending/              # Core P2P lending Soroban contract
│   │   └── src/
│   │       ├── contract.rs   # request_loan, fund_loan, repay, liquidate
│   │       ├── types.rs      # Loan, LoanRequest, LoanStatus, LoanTerm
│   │       ├── errors.rs     # LendingError codes
│   │       ├── math.rs       # Interest & health factor calculations
│   │       └── storage.rs    # Persistent storage helpers
│   └── oracle/               # Price oracle contract
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/         # JWT auth, registration, login, wallet link
│   │   │   ├── loan/         # Loan endpoints, XDR building, submission
│   │   │   ├── stellar/      # Soroban RPC service
│   │   │   └── prisma/       # Database service
│   │   └── prisma/
│   │       └── schema.prisma # User, LoanRequestRecord, LoanRecord
│   └── frontend/             # Next.js UI
│       └── src/app/
│           ├── page.tsx      # Landing page
│           ├── borrow/       # Loan request form
│           ├── lend/         # Browse and fund loans
│           ├── markets/      # Full marketplace view
│           └── dashboard/    # User dashboard + health factors
├── docs/
│   ├── architecture.md       # System design and data flow
│   ├── api-reference.md      # REST API documentation
│   └── deployment.md         # Deploy to testnet / production
├── docker-compose.yml        # Full stack: postgres + api + frontend
└── .env.example              # Configuration reference
```

---

## Getting Started

### Quickstart with Docker

```bash
git clone https://github.com/Timz-labs/stellarlend
cd stellarlend
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api/v1

### Build Contracts

```bash
rustup target add wasm32v1-none
stellar contract build
```

### Run Tests

```bash
cd apps/api
npm test
```

### Run Locally (without Docker)

```bash
# API
cd apps/api && npm install
npm run prisma:generate && npm run prisma:migrate
npm run start:dev

# Frontend (separate terminal)
cd apps/frontend && npm install
npm run dev
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). This project participates in the **Stellar Wave Program on Drips**.

---

## License

Apache 2.0
