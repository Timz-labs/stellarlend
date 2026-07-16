# StellarLend API Reference

Base URL: `http://localhost:3001/api/v1`

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## Auth

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "minimum8chars",
  "stellarPubkey": "G..." 
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "userId": "uuid",
  "email": "user@example.com"
}
```

---

### POST /auth/login
Login with email and password.

**Body:**
```json
{ "email": "user@example.com", "password": "yourpassword" }
```

---

### PATCH /auth/wallet 🔒
Link a Stellar public key to your account.

**Body:**
```json
{ "stellarPubkey": "G..." }
```

---

## Loans

### POST /loans/request/build 🔒
Build an unsigned XDR for creating a loan request.
Sign with your wallet and submit via `/loans/submit`.

**Body:**
```json
{
  "borrowerPubkey": "G...",
  "borrowToken": "C...",
  "borrowAmount": "10000000000",
  "collateralToken": "C...",
  "collateralAmount": "150000000000",
  "interestRateBps": 800,
  "termDays": 30
}
```

**Response:** `"AAAAAgAAAAA..."` (base64 XDR string)

---

### POST /loans/fund/build 🔒
Build an unsigned XDR for funding a loan request.

**Body:**
```json
{
  "lenderPubkey": "G...",
  "requestId": "1"
}
```

---

### POST /loans/repay/build 🔒
Build an unsigned XDR for repaying a loan.

**Body:**
```json
{
  "borrowerPubkey": "G...",
  "requestId": "1",
  "amount": "10800000000"
}
```

---

### POST /loans/submit 🔒
Submit a signed transaction to the Stellar network.

**Body:**
```json
{ "signedXdr": "AAAAAgAAAAA..." }
```

**Response:**
```json
{ "txHash": "abc123..." }
```

---

### GET /loans
Get all loan requests.

**Query params:**
- `status` — filter by status (`Requested`, `Active`, `Repaid`, `Liquidated`, `Defaulted`)

---

### GET /loans/:id
Get a specific loan request by on-chain ID.

---

## Amount Encoding

All amounts use Stellar's base unit (1 stroop = 0.0000001).
- 1 USDC = `10000000`
- 1000 USDC = `10000000000`

## Interest Rate Encoding

Rates are in basis points (BPS):
- 8% APR = `800`
- 10% APR = `1000`
- Maximum = `5000` (50% APR)
