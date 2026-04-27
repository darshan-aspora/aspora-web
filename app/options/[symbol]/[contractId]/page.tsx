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
  // option price floats around a base, jittered
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

function GreekCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color?: "red" | "green" | "white";
}) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
      <div className="text-white/40 text-sm mb-2">{label}</div>
      <div
        className={cn(
          "text-2xl font-bold mb-1",
          color === "red"
            ? "text-red-400"
            : color === "green"
            ? "text-emerald-400"
            : "text-white"
        )}
      >
        {value}
      </div>
      <div className="text-white/40 text-xs">{sub}</div>
    </div>
  );
}

function PayoffSVG({
  contract,
  underlying,
  interactive,
}: {
  contract: OptionContract;
  underlying: number;
  interactive?: boolean;
}) {
  const isCall = contract.type === "CALL";
  const strike = contract.strike;
  const premium = contract.price;
  const [hoverX, setHoverX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const min = underlying * 0.72;
  const max = underlying * 1.28;

  const points: { x: number; y: number }[] = [];
  for (let p = min; p <= max; p += (max - min) / 80) {
    const intrinsic = isCall ? Math.max(0, p - strike) : Math.max(0, strike - p);
    points.push({ x: p, y: intrinsic - premium });
  }

  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const yPad = (maxY - minY) * 0.15 || premium;
  const yMin = minY - yPad;
  const yMax = maxY + yPad;
  const W = 500, H = 200;

  const toSvg = (x: number, y: number) => ({
    sx: ((x - min) / (max - min)) * W,
    sy: H - ((y - yMin) / (yMax - yMin)) * H,
  });

  const zeroSy = toSvg(min, 0).sy;
  const breakeven = isCall ? strike + premium : strike - premium;
  const beSx = toSvg(breakeven, 0).sx;
  const underlyingX = toSvg(underlying, 0).sx;

  // Split path into profit (green) and loss (red) segments
  const profitPath = points
    .map((p, i) => {
      const { sx, sy } = toSvg(p.x, p.y);
      return `${i === 0 ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    })
    .join(" ");

  // Hover price & P&L
  let hoverPrice: number | null = null;
  let hoverPnl: number | null = null;
  if (hoverX !== null) {
    hoverPrice = min + (hoverX / W) * (max - min);
    const intrinsic = isCall
      ? Math.max(0, hoverPrice - strike)
      : Math.max(0, strike - hoverPrice);
    hoverPnl = intrinsic - premium;
  }

  const displayPrice = hoverPrice ?? underlying;
  const displayPnl = hoverPnl ?? (() => {
    const intr = isCall ? Math.max(0, underlying - strike) : Math.max(0, strike - underlying);
    return intr - premium;
  })();

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !interactive) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    setHoverX(Math.min(W, Math.max(0, px)));
  };

  const cursorX = hoverX ?? underlyingX;
  const cursorSy = toSvg(displayPrice, displayPnl).sy;

  return (
    <div>
      {interactive && (
        <div className="flex items-baseline gap-3 mb-4">
          <div
            className={cn(
              "text-4xl font-bold tabular-nums",
              displayPnl >= 0 ? "text-emerald-400" : "text-red-400"
            )}
          >
            {displayPnl >= 0 ? "+" : ""}${Math.abs(displayPnl * 100).toFixed(0)}
          </div>
          <div className="text-white/50 text-sm">
            Expected P&amp;L · if stock reaches{" "}
            <span className="text-white font-medium">${displayPrice.toFixed(2)}</span>
            <span
              className={cn(
                "ml-1.5",
                displayPrice >= underlying ? "text-emerald-400" : "text-red-400"
              )}
            >
              ({displayPrice >= underlying ? "+" : ""}
              {(((displayPrice - underlying) / underlying) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={cn("w-full", interactive ? "cursor-crosshair" : "")}
        style={{ height: interactive ? 220 : 160 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => interactive && setHoverX(null)}
      >
        {/* Zero line */}
        <line
          x1={0}
          y1={zeroSy}
          x2={W}
          y2={zeroSy}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="5,5"
        />
        {/* Profit fill */}
        <clipPath id={`profit-clip-${contract.contractId}`}>
          <rect x={0} y={0} width={W} height={zeroSy} />
        </clipPath>
        <clipPath id={`loss-clip-${contract.contractId}`}>
          <rect x={0} y={zeroSy} width={W} height={H} />
        </clipPath>
        <path
          d={profitPath}
          fill="none"
          stroke="#34d399"
          strokeWidth={2.5}
          clipPath={`url(#profit-clip-${contract.contractId})`}
        />
        <path
          d={profitPath}
          fill="none"
          stroke="#f87171"
          strokeWidth={2.5}
          clipPath={`url(#loss-clip-${contract.contractId})`}
        />
        {/* Breakeven vertical */}
        <line
          x1={beSx}
          y1={0}
          x2={beSx}
          y2={H}
          stroke="rgba(255,255,255,0.2)"
          strokeDasharray="4,4"
        />
        <text x={beSx + 4} y={14} fill="rgba(255,255,255,0.35)" fontSize={10}>
          BE ${breakeven.toFixed(0)}
        </text>
        {/* Cursor / underlying marker */}
        <line
          x1={cursorX}
          y1={0}
          x2={cursorX}
          y2={H}
          stroke={displayPnl >= 0 ? "#34d399" : "#f87171"}
          strokeWidth={1.5}
          strokeOpacity={0.6}
        />
        <circle
          cx={cursorX}
          cy={cursorSy}
          r={5}
          fill={displayPnl >= 0 ? "#34d399" : "#f87171"}
        />
        {!interactive && (
          <text x={cursorX + 5} y={cursorSy - 6} fill="rgba(255,255,255,0.4)" fontSize={9}>
            Current
          </text>
        )}
      </svg>

      <div className="flex justify-between text-white/30 text-[11px] mt-1 px-0.5">
        <span>${Math.round(min)}</span>
        <span className="text-white/20">Underlying price at expiry</span>
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

  const rng = seededRandom(hashSymbol(symbol + contract.expiryCode));
  const oiChangePct = ((rng() - 0.4) * 10).toFixed(1);
  const ivRank = Math.floor(30 + rng() * 60);

  return (
    <div className="space-y-5">
      {/* Price header */}
      <div>
        <div className="text-3xl font-bold text-white tabular-nums">
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
                ? "bg-white text-neutral-900"
                : "bg-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white"
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

      {/* Stats row 1 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Period High",
            value: `$${periodHigh.toFixed(2)}`,
            color: "text-emerald-400",
          },
          {
            label: "Period Low",
            value: `$${periodLow.toFixed(2)}`,
            color: "text-red-400",
          },
          { label: "Open", value: `$${periodOpen.toFixed(2)}`, color: "text-white" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4"
          >
            <div className="text-white/40 text-xs mb-1.5">{s.label}</div>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Stats row 2 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "OI Change",
            value: `${Number(oiChangePct) >= 0 ? "+" : ""}${oiChangePct}%`,
            color: Number(oiChangePct) >= 0 ? "text-emerald-400" : "text-red-400",
          },
          { label: "IV Rank", value: `${ivRank}%`, color: "text-white" },
          {
            label: "Days to Exp",
            value: String(
              Math.max(
                0,
                Math.round(
                  (new Date(contract.expiry).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              )
            ),
            color: "text-white",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4"
          >
            <div className="text-white/40 text-xs mb-1.5">{s.label}</div>
            <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewTab({
  contract,
  underlying,
}: {
  contract: OptionContract;
  underlying: number;
}) {
  const isCall = contract.type === "CALL";
  const breakeven = isCall ? contract.strike + contract.price : contract.strike - contract.price;
  const maxProfit = isCall ? "Unlimited" : `$${((contract.strike - contract.price) * 100).toFixed(0)}`;
  const maxLoss = `$${(contract.price * 100).toFixed(0)}`;
  const daysLeft = Math.max(
    0,
    Math.round((new Date(contract.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const intrinsic = isCall
    ? Math.max(0, underlying - contract.strike)
    : Math.max(0, contract.strike - underlying);
  const expectedPnl = intrinsic - contract.price;

  return (
    <div className="space-y-6">
      {/* Max Profit / Max Loss hero */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M4 5l3-3 3 3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white/50 text-sm">Max Profit</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{maxProfit}</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M4 9l3 3 3-3" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white/50 text-sm">Max Loss</span>
          </div>
          <div className="text-2xl font-bold text-red-400">-{maxLoss}</div>
        </div>
      </div>

      {/* Mini payoff chart block */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Expected Price + P&L */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-white/40 text-xs mb-1">Expected Price at Expiry</div>
            <div className="flex items-baseline gap-2">
              <span className="text-white font-bold">${underlying.toFixed(2)}</span>
              <span className={cn("text-xs", expectedPnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                ({(((underlying - contract.strike) / contract.strike) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
          <div>
            <div className="text-white/40 text-xs mb-1">Expected P&amp;L</div>
            <div
              className={cn(
                "text-xl font-bold",
                expectedPnl >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {expectedPnl >= 0 ? "+" : ""}${(expectedPnl * 100).toFixed(0)}
            </div>
          </div>
        </div>

        <PayoffSVG contract={contract} underlying={underlying} />

        {/* Break-even / Entry / Time */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Break-even", value: `$${breakeven.toFixed(2)}` },
            { label: "Entry Cost", value: `$${(contract.price * 100).toFixed(0)}` },
            { label: "Time Left", value: `${daysLeft} day${daysLeft !== 1 ? "s" : ""}` },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.03] rounded-xl p-3 text-center"
            >
              <div className="text-white/40 text-[11px] mb-1">{s.label}</div>
              <div className="text-white font-bold text-sm">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Greeks */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          Greeks
          <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
            <Info size={10} className="text-white/40" />
          </span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <GreekCard
            label="Delta"
            value={String(contract.delta)}
            sub={contract.delta < 0 ? "Bearish sensitivity" : "Bullish sensitivity"}
            color={contract.delta < 0 ? "red" : "green"}
          />
          <GreekCard
            label="Theta"
            value={String(contract.theta)}
            sub="$/day decay"
            color="red"
          />
          <GreekCard
            label="Gamma"
            value={String(contract.gamma)}
            sub="Delta acceleration"
          />
          <GreekCard
            label="Vega"
            value={String(contract.vega)}
            sub="Volatility impact"
          />
        </div>
      </div>

      {/* Contract details */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <h3 className="text-white font-semibold text-sm mb-4">Contract Details</h3>
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
            <div
              key={k}
              className="flex justify-between py-1.5 border-b border-white/[0.05] last:border-0"
            >
              <span className="text-white/50">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PayoffTab({
  contract,
  underlying,
}: {
  contract: OptionContract;
  underlying: number;
}) {
  const isCall = contract.type === "CALL";
  const breakeven = isCall ? contract.strike + contract.price : contract.strike - contract.price;
  const daysLeft = Math.max(
    0,
    Math.round((new Date(contract.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6"
        style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <PayoffSVG contract={contract} underlying={underlying} interactive />

        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/[0.06]">
          {[
            { label: "Break-even", value: `$${breakeven.toFixed(2)}` },
            { label: "Entry Cost", value: `$${(contract.price * 100).toFixed(0)}` },
            { label: "Time Left", value: `${daysLeft} day${daysLeft !== 1 ? "s" : ""}` },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 text-center"
            >
              <div className="text-white/40 text-xs mb-1.5">{s.label}</div>
              <div className="text-white font-bold">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk profile */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <h3 className="text-white font-semibold text-sm mb-4">Risk Profile</h3>
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
            { label: "Breakeven at Expiry", value: `$${breakeven.toFixed(2)}`, color: "text-white" },
            { label: "Strike", value: `$${contract.strike.toLocaleString()}`, color: "text-white" },
          ].map((r) => (
            <div key={r.label} className="flex justify-between items-center py-3">
              <span className="text-white/50 text-sm">{r.label}</span>
              <span className={cn("font-semibold text-sm", r.color)}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

type Tab = "Overview" | "Candle Chart" | "Payoff";

export default function OptionLegDetailPage() {
  const params = useParams();
  const rawSymbol = Array.isArray(params.symbol) ? params.symbol[0] : (params.symbol ?? "");
  const contractId = Array.isArray(params.contractId)
    ? params.contractId[0]
    : (params.contractId ?? "");
  const symbol = rawSymbol.toUpperCase();

  const underlying = getBasePrice(symbol);
  const expiries = getExpiries(symbol);
  const [tab, setTab] = useState<Tab>("Overview");

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
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/40 text-lg mb-4">Contract not found</div>
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

  return (
    <div className="min-h-screen bg-[#0f0f11]">
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
          className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={15} />
          Option Chain
        </Link>
        <div className="w-px h-4 bg-white/10" />
        <div className="text-white/60 text-sm">
          {symbol} · {contract.expiry} ·{" "}
          <span className="font-medium text-white">${contract.strike}</span>{" "}
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

      <div className="max-w-[760px] mx-auto px-6 py-8">
        {/* Price header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-4xl font-bold text-white tabular-nums mb-1">
              ${contract.price.toFixed(2)}
            </div>
            <div
              className={cn(
                "text-sm font-medium",
                pos ? "text-emerald-400" : "text-red-400"
              )}
            >
              {pos ? "+" : ""}${contract.change.toFixed(2)} ({pos ? "+" : ""}
              {contract.changePct}%) today
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold",
                  isCall
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                )}
              >
                {contract.type}
              </span>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium",
                  contract.itm
                    ? "bg-white/10 text-white/70"
                    : "bg-white/[0.05] text-white/40"
                )}
              >
                {contract.itm ? "In the Money" : "Out of the Money"}
              </span>
              {expiry && (
                <span className="text-white/40 text-xs">
                  {expiry.daysToExpiry}d to expiry
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-white/40 mt-1">
            <div>Bid <span className="text-white/60">${contract.bid}</span></div>
            <div className="mt-0.5">Ask <span className="text-white/60">${contract.ask}</span></div>
            <div className="mt-0.5">Underlying <span className="text-white/60">${underlying.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Read-only notice */}
        <div
          className="flex items-start gap-2 rounded-xl px-4 py-3 mb-6 text-sm"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Info size={14} className="text-white/30 mt-0.5 shrink-0" />
          <span className="text-white/40">
            This is a read-only view. Trading is available on the Aspora mobile app.
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/[0.08] mb-6">
          {(["Overview", "Candle Chart", "Payoff"] as Tab[]).map((t) => (
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

        {/* Tab content */}
        {tab === "Overview" && (
          <OverviewTab contract={contract} underlying={underlying} />
        )}
        {tab === "Candle Chart" && (
          <CandleChart contract={contract} symbol={symbol} />
        )}
        {tab === "Payoff" && (
          <PayoffTab contract={contract} underlying={underlying} />
        )}

        {/* Register nudge */}
        <div className="mt-8 bg-gradient-to-br from-emerald-950/60 to-[#1c1c1e] border border-emerald-500/20 rounded-2xl p-6">
          <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Free to join
          </div>
          <h3 className="text-white font-bold text-base mb-1">
            Want to trade this option?
          </h3>
          <p className="text-white/50 text-sm mb-4">
            Open your Aspora account in under 15 minutes and start trading options, stocks, and ETFs — no minimums, no fees to start.
          </p>
          <a
            href="https://aspora.com/register"
            className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-400 transition-colors"
          >
            Create free account →
          </a>
        </div>

        {/* Back link */}
        <div className="mt-6 flex justify-center">
          <Link
            href={`/options/${symbol}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white/50 hover:text-white transition-colors"
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
