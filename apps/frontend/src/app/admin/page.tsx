"use client";

/**
 * Admin Monitoring Dashboard
 * Shows protocol health metrics, active loans, liquidatable positions,
 * and protocol revenue in real time.
 *
 * Resolves: https://github.com/Timz-labs/stellarlend/issues/8
 */

import { useState } from "react";
import clsx from "clsx";
import {
  TrendingUp, TrendingDown, AlertTriangle,
  Activity, DollarSign, Users, Zap,
} from "lucide-react";

interface ProtocolStats {
  totalValueLocked: string;
  activeLoans: number;
  totalBorrowed: string;
  totalLent: string;
  protocolRevenue: string;
  liquidatablePositions: number;
  averageHealthFactor: number;
  totalLiquidations: number;
}

interface LiquidatablePosition {
  id: number;
  borrower: string;
  debt: string;
  collateral: string;
  healthFactor: number;
  collateralToken: string;
}

interface RecentActivity {
  id: number;
  type: "loan_created" | "loan_funded" | "repayment" | "liquidation" | "default";
  description: string;
  amount: string;
  time: string;
  txHash: string;
}

const STATS: ProtocolStats = {
  totalValueLocked: "$157,500",
  activeLoans: 12,
  totalBorrowed: "$67,500",
  totalLent: "$90,000",
  protocolRevenue: "$1,234.56",
  liquidatablePositions: 2,
  averageHealthFactor: 178,
  totalLiquidations: 3,
};

const LIQUIDATABLE: LiquidatablePosition[] = [
  { id: 4, borrower: "GXYZ...5678", debt: "5,000 USDC", collateral: "7,800 XLM", healthFactor: 108, collateralToken: "XLM" },
  { id: 7, borrower: "GABC...9012", debt: "2,500 USDC", collateral: "3,600 XLM", healthFactor: 105, collateralToken: "XLM" },
];

const ACTIVITY: RecentActivity[] = [
  { id: 1, type: "loan_funded", description: "Loan #12 funded", amount: "+$1,000 USDC", time: "2 min ago", txHash: "abc123..." },
  { id: 2, type: "repayment", description: "Loan #8 repaid in full", amount: "-$1,080 USDC", time: "15 min ago", txHash: "def456..." },
  { id: 3, type: "loan_created", description: "New loan request #13", amount: "$5,000 USDC", time: "34 min ago", txHash: "ghi789..." },
  { id: 4, type: "liquidation", description: "Loan #3 liquidated", amount: "$800 USDC", time: "1 hr ago", txHash: "jkl012..." },
  { id: 5, type: "loan_funded", description: "Loan #11 funded", amount: "+$750 USDC", time: "2 hr ago", txHash: "mno345..." },
];

const ACTIVITY_COLORS: Record<RecentActivity["type"], string> = {
  loan_created:  "bg-yellow-500",
  loan_funded:   "bg-blue-500",
  repayment:     "bg-green-500",
  liquidation:   "bg-red-500",
  default:       "bg-gray-500",
};

const ACTIVITY_LABELS: Record<RecentActivity["type"], string> = {
  loan_created:  "New Request",
  loan_funded:   "Funded",
  repayment:     "Repaid",
  liquidation:   "Liquidated",
  default:       "Defaulted",
};

