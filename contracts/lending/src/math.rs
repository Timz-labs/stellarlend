//! Fixed-point math helpers for interest and health factor calculations.
//! All values use 7 decimal places (Stellar's base unit = 1 stroop).

/// Minimum collateral ratio — 150% (collateral must be 1.5x the loan value)
pub const MIN_COLLATERAL_RATIO: u32 = 150;

/// Liquidation threshold — 110% health factor
pub const LIQUIDATION_THRESHOLD: u32 = 110;

/// Liquidation bonus for liquidators — 5%
pub const LIQUIDATION_BONUS_BPS: u32 = 500;

/// Basis points denominator
pub const BPS: u32 = 10_000;

/// Seconds per year (approximate, for interest calc)
pub const LEDGERS_PER_YEAR: u32 = 17_280 * 365;

/// Calculate simple interest owed over a term.
///
/// interest = principal * rate_bps / BPS * term_ledgers / LEDGERS_PER_YEAR
pub fn calculate_interest(
    principal: i128,
    rate_bps: u32,
    term_ledgers: u32,
) -> i128 {
    let rate = rate_bps as i128;
    let term = term_ledgers as i128;
    let year = LEDGERS_PER_YEAR as i128;
    let bps = BPS as i128;

    // principal * rate / BPS * term / year
    principal
        .saturating_mul(rate)
        .saturating_div(bps)
        .saturating_mul(term)
        .saturating_div(year)
}

/// Calculate health factor * 100 (e.g. 150 = 150% = healthy).
///
/// health_factor = (collateral_value_usd * 100) / loan_value_usd
pub fn health_factor(
    collateral_amount: i128,
    collateral_price: i128, // price in base units per token
    debt_amount: i128,
    debt_price: i128,
) -> u32 {
    if debt_amount == 0 { return u32::MAX; }

    let collateral_value = collateral_amount
        .saturating_mul(collateral_price)
        .saturating_div(10_000_000); // normalize 7 decimals

    let debt_value = debt_amount
        .saturating_mul(debt_price)
        .saturating_div(10_000_000);

    if debt_value == 0 { return u32::MAX; }

    ((collateral_value * 100) / debt_value) as u32
}

/// Calculate minimum collateral needed for a given loan amount.
/// Collateral must be >= 150% of loan value.
pub fn min_collateral(
    borrow_amount: i128,
    borrow_price: i128,
    collateral_price: i128,
) -> i128 {
    let loan_value = borrow_amount
        .saturating_mul(borrow_price)
        .saturating_div(10_000_000);

    let min_collateral_value = loan_value
        .saturating_mul(MIN_COLLATERAL_RATIO as i128)
        .saturating_div(100);

    // Convert back to collateral token units
    min_collateral_value
        .saturating_mul(10_000_000)
        .saturating_div(collateral_price)
}
