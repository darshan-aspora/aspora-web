"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteNav } from "@/components/marketing/site-nav";
import { cn } from "@/lib/utils";
import {
  getStocksForCap,
  moverTabs,
  capLabels,
  capOrder,
  sortValue,
  defaultSortFor,
  type Stock,
  type MoverType,
  type CapSize,
  type SortKey,
  type SortDir,
} from "@/app/explore/_data/movers";

/* ------------------------------------------------------------------ */
/*  Market summary bar data                                             */
/* ------------------------------------------------------------------ */

const MARKET_INDICES = [
  { name: "S&P 500", level: "5,234.18", change: "+38.42", pct: "+0.74%", up: true },
  { name: "NASDAQ 100", level: "18,247.09", change: "-92.34", pct: "-0.50%", up: false },
  { name: "Dow Jones", level: "39,142.23", change: "+122.05", pct: "+0.31%", up: true },
];

/* ------------------------------------------------------------------ */
/*  ETF data                                                            */
/* ------------------------------------------------------------------ */

const ETF_LIST = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 524.18, change1d: 0.74, return1y: 24.2, aum: "549B", expenseRatio: 0.0945, category: "US Equity" },
  { symbol: "QQQ", name: "Invesco NASDAQ 100", price: 441.32, change1d: -0.50, return1y: 28.7, aum: "245B", expenseRatio: 0.20, category: "US Equity" },
  { symbol: "VTI", name: "Vanguard Total Stock Market", price: 248.65, change1d: 0.61, return1y: 22.8, aum: "387B", expenseRatio: 0.03, category: "US Equity" },
  { symbol: "IWM", name: "iShares Russell 2000", price: 198.42, change1d: -1.21, return1y: 11.4, aum: "56B", expenseRatio: 0.19, category: "Small Cap" },
  { symbol: "GLD", name: "SPDR Gold Shares", price: 224.87, change1d: 0.38, return1y: 18.3, aum: "58B", expenseRatio: 0.40, category: "Commodities" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury", price: 89.24, change1d: -0.22, return1y: -8.4, aum: "51B", expenseRatio: 0.15, category: "Bonds" },
  { symbol: "XLK", name: "Technology Select Sector SPDR", price: 214.56, change1d: 1.12, return1y: 32.1, aum: "64B", expenseRatio: 0.09, category: "Sector" },
  { symbol: "ARKK", name: "ARK Innovation ETF", price: 48.73, change1d: 2.84, return1y: -12.6, aum: "7.2B", expenseRatio: 0.75, category: "Thematic" },
];

/* ------------------------------------------------------------------ */
/*  Indices data                                                        */
/* ------------------------------------------------------------------ */

const INDEX_LIST = [
  { symbol: "SPX", name: "S&P 500", level: 5234.18, change: 38.42, changePct: 0.74, ytd: 9.83, constituents: 503, exchange: "NYSE" },
  { symbol: "NDX", name: "NASDAQ 100", level: 18247.09, change: -92.34, changePct: -0.50, ytd: 7.21, constituents: 100, exchange: "NASDAQ" },
  { symbol: "DJI", name: "Dow Jones Industrial", level: 39142.23, change: 122.05, changePct: 0.31, ytd: 4.12, constituents: 30, exchange: "NYSE" },
  { symbol: "RUT", name: "Russell 2000", level: 2048.67, change: -24.81, changePct: -1.20, ytd: 1.84, constituents: 2000, exchange: "NYSE" },
  { symbol: "VIX", name: "CBOE Volatility Index", level: 18.42, change: -1.24, changePct: -6.31, ytd: -8.20, constituents: 0, exchange: "CBOE" },
  { symbol: "NYA", name: "NYSE Composite", level: 17842.55, change: 84.22, changePct: 0.47, ytd: 6.44, constituents: 1900, exchange: "NYSE" },
];

/* ------------------------------------------------------------------ */
/*  Small helpers                                                       */
/* ------------------------------------------------------------------ */

