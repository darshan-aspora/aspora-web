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

interface IndexData {
  symbol: string;
  exchange: string;
  name: string;
  level: number;
  change: number;
  changePct: number;
  ytdChangePct: number;
  pe: string;
  constituents: number;
  marketCap: string;
  volume: string;
  description: string;
  indexProvider: string;
  baseYear: string;
  inceptionDate: string;
  rebalancing: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const INDICES: Record<string, IndexData> = {
  SPX: { symbol: "SPX", exchange: "NYSE", name: "S&P 500", level: 5234.18, change: 38.42, changePct: 0.74, ytdChangePct: 9.83, pe: "22.4x", constituents: 503, marketCap: "42.1T", volume: "3.2B", description: "The S&P 500 tracks 500 of the largest US companies by market cap. It covers ~80% of US market cap.", indexProvider: "S&P Dow Jones Indices", baseYear: "1957", inceptionDate: "Mar 4, 1957", rebalancing: "Quarterly" },
  NDX: { symbol: "NDX", exchange: "NASDAQ", name: "NASDAQ 100", level: 18247.09, change: -92.34, changePct: -0.50, ytdChangePct: 7.21, pe: "29.1x", constituents: 100, marketCap: "22.8T", volume: "4.1B", description: "The NASDAQ-100 tracks the 100 largest non-financial companies listed on the NASDAQ stock exchange.", indexProvider: "Nasdaq OMX", baseYear: "1985", inceptionDate: "Jan 31, 1985", rebalancing: "Annual" },
  DJI: { symbol: "DJI", exchange: "NYSE", name: "Dow Jones Industrial Average", level: 39142.23, change: 122.05, changePct: 0.31, ytdChangePct: 4.12, pe: "18.2x", constituents: 30, marketCap: "12.4T", volume: "312M", description: "The DJIA tracks 30 large, publicly-owned companies based in the US. It is price-weighted.", indexProvider: "S&P Dow Jones Indices", baseYear: "1896", inceptionDate: "May 26, 1896", rebalancing: "As needed" },
  RUT: { symbol: "RUT", exchange: "NYSE", name: "Russell 2000", level: 2048.67, change: -24.81, changePct: -1.20, ytdChangePct: 1.84, pe: "16.8x", constituents: 2000, marketCap: "3.1T", volume: "1.8B", description: "The Russell 2000 Index measures the performance of 2,000 smaller companies within the Russell 3000.", indexProvider: "FTSE Russell", baseYear: "1984", inceptionDate: "Jan 1, 1984", rebalancing: "Annual" },
  VIX: { symbol: "VIX", exchange: "CBOE", name: "CBOE Volatility Index", level: 18.42, change: -1.24, changePct: -6.31, ytdChangePct: -8.20, pe: "N/A", constituents: 0, marketCap: "N/A", volume: "N/A", description: "The VIX measures market expectations of near-term volatility conveyed by S&P 500 stock index option prices.", indexProvider: "CBOE Global Markets", baseYear: "1990", inceptionDate: "Jan 19, 1990", rebalancing: "Continuous" },
  NYA: { symbol: "NYA", exchange: "NYSE", name: "NYSE Composite", level: 17842.55, change: 84.22, changePct: 0.47, ytdChangePct: 6.44, pe: "19.4x", constituents: 1900, marketCap: "26.2T", volume: "1.4B", description: "The NYSE Composite tracks all common stocks listed on the New York Stock Exchange.", indexProvider: "NYSE Group", baseYear: "1965", inceptionDate: "Dec 31, 1965", rebalancing: "Continuous" },
};

function getFallbackIndex(symbol: string): IndexData {
  const h = hashSymbol(symbol);
  const rng = seededRandom(h);
  const level = parseFloat((500 + rng() * 9500).toFixed(2));
  const change = parseFloat(((rng() - 0.5) * level * 0.02).toFixed(2));
  return {
    symbol,
    exchange: "NYSE",
    name: `${symbol} Index`,
    level,
    change,
    changePct: parseFloat(((change / level) * 100).toFixed(2)),
    ytdChangePct: parseFloat(((rng() - 0.3) * 20).toFixed(2)),
    pe: `${(rng() * 20 + 12).toFixed(1)}x`,
    constituents: Math.floor(rng() * 500 + 30),
    marketCap: `${(rng() * 20 + 1).toFixed(1)}T`,
    volume: `${(rng() * 2 + 0.1).toFixed(1)}B`,
    description: `${symbol} is a market index tracking a segment of publicly traded equities.`,
    indexProvider: "Unknown Provider",
    baseYear: "2000",
    inceptionDate: "Jan 1, 2000",
    rebalancing: "Quarterly",
  };
}

// ─── Chart helpers ───────────────────────────────────────────────────────────

type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y" | "All";

function generatePriceData(symbol: string, level: number, tf: Timeframe) {
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
  let v = level * (0.7 + rng() * 0.3);
  for (let i = count; i >= 0; i--) {
    v = v * (1 + (rng() - 0.48) * 0.01);
    if (v < level * 0.3) v = level * 0.3;
    points.push({ time: now - i * step, value: parseFloat(v.toFixed(2)) });
  }
  if (points.length > 0) points[points.length - 1].value = level;
  return points;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function IndexChart({
  index,
  timeframe,
  onTimeframeChange,
}: {
  index: IndexData;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPositive = index.change >= 0;
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

    series.setData(generatePriceData(index.symbol, index.level, timeframe) as Parameters<typeof series.setData>[0]);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [index.symbol, index.level, timeframe, lineColor]);

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

function IndexSummaryCard({ index }: { index: IndexData }) {
  const isPositive = index.change >= 0;
  const isYtdPositive = index.ytdChangePct >= 0;

  return (
    <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
      <div className="text-white/50 text-sm mb-1">{index.exchange} · {index.indexProvider}</div>
      <div className="text-4xl font-semibold text-white tabular-nums">
        {index.level.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className={cn("mt-1 text-sm font-medium", isPositive ? "text-green-400" : "text-red-400")}>
        {isPositive ? "+" : ""}{index.change.toFixed(2)} ({isPositive ? "+" : ""}{index.changePct.toFixed(2)}%) today
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.08]">
        <div className="flex justify-between items-center">
          <span className="text-white/50 text-sm">YTD Return</span>
          <span className={cn("text-sm font-semibold", isYtdPositive ? "text-green-400" : "text-red-400")}>
            {isYtdPositive ? "+" : ""}{index.ytdChangePct.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ index }: { index: IndexData }) {
  const stats = [
    { label: "Provider", value: index.indexProvider },
    { label: "Base Year", value: index.baseYear },
    { label: "Inception Date", value: index.inceptionDate },
    { label: "Rebalancing", value: index.rebalancing },
    { label: "Constituents", value: index.constituents > 0 ? index.constituents.toLocaleString() : "N/A" },
    { label: "Market Cap", value: index.marketCap },
    { label: "P/E Ratio", value: index.pe },
    { label: "Volume", value: index.volume },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">About</h3>
        <p className="text-white/60 text-sm leading-relaxed">{index.description}</p>
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

function NewsTab({ index }: { index: IndexData }) {
  const items = [
    {
      title: `${index.name} climbs as Fed signals rate pause`,
      source: "Reuters",
      time: "1h ago",
      summary: `The ${index.name} gained ground after Federal Reserve officials signaled a pause in rate hikes, boosting risk appetite across equities.`,
    },
    {
      title: `Strong earnings season lifts ${index.symbol} to new highs`,
      source: "Bloomberg",
      time: "3h ago",
      summary: `Better-than-expected earnings from major index constituents drove the ${index.name} to its highest level in six months.`,
    },
    {
      title: `${index.indexProvider} announces ${index.symbol} reconstitution details`,
      source: "Morningstar",
      time: "1d ago",
      summary: `${index.indexProvider} released the schedule and methodology details for the upcoming ${index.symbol} rebalancing event.`,
    },
    {
      title: `Global markets rally; ${index.name} outperforms peers`,
      source: "CNBC",
      time: "2d ago",
      summary: `In a broad risk-on session, the ${index.name} outpaced international peers as domestic macro data surprised to the upside.`,
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

// Index options — SPX, NDX, DJI, RUT have listed options; VIX uses VIX options
const INDEX_OPTIONS_SYMBOL: Record<string, string> = {
  SPX: "SPX", NDX: "NDX", DJI: "DJI", RUT: "RUT", VIX: "VIX",
};

function IndexOptionsTab({ symbol }: { symbol: string }) {
  const optSymbol = INDEX_OPTIONS_SYMBOL[symbol] ?? symbol;
  const options = getPopularOptions(optSymbol);
  const expiries = getExpiries(optSymbol);
  const firstExpiry = expiries[0];

  return (
    <div className="space-y-4">
      <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-1">Option Chain and Prices</h3>
        <p className="text-white/50 text-sm leading-relaxed mb-5">
          {symbol} index options let you hedge or speculate on broad market direction. Explore calls and puts across expiries.
        </p>
        <Link href={`/options/${optSymbol}`}
          className="block w-full text-center rounded-xl bg-white text-neutral-900 font-bold py-3 text-sm hover:opacity-90 transition-opacity">
          Open Full Option Chain →
        </Link>
      </div>
      <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Popular {symbol} Options</h3>
          <span className="text-white/40 text-xs">{firstExpiry.label}</span>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {options.map((opt) => {
            const pos = opt.change >= 0;
            return (
              <Link key={opt.contractId} href={`/options/${optSymbol}/${opt.contractId}`}
                className="flex items-center justify-between py-3.5 hover:bg-white/[0.04] -mx-2 px-2 rounded-lg transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-1 self-stretch rounded-full mt-0.5"
                    style={{ background: opt.type === "CALL" ? "#34d399" : "#f87171" }} />
                  <div>
                    <div className="text-white/40 text-[11px] uppercase tracking-wider">Underlying {opt.symbol}</div>
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
        <Link href={`/options/${optSymbol}`} className="block mt-4 text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          View all strikes →
        </Link>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function IndexDetailPage() {
  const params = useParams();
  const rawSymbol = Array.isArray(params.symbol) ? params.symbol[0] : (params.symbol ?? "");
  const symbol = rawSymbol.toUpperCase();
  const index = INDICES[symbol] ?? getFallbackIndex(symbol);

  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [tab, setTab] = useState<"Overview" | "Options" | "News">("Overview");

  return (
    <div className="min-h-screen bg-[#0f0f11]">
      <SiteNav />

      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-6 pt-6">
        <nav className="flex items-center gap-2 text-sm text-white/50">
          <span>Explore</span>
          <span className="text-white/30">&gt;</span>
          <span>Indices</span>
          <span className="text-white/30">&gt;</span>
          <span className="text-white">{symbol}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{index.name}</h1>
          <div className="text-white/50 text-sm mt-1">{index.symbol} · {index.exchange}</div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-4">
            <IndexChart index={index} timeframe={timeframe} onTimeframeChange={setTimeframe} />

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/[0.08]">
              {(["Overview", "Options", "News"] as const).map((t) => (
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
              {tab === "Overview" && <OverviewTab index={index} />}
              {tab === "Options" && <IndexOptionsTab symbol={index.symbol} />}
              {tab === "News" && <NewsTab index={index} />}
            </div>
          </div>

          {/* Right column */}
          <div className="w-full md:w-80 shrink-0 md:sticky md:top-6">
            <IndexSummaryCard index={index} />
          </div>
        </div>
      </div>
    </div>
  );
}
