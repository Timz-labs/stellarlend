# StellarLend

Fixed-rate peer-to-peer lending protocol on Stellar Soroban.

**Live Demo:** Coming soon on Stellar Testnet

---

## Deployed Contracts (Stellar Testnet)

| Contract | ID |
|---|---|
| Lending | `CCEJCHUANEQRTC2YQ7PEDH773I272DRLRWKAFZS4MBXWUXXARMFYM6MI` |
| Oracle | `CBOE6DS7WYIS6LDQ5OAC3XUZG3LYLL5WNTO2CYTY5GSS2RAKG7JQWMSX` |

🔍 [Lending on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCEJCHUANEQRTC2YQ7PEDH773I272DRLRWKAFZS4MBXWUXXARMFYM6MI)

---

## Why StellarLend?

Existing Stellar lending protocols (Blend, K2) use floating-rate pool models. StellarLend is different:

- **Fixed rates** — borrower and lender agree on a rate at loan creation. No surprises.
- **P2P matching** — lenders choose which individual loans to fund
- **Term-based** — 30/60/90 day loans with clear repayment schedules
- **Over-collateralized** — 150% minimum collateral ratio
- **Automatic liquidation** — liquidators earn 5% bonus to keep protocol solvent

---

## Architecture

```
StellarLend/
├── contracts/
│   ├── lending/          # Core P2P lending contract (Rust/Soroban)
│   │   └── src/
│   │       ├── contract.rs   # request_loan, fund_loan, repay, liquidate
│   │       ├── types.rs      # Loan, LoanRequest, LoanStatus, LoanTerm
│   │       ├── errors.rs     # LendingError codes
│   │       ├── math.rs       # Interest, health factor calculations
│   │       └── storage.rs    # Persistent storage helpers
│   └── oracle/           # Price oracle contract (Rust/Soroban)
├── apps/
│   ├── api/              # NestJS REST API
│   │   ├── src/
│   │   │   ├── auth/         # JWT auth (register, login, wallet link)
│   │   │   ├── loan/         # Loan request/fund/repay endpoints
│   │   │   ├── stellar/      # Soroban RPC service
│   │   │   └── prisma/       # Database service
│   │   └── prisma/
│   │       └── schema.prisma # User, LoanRequest, Loan models
│   └── frontend/         # Next.js 15 + TypeScript dApp
│       └── src/app/
│           ├── page.tsx      # Landing page
│           ├── borrow/       # Loan request form
│           ├── markets/      # Browse and fund open requests
│           └── dashboard/    # User loan history
├── docker-compose.yml    # Full stack: postgres + api + frontend
└── .env.example          # Configuration reference
```

---

## Smart Contract

### Lending Contract

| Function | Who Calls | Description |
|---|---|---|
| `initialize` | Admin | Set oracle address |
| `request_loan` | Borrower | Lock collateral, set loan terms |
| `fund_loan` | Lender | Transfer principal to borrower |
| `repay` | Borrower | Repay principal + interest |
| `liquidate` | Anyone | Repay undercollateralized loan, earn 5% bonus |
| `claim_defaulted` | Lender | Claim collateral after term expires |
| `cancel_request` | Borrower | Cancel unfunded request, get collateral back |
| `get_health_factor` | Anyone | Check loan health (>150% = healthy) |

### Health Factor Formula
```
health_factor = (collateral_value_USD × 100) / debt_value_USD
< 110% → can be liquidated
```

### Interest Formula
```
interest = principal × rate_bps / 10000 × term_ledgers / ledgers_per_year
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

## Getting Started

### Prerequisites
- Rust + `rustup target add wasm32v1-none`
- Stellar CLI: `cargo install --locked stellar-cli`
- Node.js 20+
- Docker + Docker Compose

### Quickstart with Docker

```bash
git clone https://github.com/stellarfox-labs/stellarlend
cd stellarlend
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api/v1

### Local Development

```bash
# Build contracts
stellar contract build

# Install API dependencies
cd apps/api && npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev

# Install frontend dependencies
cd apps/frontend && npm install
npm run dev
```

---

## Roadmap

| Feature | Priority |
|---|---|
| Partial repayment support | High |
| Credit scoring based on repayment history | High |
| Multi-collateral support (multiple tokens) | High |
| Interest rate negotiation between borrower and lender | Medium |
| Mobile-responsive UI improvements | Medium |
| Admin dashboard for monitoring protocol health | Medium |
| CI/CD pipeline with GitHub Actions | High |
| Mainnet deployment | High |
| Governance token for protocol parameters | Low |
| Flash loan integration | Low |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). This project participates in the **Stellar Wave Program on Drips**.

---

## License

Apache 2.0
