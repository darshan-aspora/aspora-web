"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createChart, ColorType, AreaSeries } from "lightweight-charts";
import type { IChartApi } from "lightweight-charts";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SiteNav } from "@/components/marketing/site-nav";
import { hashSymbol, seededRandom } from "@/app/shared-components/mock-data";
import { getPopularOptions, getExpiries } from "@/app/options/_data/options-data";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StockData {
  symbol: string;
  exchange: string;
  name: string;
  price: number;
  dayChange: number;
  dayChangePct: number;
  marketCap: string;
  capCategory: string;
  pe: number;
  dividend: string;
  yield: number;
  high52w: number;
  low52w: number;
  avgVolume: string;
  beta: number;
  sector: string;
  description: string;
  analystBuy: number;
  analystHold: number;
  analystSell: number;
  avgTarget: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const STOCKS: Record<string, StockData> = {
  AAPL: { symbol: "AAPL", exchange: "NASDAQ", name: "Apple Inc.", price: 198.11, dayChange: 3.24, dayChangePct: 1.66, marketCap: "3.07T", capCategory: "Mega Cap", pe: 31, dividend: "0.96", yield: 0.49, high52w: 199.62, low52w: 164.08, avgVolume: "55.4M", beta: 1.24, sector: "Technology", description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.", analystBuy: 28, analystHold: 8, analystSell: 3, avgTarget: 224 },
  NVDA: { symbol: "NVDA", exchange: "NASDAQ", name: "NVIDIA Corp.", price: 124.92, dayChange: 5.87, dayChangePct: 4.93, marketCap: "3.09T", capCategory: "Mega Cap", pe: 68, dividend: "0.04", yield: 0.03, high52w: 153.13, low52w: 66.25, avgVolume: "312M", beta: 1.98, sector: "Technology", description: "NVIDIA Corporation provides graphics and compute and networking solutions worldwide.", analystBuy: 42, analystHold: 4, analystSell: 1, avgTarget: 160 },
  TSLA: { symbol: "TSLA", exchange: "NASDAQ", name: "Tesla, Inc.", price: 178.24, dayChange: -12.42, dayChangePct: -6.52, marketCap: "568B", capCategory: "Large Cap", pe: 48, dividend: "—", yield: 0, high52w: 299.29, low52w: 138.80, avgVolume: "112M", beta: 2.31, sector: "Consumer Disc.", description: "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.", analystBuy: 18, analystHold: 14, analystSell: 9, avgTarget: 215 },
  MSFT: { symbol: "MSFT", exchange: "NASDAQ", name: "Microsoft Corp.", price: 428.15, dayChange: 11.32, dayChangePct: 2.71, marketCap: "3.18T", capCategory: "Mega Cap", pe: 37, dividend: "3.00", yield: 0.70, high52w: 468.35, low52w: 309.45, avgVolume: "22.4M", beta: 0.90, sector: "Technology", description: "Microsoft Corporation develops and supports software, services, devices, and solutions worldwide.", analystBuy: 36, analystHold: 5, analystSell: 0, avgTarget: 510 },
  AMZN: { symbol: "AMZN", exchange: "NASDAQ", name: "Amazon.com Inc.", price: 186.42, dayChange: 5.72, dayChangePct: 3.17, marketCap: "1.96T", capCategory: "Mega Cap", pe: 59, dividend: "—", yield: 0, high52w: 199.42, low52w: 118.35, avgVolume: "45.7M", beta: 1.15, sector: "Consumer Disc.", description: "Amazon.com, Inc. engages in the retail sale of consumer products, advertising, and subscriptions service through online and physical stores.", analystBuy: 60, analystHold: 4, analystSell: 0, avgTarget: 245 },
  GOOGL: { symbol: "GOOGL", exchange: "NASDAQ", name: "Alphabet Inc.", price: 152.67, dayChange: -5.84, dayChangePct: -3.68, marketCap: "1.91T", capCategory: "Mega Cap", pe: 27, dividend: "—", yield: 0, high52w: 207.05, low52w: 120.21, avgVolume: "32.8M", beta: 1.05, sector: "Communication", description: "Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.", analystBuy: 38, analystHold: 8, analystSell: 1, avgTarget: 220 },
  META: { symbol: "META", exchange: "NASDAQ", name: "Meta Platforms Inc.", price: 523.8, dayChange: 18.62, dayChangePct: 3.69, marketCap: "1.33T", capCategory: "Mega Cap", pe: 34, dividend: "2.00", yield: 0.38, high52w: 614.31, low52w: 296.43, avgVolume: "28.1M", beta: 1.22, sector: "Communication", description: "Meta Platforms, Inc. engages in the development of products that enable people to connect and share with friends and family.", analystBuy: 44, analystHold: 7, analystSell: 2, avgTarget: 720 },
};

function getFallbackStock(symbol: string): StockData {
  const h = hashSymbol(symbol);
  const rng = seededRandom(h);
  const price = parseFloat((20 + rng() * 480).toFixed(2));
  const change = parseFloat(((rng() - 0.5) * price * 0.06).toFixed(2));
  return {
    symbol,
    exchange: rng() > 0.5 ? "NASDAQ" : "NYSE",
    name: `${symbol} Corp.`,
    price,
    dayChange: change,
    dayChangePct: parseFloat(((change / price) * 100).toFixed(2)),
    marketCap: `${(rng() * 500 + 1).toFixed(1)}B`,
    capCategory: "Mid Cap",
    pe: Math.floor(rng() * 40 + 10),
    dividend: (rng() * 2).toFixed(2),
    yield: parseFloat((rng() * 2).toFixed(2)),
    high52w: parseFloat((price * (1 + rng() * 0.3)).toFixed(2)),
    low52w: parseFloat((price * (1 - rng() * 0.3)).toFixed(2)),
    avgVolume: `${(rng() * 20 + 1).toFixed(1)}M`,
    beta: parseFloat((0.5 + rng() * 2).toFixed(2)),
    sector: "Technology",
    description: `${symbol} is a publicly traded company listed on major US exchanges.`,
    analystBuy: Math.floor(rng() * 20 + 5),
    analystHold: Math.floor(rng() * 10 + 2),
    analystSell: Math.floor(rng() * 5),
    avgTarget: parseFloat((price * (1 + rng() * 0.3)).toFixed(2)),
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
    v = v * (1 + (rng() - 0.48) * 0.015);
    if (v < price * 0.3) v = price * 0.3;
    points.push({ time: now - i * step, value: parseFloat(v.toFixed(2)) });
  }
  if (points.length > 0) points[points.length - 1].value = price;
  return points;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StockChart({
  stock,
  timeframe,
  onTimeframeChange,
}: {
  stock: StockData;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPositive = stock.dayChange >= 0;
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

    series.setData(generatePriceData(stock.symbol, stock.price, timeframe) as Parameters<typeof series.setData>[0]);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [stock.symbol, stock.price, timeframe, lineColor]);

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

function KeyMetricsCard({ stock }: { stock: StockData }) {
  const isPositive = stock.dayChange >= 0;
  const rangePercent = ((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100;

  return (
    <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
      <div className="text-white/50 text-sm mb-1">{stock.exchange} · {stock.capCategory}</div>
      <div className="text-4xl font-semibold text-white">${stock.price.toFixed(2)}</div>
      <div className={cn("mt-1 text-sm font-medium", isPositive ? "text-green-400" : "text-red-400")}>
        {isPositive ? "+" : ""}{stock.dayChange.toFixed(2)} ({isPositive ? "+" : ""}{stock.dayChangePct.toFixed(2)}%) today
      </div>
      <div className="mt-1 text-white/40 text-xs">After hours data may vary</div>
      <div className="mt-5">
        <div className="flex justify-between text-xs text-white/50 mb-1.5">
          <span>${stock.low52w}</span>
          <span>52W Range</span>
          <span>${stock.high52w}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 relative">
          <div
            className={cn("absolute top-0 bottom-0 left-0 rounded-full", isPositive ? "bg-green-400" : "bg-red-400")}
            style={{ width: `${Math.min(100, Math.max(0, rangePercent))}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#1c1c1e]"
            style={{ left: `calc(${Math.min(96, Math.max(0, rangePercent))}% - 6px)` }}
          />
        </div>
      </div>
    </div>
  );
}

function RegisterCard() {
  return (
    <div className="bg-[#1c1c1e] border border-white/[0.10] rounded-2xl p-6 mt-4">
      <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Free to join</div>
      <h3 className="text-white font-bold text-lg leading-snug mb-2">
        Ready to invest or trade?
      </h3>
      <p className="text-white/50 text-sm leading-relaxed mb-5">
        Open your Aspora account in under 15 minutes — no paperwork, no minimums, and no fees to get started.
      </p>
      <div className="space-y-2.5 mb-5">
        {["Stocks, ETFs & options in one place", "Real-time data and smart analytics", "Secure, regulated and FCA authorised"].map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3 5.5L6.5 2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white/60 text-xs">{item}</span>
          </div>
        ))}
      </div>
      <a
        href="https://aspora.com/register"
        className="block w-full text-center rounded-xl bg-white text-neutral-900 font-bold py-3 text-sm hover:bg-white/90 transition-colors"
      >
        Create free account →
      </a>
      <p className="text-white/30 text-xs text-center mt-3">Takes less than 15 minutes</p>
    </div>
  );
}

function OverviewTab({ stock }: { stock: StockData }) {
  const stats = [
    { label: "Market Cap", value: stock.marketCap },
    { label: "P/E Ratio", value: stock.pe.toString() },
    { label: "52W High", value: `$${stock.high52w}` },
    { label: "52W Low", value: `$${stock.low52w}` },
    { label: "Avg Volume", value: stock.avgVolume },
    { label: "Beta", value: stock.beta.toString() },
    { label: "Dividend", value: stock.dividend === "—" ? "—" : `$${stock.dividend}` },
    { label: "Sector", value: stock.sector },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">About</h3>
        <p className="text-white/60 text-sm leading-relaxed">{stock.description}</p>
      </div>
      <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Key Stats</h3>
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

function FinancialsTab({ stock }: { stock: StockData }) {
  const rng = seededRandom(hashSymbol(stock.symbol + "fin"));
  const quarters = ["Q1", "Q2", "Q3", "Q4"].map((q) => {
    const rev = parseFloat((20 + rng() * 80).toFixed(1));
    const net = parseFloat((rev * (0.1 + rng() * 0.25)).toFixed(1));
    return { q, revenue: rev, netIncome: net };
  });
  const maxRev = Math.max(...quarters.map((q) => q.revenue));

  return (
    <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-6">Quarterly Financials (mock, USD billions)</h3>
      <div className="space-y-5">
        {quarters.map((q) => (
          <div key={q.q}>
            <div className="text-white/60 font-medium text-sm mb-2">{q.q}</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">Revenue</span>
                  <span className="text-white font-medium">${q.revenue}B</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${(q.revenue / maxRev) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">Net Income</span>
                  <span className="text-green-400 font-medium">${q.netIncome}B</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${(q.netIncome / maxRev) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsTab({ stock }: { stock: StockData }) {
  const items = [
    {
      title: `${stock.name} reports quarterly results ahead of expectations`,
      source: "Reuters",
      time: "2h ago",
      summary: `${stock.symbol} beat analyst estimates on both top and bottom line, driven by strong demand across key product segments.`,
    },
    {
      title: `Analysts raise price targets for ${stock.symbol} after earnings beat`,
      source: "Bloomberg",
      time: "4h ago",
      summary: `Multiple Wall Street firms raised their price targets following the latest earnings release, citing improving margins.`,
    },
    {
      title: `${stock.sector} sector sees broad gains as macro headwinds ease`,
      source: "CNBC",
      time: "6h ago",
      summary: `Technology stocks led the market higher, with ${stock.symbol} among the top performers in the S&P 500.`,
    },
    {
      title: `${stock.name} expands into new markets amid strong cash generation`,
      source: "WSJ",
      time: "1d ago",
      summary: `The company announced strategic expansion plans supported by its robust balance sheet and recurring revenue growth.`,
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

function OptionsTab({ symbol }: { symbol: string }) {
  const options = getPopularOptions(symbol);
  const expiries = getExpiries(symbol);
  const firstExpiry = expiries[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      {/* Left — Popular options list */}
      <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Popular {symbol} Options</h3>
          <span className="text-white/40 text-xs">{firstExpiry.label}</span>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {options.map((opt) => {
            const pos = opt.change >= 0;
            return (
              <Link
                key={opt.contractId}
                href={`/options/${symbol}/${opt.contractId}`}
                className="flex items-center justify-between py-3.5 hover:bg-white/[0.04] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-1 self-stretch rounded-full mt-0.5"
                    style={{ background: opt.type === "CALL" ? "#34d399" : "#f87171" }}
                  />
                  <div>
                    <div className="text-white/40 text-[11px] uppercase tracking-wider">
                      Underlying {opt.symbol} {opt.strike}
                    </div>
                    <div className="text-white font-semibold text-sm mt-0.5">
                      {opt.expiry} {opt.strike} {opt.type}
                    </div>
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

      {/* Right — Option Chain CTA */}
      <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-white font-semibold mb-1">Option Chain and Prices</h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Explore options data like calls, puts, and strike prices. Understand market expectations for future price movements.
          </p>
        </div>
        <Link
          href={`/options/${symbol}`}
          className="block w-full text-center rounded-xl bg-white text-neutral-900 font-bold py-3 text-sm hover:opacity-90 transition-opacity"
        >
          Open Full Option Chain →
        </Link>
        {/* Quick expiry pills */}
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="text-white/40 text-xs mb-3 uppercase tracking-wider">Available Expiries</div>
          <div className="flex flex-wrap gap-2">
            {expiries.slice(0, 5).map(e => (
              <Link key={e.code} href={`/options/${symbol}?expiry=${e.code}`}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors">
                {e.label}
                <span className="ml-1.5 text-white/30">{e.daysToExpiry}d</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

function StockSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f11]">
      <SiteNav />
      <div className="max-w-[1436px] mx-auto px-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 bg-white/[0.07] rounded animate-pulse" />
          <div className="h-4 w-2 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-4 w-14 bg-white/[0.07] rounded animate-pulse" />
          <div className="h-4 w-2 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-4 w-16 bg-white/[0.07] rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-[1436px] mx-auto px-6 py-8">
        <div className="mb-6 space-y-2">
          <div className="h-8 w-64 bg-white/[0.08] rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-white/[0.05] rounded animate-pulse" />
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
              {[1,2,3].map(i => (
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
              <div className="h-4 w-24 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-10 w-40 bg-white/[0.08] rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse" />
              {[1,2,3,4,5].map(i => (
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

export default function StockDetailPage() {
  const params = useParams();
  const rawSymbol = Array.isArray(params.symbol) ? params.symbol[0] : (params.symbol ?? "");
  const symbol = rawSymbol.toUpperCase();
  const stock = STOCKS[symbol] ?? getFallbackStock(symbol);

  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [tab, setTab] = useState<"Overview" | "Financials" | "Options" | "News">("Overview");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(t);
  }, [symbol]);

  if (!loaded) return <StockSkeleton />;

  return (
    <div className="min-h-screen bg-[#0f0f11]">
      <SiteNav />

      {/* Breadcrumb */}
      <div className="max-w-[1436px] mx-auto px-6 pt-6">
        <nav className="flex items-center gap-2 text-sm text-white/50">
          <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
          <span className="text-white/30">&gt;</span>
          <Link href="/explore" className="hover:text-white transition-colors">Stocks</Link>
          <span className="text-white/30">&gt;</span>
          <span className="text-white">{symbol}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-[1436px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{stock.name}</h1>
          <div className="text-white/50 text-sm mt-1">{stock.symbol} · {stock.exchange}</div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-4">
            <StockChart stock={stock} timeframe={timeframe} onTimeframeChange={setTimeframe} />

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/[0.08]">
              {(["Overview", "Financials", "Options", "News"] as const).map((t) => (
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
              {tab === "Overview" && <OverviewTab stock={stock} />}
              {tab === "Financials" && <FinancialsTab stock={stock} />}
              {tab === "Options" && <OptionsTab symbol={stock.symbol} />}
              {tab === "News" && <NewsTab stock={stock} />}
            </div>
          </div>

          {/* Right column */}
          <div className="w-full md:w-80 shrink-0 md:sticky md:top-6">
            <KeyMetricsCard stock={stock} />
            <RegisterCard />
          </div>
        </div>
      </div>
    </div>
  );
}
