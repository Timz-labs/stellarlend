//! StellarLend — Fixed-Rate P2P Lending Protocol on Stellar Soroban
//!
//! A decentralized peer-to-peer lending protocol where borrowers request
//! fixed-rate term loans and lenders fund them directly. Collateral is
//! locked in the contract and liquidated automatically if the health
//! factor falls below the liquidation threshold.
//!
//! ## Key Differentiators from Blend/K2
//! - Fixed interest rates (not floating pool rates)
//! - Term-based loans (30/60/90 days)
//! - P2P matching — lenders choose which loans to fund
//! - Automatic liquidation with liquidator incentive bonus
//!
//! ## Loan Lifecycle
//! 1. Borrower requests loan — locks collateral, sets desired amount/rate/term
//! 2. Lender funds the loan — transfers principal to borrower
//! 3. Borrower repays principal + interest before term ends
//! 4. If health factor < 110%, anyone can liquidate and earn 5% bonus
//! 5. If term expires without repayment, lender claims collateral

#![no_std]

mod contract;
mod errors;
mod types;
mod storage;
mod math;

pub use contract::LendingContract;
pub use errors::LendingError;
pub use types::{Loan, LoanStatus, LoanRequest};

#[cfg(any(test, feature = "testutils"))]
pub use contract::LendingContractClient;
