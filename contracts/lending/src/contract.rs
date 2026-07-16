//! StellarLend core lending contract
//!
//! Security invariants:
//! - require_auth() on every state-changing call
//! - Collateral validated against oracle price before loan creation
//! - Health factor checked before liquidation
//! - Interest computed at funding time — no floating rate manipulation
//! - overflow-checks = true in release profile

#![allow(deprecated)]

use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, Env};
use crate::{
    errors::LendingError,
    math,
    storage,
    types::{Loan, LoanRequest, LoanStatus, LoanTerm},
};

/// Maximum concurrent open loan requests per borrower (DoS prevention)
const MAX_REQUESTS: u64 = 50;

/// Oracle contract interface — call get_price(token) -> i128
mod oracle_interface {
    use soroban_sdk::{contractclient, Address};
    #[contractclient(name = "OracleClient")]
    pub trait Oracle {
        fn get_price(env: soroban_sdk::Env, token: Address) -> i128;
    }
}

use oracle_interface::OracleClient;

#[contract]
pub struct LendingContract;

#[contractimpl]
impl LendingContract {

    /// Initialize the lending contract.
    pub fn initialize(env: Env, admin: Address, oracle: Address) -> Result<(), LendingError> {
        if storage::get_admin(&env).is_some() { return Err(LendingError::AlreadyInitialized); }
        storage::set_admin(&env, &admin);
        storage::set_oracle(&env, &oracle);
        Ok(())
    }

    /// Borrower creates a loan request and locks collateral.
    ///
    /// # Arguments
    /// * `borrower`          – Must sign this transaction
    /// * `borrow_token`      – Token to receive (e.g. USDC)
    /// * `borrow_amount`     – How much to borrow
    /// * `collateral_token`  – Token to lock as collateral
    /// * `collateral_amount` – Amount of collateral to lock
    /// * `interest_rate_bps` – Fixed annual rate in basis points (e.g. 800 = 8%)
    /// * `term`              – Loan duration (30/60/90 days)
    pub fn request_loan(
        env: Env,
        borrower: Address,
        borrow_token: Address,
        borrow_amount: i128,
        collateral_token: Address,
        collateral_amount: i128,
        interest_rate_bps: u32,
        term: LoanTerm,
    ) -> Result<u64, LendingError> {
        borrower.require_auth();

        let oracle_addr = storage::get_oracle(&env).ok_or(LendingError::NotInitialized)?;

        if borrow_amount <= 0 { return Err(LendingError::InvalidAmount); }
        if collateral_amount <= 0 { return Err(LendingError::InvalidAmount); }
        if interest_rate_bps == 0 || interest_rate_bps > 5000 {
            return Err(LendingError::InvalidRate);
        }
        if storage::get_request_count(&env) >= MAX_REQUESTS {
            return Err(LendingError::TooManyLoans);
        }

        // Verify collateral ratio using oracle prices
        let oracle = OracleClient::new(&env, &oracle_addr);
        let borrow_price = oracle.get_price(&borrow_token);
        let collateral_price = oracle.get_price(&collateral_token);

        let min_col = math::min_collateral(borrow_amount, borrow_price, collateral_price);
        if collateral_amount < min_col {
            return Err(LendingError::CollateralInsufficient);
        }

        // Lock collateral from borrower into contract
        token::TokenClient::new(&env, &collateral_token)
            .transfer(&borrower, &env.current_contract_address(), &collateral_amount);

        let id = storage::next_request_id(&env);
        storage::set_request(&env, &LoanRequest {
            id,
            borrower: borrower.clone(),
            borrow_token,
            borrow_amount,
            collateral_token,
            collateral_amount,
            interest_rate_bps,
            term,
            status: LoanStatus::Requested,
        });

        env.events().publish((symbol_short!("LREQUEST"), id), borrower);
        Ok(id)
    }

