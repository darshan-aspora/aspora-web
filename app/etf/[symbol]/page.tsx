"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createChart, ColorType, AreaSeries } from "lightweight-charts";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SiteNav } from "@/components/marketing/site-nav";
import { hashSymbol, seededRandom } from "@/app/shared-components/mock-data";
import { getPopularOptions, getExpiries } from "@/app/options/_data/options-data";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ETFData {
  symbol: string;
  name: string;
  issuer: string;
  price: number;
  dayChange: number;
  dayChangePct: number;
  aum: string;
  expenseRatio: string;
  return1y: number;
  return3y: number;
  return5y: number;
  nav: number;
  premium: number;
  description: string;
  topHoldings: string[];
  avgVolume: string;
  inceptionDate: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const ETFS: Record<string, ETFData> = {
  SPY: { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", issuer: "State Street", price: 524.18, dayChange: 3.86, dayChangePct: 0.74, aum: "$549B", expenseRatio: "0.0945%", return1y: 24.2, return3y: 31.8, return5y: 87.4, nav: 524.12, premium: 0.01, description: "Tracks the S&P 500 index, providing exposure to 500 of the largest US companies.", topHoldings: ["AAPL 7.1%", "MSFT 6.8%", "NVDA 6.2%", "AMZN 3.8%", "META 2.4%"], avgVolume: "68.2M", inceptionDate: "Jan 22, 1993" },
  QQQ: { symbol: "QQQ", name: "Invesco QQQ Trust", issuer: "Invesco", price: 441.32, dayChange: -2.22, dayChangePct: -0.50, aum: "$245B", expenseRatio: "0.20%", return1y: 28.7, return3y: 38.2, return5y: 114.8, nav: 441.28, premium: 0.01, description: "Tracks the NASDAQ-100 Index, including 100 of the largest non-financial companies listed on the NASDAQ.", topHoldings: ["NVDA 8.6%", "AAPL 8.1%", "MSFT 7.4%", "AMZN 5.2%", "GOOGL 4.8%"], avgVolume: "44.1M", inceptionDate: "Mar 10, 1999" },
  VTI: { symbol: "VTI", name: "Vanguard Total Stock Market ETF", issuer: "Vanguard", price: 248.65, dayChange: 1.52, dayChangePct: 0.61, aum: "$387B", expenseRatio: "0.03%", return1y: 22.8, return3y: 27.4, return5y: 78.9, nav: 248.63, premium: 0.01, description: "Tracks the CRSP US Total Market Index, covering nearly all investable US equities.", topHoldings: ["AAPL 5.8%", "MSFT 5.6%", "NVDA 5.0%", "AMZN 3.1%", "META 2.0%"], avgVolume: "4.2M", inceptionDate: "May 24, 2001" },
  IWM: { symbol: "IWM", name: "iShares Russell 2000 ETF", issuer: "BlackRock", price: 198.42, dayChange: -2.42, dayChangePct: -1.21, aum: "$56B", expenseRatio: "0.19%", return1y: 11.4, return3y: 8.2, return5y: 34.6, nav: 198.38, premium: 0.02, description: "Tracks the Russell 2000 Index of US small-cap stocks, providing broad small-cap exposure.", topHoldings: ["SMCI 0.4%", "CGNX 0.3%", "KRYS 0.3%", "ARWR 0.3%", "CELH 0.3%"], avgVolume: "32.4M", inceptionDate: "May 22, 2000" },
  GLD: { symbol: "GLD", name: "SPDR Gold Shares", issuer: "State Street", price: 224.87, dayChange: 0.85, dayChangePct: 0.38, aum: "$58B", expenseRatio: "0.40%", return1y: 18.3, return3y: 21.4, return5y: 56.2, nav: 224.80, premium: 0.03, description: "Tracks the price of gold bullion, offering investors direct exposure to gold returns without physical storage.", topHoldings: ["Gold Bullion 100%"], avgVolume: "8.4M", inceptionDate: "Nov 18, 2004" },
  TLT: { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF", issuer: "BlackRock", price: 89.24, dayChange: -0.20, dayChangePct: -0.22, aum: "$51B", expenseRatio: "0.15%", return1y: -8.4, return3y: -28.1, return5y: -32.4, nav: 89.22, premium: 0.02, description: "Tracks long-term US Treasury bonds with maturities of 20 years or more.", topHoldings: ["US Treasury 30Y 18.2%", "US Treasury 20Y 14.8%", "US Treasury 25Y 12.4%"], avgVolume: "42.8M", inceptionDate: "Jul 22, 2002" },
  XLK: { symbol: "XLK", name: "Technology Select Sector SPDR", issuer: "State Street", price: 214.56, dayChange: 2.40, dayChangePct: 1.12, aum: "$64B", expenseRatio: "0.09%", return1y: 32.1, return3y: 44.8, return5y: 134.2, nav: 214.52, premium: 0.02, description: "Tracks technology stocks within the S&P 500, providing concentrated tech sector exposure.", topHoldings: ["MSFT 22.4%", "AAPL 21.8%", "NVDA 14.2%", "AVGO 4.8%", "AMD 2.8%"], avgVolume: "14.2M", inceptionDate: "Dec 16, 1998" },
  ARKK: { symbol: "ARKK", name: "ARK Innovation ETF", issuer: "ARK Invest", price: 48.73, dayChange: 1.34, dayChangePct: 2.84, aum: "$7.2B", expenseRatio: "0.75%", return1y: -12.6, return3y: -62.4, return5y: -18.4, nav: 48.70, premium: 0.06, description: "Actively managed ETF focusing on disruptive innovation across genomics, automation, energy storage, AI, and fintech.", topHoldings: ["TSLA 9.8%", "COIN 8.4%", "RKLB 8.2%", "ROKU 7.8%", "PLTR 6.4%"], avgVolume: "12.8M", inceptionDate: "Oct 31, 2014" },
};

function getFallbackETF(symbol: string): ETFData {
  const h = hashSymbol(symbol);
  const rng = seededRandom(h);
  const price = parseFloat((20 + rng() * 300).toFixed(2));
  const change = parseFloat(((rng() - 0.5) * price * 0.03).toFixed(2));
  return {
    symbol,
    name: `${symbol} ETF`,
    issuer: "Unknown Issuer",
    price,
    dayChange: change,
    dayChangePct: parseFloat(((change / price) * 100).toFixed(2)),
    aum: `$${(rng() * 50 + 1).toFixed(1)}B`,
    expenseRatio: `${(rng() * 0.5 + 0.03).toFixed(2)}%`,
    return1y: parseFloat(((rng() - 0.3) * 40).toFixed(1)),
    return3y: parseFloat(((rng() - 0.2) * 60).toFixed(1)),
    return5y: parseFloat(((rng() - 0.1) * 100).toFixed(1)),
    nav: parseFloat((price - rng() * 0.1).toFixed(2)),
    premium: parseFloat((rng() * 0.1).toFixed(2)),
    description: `${symbol} is an exchange-traded fund listed on major US exchanges.`,
    topHoldings: ["N/A"],
    avgVolume: `${(rng() * 10 + 0.5).toFixed(1)}M`,
    inceptionDate: "N/A",
  };
}

// ─── Chart helpers ───────────────────────────────────────────────────────────

type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y" | "All";

function generatePriceData(symbol: string, price: number, tf: Timeframe) {
  const h = hashSymbol(symbol + tf);
  const rng = seededRandom(h);
  const now = Math.floor(Date.now() / 1000);
  const configs: Record<Timeframe, { count: number; step: number }> = {
    "1D": { count: 78, step: 300 },
    "1W": { count: 390, step: 300 },
    "1M": { count: 30, step: 86400 },
    "3M": { count: 90, step: 86400 },
    "1Y": { count: 252, step: 86400 },
    "All": { count: 1260, step: 86400 },
  };
  const { count, step } = configs[tf];
  const points: { time: number; value: number }[] = [];
  let v = price * (0.7 + rng() * 0.3);
  for (let i = count; i >= 0; i--) {
    v = v * (1 + (rng() - 0.48) * 0.012);
    if (v < price * 0.3) v = price * 0.3;
    points.push({ time: now - i * step, value: parseFloat(v.toFixed(2)) });
  }
  if (points.length > 0) points[points.length - 1].value = price;
  return points;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ETFChart({
  etf,
  timeframe,
  onTimeframeChange,
}: {
  etf: ETFData;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPositive = etf.dayChange >= 0;
  const lineColor = isPositive ? "#22c55e" : "#ef4444";

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: { background: { type: ColorType.Solid, color: "#0f0f11" }, textColor: "rgba(255,255,255,0.5)" },
      grid: { vertLines: { color: "rgba(255,255,255,0.06)" }, horzLines: { color: "rgba(255,255,255,0.06)" } },
      crosshair: { vertLine: { color: "rgba(255,255,255,0.3)" }, horzLine: { color: "rgba(255,255,255,0.3)" } },
      timeScale: { borderColor: "rgba(255,255,255,0.1)", timeVisible: true },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: lineColor + "40",
      bottomColor: "rgba(0,0,0,0)",
      lineWidth: 2,
    });

    series.setData(generatePriceData(etf.symbol, etf.price, timeframe) as Parameters<typeof series.setData>[0]);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [etf.symbol, etf.price, timeframe, lineColor]);

  const TFS: Timeframe[] = ["1D", "1W", "1M", "3M", "1Y", "All"];

  return (
    <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-4">
      <div ref={containerRef} className="w-full" />
      <div className="flex gap-1 mt-4">
        {TFS.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              timeframe === tf ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
            )}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
}

function KeyMetricsCard({ etf }: { etf: ETFData }) {
  const isPositive = etf.dayChange >= 0;

  return (
    <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
      <div className="text-white/50 text-sm mb-1">{etf.issuer}</div>
      <div className="text-4xl font-semibold text-white">${etf.price.toFixed(2)}</div>
      <div className={cn("mt-1 text-sm font-medium", isPositive ? "text-green-400" : "text-red-400")}>
        {isPositive ? "+" : ""}{etf.dayChange.toFixed(2)} ({isPositive ? "+" : ""}{etf.dayChangePct.toFixed(2)}%) today
      </div>

      <div className="mt-5 space-y-3">
        {[
          { label: "NAV", value: `$${etf.nav.toFixed(2)}` },
          { label: "Premium/Discount", value: `${etf.premium > 0 ? "+" : ""}${etf.premium.toFixed(2)}%` },
          { label: "AUM", value: etf.aum },
          { label: "Expense Ratio", value: etf.expenseRatio },
        ].map((item) => (
          <div key={item.label} className="flex justify-between border-b border-white/[0.05] pb-3">
            <span className="text-white/50 text-sm">{item.label}</span>
            <span className="text-white text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegisterCard() {
  return (
    <div className="bg-gradient-to-br from-emerald-950/60 to-[#1c1c1e] border border-emerald-500/20 rounded-2xl p-6 mt-4">
      <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">Free to join</div>
      <h3 className="text-white font-bold text-lg leading-snug mb-2">
        Ready to invest or trade?
      </h3>
      <p className="text-white/50 text-sm leading-relaxed mb-5">
        Open your Aspora account in under 15 minutes — no paperwork, no minimums, and no fees to get started.
      </p>
      <div className="space-y-2.5 mb-5">
        {["Stocks, ETFs & options in one place", "Real-time data and smart analytics", "Secure, regulated and FCA authorised"].map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3 5.5L6.5 2" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white/60 text-xs">{item}</span>
          </div>
        ))}
      </div>
      <a
        href="https://aspora.com/register"
        className="block w-full text-center rounded-xl bg-emerald-500 text-white font-bold py-3 text-sm hover:bg-emerald-400 transition-colors"
      >
        Create free account →
      </a>
      <p className="text-white/30 text-xs text-center mt-3">Takes less than 15 minutes</p>
    </div>
  );
}

function PerformanceCard({ etf }: { etf: ETFData }) {
  const returns = [
    { label: "1Y Return", value: etf.return1y },
    { label: "3Y Return", value: etf.return3y },
    { label: "5Y Return", value: etf.return5y },
  ];

  return (
    <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6 mt-4">
      <h3 className="text-white font-semibold mb-4">Performance</h3>
      <div className="space-y-3">
        {returns.map((r) => (
          <div key={r.label} className="flex justify-between items-center">
            <span className="text-white/50 text-sm">{r.label}</span>
            <span className={cn("text-sm font-semibold", r.value >= 0 ? "text-green-400" : "text-red-400")}>
              {r.value >= 0 ? "+" : ""}{r.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewTab({ etf }: { etf: ETFData }) {
  const stats = [
    { label: "Issuer", value: etf.issuer },
    { label: "NAV", value: `$${etf.nav.toFixed(2)}` },
    { label: "Premium/Discount", value: `${etf.premium >= 0 ? "+" : ""}${etf.premium.toFixed(2)}%` },
    { label: "Inception Date", value: etf.inceptionDate },
    { label: "AUM", value: etf.aum },
    { label: "Expense Ratio", value: etf.expenseRatio },
    { label: "Avg Volume", value: etf.avgVolume },
    { label: "1Y Return", value: `${etf.return1y >= 0 ? "+" : ""}${etf.return1y}%` },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">About</h3>
        <p className="text-white/60 text-sm leading-relaxed">{etf.description}</p>
      </div>
      <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Fund Details</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {stats.map((s) => (
            <div key={s.label} className="flex justify-between border-b border-white/[0.05] pb-3">
              <span className="text-white/50 text-sm">{s.label}</span>
              <span className="text-white text-sm font-medium">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HoldingsTab({ etf }: { etf: ETFData }) {
  return (
    <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4">Top Holdings</h3>
      <div className="space-y-3">
        {etf.topHoldings.map((holding, i) => {
          const [ticker, weight] = holding.split(" ");
          const weightNum = parseFloat(weight?.replace("%", "") ?? "0");
          const maxWeight = parseFloat(etf.topHoldings[0]?.split(" ")[1]?.replace("%", "") ?? "10");
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">{ticker}</span>
                </div>
                <span className="text-white/60 text-sm">{weight}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${Math.min(100, (weightNum / Math.max(maxWeight, 1)) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-white/30 text-xs mt-4">Holdings as of latest available date. Subject to change.</p>
    </div>
  );
}

function NewsTab({ etf }: { etf: ETFData }) {
  const items = [
    {
      title: `${etf.name} sees record inflows amid market rally`,
      source: "Bloomberg",
      time: "2h ago",
      summary: `${etf.symbol} attracted significant net new assets this week as investors sought broad market exposure during the risk-on environment.`,
    },
    {
      title: `${etf.issuer} announces minor fee adjustment to ${etf.symbol}`,
      source: "Reuters",
      time: "1d ago",
      summary: `The fund manager confirmed the updated expense ratio structure effective next quarter, keeping ${etf.symbol} competitive in its category.`,
    },
    {
      title: `Passive investing continues to outpace active management in 2025`,
      source: "WSJ",
      time: "2d ago",
      summary: `Index-tracking ETFs like ${etf.symbol} continue to attract the majority of new fund flows as cost-conscious investors prioritize simplicity.`,
    },
    {
      title: `${etf.symbol} rebalancing: what investors need to know`,
      source: "Morningstar",
      time: "3d ago",
      summary: `Quarterly rebalancing for ${etf.symbol} resulted in minor position adjustments. Here is what changed in the underlying index.`,
    },
  ];

  return (
    <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06]">
      {items.map((item, i) => (
        <div key={i} className="p-5 hover:bg-white/[0.03] transition-colors cursor-pointer">
          <div className="flex justify-between items-start gap-4 mb-1">
            <h4 className="text-white text-sm font-medium leading-snug">{item.title}</h4>
            <span className="text-white/40 text-xs shrink-0">{item.time}</span>
          </div>
          <div className="text-white/40 text-xs mb-2">{item.source}</div>
          <p className="text-white/50 text-xs leading-relaxed">{item.summary}</p>
        </div>
      ))}
    </div>
  );
}

function ETFOptionsTab({ symbol }: { symbol: string }) {
  const options = getPopularOptions(symbol);
  const expiries = getExpiries(symbol);
  const firstExpiry = expiries[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      {/* Left — Popular options */}
      <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Popular {symbol} Options</h3>
          <span className="text-white/40 text-xs">{firstExpiry.label}</span>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {options.map((opt) => {
            const pos = opt.change >= 0;
            return (
              <Link key={opt.contractId} href={`/options/${symbol}/${opt.contractId}`}
                className="flex items-center justify-between py-3.5 hover:bg-white/[0.04] -mx-2 px-2 rounded-lg transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-1 self-stretch rounded-full mt-0.5"
                    style={{ background: opt.type === "CALL" ? "#34d399" : "#f87171" }} />
                  <div>
                    <div className="text-white/40 text-[11px] uppercase tracking-wider">Underlying {opt.symbol} {opt.strike}</div>
                    <div className="text-white font-semibold text-sm mt-0.5">{opt.expiry} {opt.strike} {opt.type}</div>
                    <div className="text-white/40 text-[11px] mt-0.5">OI: {opt.oi}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">${opt.price.toFixed(2)}</div>
                  <div className={cn("text-xs mt-0.5", pos ? "text-emerald-400" : "text-red-400")}>
                    {pos ? "+" : ""}${opt.change.toFixed(2)} ({pos ? "+" : ""}{opt.changePct}%)
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <Link href={`/options/${symbol}`} className="block mt-4 text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          View all strikes →
        </Link>
      </div>

      {/* Right — CTA card */}
      <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-white font-semibold mb-1">Option Chain and Prices</h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Explore options on {symbol} — calls, puts, and strike prices across multiple expiries.
          </p>
        </div>
        <Link href={`/options/${symbol}`}
          className="block w-full text-center rounded-xl bg-white text-neutral-900 font-bold py-3 text-sm hover:opacity-90 transition-opacity">
          Open Full Option Chain →
        </Link>
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="text-white/40 text-xs mb-3 uppercase tracking-wider">Available Expiries</div>
          <div className="flex flex-wrap gap-2">
            {expiries.slice(0, 5).map(e => (
              <Link key={e.code} href={`/options/${symbol}?expiry=${e.code}`}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors">
                {e.label}<span className="ml-1.5 text-white/30">{e.daysToExpiry}d</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

function ETFSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f11]">
      <SiteNav />
      <div className="max-w-[1200px] mx-auto px-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 bg-white/[0.07] rounded animate-pulse" />
          <div className="h-4 w-2 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-4 w-10 bg-white/[0.07] rounded animate-pulse" />
          <div className="h-4 w-2 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-4 w-16 bg-white/[0.07] rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="mb-6 space-y-2">
          <div className="h-8 w-72 bg-white/[0.08] rounded-lg animate-pulse" />
          <div className="h-4 w-36 bg-white/[0.05] rounded animate-pulse" />
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 space-y-4">
            <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-4">
              <div className="h-[400px] w-full bg-white/[0.04] rounded-xl animate-pulse" />
              <div className="flex gap-2 mt-4">
                {["1D","1W","1M","3M","1Y","All"].map(tf => (
                  <div key={tf} className="h-8 w-10 bg-white/[0.06] rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
            <div className="flex gap-1 border-b border-white/[0.08] pb-px">
              {[1,2,3,4].map(i => <div key={i} className="h-9 w-24 bg-white/[0.05] rounded-t-lg animate-pulse" />)}
            </div>
            <div className="space-y-3 pt-1">
              {[1,2].map(i => (
                <div key={i} className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6 space-y-3">
                  <div className="h-5 w-32 bg-white/[0.08] rounded animate-pulse" />
                  <div className="h-4 w-full bg-white/[0.05] rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-white/[0.05] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-80 shrink-0 space-y-4">
            <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="h-4 w-28 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-10 w-40 bg-white/[0.08] rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse" />
              {[1,2,3,4].map(i => (
                <div key={i} className="flex justify-between py-2 border-b border-white/[0.05]">
                  <div className="h-4 w-24 bg-white/[0.05] rounded animate-pulse" />
                  <div className="h-4 w-16 bg-white/[0.07] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ETFDetailPage() {
  const params = useParams();
  const rawSymbol = Array.isArray(params.symbol) ? params.symbol[0] : (params.symbol ?? "");
  const symbol = rawSymbol.toUpperCase();
  const etf = ETFS[symbol] ?? getFallbackETF(symbol);

  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [tab, setTab] = useState<"Overview" | "Holdings" | "Options" | "News">("Overview");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(t);
  }, [symbol]);

  if (!loaded) return <ETFSkeleton />;

  return (
    <div className="min-h-screen bg-[#0f0f11]">
      <SiteNav />

      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-6 pt-6">
        <nav className="flex items-center gap-2 text-sm text-white/50">
          <span>Explore</span>
          <span className="text-white/30">&gt;</span>
          <span>ETFs</span>
          <span className="text-white/30">&gt;</span>
          <span className="text-white">{symbol}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{etf.name}</h1>
          <div className="text-white/50 text-sm mt-1">{etf.symbol} · {etf.issuer}</div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-4">
            <ETFChart etf={etf} timeframe={timeframe} onTimeframeChange={setTimeframe} />

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/[0.08]">
              {(["Overview", "Holdings", "Options", "News"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                    tab === t
                      ? "border-white text-white"
                      : "border-transparent text-white/50 hover:text-white/80"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="pt-1">
              {tab === "Overview" && <OverviewTab etf={etf} />}
              {tab === "Holdings" && <HoldingsTab etf={etf} />}
              {tab === "Options" && <ETFOptionsTab symbol={etf.symbol} />}
              {tab === "News" && <NewsTab etf={etf} />}
            </div>
          </div>

          {/* Right column */}
          <div className="w-full md:w-80 shrink-0 md:sticky md:top-6">
            <KeyMetricsCard etf={etf} />
            <PerformanceCard etf={etf} />
            <RegisterCard />
          </div>
        </div>
      </div>
    </div>
  );
}
