"use client";

import { Suspense, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Download,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteNav } from "@/components/marketing/site-nav";
import { HOLDINGS } from "@/app/portfolio/tabs/holdings";
import type { Holding } from "@/app/portfolio/tabs/holdings";

// ---------------------------------------------------------------------------
// Symbol map
// ---------------------------------------------------------------------------
const SYMBOL_MAP: Record<string, string> = {
  "Apple Inc.": "AAPL",
  "Microsoft Corporation": "MSFT",
  "NVIDIA Corporation": "NVDA",
  "Alphabet Inc.": "GOOGL",
  "Meta Platforms, Inc.": "META",
  "Tesla, Inc.": "TSLA",
  "Amazon.com, Inc.": "AMZN",
  "Netflix, Inc.": "NFLX",
};

function getSymbol(name: string) {
  return SYMBOL_MAP[name] ?? name.split(" ")[0].toUpperCase();
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const POSITIONS = [
  { symbol: "AAPL", type: "Put", strike: 190, expiry: "Jun 20, 2025", qty: 2, premium: 4.2, currentValue: 5.8, pnl: 320, pnlPct: 38.1 },
  { symbol: "NVDA", type: "Call", strike: 130, expiry: "May 16, 2025", qty: 5, premium: 8.4, currentValue: 12.2, pnl: 1900, pnlPct: 45.2 },
  { symbol: "TSLA", type: "Put", strike: 160, expiry: "Jun 20, 2025", qty: 3, premium: 12.1, currentValue: 8.4, pnl: -1113, pnlPct: -30.6 },
];

const ORDERS = [
  { date: "Apr 25, 2025", symbol: "AAPL", side: "Buy", qty: 3, price: 172.4, status: "Executed" },
  { date: "Apr 18, 2025", symbol: "NVDA", side: "Buy", qty: 2, price: 862.0, status: "Executed" },
  { date: "Apr 12, 2025", symbol: "TSLA", side: "Sell", qty: 1, price: 218.4, status: "Executed" },
  { date: "Mar 28, 2025", symbol: "META", side: "Buy", qty: 1.5, price: 492.8, status: "Executed" },
  { date: "Mar 10, 2025", symbol: "AMZN", side: "Buy", qty: 4, price: 187.0, status: "Executed" },
  { date: "Feb 20, 2025", symbol: "NVDA", side: "Sell", qty: 1, price: 850.0, status: "Executed" },
];

const SIPS = [
  { symbol: "AAPL", name: "Apple Inc.", amount: 50, frequency: "Monthly", nextDate: "May 1, 2025", totalInvested: 600, status: "Active" },
  { symbol: "QQQ", name: "Invesco QQQ", amount: 100, frequency: "Monthly", nextDate: "May 1, 2025", totalInvested: 1200, status: "Active" },
  { symbol: "NVDA", name: "NVIDIA Corp.", amount: 25, frequency: "Weekly", nextDate: "Apr 28, 2025", totalInvested: 325, status: "Active" },
];

const MONTHLY_PNL = [
  { month: "Jan 2025", realised: 0, unrealised: 1240, total: 1240 },
  { month: "Feb 2025", realised: 0, unrealised: -480, total: -480 },
  { month: "Mar 2025", realised: 842, unrealised: 2140, total: 2982 },
  { month: "Apr 2025", realised: 0, unrealised: 728, total: 728 },
];

// Seeded daily P&L for April 2025
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const APRIL_DAILY: Record<number, number> = Object.fromEntries(
  Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const r = seededRand(day * 13);
    return [day, Math.round((r * 2 - 1) * 400)];
  })
);

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------
function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtDollar(n: number) {
  const abs = Math.abs(n);
  return `${n < 0 ? "-" : ""}$${fmt(abs)}`;
}

function pnlColor(n: number) {
  return n >= 0 ? "text-green-400" : "text-red-400";
}

