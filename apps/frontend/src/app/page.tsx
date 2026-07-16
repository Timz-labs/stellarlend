import Link from "next/link";

const stats = [
  { label: "Total Value Locked", value: "$0", sub: "Testnet" },
  { label: "Active Loans", value: "0", sub: "Live on Stellar" },
  { label: "Avg Interest Rate", value: "8%", sub: "Fixed rate" },
  { label: "Network", value: "Stellar", sub: "Soroban contracts" },
];

const features = [
  { icon: "🔒", title: "Fixed Interest Rates", desc: "Lock in your rate at loan creation. No surprises — you know exactly what you owe at maturity." },
  { icon: "🤝", title: "Peer-to-Peer Matching", desc: "Lenders choose which loans to fund. Borrowers set their own terms. Direct, transparent matching." },
  { icon: "⚡", title: "Instant Settlement", desc: "Stellar's 5-second finality means funds move immediately when a loan is funded or repaid." },
  { icon: "🛡️", title: "Over-Collateralized", desc: "All loans require 150% collateral. Automatic liquidation protects lenders if health factor drops." },
  { icon: "📅", title: "Flexible Terms", desc: "Choose 30, 60, or 90-day loan terms. Fixed duration with clear repayment schedule." },
  { icon: "💧", title: "Liquidation Incentives", desc: "Liquidators earn a 5% bonus for repaying undercollateralized loans, keeping the protocol solvent." },
];

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center space-y-6 pt-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-900/30 border border-violet-700 rounded-full text-violet-300 text-sm">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          Live on Stellar Testnet
        </div>
        <h1 className="text-6xl font-bold tracking-tight">
          Fixed-Rate P2P Lending
          <span className="text-violet-400 block mt-2">on Stellar</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Borrow USDC at fixed rates with on-chain collateral.
          Fund loans and earn predictable fixed returns.
          Powered by Soroban smart contracts — trustless and transparent.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/borrow" className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-lg transition-colors">
            Start Borrowing
          </Link>
          <Link href="/lend" className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-lg transition-colors">
            Start Lending
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl font-bold text-violet-400">{value}</div>
            <div className="text-sm font-medium mt-1">{label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10">Why StellarLend?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="card flex gap-4">
              <div className="text-3xl">{icon}</div>
              <div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-lg font-semibold text-violet-400 mb-4">For Borrowers</h3>
            <ol className="space-y-3">
              {[
                "Connect your Stellar wallet (Freighter)",
                "Choose borrow amount, token, term, and interest rate",
                "Lock collateral (150% of loan value) — held in contract",
                "Wait for a lender to fund your request",
                "Receive funds instantly when funded",
                "Repay principal + interest before term ends to get collateral back",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span className="w-6 h-6 rounded-full bg-violet-900/50 border border-violet-700 text-violet-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-4">For Lenders</h3>
            <ol className="space-y-3">
              {[
                "Connect your Stellar wallet (Freighter)",
                "Browse open loan requests in the marketplace",
                "Review borrower details, collateral ratio, and interest rate",
                "Fund a loan — principal transfers to borrower immediately",
                "Earn fixed interest when borrower repays",
                "Claim collateral if borrower defaults after term ends",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span className="w-6 h-6 rounded-full bg-green-900/50 border border-green-700 text-green-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Contracts */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-4">Deployed Contracts (Stellar Testnet)</h2>
        <div className="space-y-3">
          {[
            { name: "Lending Contract", id: "CCEJCHUANEQRTC2YQ7PEDH773I272DRLRWKAFZS4MBXWUXXARMFYM6MI" },
            { name: "Oracle Contract", id: "CBOE6DS7WYIS6LDQ5OAC3XUZG3LYLL5WNTO2CYTY5GSS2RAKG7JQWMSX" },
          ].map(({ name, id }) => (
            <div key={name} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
              <span className="text-sm text-gray-400">{name}</span>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-violet-400 hover:underline"
              >
                {id.slice(0, 10)}...{id.slice(-6)}
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
