use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum LendingError {
    NotInitialized        = 1,
    AlreadyInitialized    = 2,
    Unauthorized          = 3,
    LoanNotFound          = 4,
    InvalidStatus         = 5,
    InvalidAmount         = 6,
    InvalidRate           = 7,
    CollateralInsufficient= 8,
    HealthFactorOk        = 9,
    LoanNotDue            = 10,
    LoanExpired           = 11,
    TooManyLoans          = 12,
    OraclePriceStale      = 13,
    SelfFunding           = 14,
    AlreadyRepaid         = 15,
}