function fmtPrice(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number, forceSign = true) {
  const sign = forceSign && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function PctCell({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={cn("font-medium tabular-nums", up ? "text-emerald-400" : "text-red-400")}>
      {fmtPct(value)}
    </span>
  );
}

function RatingBadge({ rating }: { rating: string }) {
  const cls =
    rating === "Buy"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
      : rating === "Sell"
      ? "bg-red-500/15 text-red-400 border-red-500/20"
      : "bg-amber-500/15 text-amber-400 border-amber-500/20";
  return (
    <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-semibold border", cls)}>
      {rating}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Pill filter                                                         */
/* ------------------------------------------------------------------ */

interface PillFilterProps<T extends string> {
  options: { id: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
}

function PillFilter<T extends string>({ options, active, onChange }: PillFilterProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium transition-colors",
            active === opt.id
              ? "bg-white text-neutral-900"
              : "text-white/60 hover:text-white border border-white/10 hover:border-white/20"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sort header cell                                                    */
/* ------------------------------------------------------------------ */

interface SortHeaderProps {
  label: string;
  colKey: string;
  sortKey: string;
  sortDir: SortDir;
  onSort: (k: string) => void;
  className?: string;
}

function SortHeader({ label, colKey, sortKey, sortDir, onSort, className }: SortHeaderProps) {
  const active = colKey === sortKey;
  return (
    <th
      className={cn(
        "px-3 py-2.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:text-white/70 transition-colors",
        active && "text-white/80",
        className
      )}
      onClick={() => onSort(colKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          sortDir === "desc" ? (
            <ChevronDown className="w-3 h-3 opacity-80" />
          ) : (
            <ChevronUp className="w-3 h-3 opacity-80" />
          )
        ) : (
          <ChevronsUpDown className="w-3 h-3 opacity-30" />
        )}
      </span>
    </th>
  );
}

/* ------------------------------------------------------------------ */
/*  Stocks tab                                                          */
/* ------------------------------------------------------------------ */

type TableSortKey = "symbol" | "name" | "price" | "changePercent" | "volume" | "marketCap" | "pe" | "rating";

function StocksTab() {
  const [moverType, setMoverType] = useState<MoverType>("gainers");
  const [capSize, setCapSize] = useState<CapSize>("all");
  const [sortKey, setSortKey] = useState<TableSortKey>("changePercent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleMoverChange = (type: MoverType) => {
    setMoverType(type);
    const def = defaultSortFor[type];
    const mapped: TableSortKey =
      def.key === "volume" ? "volume"
      : def.key === "changePercent" ? "changePercent"
      : def.key === "price" ? "price"
      : def.key === "marketCap" ? "marketCap"
      : def.key === "pe" ? "pe"
      : "changePercent";
    setSortKey(mapped);
    setSortDir(def.dir);
  };

  const handleSort = (col: string) => {
    const k = col as TableSortKey;
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  const stocks = useMemo(() => {
    const raw = getStocksForCap(moverType, capSize).slice(0, 20);
    return [...raw].sort((a, b) => {
      let av: number;
      let bv: number;
      switch (sortKey) {
        case "symbol":
          return sortDir === "asc"
            ? a.symbol.localeCompare(b.symbol)
            : b.symbol.localeCompare(a.symbol);
        case "name":
          return sortDir === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case "rating":
          return sortDir === "asc"
            ? a.rating.localeCompare(b.rating)
            : b.rating.localeCompare(a.rating);
        case "price":       av = a.price; bv = b.price; break;
        case "changePercent": av = a.changePercent; bv = b.changePercent; break;
        case "volume":      av = sortValue(a, "volume"); bv = sortValue(b, "volume"); break;
        case "marketCap":   av = sortValue(a, "marketCap"); bv = sortValue(b, "marketCap"); break;
        case "pe":          av = a.pe ?? Infinity; bv = b.pe ?? Infinity; break;
        default:            av = 0; bv = 0;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [moverType, capSize, sortKey, sortDir]);

  const moverOptions = moverTabs.map((t) => ({ id: t.id, label: t.label }));
  const capOptions = capOrder.map((c) => ({ id: c, label: capLabels[c] }));

  return (
    <div className="space-y-4">
      <PillFilter options={moverOptions} active={moverType} onChange={handleMoverChange} />
      <PillFilter options={capOptions} active={capSize} onChange={setCapSize} />

      <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] bg-white/[0.03]">
              <SortHeader label="Symbol"    colKey="symbol"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4" />
              <SortHeader label="Name"      colKey="name"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Price"     colKey="price"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Change %"  colKey="changePercent" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Volume"    colKey="volume"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Mkt Cap"   colKey="marketCap"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="P/E"       colKey="pe"            sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Rating"    colKey="rating"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pr-4" />
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, i) => (
              <tr
                key={stock.symbol}
                className={cn(
                  "border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors",
                  i % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"
                )}
              >
                <td className="pl-4 pr-3 py-2.5">
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    className="font-semibold text-white hover:text-blue-400 transition-colors"
                  >
                    {stock.symbol}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-white/60 max-w-[180px] truncate">{stock.name}</td>
                <td className="px-3 py-2.5 text-white tabular-nums font-medium">${fmtPrice(stock.price)}</td>
                <td className="px-3 py-2.5 tabular-nums"><PctCell value={stock.changePercent} /></td>
                <td className="px-3 py-2.5 text-white/60 tabular-nums">{stock.volume}</td>
                <td className="px-3 py-2.5 text-white/60 tabular-nums">{stock.marketCap}</td>
                <td className="px-3 py-2.5 text-white/60 tabular-nums">
                  {stock.pe !== null ? stock.pe : <span className="text-white/30">—</span>}
                </td>
                <td className="px-3 pr-4 py-2.5"><RatingBadge rating={stock.rating} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ETFs tab                                                            */
/* ------------------------------------------------------------------ */

function ETFsTab() {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.07] bg-white/[0.03]">
            {["Symbol", "Name", "Category", "Price", "1D Change", "1Y Return", "AUM", "Exp. Ratio"].map(
              (h, i) => (
                <th
                  key={h}
                  className={cn(
                    "px-3 py-2.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wide whitespace-nowrap",
                    i === 0 && "pl-4",
                    i === 7 && "pr-4"
                  )}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {ETF_LIST.map((etf, i) => (
            <tr
              key={etf.symbol}
              className={cn(
                "border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors",
                i % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"
              )}
            >
              <td className="pl-4 pr-3 py-2.5">
                <Link
                  href={`/etf/${etf.symbol}`}
                  className="font-semibold text-white hover:text-blue-400 transition-colors"
                >
                  {etf.symbol}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-white/60 max-w-[200px] truncate">{etf.name}</td>
              <td className="px-3 py-2.5">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/[0.07] text-white/60 border border-white/10">
                  {etf.category}
                </span>
              </td>
              <td className="px-3 py-2.5 text-white tabular-nums font-medium">${fmtPrice(etf.price)}</td>
              <td className="px-3 py-2.5 tabular-nums"><PctCell value={etf.change1d} /></td>
              <td className="px-3 py-2.5 tabular-nums"><PctCell value={etf.return1y} /></td>
              <td className="px-3 py-2.5 text-white/60 tabular-nums">${etf.aum}</td>
              <td className="px-3 pr-4 py-2.5 text-white/60 tabular-nums">{etf.expenseRatio.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Indices tab                                                         */
/* ------------------------------------------------------------------ */

function IndicesTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {INDEX_LIST.map((idx) => {
        const up = idx.changePct >= 0;
        const ytdUp = idx.ytd >= 0;
        return (
          <Link
            key={idx.symbol}
            href={`/indices/${idx.symbol}`}
            className="group block rounded-xl border border-white/[0.07] bg-white/[0.03] p-5 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-0.5">
                  {idx.exchange}
                </div>
                <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {idx.name}
                </div>
              </div>
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  up ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                )}
              >
                {fmtPct(idx.changePct)}
              </span>
            </div>

            <div className="text-2xl font-bold text-white tabular-nums mb-1">
              {idx.level.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <div className={cn("text-sm tabular-nums mb-4", up ? "text-emerald-400" : "text-red-400")}>
              {up ? "+" : ""}
              {idx.change.toFixed(2)} today
            </div>

            <div className="flex items-center justify-between text-xs text-white/40">
              <div>
                YTD{" "}
                <span className={cn("font-semibold", ytdUp ? "text-emerald-400" : "text-red-400")}>
                  {fmtPct(idx.ytd)}
                </span>
              </div>
              {idx.constituents > 0 && (
                <div>{idx.constituents.toLocaleString()} constituents</div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

type MainTab = "stocks" | "etfs" | "indices";

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: "stocks", label: "Stocks" },
  { id: "etfs", label: "ETFs" },
  { id: "indices", label: "Indices" },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<MainTab>("stocks");

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white">
      <SiteNav />

      {/* Market summary bar */}
      <div className="w-full bg-[#18181b] border-b border-white/[0.07]">
        <div className="max-w-[1436px] mx-auto px-6 py-2.5 flex items-center gap-8 overflow-x-auto">
          {MARKET_INDICES.map((idx) => (
            <div key={idx.name} className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs text-white/50 font-medium">{idx.name}</span>
              <span className="text-xs text-white/30">·</span>
              <span className="text-xs text-white/80 tabular-nums font-medium">{idx.level}</span>
              <span className="text-xs text-white/30">·</span>
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  idx.up ? "text-emerald-400" : "text-red-400"
                )}
              >
                {idx.pct}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1436px] mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Explore Markets</h1>
          <p className="text-white/50 text-base">Discover US stocks, ETFs, and indices</p>
        </div>

        {/* Main tab bar */}
        <div className="flex items-end gap-0 border-b border-white/[0.07] mb-6">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-5 py-3 text-sm font-semibold transition-colors",
                activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "stocks" && <StocksTab />}
            {activeTab === "etfs" && <ETFsTab />}
            {activeTab === "indices" && <IndicesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
