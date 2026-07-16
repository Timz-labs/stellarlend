"use client";

import { useState } from "react";
import clsx from "clsx";
import { TrendingUp, Shield, Clock } from "lucide-react";
import Link from "next/link";

const OPEN_REQUESTS = [
  { id: 1, borrower: "GABC...1234", amount: "1,000", token: "USDC", collateralRatio: 185, interestRate: 8, termDays: 30, interest: "6.58" },
  { id: 2, borrower: "GXYZ...5678", amount: "5,000", token: "USDC", collateralRatio: 160, interestRate: 10, termDays: 60, interest: "82.19" },
  { id: 3, borrower: "GDEF...9012", amount: "500", token: "USDC", collateralRatio: 210, interestRate: 6, termDays: 90, interest: "7.40" },
];

export default function LendPage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Lend & Earn</h1>
        <p className="text-gray-400 mt-2">
          Fund open loan requests and earn fixed interest. Your principal is protected by over-collateralization.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, title: "Fixed Returns", desc: "Know exactly how much you earn before funding", color: "text-green-400" },
          { icon: Shield, title: "Over-Collateralized", desc: "All loans backed by 150%+ collateral on-chain", color: "text-blue-400" },
          { icon: Clock, title: "Clear Timeline", desc: "30, 60, or 90 day terms — no open-ended exposure", color: "text-violet-400" },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card flex gap-3">
            <Icon className={clsx("w-5 h-5 mt-0.5 shrink-0", color)} />
            <div>
              <div className="font-semibold text-sm">{title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Open requests */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Open Loan Requests</h2>
        <div className="space-y-4">
          {OPEN_REQUESTS.map((req) => (
            <div key={req.id}
              onClick={() => setSelected(selected === req.id ? null : req.id)}
              className={clsx("card cursor-pointer transition-all",
                selected === req.id ? "border-violet-600" : "hover:border-gray-600")}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 flex-1 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Amount</div>
                    <div className="font-semibold">{req.amount} {req.token}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">You Earn</div>
                    <div className="font-semibold text-green-400">+{req.interest} {req.token}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Rate</div>
                    <div className="font-semibold">{req.interestRate}% APR</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Term</div>
                    <div className="font-semibold">{req.termDays} days</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Collateral</div>
                    <div className={clsx("font-semibold",
                      req.collateralRatio >= 175 ? "text-green-400" : "text-yellow-400")}>
                      {req.collateralRatio}%
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                  Fund Loan
                </button>
              </div>

              {selected === req.id && (
                <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Borrower</div>
                    <div className="font-mono text-xs">{req.borrower}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Total Return</div>
                    <div className="text-green-400 font-semibold">{(parseFloat(req.amount.replace(",","")) + parseFloat(req.interest)).toLocaleString()} {req.token}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Maturity</div>
                    <div>{req.termDays} days after funding</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Default Protection</div>
                    <div className="text-blue-400">Claim collateral</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">
        Want to borrow instead?{" "}
        <Link href="/borrow" className="text-violet-400 hover:underline">Create a loan request →</Link>
      </p>
    </div>
  );
}
