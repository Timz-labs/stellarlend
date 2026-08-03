//! StellarLend Price Oracle
//!
//! Adapter for Band Protocol price feeds. In testnet this contract may cache
//! prices, but on mainnet it queries a Band Protocol feed contract to obtain
//! decentralized prices. Prices are returned in 7-decimal USD (same as before).

#![no_std]
#![allow(deprecated)]

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

#[contract]
pub struct OracleContract;

mod band_interface {
    use soroban_sdk::{contractclient, Address};
    #[contractclient(name = "BandClient")]
    pub trait Band {
        // Expected Band-style getter exposed by the on-chain Band feed adapter.
        fn get_price(env: soroban_sdk::Env, token: Address) -> i128;
    }
}

#[contractimpl]
impl OracleContract {

    /// Initialize with an admin. Admin can set a Band oracle address later.
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&symbol_short!("ADMIN"), &admin);
    }

    /// Admin sets the on-chain Band oracle contract address (admin only).
    pub fn set_band_oracle(env: Env, admin: Address, band: Address) {
        admin.require_auth();
        let stored: Address = env.storage().instance().get(&symbol_short!("ADMIN")).unwrap();
        assert!(admin == stored, "unauthorized");
        env.storage().instance().set(&symbol_short!("BAND"), &band);
        env.storage().instance().extend_ttl(17280 * 7, 17280 * 7);
    }

    /// Optional fallback: cached admin-set prices. First consult the cache,
    /// otherwise query the configured Band feed contract. Returns 0 if neither
    /// is available.
    pub fn get_price(env: Env, token: Address) -> i128 {
        // Check cached admin-set price first (useful for testnet or emergency).
        let cached: i128 = env.storage().persistent().get(&(symbol_short!("PRICE"), token.clone())).unwrap_or(0);
        if cached > 0 {
            return cached;
        }

        // If a Band feed contract is configured, query it.
        if let Some(band_addr) = env.storage().instance().get(&symbol_short!("BAND")) {
            let band = band_interface::BandClient::new(&env, &band_addr);
            return band.get_price(&token);
        }

        0
    }
}
