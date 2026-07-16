//! StellarLend Price Oracle
//!
//! A simple admin-controlled price oracle that stores token prices
//! in USD with 7 decimal places (e.g. 1 USDC = 10_000_000).
//! In production this would be replaced by Band Protocol or
//! a decentralized oracle network.

#![no_std]
#![allow(deprecated)]

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

#[contract]
pub struct OracleContract;

#[contractimpl]
impl OracleContract {

    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&symbol_short!("ADMIN"), &admin);
    }

    /// Admin sets price for a token (7 decimal places, USD).
    pub fn set_price(env: Env, admin: Address, token: Address, price: i128) {
        admin.require_auth();
        let stored: Address = env.storage().instance().get(&symbol_short!("ADMIN")).unwrap();
        assert!(admin == stored, "unauthorized");
        assert!(price > 0, "price must be positive");
        env.storage().persistent().set(&(symbol_short!("PRICE"), token.clone()), &price);
        env.storage().persistent().extend_ttl(&(symbol_short!("PRICE"), token), 17280 * 7, 17280 * 7);
    }

    /// Get price for a token. Returns 0 if not set.
    pub fn get_price(env: Env, token: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&(symbol_short!("PRICE"), token))
            .unwrap_or(0)
    }
}
