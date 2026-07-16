"use client";

import { useState } from "react";
import clsx from "clsx";

interface LoanRequestDisplay {
  id: number;
  borrower: string;
  borrowToken: string;
  borrowAmount: string;
  collateralToken: string;
  collateralRatio: number;
  interestRate: number;
  termDays: number;
  status: string;
}

const MOCK: LoanRequestDisplay[] = [
  { id: 1, borrower: "GABC...1234", borrowToken: "USDC", borrowAmount: "1,000", collateralToken: "XLM", collateralRatio: 185, interestRate: 8, termDays: 30, status: "Requested" },
  { id: 2, borrower: "GXYZ...5678", borrowToken: "USDC", borrowAmount: "5,000", collateralToken: "XLM", collateralRatio: 160, interestRate: 10, termDays: 60, status: "Requested" },
  { id: 3, borrower: "GDEF...9012", borrowToken: "USDC", borrowAmount: "500", collateralToken: "XLM", collateralRatio: 200, interestRate: 6, termDays: 90, status: "Active" },
];

export default function MarketsPage() {
  const [filter, setFilter] = useState<"all" | "Requested" | "Active">("all");

  const filtered = MOCK.filter((l) => filter === "all" || l.status === filter);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Loan Marketplace</h1>
        <p className="text-gray-400 mt-2">Browse open loan requests and fund them to earn fixed interest.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "Requested", "Active"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filter === f ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700")}>
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Loan cards */}
      <div className="space-y-4">
        {filtered.map((loan) => (
          <div key={loan.id} className="card flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <div>
                <div className="text-xs text-gray-500 mb-1">Borrow Amount</div>
                <div className="font-semibold">{loan.borrowAmount} {loan.borrowToken}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Interest Rate</div>
                <div className="font-semibold text-green-400">{loan.interestRate}% APR</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Term</div>
                <div className="font-semibold">{loan.termDays} days</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Collateral Ratio</div>
                <div className={clsx("font-semibold", loan.collateralRatio >= 175 ? "text-green-400" : "text-yellow-400")}>
                  {loan.collateralRatio}%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={clsx("px-3 py-1 rounded-full border text-xs font-semibold",
                loan.status === "Requested" ? "badge-requested" : "badge-active")}>
                {loan.status}
              </span>
              {loan.status === "Requested" && (
                <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors">
                  Fund Loan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
