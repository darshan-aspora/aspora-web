"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import { cn } from "@/lib/utils";
import {
  getContracts,
  getExpiries,
  getBasePrice,
  type OptionContract,
} from "@/app/options/_data/options-data";
import { hashSymbol, seededRandom } from "@/app/shared-components/mock-data";

// ─── Candle data ─────────────────────────────────────────────────────────────

type CandleTF = "1D" | "1W" | "1M" | "3M";

function generateCandleData(symbol: string, expiryCode: string, strike: number, tf: CandleTF) {
  const seed = hashSymbol(symbol + expiryCode + String(strike) + tf);
  const rng = seededRandom(seed);
  const now = Math.floor(Date.now() / 1000);
  const configs: Record<CandleTF, { count: number; step: number }> = {
    "1D": { count: 30, step: 900 },
    "1W": { count: 35, step: 3600 * 4 },
    "1M": { count: 30, step: 86400 },
    "3M": { count: 60, step: 86400 },
  };
  const { count, step } = configs[tf];
  const base = 2 + rng() * 8;
  const candles = [];
  let close = base;
  for (let i = count; i >= 0; i--) {
    const volatility = close * 0.06;
    const open = close;
    close = Math.max(0.05, open + (rng() - 0.48) * volatility);
    const high = Math.max(open, close) + rng() * volatility * 0.5;
    const low = Math.min(open, close) - rng() * volatility * 0.5;
    candles.push({ time: now - i * step, open, high, low, close });
  }
  return candles;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PayoffSVG({
  contract,
  underlying,
  interactive,
  seller,
}: {
  contract: OptionContract;
  underlying: number;
  interactive?: boolean;
  seller?: boolean;
}) {
  const isCall = contract.type === "CALL";
  const strike = contract.strike;
  const premium = contract.price;
  const [dragX, setDragX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const min = underlying * 0.72;
  const max = underlying * 1.28;
  const W = 500, H = 180, SCRUBBER_H = 28;
  const TOTAL_H = H + SCRUBBER_H;

  const rawPoints: { x: number; y: number }[] = [];
  for (let p = min; p <= max; p += (max - min) / 80) {
    const intrinsic = isCall ? Math.max(0, p - strike) : Math.max(0, strike - p);
    const raw = intrinsic - premium;
    rawPoints.push({ x: p, y: seller ? -raw : raw });
  }

  const minY = Math.min(...rawPoints.map((p) => p.y));
  const maxY = Math.max(...rawPoints.map((p) => p.y));
  const yPad = (maxY - minY) * 0.15 || premium;
  const yMin = minY - yPad;
  const yMax = maxY + yPad;

  const toSvg = (x: number, y: number) => ({
    sx: ((x - min) / (max - min)) * W,
    sy: H - ((y - yMin) / (yMax - yMin)) * H,
  });

  const zeroSy = toSvg(min, 0).sy;
  const breakeven = isCall ? strike + premium : strike - premium;
  const beSx = toSvg(breakeven, 0).sx;
  const underlyingX = toSvg(underlying, 0).sx;

  const profitPath = rawPoints
    .map((p, i) => {
      const { sx, sy } = toSvg(p.x, p.y);
      return `${i === 0 ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    })
    .join(" ");

  const cursorSvgX = dragX ?? underlyingX;
  const displayPrice = min + (cursorSvgX / W) * (max - min);
  const rawIntrinsic = isCall ? Math.max(0, displayPrice - strike) : Math.max(0, strike - displayPrice);
  const rawPnl = rawIntrinsic - premium;
  const displayPnl = seller ? -rawPnl : rawPnl;

  const updateDrag = (clientX: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    setDragX(Math.min(W - 1, Math.max(1, px)));
  };

  return (
    <div>
      {interactive && (
        <div className="mb-5">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Expected P&amp;L</div>
          <div
            className={cn(
              "text-4xl font-bold tabular-nums",
              displayPnl >= 0 ? "text-emerald-400" : "text-red-400"
            )}
          >
            {displayPnl >= 0 ? "+" : ""}${Math.abs(displayPnl * 100).toFixed(0)}
          </div>
          <div className="text-gray-400 text-sm mt-1">
            If stock reaches{" "}
            <span className="text-gray-900 font-semibold">${displayPrice.toFixed(2)}</span>
            <span className={cn("ml-1.5 text-xs", displayPrice >= underlying ? "text-emerald-400" : "text-red-400")}>
              ({displayPrice >= underlying ? "+" : ""}{(((displayPrice - underlying) / underlying) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${TOTAL_H}`}
        className="w-full select-none"
        style={{ height: interactive ? 240 : 180, cursor: interactive ? "ew-resize" : "default" }}
        onMouseDown={(e) => { if (interactive) { setIsDragging(true); updateDrag(e.clientX); } }}
        onMouseMove={(e) => { if (interactive && isDragging) updateDrag(e.clientX); }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => { if (interactive) setIsDragging(false); }}
        onTouchStart={(e) => { if (interactive) updateDrag(e.touches[0].clientX); }}
        onTouchMove={(e) => { if (interactive) updateDrag(e.touches[0].clientX); }}
      >
        {/* Zero line */}
        <line x1={0} y1={zeroSy} x2={W} y2={zeroSy} stroke="rgba(255,255,255,0.12)" strokeDasharray="5,5" />
        {/* Color clips */}
        <clipPath id={`pc-${contract.contractId}`}><rect x={0} y={0} width={W} height={zeroSy} /></clipPath>
        <clipPath id={`lc-${contract.contractId}`}><rect x={0} y={zeroSy} width={W} height={H} /></clipPath>
        <path d={profitPath} fill="none" stroke="#34d399" strokeWidth={2.5} clipPath={`url(#pc-${contract.contractId})`} />
        <path d={profitPath} fill="none" stroke="#f87171" strokeWidth={2.5} clipPath={`url(#lc-${contract.contractId})`} />
        {/* Breakeven */}
        <line x1={beSx} y1={0} x2={beSx} y2={H} stroke="rgba(255,255,255,0.18)" strokeDasharray="4,4" />
        <text x={beSx + 4} y={13} fill="rgba(255,255,255,0.3)" fontSize={9}>BE ${breakeven.toFixed(0)}</text>
        {/* Vertical cursor line */}
        <line
          x1={cursorSvgX} y1={0} x2={cursorSvgX} y2={H}
          stroke={displayPnl >= 0 ? "#34d399" : "#f87171"}
          strokeWidth={1.5} strokeOpacity={0.5}
        />
        {/* Dot on payoff line */}
        {(() => {
          const { sy } = toSvg(displayPrice, displayPnl);
          return <circle cx={cursorSvgX} cy={sy} r={4} fill={displayPnl >= 0 ? "#34d399" : "#f87171"} />;
        })()}
        {/* X-axis scrubber track */}
        <rect x={0} y={H + 8} width={W} height={6} rx={3} fill="rgba(255,255,255,0.08)" />
        <rect x={0} y={H + 8} width={cursorSvgX} height={6} rx={3} fill={displayPnl >= 0 ? "rgba(52,211,153,0.4)" : "rgba(248,113,113,0.4)"} />
        {/* Scrubber handle */}
        <circle cx={cursorSvgX} cy={H + 11} r={10} fill={displayPnl >= 0 ? "#34d399" : "#f87171"} />
        <line x1={cursorSvgX - 3} y1={H + 8} x2={cursorSvgX - 3} y2={H + 14} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={cursorSvgX} y1={H + 8} x2={cursorSvgX} y2={H + 14} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={cursorSvgX + 3} y1={H + 8} x2={cursorSvgX + 3} y2={H + 14} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
        {/* Underlying marker (non-interactive) */}
        {!interactive && (
          <text x={underlyingX + 4} y={H - 4} fill="rgba(255,255,255,0.35)" fontSize={9}>Current</text>
        )}
      </svg>

      <div className="flex justify-between text-gray-300 text-[11px] mt-1 px-0.5">
        <span>${Math.round(min)}</span>
        <span className="text-gray-300">Underlying price at expiry</span>
        <span>${Math.round(max)}</span>
      </div>
    </div>
  );
}

function CandleChart({
  contract,
  symbol,
}: {
  contract: OptionContract;
  symbol: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tf, setTf] = useState<CandleTF>("1M");
  const candles = useMemo(
    () => generateCandleData(symbol, contract.expiryCode, contract.strike, tf),
    [symbol, contract.expiryCode, contract.strike, tf]
  );

  const periodHigh = Math.max(...candles.map((c) => c.high));
  const periodLow = Math.min(...candles.map((c) => c.low));
  const periodOpen = candles[0]?.open ?? 0;
  const periodClose = candles[candles.length - 1]?.close ?? 0;
  const periodChangePct = ((periodClose - periodOpen) / periodOpen) * 100;

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 280,
      layout: {
        background: { type: ColorType.Solid, color: "#0f0f11" },
        textColor: "rgba(255,255,255,0.4)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.25)" },
        horzLine: { color: "rgba(255,255,255,0.25)" },
      },
      timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: true },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#34d399",
      downColor: "#f87171",
      borderUpColor: "#34d399",
      borderDownColor: "#f87171",
      wickUpColor: "#34d399",
      wickDownColor: "#f87171",
    });

    series.setData(
      candles as Parameters<typeof series.setData>[0]
    );
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (containerRef.current)
        chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [candles]);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
      {/* Price header */}
      <div>
        <div className="text-3xl font-bold text-gray-900 tabular-nums">
          ${periodClose.toFixed(2)}
        </div>
        <div
          className={cn(
            "text-sm mt-0.5 font-medium",
            periodChangePct >= 0 ? "text-emerald-400" : "text-red-400"
          )}
        >
          {periodChangePct >= 0 ? "+" : ""}
          {periodChangePct.toFixed(1)}% this period
        </div>
      </div>

      {/* Timeframe pills */}
      <div className="flex gap-2">
        {(["1D", "1W", "1M", "3M"] as CandleTF[]).map((t) => (
          <button
            key={t}
            onClick={() => setTf(t)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              tf === t
                ? "bg-gray-900 text-white"
                : "bg-black/[0.04] text-gray-500 hover:bg-black/[0.05] hover:text-gray-900"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Period High", value: `$${periodHigh.toFixed(2)}`, color: "text-emerald-400" },
          { label: "Period Low", value: `$${periodLow.toFixed(2)}`, color: "text-red-400" },
          { label: "Open", value: `$${periodOpen.toFixed(2)}`, color: "text-gray-900" },
        ].map((s) => (
          <div key={s.label} className="bg-black/[0.03] border border-gray-100 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1.5">{s.label}</div>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function OptionLegDetailPage() {
  const params = useParams();
  const rawSymbol = Array.isArray(params.symbol) ? params.symbol[0] : (params.symbol ?? "");
  const contractId = Array.isArray(params.contractId)
    ? params.contractId[0]
    : (params.contractId ?? "");
  const symbol = rawSymbol.toUpperCase();

  const underlying = getBasePrice(symbol);
  const expiries = getExpiries(symbol);
  const [perspective, setPerspective] = useState<"buy" | "sell">("buy");

  const contract: OptionContract | undefined = useMemo(() => {
    const parts = contractId.split("-");
    if (parts.length < 4) return undefined;
    const typeStr = parts[parts.length - 1] as "CALL" | "PUT";
    const strikeStr = parts[parts.length - 2];
    const expiryCode = parts[parts.length - 3];
    const contracts = getContracts(symbol, expiryCode);
    return contracts.find(
      (c) => c.strike === parseFloat(strikeStr) && c.type === typeStr
    );
  }, [symbol, contractId]);

  if (!contract) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-4">Contract not found</div>
          <Link
            href={`/options/${symbol}`}
            className="text-emerald-400 text-sm hover:underline"
          >
            ← Back to chain
          </Link>
        </div>
      </div>
    );
  }

  const isCall = contract.type === "CALL";
  const pos = contract.change >= 0;
  const expiry = expiries.find((e) => e.code === contract.expiryCode);
  const daysLeft = Math.max(
    0,
    Math.round((new Date(contract.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const breakeven = isCall ? contract.strike + contract.price : contract.strike - contract.price;
  const intrinsic = isCall
    ? Math.max(0, underlying - contract.strike)
    : Math.max(0, contract.strike - underlying);
  const expectedPnl = intrinsic - contract.price;

  // Positions widget data
  const qty = 2;
  const avgCost = contract.price * 0.82;
  const pnl = (contract.price - avgCost) * qty * 100;
  const pnlPct = ((contract.price - avgCost) / avgCost) * 100;
  const pnlPos = pnl >= 0;

  // Performance bar
  const low52 = underlying * 0.72;
  const high52 = underlying * 1.28;
  const perfPct = ((underlying - low52) / (high52 - low52)) * 100;

  // Market depth
  const depthRng = seededRandom(hashSymbol(contract.contractId));
  const mid = contract.price;
  const bids = Array.from({ length: 5 }, (_, i) => ({
    price: parseFloat((mid - (i + 1) * 0.02).toFixed(2)),
    qty: Math.floor(50 + depthRng() * 200),
  }));
  const asks = Array.from({ length: 5 }, (_, i) => ({
    price: parseFloat((mid + (i + 1) * 0.02).toFixed(2)),
    qty: Math.floor(50 + depthRng() * 200),
  }));
  const maxQty = Math.max(...bids.map(b => b.qty), ...asks.map(a => a.qty));

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-40 px-6 py-3 flex items-center gap-4"
        style={{
          background: "#0f0f11",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link
          href={`/options/${symbol}`}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft size={15} />
          Option Chain
        </Link>
        <div className="w-px h-4 bg-black/[0.05]" />
        <div className="text-gray-500 text-sm">
          {symbol} · {contract.expiry} ·{" "}
          <span className="font-medium text-gray-900">${contract.strike}</span>{" "}
          <span
            className={cn(
              "font-bold",
              isCall ? "text-emerald-400" : "text-red-400"
            )}
          >
            {contract.type}
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-[1436px] mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Candle Chart */}
            <CandleChart contract={contract} symbol={symbol} />

            {/* Payoff chart */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-gray-900 font-semibold">Payoff at Expiry</h3>
                {/* Buy / Sell toggle */}
                <div className="flex items-center bg-black/[0.04] rounded-full p-1 gap-0.5">
                  <button
                    onClick={() => setPerspective("buy")}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                      perspective === "buy"
                        ? "bg-gray-900 text-white shadow"
                        : "text-gray-400 hover:text-gray-900"
                    )}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setPerspective("sell")}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                      perspective === "sell"
                        ? "bg-red-500 text-gray-900 shadow"
                        : "text-gray-400 hover:text-gray-900"
                    )}
                  >
                    Sell
                  </button>
                </div>
              </div>

              <PayoffSVG contract={contract} underlying={underlying} interactive seller={perspective === "sell"} />

              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
                {[
                  { label: "Break-even", value: `$${breakeven.toFixed(2)}` },
                  { label: "Entry Cost", value: `$${(contract.price * 100).toFixed(0)}` },
                  { label: "Time Left", value: `${daysLeft} day${daysLeft !== 1 ? "s" : ""}` },
                ].map((s) => (
                  <div key={s.label} className="bg-black/[0.03] border border-gray-100 rounded-xl p-4 text-center">
                    <div className="text-gray-400 text-xs mb-1.5">{s.label}</div>
                    <div className="text-gray-900 font-bold">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick nav links */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/stocks/${symbol}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/[0.03] hover:bg-black/[0.05] border border-gray-100 transition-colors group"
              >
                <div>
                  <div className="text-gray-400 text-[11px] uppercase tracking-wider mb-0.5">Underlying</div>
                  <div className="text-gray-900 font-semibold text-sm">{symbol}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-300 group-hover:text-gray-500 transition-colors">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                href={`/options/${symbol}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/[0.03] hover:bg-black/[0.05] border border-gray-100 transition-colors group"
              >
                <div>
                  <div className="text-gray-400 text-[11px] uppercase tracking-wider mb-0.5">Options Chain</div>
                  <div className="text-gray-900 font-semibold text-sm">All strikes</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-300 group-hover:text-gray-500 transition-colors">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>

            {/* Risk Profile */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="text-gray-900 font-semibold text-sm mb-4">Risk Profile</h3>
              <div className="space-y-0 divide-y divide-white/[0.06]">
                {[
                  {
                    label: "Max Profit",
                    value: isCall ? "Unlimited" : `$${((contract.strike - contract.price) * 100).toFixed(0)}`,
                    color: "text-emerald-400",
                  },
                  {
                    label: "Max Loss",
                    value: `-$${(contract.price * 100).toFixed(0)}`,
                    color: "text-red-400",
                  },
                  { label: "Breakeven at Expiry", value: `$${breakeven.toFixed(2)}`, color: "text-gray-900" },
                  { label: "Strike", value: `$${contract.strike.toLocaleString()}`, color: "text-gray-900" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center py-3">
                    <span className="text-gray-400 text-sm">{r.label}</span>
                    <span className={cn("font-semibold text-sm", r.color)}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="w-[400px] shrink-0 sticky top-[57px] space-y-4">

            {/* Price header */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-4xl font-bold text-gray-900 tabular-nums mb-1">
                    ${contract.price.toFixed(2)}
                  </div>
                  <div className={cn("text-sm font-medium", pos ? "text-emerald-400" : "text-red-400")}>
                    {pos ? "+" : ""}${contract.change.toFixed(2)} ({pos ? "+" : ""}{contract.changePct}%) today
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      contract.itm ? "bg-black/[0.05] text-gray-600" : "bg-gray-100 text-gray-400"
                    )}>
                      {contract.itm ? "In the Money" : "Out of the Money"}
                    </span>
                    {expiry && (
                      <span className="text-gray-400 text-xs">{expiry.daysToExpiry}d to expiry</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-400 mt-1">
                  <div>Bid <span className="text-gray-500">${contract.bid}</span></div>
                  <div className="mt-0.5">Ask <span className="text-gray-500">${contract.ask}</span></div>
                  <div className="mt-0.5">Underlying <span className="text-gray-500">${underlying.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Read-only notice */}
              <div
                className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Info size={14} className="text-gray-300 mt-0.5 shrink-0" />
                <span className="text-gray-400">This is a read-only view. Trading is available on the Aspora mobile app.</span>
              </div>
            </div>

            {/* Positions widget */}
            <div className="bg-black/[0.03] border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-900 font-semibold text-sm">Your Position</span>
                <span className="text-gray-400 text-xs px-2 py-0.5 rounded-full bg-black/[0.04]">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <div className="text-gray-400 text-xs mb-0.5">Qty</div>
                  <div className="text-gray-900 font-semibold">{qty} contracts</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-0.5">Avg Cost</div>
                  <div className="text-gray-900 font-semibold">${avgCost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-0.5">LTP</div>
                  <div className="text-gray-900 font-semibold">${contract.price.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-0.5">Unrealised P&amp;L</div>
                  <div className={cn("font-bold", pnlPos ? "text-emerald-400" : "text-red-400")}>
                    {pnlPos ? "+" : ""}${Math.abs(pnl).toFixed(0)}{" "}
                    <span className="text-xs font-medium">({pnlPos ? "+" : ""}{pnlPct.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance bar */}
            <div className="bg-black/[0.03] border border-gray-100 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400 text-sm font-medium">52W Range</span>
                <span className="text-gray-900 font-bold text-sm">${underlying.toFixed(2)} LTP</span>
              </div>
              <div className="relative h-1.5 rounded-full bg-black/[0.05] mb-2">
                <div className="absolute h-full rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-emerald-400 w-full opacity-30" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-white shadow-lg"
                  style={{ left: `calc(${perfPct}% - 6px)` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>52W Low · ${Math.round(low52)}</span>
                <span>52W High · ${Math.round(high52)}</span>
              </div>
            </div>

            {/* Greeks compact */}
            <div className="bg-black/[0.03] border border-gray-100 rounded-2xl p-5">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                Greeks
                <span className="w-3.5 h-3.5 rounded-full bg-black/[0.05] flex items-center justify-center">
                  <Info size={9} className="text-gray-400" />
                </span>
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Delta", value: String(contract.delta), color: contract.delta < 0 ? "text-red-400" : "text-emerald-400" },
                  { label: "Theta", value: String(contract.theta), color: "text-red-400" },
                  { label: "Gamma", value: String(contract.gamma), color: "text-gray-900" },
                  { label: "Vega", value: String(contract.vega), color: "text-gray-900" },
                ].map((g) => (
                  <div key={g.label} className="text-center">
                    <div className="text-gray-400 text-[11px] mb-1">{g.label}</div>
                    <div className={cn("text-base font-bold tabular-nums", g.color)}>{g.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market depth */}
            <div className="bg-black/[0.03] border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-900 font-semibold text-sm">Market Depth</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Bid</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Ask</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="grid grid-cols-2 text-[11px] text-gray-300 font-medium mb-2 px-1">
                    <span>Price</span><span className="text-right">Qty</span>
                  </div>
                  {bids.map((b, i) => (
                    <div key={i} className="relative rounded-md overflow-hidden">
                      <div className="absolute inset-y-0 right-0 bg-emerald-500/10 rounded-md" style={{ width: `${(b.qty / maxQty) * 100}%` }} />
                      <div className="relative grid grid-cols-2 px-2 py-1.5 text-xs">
                        <span className="text-emerald-400 font-medium tabular-nums">${b.price.toFixed(2)}</span>
                        <span className="text-gray-500 text-right tabular-nums">{b.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="grid grid-cols-2 text-[11px] text-gray-300 font-medium mb-2 px-1">
                    <span>Price</span><span className="text-right">Qty</span>
                  </div>
                  {asks.map((a, i) => (
                    <div key={i} className="relative rounded-md overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-red-500/10 rounded-md" style={{ width: `${(a.qty / maxQty) * 100}%` }} />
                      <div className="relative grid grid-cols-2 px-2 py-1.5 text-xs">
                        <span className="text-red-400 font-medium tabular-nums">${a.price.toFixed(2)}</span>
                        <span className="text-gray-500 text-right tabular-nums">{a.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                <span>Spread: ${(asks[0].price - bids[0].price).toFixed(2)}</span>
                <span>Total Bid: {bids.reduce((s, b) => s + b.qty, 0).toLocaleString()}</span>
                <span>Total Ask: {asks.reduce((s, a) => s + a.qty, 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Contract details */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="text-gray-900 font-semibold text-sm mb-4">Contract Details</h3>
              <div className="space-y-2.5 text-sm">
                {[
                  ["IV", `${contract.iv}%`],
                  ["Open Interest", contract.oi],
                  ["Volume", contract.volume],
                  ["Bid / Ask", `$${contract.bid} / $${contract.ask}`],
                  ["Strike Price", `$${contract.strike.toLocaleString()}`],
                  ["Contract Size", "100 shares"],
                  ["Exercise Style", "American"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-400">{k}</span>
                    <span className="text-gray-900 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Register nudge — full width below both columns */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Free to join
          </div>
          <h3 className="text-gray-900 font-bold text-base mb-1">
            Want to trade this option?
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Open your Aspora account in under 15 minutes and start trading options, stocks, and ETFs — no minimums, no fees to start.
          </p>
          <a
            href="https://aspora.com/register"
            className="inline-block px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors"
          >
            Create free account →
          </a>
        </div>

        {/* Back link */}
        <div className="mt-6 flex justify-center">
          <Link
            href={`/options/${symbol}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <ArrowLeft size={14} />
            Back to {symbol} Option Chain
          </Link>
        </div>
      </div>
    </div>
  );
}
