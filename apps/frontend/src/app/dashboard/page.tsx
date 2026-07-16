"use client";

import { useState } from "react";
import clsx from "clsx";
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface LoanItem {
  id: number;
  type: "borrowed" | "lent";
  amount: string;
  token: string;
  interestRate: number;
  termDays: number;
  dueDate: string;
  healthFactor: number | null;
  status: string;
  counterparty: string;
}

const MOCK_LOANS: LoanItem[] = [
  { id: 1, type: "borrowed", amount: "1,000", token: "USDC", interestRate: 8, termDays: 30, dueDate: "Aug 14, 2026", healthFactor: 185, status: "Active", counterparty: "GXYZ...5678" },
  { id: 2, type: "lent", amount: "500", token: "USDC", interestRate: 10, termDays: 60, dueDate: "Sep 12, 2026", healthFactor: null, status: "Active", counterparty: "GABC...1234" },
  { id: 3, type: "borrowed", amount: "2,000", token: "USDC", interestRate: 7, termDays: 30, dueDate: "Jul 10, 2026", healthFactor: null, status: "Repaid", counterparty: "GDEF...9012" },
  { id: 4, type: "lent", amount: "750", token: "USDC", interestRate: 9, termDays: 30, dueDate: "Jul 20, 2026", healthFactor: null, status: "Defaulted", counterparty: "GHIJ...3456" },
];

const STATUS_STYLES: Record<string, string> = {
  Active:    "badge-active",
  Repaid:    "badge-repaid",
  Defaulted: "badge-defaulted",
  Liquidated:"badge-liquidated",
  Requested: "badge-requested",
};

function HealthBar({ value }: { value: number }) {
  const color = value >= 175 ? "bg-green-500" : value >= 130 ? "bg-yellow-500" : "bg-red-500";
  const width = Math.min((value / 300) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
        <div className={clsx("h-1.5 rounded-full", color)} style={{ width: `${width}%` }} />
      </div>
      <span className={clsx("text-xs font-semibold",
        value >= 175 ? "text-green-400" : value >= 130 ? "text-yellow-400" : "text-red-400")}>
        {value}%
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [tab, setTab] = useState<"all" | "borrowed" | "lent">("all");

  const filtered = MOCK_LOANS.filter((l) => tab === "all" || l.type === tab);

  const totalBorrowed = MOCK_LOANS.filter((l) => l.type === "borrowed" && l.status === "Active")
    .reduce((s) => s + 1000, 0);
  const totalLent = MOCK_LOANS.filter((l) => l.type === "lent" && l.status === "Active")
    .reduce((s) => s + 500, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-2">Your active loans, lending positions, and history.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs">Total Borrowed</span>
          </div>
          <div className="text-2xl font-bold">$1,000</div>
          <div className="text-xs text-gray-500 mt-1">1 active loan</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Total Lent</span>
          </div>
          <div className="text-2xl font-bold">$500</div>
          <div className="text-xs text-gray-500 mt-1">1 active position</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Interest Earned</span>
          </div>
          <div className="text-2xl font-bold">$12.33</div>
          <div className="text-xs text-gray-500 mt-1">All time</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">Loans Completed</span>
          </div>
          <div className="text-2xl font-bold">1</div>
          <div className="text-xs text-gray-500 mt-1">0 defaults</div>
        </div>
      </div>

      {/* Loan list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Your Loans</h2>
          <div className="flex gap-2">
            {(["all", "borrowed", "lent"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  tab === t ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700")}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((loan) => (
            <div key={loan.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded",
                      loan.type === "borrowed" ? "bg-red-900/30 text-red-300" : "bg-green-900/30 text-green-300")}>
                      {loan.type === "borrowed" ? "↓ Borrowing" : "↑ Lending"}
                    </span>
                    <span className={clsx("text-xs px-2 py-0.5 rounded-full border", STATUS_STYLES[loan.status])}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="font-semibold text-lg">{loan.amount} {loan.token}</div>
                  <div className="text-xs text-gray-500">
                    {loan.interestRate}% APR · {loan.termDays} days ·
                    {loan.status === "Active" ? ` Due ${loan.dueDate}` : ` Closed`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Counterparty</div>
                  <div className="text-xs font-mono text-gray-400">{loan.counterparty}</div>
                </div>
              </div>

              {loan.healthFactor && (
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    {loan.healthFactor < 130 && <AlertTriangle className="w-3 h-3 text-red-400" />}
                    Health Factor
                  </div>
                  <HealthBar value={loan.healthFactor} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
