# Deployment Guide

## Testnet Deployment

### Prerequisites
- Rust + `rustup target add wasm32v1-none`
- Stellar CLI: `cargo install --locked stellar-cli`
- Node.js 20+
- Docker + Docker Compose

### 1. Deploy Contracts

```bash
# Generate and fund a deployer keypair
stellar keys generate deployer --network testnet
stellar keys fund deployer --network testnet

# Build contracts
stellar contract build

# Deploy oracle
ORACLE_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/oracle.wasm \
  --source deployer --network testnet)

# Deploy lending
LENDING_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/lending.wasm \
  --source deployer --network testnet)

# Initialize oracle
DEPLOYER_ADDR=$(stellar keys address deployer)
stellar contract invoke --id $ORACLE_ID \
  --source deployer --network testnet \
  -- initialize --admin $DEPLOYER_ADDR

# Initialize lending with oracle address
stellar contract invoke --id $LENDING_ID \
  --source deployer --network testnet \
  -- initialize --admin $DEPLOYER_ADDR --oracle $ORACLE_ID

echo "Oracle:  $ORACLE_ID"
echo "Lending: $LENDING_ID"
```

### 2. Set Oracle Prices

```bash
# Set XLM price ($0.10 = 1000000 in 7-decimal format)
stellar contract invoke --id $ORACLE_ID \
  --source deployer --network testnet \
  -- set_price \
  --admin $DEPLOYER_ADDR \
  --token <XLM_SAC_ADDRESS> \
  --price 1000000

# Set USDC price ($1.00 = 10000000)
stellar contract invoke --id $ORACLE_ID \
  --source deployer --network testnet \
  -- set_price \
  --admin $DEPLOYER_ADDR \
  --token <USDC_SAC_ADDRESS> \
  --price 10000000
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your contract IDs and secrets
```

### 4. Start Services

```bash
docker compose up --build
```

## Production Deployment

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Min 32 char secret key | ✅ |
| `STELLAR_RPC_URL` | Soroban RPC endpoint | ✅ |
| `LENDING_CONTRACT_ID` | Deployed lending contract | ✅ |
| `ORACLE_CONTRACT_ID` | Deployed oracle contract | ✅ |
| `STELLAR_NETWORK_PASSPHRASE` | Network passphrase | ✅ |

### Database Migrations

```bash
cd apps/api
npx prisma migrate deploy
```

### Rollback

```bash
# Roll back last migration
cd apps/api
npx prisma migrate resolve --rolled-back <migration_name>
```
