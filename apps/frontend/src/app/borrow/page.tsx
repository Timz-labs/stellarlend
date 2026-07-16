"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

export default function BorrowPage() {
  const [borrowToken] = useState("USDC");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [interestRate, setInterestRate] = useState("8");
  const [termDays, setTermDays] = useState<30 | 60 | 90>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const estimatedInterest = borrowAmount
    ? ((parseFloat(borrowAmount) * parseFloat(interestRate)) / 100 * termDays / 365).toFixed(2)
    : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setSuccess("Loan request created! Waiting for a lender to fund it.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Request a Loan</h1>
        <p className="text-gray-400 mt-2">Lock collateral and set your terms. A lender will fund your request.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-300">Loan Details</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Borrow token</label>
            <div className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300">
              USDC (USD Coin on Stellar)
            </div>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm text-gray-400 mb-1">Amount to borrow</label>
            <input id="amount" type="number" value={borrowAmount} onChange={(e) => setBorrowAmount(e.target.value)}
              placeholder="1000" min="1" required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" />
          </div>
          <div>
            <label htmlFor="rate" className="block text-sm text-gray-400 mb-1">
              Interest rate (APR %) — <span className="text-green-400">{interestRate}%</span>
            </label>
            <input id="rate" type="range" min="3" max="25" value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full accent-violet-500" />
            <div className="flex justify-between text-xs text-gray-600 mt-1"><span>3%</span><span>25%</span></div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Term</label>
            <div className="grid grid-cols-3 gap-2">
              {([30, 60, 90] as const).map((d) => (
                <button key={d} type="button" onClick={() => setTermDays(d)}
                  className={clsx("py-2 rounded-lg text-sm font-medium border transition-colors",
                    termDays === d ? "bg-violet-900/50 border-violet-600 text-violet-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500")}>
                  {d} days
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-300">Collateral</h2>
          <p className="text-xs text-gray-500">Minimum 150% of loan value required. Locked until repayment.</p>
          <div>
            <label htmlFor="collateral" className="block text-sm text-gray-400 mb-1">XLM collateral amount</label>
            <input id="collateral" type="number" value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              placeholder="e.g. 15000 XLM for 1000 USDC loan" min="1" required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" />
          </div>
        </div>

        {/* Summary */}
        <div className="card bg-gray-900/50 space-y-2 text-sm">
          <h2 className="font-semibold text-gray-300 mb-3">Loan Summary</h2>
          {[
            { label: "Principal", value: `${borrowAmount || "0"} USDC` },
            { label: "Interest at maturity", value: `${estimatedInterest} USDC` },
            { label: "Total repayment", value: `${(parseFloat(borrowAmount || "0") + parseFloat(estimatedInterest)).toFixed(2)} USDC` },
            { label: "Term", value: `${termDays} days` },
            { label: "Fixed rate", value: `${interestRate}% APR` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>

        {error && <div role="alert" className="p-4 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm">{error}</div>}
        {success && <div role="status" className="p-4 bg-green-950 border border-green-800 rounded-lg text-green-300 text-sm">{success}</div>}

        <button type="submit" disabled={isSubmitting}
          className={clsx("w-full py-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2",
            isSubmitting ? "bg-gray-700 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-500")}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Creating Request…" : "Create Loan Request"}
        </button>
      </form>
    </div>
  );
}