function pnlSign(n: number) {
  return n >= 0 ? "+" : "";
}

// ---------------------------------------------------------------------------
// Card wrapper
// ---------------------------------------------------------------------------
function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6", className)}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TABS
// ---------------------------------------------------------------------------
const TABS = ["Overview", "Holdings", "Positions", "Orders", "Buying Power", "SIPs", "P&L", "Reports"] as const;
type Tab = (typeof TABS)[number];

// ---------------------------------------------------------------------------
// Performance chart placeholder
// ---------------------------------------------------------------------------
const TIME_BUTTONS = ["1D", "1W", "1M", "3M", "1Y"] as const;

function PerformanceChart() {
  const [active, setActive] = useState<string>("1M");

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Performance</h3>
        <div className="flex gap-1">
          {TIME_BUTTONS.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                active === t
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-48">
        <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,140 C60,120 100,100 150,90 C200,80 230,110 280,70 C330,30 370,50 420,40 C470,30 520,20 600,10 L600,180 L0,180 Z"
            fill="url(#chartGrad)"
          />
          <path
            d="M0,140 C60,120 100,100 150,90 C200,80 230,110 280,70 C330,30 370,50 420,40 C470,30 520,20 600,10"
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="600" cy="10" r="4" fill="#34d399" />
        </svg>
        <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[10px] text-white/30 pr-2">
          <span>$30k</span>
          <span>$27k</span>
          <span>$24k</span>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Top Holdings
// ---------------------------------------------------------------------------
function TopHoldings() {
  const top5 = useMemo(
    () => [...HOLDINGS].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5),
    []
  );

  return (
    <Card>
      <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Top Holdings</h3>
      <div className="space-y-3">
        {top5.map((h) => (
          <Link
            key={h.name}
            href={`/stocks/${getSymbol(h.name)}`}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/70 group-hover:bg-white/10 transition-colors">
                {getSymbol(h.name).slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-white leading-none">{getSymbol(h.name)}</p>
                <p className="text-xs text-white/40 mt-0.5 truncate max-w-[140px]">{h.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">{fmtDollar(h.currentValue)}</p>
              <p className={cn("text-xs", pnlColor(h.pnlPct))}>
                {pnlSign(h.pnlPct)}{fmt(h.pnlPct)}%
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Asset Breakdown
// ---------------------------------------------------------------------------
function AssetBreakdown() {
  const stocks = 72;
  const etfs = 28;
  return (
    <Card>
      <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Asset Breakdown</h3>
      <div className="flex items-center gap-6">
        <div
          className="w-20 h-20 rounded-full flex-shrink-0 relative"
          style={{
            background: `conic-gradient(#34d399 0% ${stocks}%, #6366f1 ${stocks}% 100%)`,
          }}
        >
          <div className="absolute inset-0 m-[25%] rounded-full bg-[#1c1c1e]" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-sm text-white/70">Stocks</span>
            </div>
            <span className="text-sm font-semibold text-white">{stocks}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span className="text-sm text-white/70">ETFs</span>
            </div>
            <span className="text-sm font-semibold text-white">{etfs}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sector Allocation
// ---------------------------------------------------------------------------
const SECTORS = [
  { name: "Technology", pct: 38, color: "#6366f1" },
  { name: "Consumer Disc.", pct: 18, color: "#34d399" },
  { name: "Healthcare", pct: 12, color: "#f59e0b" },
  { name: "Finance", pct: 10, color: "#3b82f6" },
  { name: "Other", pct: 22, color: "#8b5cf6" },
];

function SectorAllocation() {
  return (
    <Card>
      <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Sector Allocation</h3>
      <div className="space-y-3">
        {SECTORS.map((s) => (
          <div key={s.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/70">{s.name}</span>
              <span className="text-xs font-medium text-white">{s.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${s.pct}%`, backgroundColor: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Quick Stats
// ---------------------------------------------------------------------------
function QuickStats() {
  return (
    <Card>
      <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Quick Stats</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">XIRR</span>
          <span className="text-sm font-semibold text-green-400">14.2%</span>
        </div>
        <div className="h-px bg-white/[0.06]" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Best Performer</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-white/80">NVDA</span>
            <span className="text-sm font-semibold text-green-400">+28.4%</span>
          </div>
        </div>
        <div className="h-px bg-white/[0.06]" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Worst Performer</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-white/80">TSLA</span>
            <span className="text-sm font-semibold text-red-400">-27.9%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Overview Tab
// ---------------------------------------------------------------------------
function OverviewTab() {
  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2 space-y-5">
        <PerformanceChart />
        <TopHoldings />
      </div>
      <div className="col-span-1 space-y-5">
        <AssetBreakdown />
        <SectorAllocation />
        <QuickStats />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Holdings Tab
// ---------------------------------------------------------------------------
type SortKey = keyof Pick<Holding, "name" | "qty" | "avgPrice" | "currentPrice" | "currentValue" | "pnl" | "pnlPct" | "dayChangePct" | "xirr">;

function HoldingsTab() {
  const [category, setCategory] = useState<"All" | "Stocks" | "ETF" | "Global ETF">("All");
  const [sortKey, setSortKey] = useState<SortKey>("currentValue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const base = category === "All" ? HOLDINGS : HOLDINGS.filter((h) => h.category === category);
    return [...base].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [category, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronsUpDown size={12} className="text-white/20 ml-1" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-white/60 ml-1" />
    ) : (
      <ChevronDown size={12} className="text-white/60 ml-1" />
    );
  }

  const COL_HEAD = "px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap";

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {(["All", "Stocks", "ETF", "Global ETF"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
              category === c
                ? "bg-white/10 border-white/20 text-white"
                : "border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/70"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.04]">
              <th className={COL_HEAD} onClick={() => handleSort("name")}>
                <span className="flex items-center">Name <SortIcon k="name" /></span>
              </th>
              <th className={cn(COL_HEAD, "text-center")}>Category</th>
              <th className={COL_HEAD} onClick={() => handleSort("qty")}>
                <span className="flex items-center">Qty <SortIcon k="qty" /></span>
              </th>
              <th className={COL_HEAD} onClick={() => handleSort("avgPrice")}>
                <span className="flex items-center">Avg Price <SortIcon k="avgPrice" /></span>
              </th>
              <th className={COL_HEAD} onClick={() => handleSort("currentPrice")}>
                <span className="flex items-center">Cur. Price <SortIcon k="currentPrice" /></span>
              </th>
              <th className={COL_HEAD} onClick={() => handleSort("currentValue")}>
                <span className="flex items-center">Value <SortIcon k="currentValue" /></span>
              </th>
              <th className={COL_HEAD} onClick={() => handleSort("pnl")}>
                <span className="flex items-center">P&amp;L <SortIcon k="pnl" /></span>
              </th>
              <th className={COL_HEAD} onClick={() => handleSort("pnlPct")}>
                <span className="flex items-center">P&amp;L % <SortIcon k="pnlPct" /></span>
              </th>
              <th className={COL_HEAD} onClick={() => handleSort("dayChangePct")}>
                <span className="flex items-center">Day % <SortIcon k="dayChangePct" /></span>
              </th>
              <th className={COL_HEAD} onClick={() => handleSort("xirr")}>
                <span className="flex items-center">XIRR <SortIcon k="xirr" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => (
              <tr
                key={h.name}
                className="border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors"
              >
                <td className="px-4 py-3">
                  <Link href={`/stocks/${getSymbol(h.name)}`} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/60 group-hover:bg-white/10 transition-colors flex-shrink-0">
                      {getSymbol(h.name).slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-white/80 transition-colors leading-none">
                        {getSymbol(h.name)}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5 truncate max-w-[150px]">{h.name}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-white/[0.06] text-white/60">
                    {h.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/80">{fmt(h.qty, h.qty % 1 === 0 ? 0 : 3)}</td>
                <td className="px-4 py-3 text-white/80">${fmt(h.avgPrice)}</td>
                <td className="px-4 py-3 text-white">${fmt(h.currentPrice)}</td>
                <td className="px-4 py-3 font-medium text-white">${fmt(h.currentValue)}</td>
                <td className={cn("px-4 py-3 font-medium", pnlColor(h.pnl))}>
                  {pnlSign(h.pnl)}${fmt(Math.abs(h.pnl))}
                </td>
                <td className={cn("px-4 py-3 font-medium", pnlColor(h.pnlPct))}>
                  {pnlSign(h.pnlPct)}{fmt(h.pnlPct)}%
                </td>
                <td className={cn("px-4 py-3", pnlColor(h.dayChangePct))}>
                  {pnlSign(h.dayChangePct)}{fmt(h.dayChangePct)}%
                </td>
                <td className={cn("px-4 py-3 font-medium", pnlColor(h.xirr))}>
                  {pnlSign(h.xirr)}{fmt(h.xirr)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Positions Tab
// ---------------------------------------------------------------------------
function PositionsTab() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/[0.04]">
            {["Symbol", "Type", "Strike", "Expiry", "Qty", "Entry Premium", "Current Value", "P&L", "P&L %"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {POSITIONS.map((p) => (
            <tr key={`${p.symbol}-${p.strike}-${p.type}`} className="border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors">
              <td className="px-4 py-3 font-semibold text-white">{p.symbol}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                    p.type === "Call"
                      ? "bg-green-400/10 text-green-400"
                      : "bg-red-400/10 text-red-400"
                  )}
                >
                  {p.type}
                </span>
              </td>
              <td className="px-4 py-3 text-white/80">${p.strike}</td>
              <td className="px-4 py-3 text-white/60">{p.expiry}</td>
              <td className="px-4 py-3 text-white/80">{p.qty}</td>
              <td className="px-4 py-3 text-white/80">${fmt(p.premium)}</td>
              <td className="px-4 py-3 text-white">${fmt(p.currentValue)}</td>
              <td className={cn("px-4 py-3 font-medium", pnlColor(p.pnl))}>
                {pnlSign(p.pnl)}${fmt(Math.abs(p.pnl))}
              </td>
              <td className={cn("px-4 py-3 font-medium", pnlColor(p.pnlPct))}>
                {pnlSign(p.pnlPct)}{fmt(p.pnlPct)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Orders Tab
// ---------------------------------------------------------------------------
function OrdersTab() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/[0.04]">
            {["Date", "Symbol", "Side", "Qty", "Price", "Amount", "Status"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ORDERS.map((o, i) => (
            <tr key={i} className="border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors">
              <td className="px-4 py-3 text-white/60">{o.date}</td>
              <td className="px-4 py-3 font-semibold text-white">{o.symbol}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                    o.side === "Buy"
                      ? "bg-green-400/10 text-green-400"
                      : "bg-red-400/10 text-red-400"
                  )}
                >
                  {o.side}
                </span>
              </td>
              <td className="px-4 py-3 text-white/80">{o.qty}</td>
              <td className="px-4 py-3 text-white/80">${fmt(o.price)}</td>
              <td className="px-4 py-3 font-medium text-white">${fmt(o.qty * o.price)}</td>
              <td className="px-4 py-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.06] text-white/60">
                  {o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buying Power Tab
// ---------------------------------------------------------------------------
function BuyingPowerTab() {
  const cash = 2840.2;
  const invested = 28450.0;
  const total = cash + invested;
  const investedPct = (invested / total) * 100;

  return (
    <div className="max-w-lg space-y-5">
      <Card>
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-5">Account Summary</h3>
        <div className="space-y-4">
          {[
            { label: "Total Account Value", value: fmtDollar(total), highlight: true },
            { label: "Invested", value: fmtDollar(invested), highlight: false },
            { label: "Available Cash", value: fmtDollar(cash), highlight: false },
            { label: "Withdrawable", value: fmtDollar(cash), highlight: false },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-sm text-white/60">{row.label}</span>
              <span className={cn("font-semibold", row.highlight ? "text-white text-base" : "text-sm text-white")}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Allocation</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Invested ({investedPct.toFixed(1)}%)</span>
            <span>Cash ({(100 - investedPct).toFixed(1)}%)</span>
          </div>
          <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-green-400"
              style={{ width: `${investedPct}%` }}
            />
          </div>
        </div>
      </Card>

      <p className="text-sm text-white/30 italic">
        Deposits and withdrawals are available on the mobile app.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SIPs Tab
// ---------------------------------------------------------------------------
function SIPsTab() {
  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.04]">
              {["Symbol", "Name", "Amount", "Frequency", "Next Date", "Total Invested", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIPS.map((s) => (
              <tr key={s.symbol} className="border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <td className="px-4 py-3 font-semibold text-white">{s.symbol}</td>
                <td className="px-4 py-3 text-white/70">{s.name}</td>
                <td className="px-4 py-3 text-white">${s.amount}</td>
                <td className="px-4 py-3 text-white/60">{s.frequency}</td>
                <td className="px-4 py-3 text-white/60">{s.nextDate}</td>
                <td className="px-4 py-3 font-medium text-white">${fmt(s.totalInvested)}</td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-white/30 italic">Manage SIPs on the mobile app.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// P&L Tab
// ---------------------------------------------------------------------------
function PnLTab() {
  // April 1 2025 is a Tuesday — offset = 2 (0=Sun, 1=Mon, 2=Tue...)
  const firstDayOffset = 2;
  const daysInApril = 30;

  const cells: { day: number | null; pnl: number | null }[] = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push({ day: null, pnl: null });
  for (let d = 1; d <= daysInApril; d++) cells.push({ day: d, pnl: APRIL_DAILY[d] });

  const maxAbs = Math.max(...Object.values(APRIL_DAILY).map(Math.abs));

  function heatColor(pnl: number | null) {
    if (pnl === null) return "bg-transparent";
    if (pnl === 0) return "bg-white/[0.04]";
    const intensity = Math.min(Math.abs(pnl) / maxAbs, 1);
    if (pnl > 0) return intensity > 0.6 ? "bg-green-400/40" : "bg-green-400/20";
    return intensity > 0.6 ? "bg-red-400/40" : "bg-red-400/20";
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-white mb-4">Monthly P&L Summary</h3>
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04]">
                {["Month", "Realised P&L", "Unrealised P&L", "Total"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONTHLY_PNL.map((row) => (
                <tr key={row.month} className="border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                  <td className="px-4 py-3 text-white/70">{row.month}</td>
                  <td className={cn("px-4 py-3 font-medium", pnlColor(row.realised))}>
                    {row.realised === 0 ? <span className="text-white/30">—</span> : `${pnlSign(row.realised)}$${fmt(Math.abs(row.realised))}`}
                  </td>
                  <td className={cn("px-4 py-3 font-medium", pnlColor(row.unrealised))}>
                    {pnlSign(row.unrealised)}${fmt(Math.abs(row.unrealised))}
                  </td>
                  <td className={cn("px-4 py-3 font-semibold", pnlColor(row.total))}>
                    {pnlSign(row.total)}${fmt(Math.abs(row.total))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-white mb-4">April 2025 — Daily P&L</h3>
        <Card className="p-5">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-[10px] text-white/30 font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((c, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-md aspect-square flex flex-col items-center justify-center",
                  heatColor(c.pnl)
                )}
                title={c.day ? `Apr ${c.day}: ${c.pnl! >= 0 ? "+" : ""}$${c.pnl}` : ""}
              >
                {c.day && (
                  <>
                    <span className="text-[10px] text-white/50 leading-none">{c.day}</span>
                    <span
                      className={cn(
                        "text-[9px] leading-none mt-0.5",
                        c.pnl! >= 0 ? "text-green-400/80" : "text-red-400/80"
                      )}
                    >
                      {c.pnl! >= 0 ? "+" : ""}
                      {c.pnl}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 justify-end">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-400/30" />
              <span className="text-[10px] text-white/40">Gain</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-400/30" />
              <span className="text-[10px] text-white/40">Loss</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reports Tab
// ---------------------------------------------------------------------------
const REPORTS = [
  { title: "Annual Tax Report 2024", desc: "Consolidated tax statement for the financial year 2024 including all trades and dividends." },
  { title: "Q1 2025 Summary", desc: "Quarterly portfolio performance summary for January–March 2025." },
  { title: "Transaction History", desc: "Complete history of all buy/sell transactions since account opening." },
  { title: "Capital Gains Statement", desc: "Detailed breakdown of short-term and long-term capital gains and losses." },
];

function ReportsTab() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-5 mb-5">
        {REPORTS.map((r) => (
          <Card key={r.title} className="flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">{r.title}</h4>
              <p className="text-xs text-white/50 leading-relaxed">{r.desc}</p>
            </div>
            <button className="self-start flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors">
              <Download size={14} />
              Download PDF
            </button>
          </Card>
        ))}
      </div>
      <p className="text-sm text-white/30 italic">Reports are generated based on your trading activity.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab content switcher
// ---------------------------------------------------------------------------
function TabContent({ tab }: { tab: Tab }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
      >
        {tab === "Overview" && <OverviewTab />}
        {tab === "Holdings" && <HoldingsTab />}
        {tab === "Positions" && <PositionsTab />}
        {tab === "Orders" && <OrdersTab />}
        {tab === "Buying Power" && <BuyingPowerTab />}
        {tab === "SIPs" && <SIPsTab />}
        {tab === "P&L" && <PnLTab />}
        {tab === "Reports" && <ReportsTab />}
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Inner page (uses useSearchParams)
// ---------------------------------------------------------------------------
function PortfolioPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") ?? "Overview";
  const activeTab: Tab = (TABS as readonly string[]).includes(rawTab) ? (rawTab as Tab) : "Overview";

  function setTab(tab: Tab) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="min-h-screen bg-[#0f0f11]">
      <SiteNav />

      {/* Hero header */}
      <div className="px-6 pt-10 pb-8 max-w-7xl mx-auto">
        {/* User row */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-sm font-semibold text-indigo-300 flex-shrink-0">
            AJ
          </div>
          <p className="text-sm text-white/50">Alex Johnson</p>
        </div>

        {/* Portfolio value */}
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1">Portfolio</p>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-1">$28,450.00</h1>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={15} className="text-green-400" />
          <span className="text-sm font-medium text-green-400">+$312.40 (+1.11%)</span>
          <span className="text-xs text-white/30">today</span>
        </div>

        {/* Secondary stats */}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { label: "Invested", value: "$24,820", positive: false },
            { label: "Unrealised P&L", value: "+$3,630 (+14.6%)", positive: true },
            { label: "Realised P&L", value: "+$842", positive: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-xs text-white/40">{s.label}</span>
              <span className={cn("text-sm font-medium", s.positive ? "text-green-400" : "text-white/70")}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-30 bg-[#0f0f11] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setTab(tab)}
                className={cn(
                  "relative px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0",
                  activeTab === tab ? "text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <TabContent tab={activeTab} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export — wraps inner page in Suspense for useSearchParams
// ---------------------------------------------------------------------------
export default function PortfolioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      }
    >
      <PortfolioPageInner />
    </Suspense>
  );
}
