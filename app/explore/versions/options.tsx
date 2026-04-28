"use client";

import { useState } from "react";
import { ArrowUpDown, Link2, LayoutGrid, TrendingUp, BarChart2, Layers, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ColDef {
  label: string;
  align?: "left" | "right";
  minWidth?: number;
}

const MARKET_CAPS = ["Mega Cap", "Large Cap", "Mid Cap", "Small Cap", "Micro Cap", "Nano Cap"] as const;
type MarketCap = (typeof MARKET_CAPS)[number];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FILTER_CHIPS = ["All", "Stocks", "Indices", "ETF", "Global ETF"] as const;
type FilterChip = (typeof FILTER_CHIPS)[number];
type AssetType = "Stock" | "Index" | "ETF" | "Global ETF";

/* ------------------------------------------------------------------ */
/*  Table primitive                                                    */
/* ------------------------------------------------------------------ */

function OptionsTable({ cols, rows, onRowClick }: { cols: ColDef[]; rows: React.ReactNode[][]; onRowClick?: (i: number) => void }) {
  if (rows.length === 0) {
    return <p className="px-5 py-5 text-[14px] text-muted-foreground text-center">No data for this filter.</p>;
  }
  const [first, ...rest] = cols;
  return (
    <div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-muted-foreground text-[12px] uppercase tracking-wider">
            <th className="text-left py-2.5 pl-5 pr-2 font-medium w-full">{first.label}</th>
            {rest.map((col, i) => (
              <th key={i} className={cn("py-2.5 px-2 font-medium whitespace-nowrap", col.align === "left" ? "text-left" : "text-right", i === rest.length - 1 && "pr-5")}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={cn("border-t border-border/30", onRowClick && "cursor-pointer active:bg-muted/40")} onClick={() => onRowClick?.(ri)}>
              <td className="py-3.5 pl-5 pr-2 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-[3px] h-8 rounded-full shrink-0 bg-neutral-800" />
                  {row[0]}
                </div>
              </td>
              {row.slice(1).map((cell, ci) => (
                <td key={ci} className={cn("py-3.5 px-2 whitespace-nowrap", (cols[ci + 1]?.align ?? "right") === "right" ? "text-right" : "text-left", ci === row.length - 2 && "pr-5")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared UI atoms                                                    */
/* ------------------------------------------------------------------ */

function fmtNum(raw: string): string {
  const n = +raw.replace(/[^0-9.]/g, "");
  if (isNaN(n)) return raw;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function PctBadge({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span className={cn("text-[14px] font-semibold tabular-nums", pos ? "text-gain" : "text-loss")}>
      {pos ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

function Cell({ top, bottom }: { top: string; bottom?: string }) {
  return (
    <div>
      <p className="text-[14px] font-semibold text-foreground leading-tight whitespace-nowrap">{top}</p>
      {bottom && <p className="text-[12px] text-muted-foreground leading-tight">{bottom}</p>}
    </div>
  );
}

function NumCell({ value }: { value: string }) {
  return <span className="text-[14px] tabular-nums text-foreground">{value}</span>;
}

function FlipperBtn({ cap, onCycle }: { cap: MarketCap; onCycle: () => void }) {
  return (
    <button onClick={onCycle} className="flex items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-1.5 text-[13px] font-semibold text-foreground active:opacity-70 transition-opacity whitespace-nowrap">
      {cap} <ArrowUpDown size={12} strokeWidth={2} />
    </button>
  );
}

function WidgetCard({ title, subtitle, cap, onCycle, children }: { title: string; subtitle?: string; cap?: MarketCap; onCycle?: () => void; children: React.ReactNode }) {
  return (
    <div className="mx-5 rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="px-5 pt-4 pb-1 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-bold text-foreground">{title}</p>
          {subtitle && <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>}
        </div>
        {cap && onCycle && <FlipperBtn cap={cap} onCycle={onCycle} />}
      </div>
      {children}
    </div>
  );
}

function TabRow<T extends string>({ tabs, active, onChange }: { tabs: readonly T[]; active: T; onChange: (t: T) => void }) {
  return (
    <div className="overflow-x-auto no-scrollbar px-5 pb-1 pt-3">
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => onChange(t)} className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold border transition-colors", active === t ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border/60")}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectorChips<T extends string>({ chips, active, onChange }: { chips: readonly T[]; active: T; onChange: (c: T) => void }) {
  return (
    <div className="overflow-x-auto no-scrollbar px-5 pb-1 pt-3">
      <div className="flex gap-2">
        {chips.map((chip) => (
          <button key={chip} onClick={() => onChange(chip)} className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold border transition-colors", active === chip ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border/60")}>
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter helper                                                      */
/* ------------------------------------------------------------------ */

function matchesFilter(assetType: AssetType, filter: FilterChip): boolean {
  if (filter === "All") return true;
  if (filter === "Stocks")     return assetType === "Stock";
  if (filter === "Indices")    return assetType === "Index";
  if (filter === "ETF")        return assetType === "ETF";
  if (filter === "Global ETF") return assetType === "Global ETF";
  return true;
}

function nextCap(cap: MarketCap): MarketCap {
  const idx = MARKET_CAPS.indexOf(cap);
  return MARKET_CAPS[(idx + 1) % MARKET_CAPS.length];
}

/* ------------------------------------------------------------------ */
/*  Data — Popular                                                     */
/* ------------------------------------------------------------------ */

const POPULAR_TABS = ["Daily Expiry", "Weekly", "Monthly", "Quarterly"] as const;
type PopularTab = (typeof POPULAR_TABS)[number];
type PopularRow = { assetType: AssetType; index: string; option: string; underlying: string; oi: string };

const POPULAR_DATA: Record<MarketCap, Record<PopularTab, PopularRow[]>> = {
  "Mega Cap": {
    "Daily Expiry": [
      { assetType: "Index",      index: "NDX", option: "Apr 20 18000 CALL", underlying: "17,995",    oi: "1.2M" },
      { assetType: "ETF",        index: "SPY",        option: "Apr 20 5200 PUT",   underlying: "5,195.25",  oi: "899K" },
      { assetType: "ETF",        index: "QQQ",        option: "Apr 20 420 CALL",   underlying: "419.80",    oi: "750K" },
      { assetType: "ETF",        index: "IWM",        option: "Apr 20 195 PUT",    underlying: "193.40",    oi: "620K" },
      { assetType: "Stock",      index: "NVDA",       option: "Apr 20 950 CALL",   underlying: "924.80",    oi: "540K" },
      { assetType: "Stock",      index: "AAPL",       option: "Apr 20 195 PUT",    underlying: "188.50",    oi: "410K" },
      { assetType: "Global ETF", index: "EFA",        option: "Apr 20 82 CALL",    underlying: "81.40",     oi: "180K" },
    ],
    Weekly: [
      { assetType: "ETF",        index: "SPY",        option: "Apr 26 5200 PUT",   underlying: "5,195.25",  oi: "1.1M" },
      { assetType: "ETF",        index: "QQQ",        option: "Apr 26 420 CALL",   underlying: "419.80",    oi: "890K" },
      { assetType: "Index",      index: "NDX", option: "Apr 26 18200 CALL", underlying: "18,190.10", oi: "760K" },
      { assetType: "Stock",      index: "MSFT",       option: "Apr 26 440 CALL",   underlying: "425.30",    oi: "480K" },
      { assetType: "Global ETF", index: "VEA",        option: "Apr 26 50 CALL",    underlying: "49.60",     oi: "140K" },
    ],
    Monthly: [
      { assetType: "ETF",        index: "SPY",        option: "May 17 5300 CALL",  underlying: "5,195.25",  oi: "2.1M" },
      { assetType: "ETF",        index: "QQQ",        option: "May 17 450 CALL",   underlying: "419.80",    oi: "1.8M" },
      { assetType: "Index",      index: "NDX", option: "May 17 19000 CALL", underlying: "18,190.10", oi: "1.4M" },
      { assetType: "Stock",      index: "AAPL",       option: "May 17 200 CALL",   underlying: "188.50",    oi: "980K" },
      { assetType: "Global ETF", index: "EFA",        option: "May 17 84 CALL",    underlying: "81.40",     oi: "220K" },
    ],
    Quarterly: [
      { assetType: "ETF",        index: "SPY",        option: "Jun 20 5500 CALL",  underlying: "5,195.25",  oi: "3.2M" },
      { assetType: "ETF",        index: "QQQ",        option: "Jun 20 480 CALL",   underlying: "419.80",    oi: "2.6M" },
      { assetType: "Stock",      index: "NVDA",       option: "Jun 20 1000 CALL",  underlying: "924.80",    oi: "1.5M" },
      { assetType: "Index",      index: "SPX",    option: "Jun 20 5600 CALL",  underlying: "5,195.25",  oi: "2.1M" },
      { assetType: "Global ETF", index: "EFA",        option: "Jun 20 86 CALL",    underlying: "81.40",     oi: "310K" },
    ],
  },
  "Large Cap": {
    "Daily Expiry": [
      { assetType: "Stock",      index: "JPM",   option: "Apr 20 200 CALL",  underlying: "198.40",  oi: "480K" },
      { assetType: "Stock",      index: "GS",    option: "Apr 20 450 PUT",   underlying: "447.20",  oi: "360K" },
      { assetType: "ETF",        index: "XLF",        option: "Apr 20 42 CALL",   underlying: "41.80",   oi: "290K" },
      { assetType: "Index",      index: "RUI",option: "Apr 20 2400 CALL",underlying: "2,390.10",oi: "210K" },
      { assetType: "Global ETF", index: "EWJ",        option: "Apr 20 68 CALL",   underlying: "67.40",   oi: "140K" },
    ],
    Weekly: [
      { assetType: "Stock",      index: "JPM",   option: "Apr 26 205 CALL",  underlying: "198.40",  oi: "510K" },
      { assetType: "ETF",        index: "XLF",        option: "Apr 26 43 CALL",   underlying: "41.80",   oi: "320K" },
      { assetType: "Stock",      index: "V",       option: "Apr 26 280 CALL",  underlying: "278.90",  oi: "310K" },
      { assetType: "Global ETF", index: "EWJ",        option: "Apr 26 69 CALL",   underlying: "67.40",   oi: "160K" },
    ],
    Monthly: [
      { assetType: "Stock",      index: "JPM",   option: "May 17 210 CALL",  underlying: "198.40",  oi: "680K" },
      { assetType: "ETF",        index: "XLF",        option: "May 17 44 CALL",   underlying: "41.80",   oi: "420K" },
      { assetType: "Index",      index: "RUI",option: "May 17 2450 CALL",underlying: "2,390.10",oi: "280K" },
    ],
    Quarterly: [
      { assetType: "Stock",      index: "JPM",   option: "Jun 20 220 CALL",  underlying: "198.40",  oi: "820K" },
      { assetType: "ETF",        index: "XLF",        option: "Jun 20 46 CALL",   underlying: "41.80",   oi: "510K" },
      { assetType: "Global ETF", index: "EWJ",        option: "Jun 20 72 CALL",   underlying: "67.40",   oi: "210K" },
    ],
  },
  "Mid Cap": {
    "Daily Expiry": [
      { assetType: "Stock",  index: "ZBRA",  option: "Apr 20 310 CALL",  underlying: "308.50",  oi: "125K" },
      { assetType: "ETF",    index: "MDY",         option: "Apr 20 580 CALL",  underlying: "578.20",  oi: "98K"  },
      { assetType: "Stock",  index: "SAIA",    option: "Apr 20 440 CALL",  underlying: "438.80",  oi: "82K"  },
      { assetType: "Index",  index: "MID",     option: "Apr 20 2800 CALL", underlying: "2,790.40",oi: "74K"  },
    ],
    Weekly: [
      { assetType: "Stock",  index: "ZBRA",  option: "Apr 26 315 CALL",  underlying: "308.50",  oi: "140K" },
      { assetType: "ETF",    index: "MDY",         option: "Apr 26 585 CALL",  underlying: "578.20",  oi: "112K" },
      { assetType: "Stock",  index: "TECH",   option: "Apr 26 64 CALL",   underlying: "61.40",   oi: "88K"  },
    ],
    Monthly: [
      { assetType: "Stock",  index: "ZBRA",  option: "May 17 320 CALL",  underlying: "308.50",  oi: "180K" },
      { assetType: "ETF",    index: "MDY",         option: "May 17 592 CALL",  underlying: "578.20",  oi: "148K" },
      { assetType: "Index",  index: "MID",     option: "May 17 2850 CALL", underlying: "2,790.40",oi: "96K"  },
    ],
    Quarterly: [
      { assetType: "Stock",  index: "ZBRA",  option: "Jun 20 330 CALL",  underlying: "308.50",  oi: "220K" },
      { assetType: "ETF",    index: "MDY",         option: "Jun 20 600 CALL",  underlying: "578.20",  oi: "180K" },
    ],
  },
  "Small Cap": {
    "Daily Expiry": [
      { assetType: "ETF",    index: "IWM",         option: "Apr 20 195 CALL",  underlying: "193.80",  oi: "310K" },
      { assetType: "ETF",    index: "SLY",         option: "Apr 20 82 PUT",    underlying: "81.40",   oi: "94K"  },
      { assetType: "Stock",  index: "SMTC",        option: "Apr 20 44 CALL",   underlying: "42.80",   oi: "38K"  },
      { assetType: "Index",  index: "RUT",option: "Apr 20 1980 CALL", underlying: "1,974.20",oi: "68K"  },
    ],
    Weekly: [
      { assetType: "ETF",    index: "IWM",         option: "Apr 26 197 CALL",  underlying: "193.80",  oi: "340K" },
      { assetType: "Stock",  index: "SMTC",        option: "Apr 26 46 CALL",   underlying: "42.80",   oi: "42K"  },
      { assetType: "Index",  index: "RUT",option: "Apr 26 1990 CALL", underlying: "1,974.20",oi: "82K"  },
    ],
    Monthly: [
      { assetType: "ETF",    index: "IWM",         option: "May 17 200 CALL",  underlying: "193.80",  oi: "480K" },
      { assetType: "ETF",    index: "SLY",         option: "May 17 85 CALL",   underlying: "81.40",   oi: "145K" },
      { assetType: "Stock",  index: "RLAY",        option: "May 17 20 CALL",   underlying: "18.40",   oi: "28K"  },
    ],
    Quarterly: [
      { assetType: "ETF",    index: "IWM",         option: "Jun 20 205 CALL",  underlying: "193.80",  oi: "560K" },
      { assetType: "Index",  index: "RUT",option: "Jun 20 2020 CALL", underlying: "1,974.20",oi: "120K" },
    ],
  },
  "Micro Cap": {
    "Daily Expiry": [
      { assetType: "ETF",    index: "IWC",         option: "Apr 20 36 CALL",   underlying: "35.60",   oi: "28K"  },
      { assetType: "Stock",  index: "TPHS",        option: "Apr 20 8 CALL",    underlying: "7.80",    oi: "8K"   },
      { assetType: "ETF",    index: "DWMC",        option: "Apr 20 18 PUT",    underlying: "17.80",   oi: "14K"  },
    ],
    Weekly: [
      { assetType: "ETF",    index: "IWC",         option: "Apr 26 37 CALL",   underlying: "35.60",   oi: "32K"  },
      { assetType: "Stock",  index: "RNLX",        option: "Apr 26 5 CALL",    underlying: "4.90",    oi: "6K"   },
    ],
    Monthly: [
      { assetType: "ETF",    index: "IWC",         option: "May 17 38 CALL",   underlying: "35.60",   oi: "45K"  },
      { assetType: "Stock",  index: "BFST",        option: "May 17 12 CALL",   underlying: "11.80",   oi: "10K"  },
    ],
    Quarterly: [
      { assetType: "ETF",    index: "IWC",         option: "Jun 20 40 CALL",   underlying: "35.60",   oi: "58K"  },
    ],
  },
  "Nano Cap": {
    "Daily Expiry": [
      { assetType: "Stock",  index: "HNNA",        option: "Apr 20 14 CALL",   underlying: "13.80",   oi: "4.2K" },
      { assetType: "Stock",  index: "MCVT",        option: "Apr 20 6 PUT",     underlying: "5.90",    oi: "2.8K" },
    ],
    Weekly: [
      { assetType: "Stock",  index: "HNNA",        option: "Apr 26 15 CALL",   underlying: "13.80",   oi: "5.1K" },
      { assetType: "Stock",  index: "MCVT",        option: "Apr 26 7 CALL",    underlying: "5.90",    oi: "3.2K" },
    ],
    Monthly: [
      { assetType: "Stock",  index: "HNNA",        option: "May 17 16 CALL",   underlying: "13.80",   oi: "6.8K" },
    ],
    Quarterly: [
      { assetType: "Stock",  index: "HNNA",        option: "Jun 20 18 CALL",   underlying: "13.80",   oi: "8.4K" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Data — Under $10                                                   */
/* ------------------------------------------------------------------ */

type Under10Row = { assetType: AssetType; index: string; strike: string; price: string; change: number };
const UNDER_10_DATA: Record<MarketCap, Under10Row[]> = {
  "Mega Cap": [
    { assetType: "Stock",      index: "TSLA",  strike: "Apr 19 200 CALL", price: "$6.80", change:  12.4 },
    { assetType: "Stock",      index: "AAPL",  strike: "Apr 19 230 CALL", price: "$4.85", change:  17.4 },
    { assetType: "ETF",        index: "SPY",   strike: "Apr 19 5300 CALL",price: "$8.20", change:   6.8 },
    { assetType: "Index",      index: "NDX",   strike: "Apr 19 18500 CALL",price: "$7.60",change:   9.2 },
    { assetType: "Global ETF", index: "EFA",   strike: "Apr 19 84 CALL",  price: "$2.40", change:   4.1 },
    { assetType: "Stock",      index: "AMD",   strike: "Apr 18 180 CALL", price: "$3.20", change:   9.6 },
  ],
  "Large Cap": [
    { assetType: "Stock",      index: "JPM",   strike: "Apr 19 210 CALL", price: "$7.40", change:   8.2 },
    { assetType: "Stock",      index: "DIS",   strike: "Apr 19 120 CALL", price: "$5.10", change:  11.8 },
    { assetType: "ETF",        index: "XLF",   strike: "Apr 19 44 CALL",  price: "$6.90", change:   5.4 },
    { assetType: "ETF",        index: "XLY",   strike: "Apr 19 190 PUT",  price: "$4.30", change:  -8.2 },
    { assetType: "Global ETF", index: "EWJ",   strike: "Apr 19 70 CALL",  price: "$3.10", change:   6.4 },
    { assetType: "Index",      index: "R1000", strike: "Apr 19 2450 CALL",price: "$9.80", change:   7.6 },
  ],
  "Mid Cap": [
    { assetType: "Stock",      index: "CDAY",  strike: "Apr 19 72 CALL",  price: "$8.20", change:  14.3 },
    { assetType: "Stock",      index: "SAIA",  strike: "Apr 19 450 PUT",  price: "$6.50", change:  -9.8 },
    { assetType: "ETF",        index: "MDY",   strike: "Apr 19 590 CALL", price: "$7.80", change:   4.2 },
    { assetType: "Index",      index: "MID",strike: "Apr 19 2820 CALL",price:"$9.40", change:   8.6 },
    { assetType: "Stock",      index: "ITRI",  strike: "Apr 18 88 CALL",  price: "$4.15", change:  16.2 },
  ],
  "Small Cap": [
    { assetType: "Stock",      index: "SMTC",  strike: "Apr 19 42 CALL",  price: "$7.90", change:  22.1 },
    { assetType: "ETF",        index: "IWM",   strike: "Apr 19 198 CALL", price: "$6.40", change:   8.6 },
    { assetType: "Stock",      index: "RLAY",  strike: "Apr 19 18 CALL",  price: "$5.30", change:  31.4 },
    { assetType: "Index",      index: "R2000", strike: "Apr 19 1990 CALL",price: "$8.70", change:  10.2 },
    { assetType: "Stock",      index: "FWRD",  strike: "Apr 18 28 PUT",   price: "$3.70", change: -14.2 },
  ],
  "Micro Cap": [
    { assetType: "Stock",      index: "TPHS",  strike: "Apr 19 8 CALL",   price: "$1.40", change:  44.2 },
    { assetType: "ETF",        index: "IWC",   strike: "Apr 19 37 CALL",  price: "$2.80", change:  18.6 },
    { assetType: "Stock",      index: "RNLX",  strike: "Apr 19 5 CALL",   price: "$0.80", change:  62.5 },
    { assetType: "Stock",      index: "BFST",  strike: "Apr 18 12 CALL",  price: "$2.10", change:  28.6 },
  ],
  "Nano Cap": [
    { assetType: "Stock",      index: "MITI",  strike: "Apr 19 3 CALL",   price: "$0.40", change:  88.9 },
    { assetType: "Stock",      index: "CNET",  strike: "Apr 19 2 CALL",   price: "$0.25", change: 120.0 },
  ],
};

/* ------------------------------------------------------------------ */
/*  Data — Sectorial                                                   */
/* ------------------------------------------------------------------ */

const SECTOR_CHIPS = ["FinTech", "Clean Energy", "Biotech", "EV", "Automobile"] as const;
type SectorChip = (typeof SECTOR_CHIPS)[number];
type SectorRow = { assetType: AssetType; index: string; option: string; oi: string; vol: string };

const SECTORIAL_DATA: Record<MarketCap, Record<SectorChip, SectorRow[]>> = {
  "Mega Cap": {
    FinTech: [
      { assetType: "ETF",        index: "VFH",   option: "Apr 20 96 CALL",   oi: "15,894", vol: "3,180" },
      { assetType: "Stock",      index: "V",     option: "Apr 20 285 CALL",  oi: "8,420",  vol: "1,684" },
      { assetType: "Global ETF", index: "IXG",   option: "Apr 20 22 CALL",   oi: "4,210",  vol: "842"   },
      { assetType: "Stock",      index: "MA",    option: "Apr 20 490 CALL",  oi: "6,180",  vol: "1,236" },
      { assetType: "ETF",        index: "XLF",   option: "Apr 20 42 CALL",   oi: "12,400", vol: "2,480" },
    ],
    "Clean Energy": [
      { assetType: "ETF",        index: "ICLN",  option: "Apr 20 18 CALL",   oi: "42,300", vol: "8,460" },
      { assetType: "ETF",        index: "TAN",   option: "Apr 20 65 PUT",    oi: "28,440", vol: "5,688" },
      { assetType: "Global ETF", index: "INRG",  option: "Apr 20 14 CALL",   oi: "9,800",  vol: "1,960" },
      { assetType: "Stock",      index: "NEE",   option: "Apr 20 80 CALL",   oi: "18,400", vol: "3,680" },
    ],
    Biotech: [
      { assetType: "ETF",        index: "IBB",   option: "Apr 20 130 CALL",  oi: "38,200", vol: "7,640" },
      { assetType: "Stock",      index: "REGN",  option: "Apr 20 800 CALL",  oi: "5,600",  vol: "1,120" },
      { assetType: "ETF",        index: "XBI",   option: "Apr 20 90 PUT",    oi: "24,900", vol: "4,980" },
      { assetType: "Global ETF", index: "IXJ",   option: "Apr 20 48 CALL",   oi: "6,200",  vol: "1,240" },
    ],
    EV: [
      { assetType: "Stock",      index: "TSLA",  option: "Apr 20 200 CALL",  oi: "48,600", vol: "9,720" },
      { assetType: "ETF",        index: "DRIV",  option: "Apr 20 28 CALL",   oi: "52,400", vol: "10,480"},
      { assetType: "Global ETF", index: "IDRV",  option: "Apr 20 34 PUT",    oi: "31,200", vol: "6,240" },
      { assetType: "Stock",      index: "RIVN",  option: "Apr 20 14 CALL",   oi: "22,400", vol: "4,480" },
    ],
    Automobile: [
      { assetType: "ETF",        index: "CARZ",  option: "Apr 20 72 CALL",   oi: "29,800", vol: "5,960" },
      { assetType: "Stock",      index: "F",     option: "Apr 20 12 CALL",   oi: "38,400", vol: "7,680" },
      { assetType: "Global ETF", index: "IYT",   option: "Apr 20 56 PUT",    oi: "22,400", vol: "4,480" },
      { assetType: "Stock",      index: "GM",    option: "Apr 20 46 CALL",   oi: "24,800", vol: "4,960" },
    ],
  },
  "Large Cap": {
    FinTech: [
      { assetType: "Stock",      index: "JPM",   option: "Apr 20 205 CALL", oi: "9,840",  vol: "1,968" },
      { assetType: "ETF",        index: "XLF",   option: "Apr 20 43 CALL",  oi: "14,200", vol: "2,840" },
      { assetType: "Stock",      index: "PYPL",  option: "Apr 20 72 CALL",  oi: "12,300", vol: "2,460" },
      { assetType: "Global ETF", index: "EWJ",   option: "Apr 20 69 CALL",  oi: "5,400",  vol: "1,080" },
    ],
    "Clean Energy": [
      { assetType: "Stock",      index: "NEE",   option: "Apr 20 82 CALL",  oi: "18,400", vol: "3,680" },
      { assetType: "ETF",        index: "ICLN",  option: "Apr 20 18 PUT",   oi: "24,200", vol: "4,840" },
      { assetType: "Global ETF", index: "INRG",  option: "Apr 20 14 CALL",  oi: "8,600",  vol: "1,720" },
    ],
    Biotech: [
      { assetType: "Stock",      index: "REGN",  option: "Apr 20 800 CALL", oi: "5,600",  vol: "1,120" },
      { assetType: "ETF",        index: "IBB",   option: "Apr 20 138 CALL", oi: "22,400", vol: "4,480" },
      { assetType: "Stock",      index: "BIIB",  option: "Apr 20 260 PUT",  oi: "4,200",  vol: "840"   },
    ],
    EV: [
      { assetType: "Stock",      index: "TSLA",  option: "Apr 20 200 CALL", oi: "48,600", vol: "9,720" },
      { assetType: "ETF",        index: "KARS",  option: "Apr 20 26 CALL",  oi: "18,400", vol: "3,680" },
      { assetType: "Stock",      index: "RIVN",  option: "Apr 20 14 CALL",  oi: "22,400", vol: "4,480" },
    ],
    Automobile: [
      { assetType: "Stock",      index: "F",     option: "Apr 20 12 CALL",  oi: "38,400", vol: "7,680" },
      { assetType: "ETF",        index: "CARZ",  option: "Apr 20 38 CALL",  oi: "12,600", vol: "2,520" },
      { assetType: "Stock",      index: "GM",    option: "Apr 20 46 CALL",  oi: "24,800", vol: "4,960" },
    ],
  },
  "Mid Cap": {
    FinTech:        [
      { assetType: "Stock",      index: "GDOT",  option: "Apr 20 26 CALL",  oi: "3,820",  vol: "764"  },
      { assetType: "ETF",        index: "FINX",  option: "Apr 20 32 CALL",  oi: "5,640",  vol: "1,128"},
      { assetType: "Stock",      index: "RPAY",  option: "Apr 20 14 PUT",   oi: "2,440",  vol: "488"  },
    ],
    "Clean Energy": [
      { assetType: "Stock",      index: "RUN",   option: "Apr 20 18 CALL",  oi: "9,600",  vol: "1,920"},
      { assetType: "ETF",        index: "TAN",   option: "Apr 20 32 CALL",  oi: "14,200", vol: "2,840"},
      { assetType: "Stock",      index: "SPWR",  option: "Apr 20 8 PUT",    oi: "6,200",  vol: "1,240"},
    ],
    Biotech:        [
      { assetType: "Stock",      index: "HALO",  option: "Apr 20 52 CALL",  oi: "4,800",  vol: "960"  },
      { assetType: "ETF",        index: "XBI",   option: "Apr 20 94 CALL",  oi: "18,400", vol: "3,680"},
    ],
    EV:             [
      { assetType: "Stock",      index: "LAZR",  option: "Apr 20 6 CALL",   oi: "14,200", vol: "2,840"},
      { assetType: "ETF",        index: "DRIV",  option: "Apr 20 18 CALL",  oi: "8,400",  vol: "1,680"},
    ],
    Automobile:     [
      { assetType: "Stock",      index: "MOD",   option: "Apr 20 82 CALL",  oi: "2,600",  vol: "520"  },
      { assetType: "ETF",        index: "CARZ",  option: "Apr 20 38 PUT",   oi: "4,800",  vol: "960"  },
    ],
  },
  "Small Cap": {
    FinTech:        [
      { assetType: "Stock",      index: "PAYS",  option: "Apr 20 4 CALL",   oi: "1,240",  vol: "248"  },
      { assetType: "ETF",        index: "FINX",  option: "Apr 20 32 PUT",   oi: "2,840",  vol: "568"  },
    ],
    "Clean Energy": [
      { assetType: "Stock",      index: "AMPS",  option: "Apr 20 8 CALL",   oi: "4,200",  vol: "840"  },
      { assetType: "ETF",        index: "TAN",   option: "Apr 20 32 PUT",   oi: "6,400",  vol: "1,280"},
    ],
    Biotech:        [
      { assetType: "Stock",      index: "INBX",  option: "Apr 20 22 CALL",  oi: "3,600",  vol: "720"  },
      { assetType: "ETF",        index: "XBI",   option: "Apr 20 94 PUT",   oi: "8,200",  vol: "1,640"},
    ],
    EV:             [
      { assetType: "Stock",      index: "IDEA",  option: "Apr 20 2 CALL",   oi: "8,200",  vol: "1,640"},
      { assetType: "ETF",        index: "KARS",  option: "Apr 20 26 PUT",   oi: "4,600",  vol: "920"  },
    ],
    Automobile:     [
      { assetType: "Stock",      index: "MCRR",  option: "Apr 20 18 CALL",  oi: "1,400",  vol: "280"  },
      { assetType: "ETF",        index: "CARZ",  option: "Apr 20 38 CALL",  oi: "2,800",  vol: "560"  },
    ],
  },
  "Micro Cap": {
    FinTech:        [{ assetType: "Stock",  index: "PRTH",  option: "Apr 20 8 CALL",  oi: "320",  vol: "64"  }],
    "Clean Energy": [{ assetType: "Stock",  index: "AMPE",  option: "Apr 20 2 CALL",  oi: "840",  vol: "168" }],
    Biotech:        [{ assetType: "Stock",  index: "MOTS",  option: "Apr 20 4 CALL",  oi: "520",  vol: "104" }],
    EV:             [{ assetType: "ETF",    index: "EVGO",  option: "Apr 20 6 CALL",  oi: "1,200",vol: "240" }],
    Automobile:     [{ assetType: "Stock",  index: "RIDE",  option: "Apr 20 1 CALL",  oi: "2,400",vol: "480" }],
  },
  "Nano Cap": {
    FinTech:        [{ assetType: "Stock",  index: "MFIN",  option: "Apr 20 3 CALL",  oi: "120",  vol: "24"  }],
    "Clean Energy": [{ assetType: "Stock",  index: "SNPX",  option: "Apr 20 2 CALL",  oi: "280",  vol: "56"  }],
    Biotech:        [{ assetType: "Stock",  index: "RNAZ",  option: "Apr 20 2 CALL",  oi: "190",  vol: "38"  }],
    EV:             [{ assetType: "Stock",  index: "SOLO",  option: "Apr 20 1 CALL",  oi: "640",  vol: "128" }],
    Automobile:     [{ assetType: "Stock",  index: "WKHS",  option: "Apr 20 2 CALL",  oi: "480",  vol: "96"  }],
  },
};

/* ------------------------------------------------------------------ */
/*  Data — In Focus                                                    */
/* ------------------------------------------------------------------ */

const FOCUS_TABS = ["Top Gainer", "Top Loser", "High OI", "High Change in OI"] as const;
type FocusTab = (typeof FOCUS_TABS)[number];
type FocusRow = { assetType: AssetType; ticker: string; contract: string; openInt: string };

const IN_FOCUS_DATA: Record<MarketCap, Record<FocusTab, FocusRow[]>> = {
  "Mega Cap": {
    "Top Gainer": [
      { assetType: "Stock",      ticker: "NVDA",  contract: "Apr 20 950 CALL",  openInt: "1,840,230" },
      { assetType: "ETF",        ticker: "QQQ",   contract: "Apr 20 440 CALL",  openInt: "3,640,800" },
      { assetType: "Stock",      ticker: "META",  contract: "Apr 20 520 CALL",  openInt: "1,240,500" },
      { assetType: "Index",      ticker: "NDX",   contract: "Apr 20 18500 CALL",openInt: "2,100,400" },
      { assetType: "Global ETF", ticker: "EFA",   contract: "Apr 20 84 CALL",   openInt: "420,600"   },
    ],
    "Top Loser": [
      { assetType: "Stock",      ticker: "TSLA",  contract: "Apr 20 180 PUT",   openInt: "1,920,100" },
      { assetType: "ETF",        ticker: "SPY",   contract: "Apr 20 5100 PUT",  openInt: "2,810,400" },
      { assetType: "Stock",      ticker: "AMZN",  contract: "Apr 20 175 PUT",   openInt: "1,480,300" },
      { assetType: "Index",      ticker: "SPX",   contract: "Apr 20 5100 PUT",  openInt: "3,240,600" },
      { assetType: "Global ETF", ticker: "EEM",   contract: "Apr 20 40 PUT",    openInt: "680,200"   },
    ],
    "High OI": [
      { assetType: "ETF",        ticker: "SPY",   contract: "Apr 20 5200 PUT",  openInt: "4,820,100" },
      { assetType: "ETF",        ticker: "QQQ",   contract: "Apr 20 420 CALL",  openInt: "3,640,800" },
      { assetType: "Stock",      ticker: "TSLA",  contract: "Apr 20 200 CALL",  openInt: "2,480,300" },
      { assetType: "Index",      ticker: "SPX",   contract: "Apr 20 5200 CALL", openInt: "5,820,100" },
      { assetType: "Global ETF", ticker: "EFA",   contract: "Apr 20 82 CALL",   openInt: "520,400"   },
    ],
    "High Change in OI": [
      { assetType: "Stock",      ticker: "AMD",   contract: "Apr 20 170 CALL",  openInt: "1,420,800" },
      { assetType: "ETF",        ticker: "IWM",   contract: "Apr 20 198 CALL",  openInt: "980,400"   },
      { assetType: "Stock",      ticker: "MSFT",  contract: "Apr 20 420 CALL",  openInt: "1,630,800" },
      { assetType: "Index",      ticker: "NDX",   contract: "Apr 20 18200 CALL",openInt: "1,240,600" },
      { assetType: "Global ETF", ticker: "EEM",   contract: "Apr 20 42 CALL",   openInt: "360,200"   },
    ],
  },
  "Large Cap": {
    "Top Gainer": [
      { assetType: "Stock",      ticker: "JPM",   contract: "Apr 20 205 CALL",  openInt: "482,400"  },
      { assetType: "ETF",        ticker: "XLF",   contract: "Apr 20 43 CALL",   openInt: "640,800"  },
      { assetType: "Stock",      ticker: "DIS",   contract: "Apr 20 118 CALL",  openInt: "364,800"  },
      { assetType: "Global ETF", ticker: "EWJ",   contract: "Apr 20 70 CALL",   openInt: "210,400"  },
    ],
    "Top Loser": [
      { assetType: "Stock",      ticker: "GS",    contract: "Apr 20 440 PUT",   openInt: "312,000"  },
      { assetType: "ETF",        ticker: "XLE",   contract: "Apr 20 88 PUT",    openInt: "428,600"  },
      { assetType: "Stock",      ticker: "SBUX",  contract: "Apr 20 96 PUT",    openInt: "218,400"  },
    ],
    "High OI": [
      { assetType: "Stock",      ticker: "JPM",   contract: "Apr 20 200 CALL",  openInt: "842,100"  },
      { assetType: "ETF",        ticker: "XLF",   contract: "Apr 20 42 CALL",   openInt: "960,400"  },
      { assetType: "Stock",      ticker: "BAC",   contract: "Apr 20 38 CALL",   openInt: "624,500"  },
      { assetType: "Global ETF", ticker: "EWJ",   contract: "Apr 20 68 CALL",   openInt: "280,200"  },
    ],
    "High Change in OI": [
      { assetType: "Stock",      ticker: "DIS",   contract: "Apr 20 115 CALL",  openInt: "390,800"  },
      { assetType: "ETF",        ticker: "XLY",   contract: "Apr 20 188 CALL",  openInt: "480,600"  },
      { assetType: "Stock",      ticker: "NKE",   contract: "Apr 20 95 CALL",   openInt: "284,600"  },
    ],
  },
  "Mid Cap": {
    "Top Gainer":        [
      { assetType: "Stock",  ticker: "CDAY",  contract: "Apr 20 74 CALL",  openInt: "42,400" },
      { assetType: "ETF",    ticker: "MDY",   contract: "Apr 20 585 CALL", openInt: "68,200" },
      { assetType: "Stock",  ticker: "ITRI",  contract: "Apr 20 90 CALL",  openInt: "28,600" },
    ],
    "Top Loser":         [
      { assetType: "Stock",  ticker: "SAIA",  contract: "Apr 20 430 PUT",  openInt: "18,200" },
      { assetType: "ETF",    ticker: "IJH",   contract: "Apr 20 58 PUT",   openInt: "42,400" },
    ],
    "High OI":           [
      { assetType: "ETF",    ticker: "MDY",   contract: "Apr 20 580 CALL", openInt: "98,400" },
      { assetType: "Stock",  ticker: "AMBA",  contract: "Apr 20 68 CALL",  openInt: "76,200" },
    ],
    "High Change in OI": [
      { assetType: "Stock",  ticker: "ITRI",  contract: "Apr 20 88 CALL",  openInt: "54,800" },
      { assetType: "ETF",    ticker: "IJH",   contract: "Apr 20 58 CALL",  openInt: "72,600" },
    ],
  },
  "Small Cap": {
    "Top Gainer":        [
      { assetType: "Stock",  ticker: "SMTC",  contract: "Apr 20 44 CALL",  openInt: "8,400"  },
      { assetType: "ETF",    ticker: "IWM",   contract: "Apr 20 197 CALL", openInt: "310,200"},
    ],
    "Top Loser":         [
      { assetType: "Stock",  ticker: "FWRD",  contract: "Apr 20 26 PUT",   openInt: "4,800"  },
      { assetType: "ETF",    ticker: "IWM",   contract: "Apr 20 190 PUT",  openInt: "280,400"},
    ],
    "High OI":           [
      { assetType: "ETF",    ticker: "IWM",   contract: "Apr 20 195 CALL", openInt: "310,200"},
      { assetType: "Index",  ticker: "R2000", contract: "Apr 20 1980 CALL",openInt: "180,400"},
    ],
    "High Change in OI": [
      { assetType: "Stock",  ticker: "SMTC",  contract: "Apr 20 42 CALL",  openInt: "12,400" },
      { assetType: "ETF",    ticker: "SLY",   contract: "Apr 20 83 CALL",  openInt: "28,600" },
    ],
  },
  "Micro Cap": {
    "Top Gainer":        [{ assetType: "Stock", ticker: "TPHS", contract: "Apr 20 8 CALL",  openInt: "1,240" }],
    "Top Loser":         [{ assetType: "Stock", ticker: "RNLX", contract: "Apr 20 4 PUT",   openInt: "840"   }],
    "High OI":           [{ assetType: "ETF",   ticker: "IWC",  contract: "Apr 20 36 CALL", openInt: "28,400"}],
    "High Change in OI": [{ assetType: "ETF",   ticker: "DWMC", contract: "Apr 20 18 CALL", openInt: "14,200"}],
  },
  "Nano Cap": {
    "Top Gainer":        [{ assetType: "Stock", ticker: "MITI", contract: "Apr 20 3 CALL",  openInt: "420"   }],
    "Top Loser":         [{ assetType: "Stock", ticker: "CNET", contract: "Apr 20 2 PUT",   openInt: "280"   }],
    "High OI":           [{ assetType: "Stock", ticker: "HNNA", contract: "Apr 20 14 CALL", openInt: "4,200" }],
    "High Change in OI": [{ assetType: "Stock", ticker: "MCVT", contract: "Apr 20 6 CALL",  openInt: "2,800" }],
  },
};

/* ------------------------------------------------------------------ */
/*  Static — Top Chains                                                */
/* ------------------------------------------------------------------ */

const TOP_CHAINS: { symbol: string; ticker: string; price: number; change: number; assetType: AssetType }[] = [
  { symbol: "S&P 500",         ticker: "SPX",  price: 5_195.25, change:  1.1, assetType: "Index"      },
  { symbol: "NASDAQ 100",      ticker: "NDX",  price: 18_190.1, change:  1.8, assetType: "Index"      },
  { symbol: "SPDR S&P 500",    ticker: "SPY",  price:   519.52, change:  1.1, assetType: "ETF"        },
  { symbol: "iShares MSCI ACWI ETF", ticker: "ACWI", price: 102.30, change: 0.9, assetType: "Global ETF" },
  { symbol: "NVIDIA",          ticker: "NVDA", price:   924.80, change:  3.2, assetType: "Stock"      },
  { symbol: "Apple",           ticker: "AAPL", price:   188.50, change:  2.9, assetType: "Stock"      },
];

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export function ExploreOptions() {
  const router = useRouter();
  const [filter, setFilter]         = useState<FilterChip>("All");
  const [popularTab, setPopularTab] = useState<PopularTab>("Daily Expiry");
  const [sector, setSector]         = useState<SectorChip>("FinTech");
  const [focusTab, setFocusTab]     = useState<FocusTab>("Top Gainer");

  const [popularCap, setPopularCap] = useState<MarketCap>("Mega Cap");
  const [under10Cap, setUnder10Cap] = useState<MarketCap>("Mega Cap");
  const [sectorCap,  setSectorCap]  = useState<MarketCap>("Mega Cap");
  const [focusCap,   setFocusCap]   = useState<MarketCap>("Mega Cap");

  // Filtered rows
  const popularRows  = POPULAR_DATA[popularCap][popularTab].filter(r => matchesFilter(r.assetType, filter));
  const under10Rows  = UNDER_10_DATA[under10Cap].filter(r => matchesFilter(r.assetType, filter));
  const sectorialRows= SECTORIAL_DATA[sectorCap][sector].filter(r => matchesFilter(r.assetType, filter));
  const focusRows    = IN_FOCUS_DATA[focusCap][focusTab].filter(r => matchesFilter(r.assetType, filter));

  return (
    <div className="space-y-5 pb-8">

      {/* ── Learn Options Banner ── */}
      <div className="mx-5 mt-5 rounded-2xl bg-[#1C1C1E] overflow-hidden">
        {/* Hero: copy with ghost diagram behind */}
        <div className="relative overflow-hidden">
          {/* Ghost payoff diagram — very faint, purely atmospheric */}
          <svg viewBox="0 0 335 140" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-[0.6]">
            <polygon points="0,0 142,118 0,118" fill="#F87171" />
            <polygon points="193,118 335,0 335,118" fill="#4ADE80" />
            <polyline points="0,0 142,118 335,118" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="0,118 193,118 335,0" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="168" cy="118" r="4" fill="white" fillOpacity="0.6" />
          </svg>

          {/* Heavy veil so diagram reads as background texture only */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1C1C1E 55%, rgba(28,28,30,0.7) 100%)" }} />

          {/* Copy */}
          <div className="relative px-5 pt-5 pb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900/25 mb-2">Options 101</p>
            <p className="text-[22px] font-bold text-gray-900 leading-snug">Learn to trade<br />options in 3 mins</p>
            <p className="text-[13px] text-gray-400 mt-2 leading-snug">Step-by-step lessons built<br />for US markets.</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-white/8" />

        {/* CTA rows */}
        <div className="flex flex-col divide-y divide-white/[0.06]">
          <button className="flex items-center justify-between px-5 py-4 active:opacity-60 transition-opacity">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/[0.05] flex items-center justify-center text-[16px]">🌱</div>
              <div className="text-left">
                <p className="text-[14px] font-semibold text-gray-900">New to options</p>
                <p className="text-[12px] text-gray-400">Start from absolute basics</p>
              </div>
            </div>
            <span className="text-gray-300 text-[16px]">›</span>
          </button>
          <button className="flex items-center justify-between px-5 py-4 active:opacity-60 transition-opacity">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/[0.05] flex items-center justify-center text-[16px]">⚡</div>
              <div className="text-left">
                <p className="text-[14px] font-semibold text-gray-900">Know options, new to US</p>
                <p className="text-[12px] text-gray-400">Skip basics, learn US market rules</p>
              </div>
            </div>
            <span className="text-gray-300 text-[16px]">›</span>
          </button>
        </div>
      </div>

      {/* ── Filter tiles ── */}
      {(() => {
        const tiles: { chip: FilterChip; icon: React.ElementType; label: string }[] = [
          { chip: "All",        icon: LayoutGrid, label: "All"        },
          { chip: "Stocks",     icon: TrendingUp, label: "Stocks"     },
          { chip: "Indices",    icon: BarChart2,  label: "Indices"    },
          { chip: "ETF",        icon: Layers,     label: "ETF"        },
          { chip: "Global ETF", icon: Globe,      label: "Global ETF" },
        ];
        return (
          <div className="px-5">
            <div className="flex gap-2.5">
              {tiles.map(({ chip, icon: Icon, label }) => {
                const active = filter === chip;
                return (
                  <button
                    key={chip}
                    onClick={() => setFilter(chip)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1.5 rounded-2xl py-2.5 transition-all",
                      active
                        ? "bg-foreground text-background"
                        : "bg-muted/60 text-muted-foreground"
                    )}
                  >
                    <Icon size={18} strokeWidth={2} />
                    <span className="text-[11px] font-semibold whitespace-nowrap">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Top Option Chains ── */}
      <WidgetCard title="Top Option Chains" subtitle="Most active options across indices, ETFs, and stocks.">
        <div className="pb-2">
          {TOP_CHAINS.filter((item) => matchesFilter(item.assetType, filter)).map((item, i, arr) => (
            <div key={item.symbol} className={cn("flex items-center gap-3 px-5 py-3.5", i < arr.length - 1 && "border-b border-border/30")}>
              <div className="w-10 h-10 rounded-xl bg-muted shrink-0 flex items-center justify-center">
                <span className="text-[11px] font-bold text-muted-foreground">{item.ticker}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[15px] font-bold text-foreground truncate">{item.symbol}</p>
                  <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {item.assetType === "Global ETF" ? "G.ETF" : item.assetType}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[13px] text-muted-foreground tabular-nums">${item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <PctBadge value={item.change} />
                </div>
              </div>
              <button onClick={() => router.push(`/options-chain/${encodeURIComponent(item.symbol)}`)} className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center active:bg-muted/50 transition-colors shrink-0">
                <Link2 size={15} strokeWidth={1.8} className="text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </WidgetCard>

      {/* ── Popular ── */}
      <WidgetCard title="Popular" subtitle="High open interest options getting the most trader attention." cap={popularCap} onCycle={() => setPopularCap(nextCap(popularCap))}>
        <TabRow tabs={POPULAR_TABS} active={popularTab} onChange={setPopularTab} />
        <OptionsTable
          cols={[
            { label: "Options"              },
            { label: "OI",  align: "right" },
            { label: "Vol", align: "right" },
          ]}
          rows={popularRows.map((r) => [
            <Cell key="i" top={r.index} bottom={r.option} />,
            <NumCell key="oi" value={r.oi} />,
            <NumCell key="v" value={fmtNum(String(Math.round(+r.oi.replace(/K$/,"000").replace(/M$/,"000000").replace(/[^0-9]/g,"") * 0.22)))} />,
          ])}
        />
      </WidgetCard>

      {/* ── Top Options Under $10 ── */}
      <WidgetCard title="Top Options Under $10" subtitle="Affordable contracts to control big positions with less capital." cap={under10Cap} onCycle={() => setUnder10Cap(nextCap(under10Cap))}>
        <OptionsTable
          cols={[
            { label: "Options"                    },
            { label: "Opt. Price", align: "right" },
          ]}
          rows={under10Rows.map((r) => [
            <Cell key="i" top={r.index} bottom={r.strike} />,
            <div key="p" className="text-right">
              <p className="text-[14px] font-semibold text-foreground tabular-nums">{r.price}</p>
              <PctBadge value={r.change} />
            </div>,
          ])}
        />
      </WidgetCard>

      {/* ── Sectorial ── */}
      <WidgetCard title="Sectorial" subtitle="Browse options by sector to trade industry themes directly." cap={sectorCap} onCycle={() => setSectorCap(nextCap(sectorCap))}>
        <SectorChips chips={SECTOR_CHIPS} active={sector} onChange={setSector} />
        <OptionsTable
          cols={[
            { label: "Options"              },
            { label: "OI",  align: "right" },
            { label: "Vol", align: "right" },
          ]}
          rows={sectorialRows.map((r) => [
            <Cell key="i" top={r.index} bottom={r.option} />,
            <NumCell key="oi" value={fmtNum(r.oi)} />,
            <NumCell key="v" value={fmtNum(r.vol)} />,
          ])}
        />
      </WidgetCard>

      {/* ── Options in Focus ── */}
      <WidgetCard title="Options in Focus" subtitle="Top gainers, losers, and unusual activity worth watching today." cap={focusCap} onCycle={() => setFocusCap(nextCap(focusCap))}>
        <TabRow tabs={FOCUS_TABS} active={focusTab} onChange={setFocusTab} />
        <OptionsTable
          cols={[
            { label: "Options"              },
            { label: "OI",  align: "right" },
            { label: "Vol", align: "right" },
          ]}
          rows={focusRows.map((r) => [
            <Cell key="t" top={r.ticker} bottom={r.contract} />,
            <NumCell key="oi" value={fmtNum(r.openInt)} />,
            <NumCell key="v" value={fmtNum(String(Math.round(+r.openInt.replace(/,/g, "") * 0.18)))} />,
          ])}
        />
      </WidgetCard>

    </div>
  );
}
