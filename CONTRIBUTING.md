# Contributing to StellarLend

StellarLend welcomes contributions from the Stellar community. This project is part of the Stellar Wave Program on Drips.

## Getting Started

```bash
git clone https://github.com/stellarfox-labs/stellarlend
cd stellarlend

# Build Soroban contracts
rustup target add wasm32v1-none
stellar contract build

# Start services
cp .env.example .env
docker compose up --build
```

## Contribution Areas

| Area | Tech | Complexity |
|---|---|---|
| Smart contracts | Rust / Soroban | High |
| API endpoints | NestJS / TypeScript | Medium |
| Frontend pages | Next.js / React | Medium |
| Tests | Jest / Soroban testutils | Medium |
| Documentation | Markdown | Low |

## Standards

- Rust: `cargo clippy` must pass, no `unsafe`
- TypeScript: strict mode, no `any`
- Tests required for all new contract logic
- PRs reviewed within 48 hours

## Issue Labels

- `good first issue` — newcomer friendly
- `complexity:low` — docs, small fixes
- `complexity:medium` — features, API work
- `complexity:high` — contract changes, security

See open issues to get started.
