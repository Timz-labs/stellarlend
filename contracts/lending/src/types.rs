use soroban_sdk::{contracttype, Address};

/// Current status of a loan
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LoanStatus {
    /// Loan requested, waiting for a lender to fund it
    Requested,
    /// Funded by a lender, repayment in progress
    Active,
    /// Borrower has fully repaid — loan closed
    Repaid,
    /// Collateral liquidated due to health factor breach
    Liquidated,
    /// Term expired without repayment — lender claimed collateral
    Defaulted,
    /// Borrower cancelled before funding
    Cancelled,
}

/// Loan term options in ledgers
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LoanTerm {
    Days30,  // ~518,400 ledgers
    Days60,  // ~1,036,800 ledgers
    Days90,  // ~1,555,200 ledgers
}

impl LoanTerm {
    pub fn to_ledgers(&self) -> u32 {
        match self {
            LoanTerm::Days30 => 17_280 * 30,
            LoanTerm::Days60 => 17_280 * 60,
            LoanTerm::Days90 => 17_280 * 90,
        }
    }
}

/// A loan request created by a borrower
#[contracttype]
#[derive(Clone, Debug)]
pub struct LoanRequest {
    /// Unique loan ID
    pub id: u64,
    /// Borrower's address
    pub borrower: Address,
    /// Token the borrower wants to receive (e.g. USDC)
    pub borrow_token: Address,
    /// Amount the borrower wants to receive
    pub borrow_amount: i128,
    /// Token provided as collateral (e.g. XLM wrapped)
    pub collateral_token: Address,
    /// Amount of collateral locked
    pub collateral_amount: i128,
    /// Annual interest rate in basis points (e.g. 1000 = 10%)
    pub interest_rate_bps: u32,
    /// Loan term
    pub term: LoanTerm,
    /// Current status
    pub status: LoanStatus,
}

/// A funded, active loan
#[contracttype]
#[derive(Clone, Debug)]
pub struct Loan {
    /// Loan request ID this is based on
    pub request_id: u64,
    /// Borrower address
    pub borrower: Address,
    /// Lender who funded this loan
    pub lender: Address,
    /// Borrow token contract
    pub borrow_token: Address,
    /// Principal amount lent
    pub principal: i128,
    /// Collateral token contract
    pub collateral_token: Address,
    /// Collateral amount locked
    pub collateral_amount: i128,
    /// Annual interest rate in basis points
    pub interest_rate_bps: u32,
    /// Ledger when loan was funded (start of term)
    pub funded_at: u32,
    /// Ledger when loan expires
    pub due_at: u32,
    /// Total interest owed at maturity (pre-computed)
    pub interest_owed: i128,
    /// Amount repaid so far
    pub repaid_amount: i128,
    /// Current status
    pub status: LoanStatus,
}