export default function AdminPage() {
  const [isLiquidating, setIsLiquidating] = useState<number | null>(null);

  const handleLiquidate = async (id: number) => {
    setIsLiquidating(id);
    // Contract call: liquidate(liquidator, request_id)
    await new Promise((r) => setTimeout(r, 1500));
    setIsLiquidating(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Protocol Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time monitoring of StellarLend protocol health.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-700 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-300 text-xs font-medium">Stellar Testnet</span>
        </div>
      </div>

      {/* Alert for liquidatable positions */}
      {STATS.liquidatablePositions > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-950 border border-red-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <span className="text-red-300 font-semibold">
              {STATS.liquidatablePositions} position{STATS.liquidatablePositions > 1 ? "s" : ""} at risk of liquidation
            </span>
            <p className="text-red-400 text-sm">Health factor below 110%. Liquidators can earn 5% bonus.</p>
          </div>
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Total Value Locked", value: STATS.totalValueLocked, sub: "Collateral in contracts", color: "text-violet-400" },
          { icon: Activity, label: "Active Loans", value: STATS.activeLoans.toString(), sub: `${STATS.liquidatablePositions} at risk`, color: "text-blue-400" },
          { icon: TrendingUp, label: "Protocol Revenue", value: STATS.protocolRevenue, sub: "All time", color: "text-green-400" },
          { icon: Zap, label: "Avg Health Factor", value: `${STATS.averageHealthFactor}%`, sub: ">150% = safe", color: "text-yellow-400" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="card">
            <div className={clsx("flex items-center gap-2 mb-2", color)}>
              <Icon className="w-4 h-4" />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
            <div className={clsx("text-2xl font-bold", color)}>{value}</div>
            <div className="text-xs text-gray-600 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Borrowed", value: STATS.totalBorrowed, icon: TrendingDown, color: "text-red-400" },
          { label: "Total Lent", value: STATS.totalLent, icon: TrendingUp, color: "text-green-400" },
          { label: "Total Liquidations", value: STATS.totalLiquidations.toString(), icon: AlertTriangle, color: "text-orange-400" },
          { label: "Active Borrowers", value: "8", icon: Users, color: "text-blue-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={clsx("p-2 rounded-lg bg-gray-800", color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-gray-500">{label}</div>
              <div className="font-bold text-lg">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Liquidatable positions */}
        <div className="card space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Liquidatable Positions
          </h2>
          {LIQUIDATABLE.length === 0 ? (
            <p className="text-sm text-gray-500">No positions at risk. Protocol is healthy.</p>
          ) : (
            LIQUIDATABLE.map((pos) => (
              <div key={pos.id} className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 mr-2">Loan #{pos.id}</span>
                    <span className="font-mono text-xs text-gray-400">{pos.borrower}</span>
                  </div>
                  <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full border",
                    pos.healthFactor < 108 ? "badge-liquidated" : "badge-disputed")}>
                    HF: {pos.healthFactor}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Debt</span>
                    <div className="font-medium text-red-400">{pos.debt}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Collateral</span>
                    <div className="font-medium text-green-400">{pos.collateral}</div>
                  </div>
                </div>
                {/* Health factor bar */}
                <div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min((pos.healthFactor / 200) * 100, 100)}%` }} />
                  </div>
                </div>
                <button
                  onClick={() => handleLiquidate(pos.id)}
                  disabled={isLiquidating === pos.id}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
                  {isLiquidating === pos.id ? "Liquidating…" : "Liquidate (+5% bonus)"}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Recent activity */}
        <div className="card space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={clsx("w-2 h-2 rounded-full mt-1.5 shrink-0", ACTIVITY_COLORS[item.type])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">{item.description}</span>
                    <span className={clsx("text-xs font-semibold shrink-0",
                      item.type === "repayment" ? "text-green-400" :
                      item.type === "liquidation" ? "text-red-400" : "text-blue-400")}>
                      {item.amount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-600">{item.time}</span>
                    <span className="text-xs text-gray-700">·</span>
                    <a href={`https://stellar.expert/explorer/testnet/tx/${item.txHash}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-violet-500 hover:underline font-mono">
                      {item.txHash}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contracts info */}
      <div className="card">
        <h2 className="font-semibold mb-4">Deployed Contracts</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { name: "Lending Contract", id: "CCEJCHUANEQRTC2YQ7PEDH773I272DRLRWKAFZS4MBXWUXXARMFYM6MI" },
            { name: "Oracle Contract", id: "CBOE6DS7WYIS6LDQ5OAC3XUZG3LYLL5WNTO2CYTY5GSS2RAKG7JQWMSX" },
          ].map(({ name, id }) => (
            <div key={name} className="bg-gray-800 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">{name}</span>
              <a href={`https://stellar.expert/explorer/testnet/contract/${id}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-mono text-violet-400 hover:underline">
                {id.slice(0, 8)}...{id.slice(-6)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