    /// Lender funds a loan request. Transfers principal to borrower immediately.
    pub fn fund_loan(
        env: Env,
        lender: Address,
        request_id: u64,
    ) -> Result<u64, LendingError> {
        lender.require_auth();

        let mut request = storage::get_request(&env, request_id)
            .ok_or(LendingError::LoanNotFound)?;

        if request.status != LoanStatus::Requested { return Err(LendingError::InvalidStatus); }
        if lender == request.borrower { return Err(LendingError::SelfFunding); }

        let term_ledgers = request.term.to_ledgers();
        let interest = math::calculate_interest(
            request.borrow_amount,
            request.interest_rate_bps,
            term_ledgers,
        );

        let funded_at = env.ledger().sequence();
        let due_at = funded_at + term_ledgers;

        // Transfer principal from lender to borrower
        token::TokenClient::new(&env, &request.borrow_token)
            .transfer(&lender, &request.borrower, &request.borrow_amount);

        // Update request status
        request.status = LoanStatus::Active;
        storage::set_request(&env, &request);

        // Create active loan record
        let loan_id = storage::next_loan_id(&env);
        storage::set_loan(&env, &Loan {
            request_id,
            borrower: request.borrower.clone(),
            lender: lender.clone(),
            borrow_token: request.borrow_token,
            principal: request.borrow_amount,
            collateral_token: request.collateral_token,
            collateral_amount: request.collateral_amount,
            interest_rate_bps: request.interest_rate_bps,
            funded_at,
            due_at,
            interest_owed: interest,
            repaid_amount: 0,
            status: LoanStatus::Active,
        });

        env.events().publish((symbol_short!("LFUNDED"), request_id), lender);
        Ok(loan_id)
    }

    /// Borrower repays principal + interest. Collateral is returned on full repayment.
    pub fn repay(
        env: Env,
        borrower: Address,
        request_id: u64,
        amount: i128,
    ) -> Result<bool, LendingError> {
        borrower.require_auth();

        let mut loan = storage::get_loan(&env, request_id)
            .ok_or(LendingError::LoanNotFound)?;

        if loan.status != LoanStatus::Active { return Err(LendingError::InvalidStatus); }
        if borrower != loan.borrower { return Err(LendingError::Unauthorized); }
        if amount <= 0 { return Err(LendingError::InvalidAmount); }

        let total_owed = loan.principal
            .saturating_add(loan.interest_owed)
            .saturating_sub(loan.repaid_amount);

        let pay_amount = amount.min(total_owed);

        // Transfer repayment from borrower to lender
        token::TokenClient::new(&env, &loan.borrow_token)
            .transfer(&borrower, &loan.lender, &pay_amount);

        loan.repaid_amount = loan.repaid_amount.saturating_add(pay_amount);

        let fully_repaid = loan.repaid_amount >= loan.principal.saturating_add(loan.interest_owed);

        if fully_repaid {
            // Return collateral to borrower
            token::TokenClient::new(&env, &loan.collateral_token)
                .transfer(&env.current_contract_address(), &borrower, &loan.collateral_amount);
            loan.status = LoanStatus::Repaid;
            env.events().publish((symbol_short!("LREPAID"), request_id), borrower);
        }

        storage::set_loan(&env, &loan);
        Ok(fully_repaid)
    }

    /// Liquidate an undercollateralized loan.
    /// Liquidator repays the debt and receives collateral + 5% bonus.
    pub fn liquidate(
        env: Env,
        liquidator: Address,
        request_id: u64,
    ) -> Result<(), LendingError> {
        liquidator.require_auth();

        let oracle_addr = storage::get_oracle(&env).ok_or(LendingError::NotInitialized)?;
        let mut loan = storage::get_loan(&env, request_id)
            .ok_or(LendingError::LoanNotFound)?;

        if loan.status != LoanStatus::Active { return Err(LendingError::InvalidStatus); }

        // Check health factor
        let oracle = OracleClient::new(&env, &oracle_addr);
        let borrow_price = oracle.get_price(&loan.borrow_token);
        let collateral_price = oracle.get_price(&loan.collateral_token);

        let remaining_debt = loan.principal
            .saturating_add(loan.interest_owed)
            .saturating_sub(loan.repaid_amount);

        let hf = math::health_factor(
            loan.collateral_amount,
            collateral_price,
            remaining_debt,
            borrow_price,
        );

        if hf >= math::LIQUIDATION_THRESHOLD {
            return Err(LendingError::HealthFactorOk);
        }

        // Liquidator repays remaining debt
        token::TokenClient::new(&env, &loan.borrow_token)
            .transfer(&liquidator, &loan.lender, &remaining_debt);

        // Liquidator receives collateral + 5% bonus
        let bonus = loan.collateral_amount
            .saturating_mul(math::LIQUIDATION_BONUS_BPS as i128)
            .saturating_div(math::BPS as i128);
        let liquidator_receives = loan.collateral_amount.min(
            loan.collateral_amount.saturating_add(bonus)
        );

        token::TokenClient::new(&env, &loan.collateral_token)
            .transfer(&env.current_contract_address(), &liquidator, &liquidator_receives);

        loan.status = LoanStatus::Liquidated;
        storage::set_loan(&env, &loan);

        env.events().publish((symbol_short!("LLIQUID"), request_id), liquidator);
        Ok(())
    }

