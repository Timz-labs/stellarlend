use soroban_sdk::{symbol_short, Address, Env};
use crate::types::{Loan, LoanRequest};

const TTL: u32 = 30 * 24 * 60 * 12;

// ── Config ────────────────────────────────────────────────────────────────────

pub fn get_oracle(env: &Env) -> Option<Address> {
    env.storage().instance().get(&symbol_short!("ORACLE"))
}

pub fn set_oracle(env: &Env, oracle: &Address) {
    env.storage().instance().set(&symbol_short!("ORACLE"), oracle);
    env.storage().instance().extend_ttl(TTL, TTL);
}

pub fn get_admin(env: &Env) -> Option<Address> {
    env.storage().instance().get(&symbol_short!("ADMIN"))
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&symbol_short!("ADMIN"), admin);
    env.storage().instance().extend_ttl(TTL, TTL);
}

// ── Counters ──────────────────────────────────────────────────────────────────

pub fn next_request_id(env: &Env) -> u64 {
    let id: u64 = env.storage().instance().get(&symbol_short!("REQID")).unwrap_or(0) + 1;
    env.storage().instance().set(&symbol_short!("REQID"), &id);
    env.storage().instance().extend_ttl(TTL, TTL);
    id
}

pub fn next_loan_id(env: &Env) -> u64 {
    let id: u64 = env.storage().instance().get(&symbol_short!("LOANID")).unwrap_or(0) + 1;
    env.storage().instance().set(&symbol_short!("LOANID"), &id);
    env.storage().instance().extend_ttl(TTL, TTL);
    id
}

pub fn get_request_count(env: &Env) -> u64 {
    env.storage().instance().get(&symbol_short!("REQID")).unwrap_or(0)
}

pub fn get_loan_count(env: &Env) -> u64 {
    env.storage().instance().get(&symbol_short!("LOANID")).unwrap_or(0)
}

// ── Loan requests ─────────────────────────────────────────────────────────────

pub fn get_request(env: &Env, id: u64) -> Option<LoanRequest> {
    env.storage().persistent().get(&(symbol_short!("REQ"), id))
}

pub fn set_request(env: &Env, request: &LoanRequest) {
    let key = (symbol_short!("REQ"), request.id);
    env.storage().persistent().set(&key, request);
    env.storage().persistent().extend_ttl(&key, TTL, TTL);
}

// ── Active loans ──────────────────────────────────────────────────────────────

pub fn get_loan(env: &Env, id: u64) -> Option<Loan> {
    env.storage().persistent().get(&(symbol_short!("LOAN"), id))
}

pub fn set_loan(env: &Env, loan: &Loan) {
    let key = (symbol_short!("LOAN"), loan.request_id);
    env.storage().persistent().set(&key, loan);
    env.storage().persistent().extend_ttl(&key, TTL, TTL);
}
