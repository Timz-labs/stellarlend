"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import { Search, SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react";

interface LoanRequest {
  id: number;
  borrower: string;
  borrowToken: string;
  borrowAmount: number;
  collateralToken: string;
  collateralRatio: number;
  interestRate: number;
  termDays: number;
  status: string;
  postedDate: string;
}

const ALL_LOANS: LoanRequest[] = [
  { id: 1, borrower: "GABC...1234", borrowToken: "USDC", borrowAmount: 1000, collateralToken: "XLM", collateralRatio: 185, interestRate: 8, termDays: 30, status: "Requested", postedDate: "2026-07-01" },
  { id: 2, borrower: "GXYZ...5678", borrowToken: "USDC", borrowAmount: 5000, collateralToken: "XLM", collateralRatio: 160, interestRate: 10, termDays: 60, status: "Requested", postedDate: "2026-07-03" },
  { id: 3, borrower: "GDEF...9012", borrowToken: "USDC", borrowAmount: 500, collateralToken: "XLM", collateralRatio: 210, interestRate: 6, termDays: 90, status: "Active", postedDate: "2026-06-28" },
  { id: 4, borrower: "GHIJ...3456", borrowToken: "USDC", borrowAmount: 2500, collateralToken: "XLM", collateralRatio: 175, interestRate: 9, termDays: 30, status: "Requested", postedDate: "2026-07-05" },
  { id: 5, borrower: "GKLM...7890", borrowToken: "USDC", borrowAmount: 750, collateralToken: "XLM", collateralRatio: 195, interestRate: 7, termDays: 60, status: "Requested", postedDate: "2026-07-06" },
  { id: 6, borrower: "GNOP...2345", borrowToken: "USDC", borrowAmount: 10000, collateralToken: "XLM", collateralRatio: 155, interestRate: 12, termDays: 90, status: "Requested", postedDate: "2026-07-07" },
];

type SortField = "borrowAmount" | "interestRate" | "termDays" | "collateralRatio" | "postedDate";
type SortDir = "asc" | "desc";

export default function MarketsPage() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Requested" | "Active">("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [termFilter, setTermFilter] = useState<"all" | "30" | "60" | "90">("all");
  const [minCollateral, setMinCollateral] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ── Sort state ────────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>("postedDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // ── Filtered + sorted loans ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    return ALL_LOANS
      .filter((loan) => {
        if (statusFilter !== "all" && loan.status !== statusFilter) return false;
        if (search && !loan.borrower.toLowerCase().includes(search.toLowerCase())) return false;
        if (minAmount && loan.borrowAmount < parseFloat(minAmount)) return false;
        if (maxAmount && loan.borrowAmount > parseFloat(maxAmount)) return false;
        if (minRate && loan.interestRate < parseFloat(minRate)) return false;
        if (maxRate && loan.interestRate > parseFloat(maxRate)) return false;
        if (termFilter !== "all" && loan.termDays !== parseInt(termFilter)) return false;
        if (minCollateral && loan.collateralRatio < parseFloat(minCollateral)) return false;
        return true;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortField === "postedDate") return dir * (a.postedDate > b.postedDate ? 1 : -1);
        return dir * ((a[sortField] as number) - (b[sortField] as number));
      });
  }, [search, statusFilter, minAmount, maxAmount, minRate, maxRate, termFilter, minCollateral, sortField, sortDir]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setMinAmount("");
    setMaxAmount("");
    setMinRate("");
    setMaxRate("");
    setTermFilter("all");
    setMinCollateral("");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-violet-400" />
      : <ChevronDown className="w-3 h-3 text-violet-400" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loan Marketplace</h1>
        <p className="text-gray-400 mt-2">
          Browse open loan requests and fund them to earn fixed interest.
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by borrower address..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
            aria-label="Search loans"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx("flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors",
            showFilters ? "bg-violet-900/50 border-violet-600 text-violet-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500")}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="card space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500">
                <option value="all">All</option>
                <option value="Requested">Requested</option>
                <option value="Active">Active</option>
              </select>
            </div>

            {/* Term */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Term</label>
              <select value={termFilter} onChange={(e) => setTermFilter(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500">
                <option value="all">All terms</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            {/* Amount range */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Amount (USDC)</label>
              <input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Amount (USDC)</label>
              <input type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="100000"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500" />
            </div>

            {/* Rate range */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Rate (%)</label>
              <input type="number" value={minRate} onChange={(e) => setMinRate(e.target.value)}
                placeholder="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Rate (%)</label>
              <input type="number" value={maxRate} onChange={(e) => setMaxRate(e.target.value)}
                placeholder="50"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500" />
            </div>

            {/* Min collateral ratio */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Collateral Ratio (%)</label>
              <input type="number" value={minCollateral} onChange={(e) => setMinCollateral(e.target.value)}
                placeholder="150"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500" />
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button onClick={resetFilters}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-400 transition-colors">
                Reset filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{filtered.length} loan{filtered.length !== 1 ? "s" : ""} found</span>
        <div className="flex gap-2">
          {(["all", "Requested", "Active"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={clsx("px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                statusFilter === s ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700")}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Sortable table header */}
      <div className="hidden md:grid grid-cols-6 gap-4 px-4 text-xs text-gray-500">
        {[
          { label: "Amount", field: "borrowAmount" as SortField },
          { label: "Rate", field: "interestRate" as SortField },
          { label: "Term", field: "termDays" as SortField },
          { label: "Collateral", field: "collateralRatio" as SortField },
          { label: "Posted", field: "postedDate" as SortField },
        ].map(({ label, field }) => (
          <button key={field} onClick={() => handleSort(field)}
            className="flex items-center gap-1 hover:text-white transition-colors">
            {label}
            <SortIcon field={field} />
          </button>
        ))}
        <span>Action</span>
      </div>

      {/* Loan cards */}
      {filtered.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          No loans match your filters. Try adjusting or resetting them.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((loan) => (
            <div key={loan.id} className="card hover:border-gray-600 transition-colors">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Amount</div>
                  <div className="font-semibold">{loan.borrowAmount.toLocaleString()} {loan.borrowToken}</div>
                  <div className="text-xs text-gray-600 font-mono">{loan.borrower}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Rate</div>
                  <div className="font-semibold text-green-400">{loan.interestRate}% APR</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Term</div>
                  <div className="font-semibold">{loan.termDays} days</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Collateral</div>
                  <div className={clsx("font-semibold",
                    loan.collateralRatio >= 175 ? "text-green-400" : "text-yellow-400")}>
                    {loan.collateralRatio}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Posted</div>
                  <div className="text-sm">{loan.postedDate}</div>
                  <span className={clsx("text-xs px-2 py-0.5 rounded-full border mt-1 inline-block",
                    loan.status === "Requested" ? "badge-requested" : "badge-active")}>
                    {loan.status}
                  </span>
                </div>
                <div>
                  {loan.status === "Requested" && (
                    <button className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors">
                      Fund Loan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