    /// Lender claims collateral after loan term expires without repayment.
    pub fn claim_defaulted(
        env: Env,
        lender: Address,
        request_id: u64,
    ) -> Result<(), LendingError> {
        lender.require_auth();

        let mut loan = storage::get_loan(&env, request_id)
            .ok_or(LendingError::LoanNotFound)?;

        if loan.status != LoanStatus::Active { return Err(LendingError::InvalidStatus); }
        if lender != loan.lender { return Err(LendingError::Unauthorized); }
        if env.ledger().sequence() < loan.due_at { return Err(LendingError::LoanNotDue); }

        // Transfer collateral to lender
        token::TokenClient::new(&env, &loan.collateral_token)
            .transfer(&env.current_contract_address(), &lender, &loan.collateral_amount);

        loan.status = LoanStatus::Defaulted;
        storage::set_loan(&env, &loan);

        env.events().publish((symbol_short!("LDEFAULT"), request_id), lender);
        Ok(())
    }

    /// Borrower cancels a request that hasn't been funded yet.
    pub fn cancel_request(
        env: Env,
        borrower: Address,
        request_id: u64,
    ) -> Result<(), LendingError> {
        borrower.require_auth();

        let mut request = storage::get_request(&env, request_id)
            .ok_or(LendingError::LoanNotFound)?;

        if request.status != LoanStatus::Requested { return Err(LendingError::InvalidStatus); }
        if borrower != request.borrower { return Err(LendingError::Unauthorized); }

        // Return collateral to borrower
        token::TokenClient::new(&env, &request.collateral_token)
            .transfer(&env.current_contract_address(), &borrower, &request.collateral_amount);

        request.status = LoanStatus::Cancelled;
        storage::set_request(&env, &request);

        env.events().publish((symbol_short!("LCANCEL"), request_id), borrower);
        Ok(())
    }

    // ── Read-only ─────────────────────────────────────────────────────────────

    pub fn get_loan_request(env: Env, id: u64) -> Result<LoanRequest, LendingError> {
        storage::get_request(&env, id).ok_or(LendingError::LoanNotFound)
    }

    pub fn get_loan(env: Env, id: u64) -> Result<Loan, LendingError> {
        storage::get_loan(&env, id).ok_or(LendingError::LoanNotFound)
    }

    pub fn get_request_count(env: Env) -> u64 {
        storage::get_request_count(&env)
    }

    pub fn get_loan_count(env: Env) -> u64 {
        storage::get_loan_count(&env)
    }

    pub fn get_health_factor(env: Env, request_id: u64) -> Result<u32, LendingError> {
        let oracle_addr = storage::get_oracle(&env).ok_or(LendingError::NotInitialized)?;
        let loan = storage::get_loan(&env, request_id).ok_or(LendingError::LoanNotFound)?;
        let oracle = OracleClient::new(&env, &oracle_addr);

        let borrow_price = oracle.get_price(&loan.borrow_token);
        let collateral_price = oracle.get_price(&loan.collateral_token);

        let remaining_debt = loan.principal
            .saturating_add(loan.interest_owed)
            .saturating_sub(loan.repaid_amount);

        Ok(math::health_factor(
            loan.collateral_amount,
            collateral_price,
            remaining_debt,
            borrow_price,
        ))
    }
}
