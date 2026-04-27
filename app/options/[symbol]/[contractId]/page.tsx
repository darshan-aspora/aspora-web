"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getContracts,
  getExpiries,
  getBasePrice,
  type OptionContract,
} from "@/app/options/_data/options-data";

function MetricCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: "green" | "red" }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="text-white/50 text-xs mb-1.5 uppercase tracking-wider">{label}</div>
      <div className={cn(
        "text-xl font-bold",
        highlight === "green" ? "text-emerald-400" : highlight === "red" ? "text-red-400" : "text-white"
      )}>{value}</div>
      {sub && <div className="text-white/40 text-xs mt-1">{sub}</div>}
    </div>
  );
}

function GreekBar({ label, value, min, max, tooltip }: { label: string; value: number; min: number; max: number; tooltip: string }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 text-white/50 text-xs text-right shrink-0">{label}</div>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-16 text-white text-xs text-right shrink-0">{value}</div>
      <div className="text-white/30 text-[10px] shrink-0 hidden md:block max-w-[140px] truncate">{tooltip}</div>
    </div>
  );
}

function PayoffChart({ contract, underlying }: { contract: OptionContract; underlying: number }) {
  const isCall = contract.type === "CALL";
  const strike = contract.strike;
  const premium = contract.price;

  // Generate payoff curve points at expiry (buyer perspective)
  const min = underlying * 0.8;
  const max = underlying * 1.2;
  const points: { x: number; y: number }[] = [];
  for (let p = min; p <= max; p += (max - min) / 60) {
    let intrinsic = 0;
    if (isCall) intrinsic = Math.max(0, p - strike);
    else intrinsic = Math.max(0, strike - p);
    points.push({ x: p, y: intrinsic - premium });
  }

  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));
  const range = maxY - minY || 1;
  const W = 400, H = 140;

  const toSvg = (x: number, y: number) => ({
    sx: ((x - min) / (max - min)) * W,
    sy: H - ((y - minY) / range) * H,
  });

  const breakeven = isCall ? strike + premium : strike - premium;
  const { sx: beSx } = toSvg(breakeven, 0);
  const { sy: zeroSy } = toSvg(min, 0);

  const pathD = points.map((p, i) => {
    const { sx, sy } = toSvg(p.x, p.y);
    return `${i === 0 ? "M" : "L"} ${sx} ${sy}`;
  }).join(" ");

  const underlyingX = toSvg(underlying, 0).sx;

  return (
    <div className="rounded-2xl p-5" style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Payoff at Expiry</h3>
        <span className="text-white/40 text-xs">Breakeven: ${breakeven.toFixed(2)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
        {/* Zero line */}
        <line x1={0} y1={zeroSy} x2={W} y2={zeroSy} stroke="rgba(255,255,255,0.1)" strokeDasharray="4,4" />
        {/* Payoff path */}
        <path d={pathD} fill="none" stroke={isCall ? "#34d399" : "#f87171"} strokeWidth={2} />
        {/* Underlying marker */}
        <line x1={underlyingX} y1={0} x2={underlyingX} y2={H} stroke="rgba(255,255,255,0.2)" strokeDasharray="3,3" />
        <text x={underlyingX + 3} y={12} fill="rgba(255,255,255,0.4)" fontSize={9}>Current</text>
        {/* Breakeven marker */}
        <line x1={beSx} y1={0} x2={beSx} y2={H} stroke={isCall ? "#34d399" : "#f87171"} strokeDasharray="3,3" strokeOpacity={0.5} />
        <text x={beSx + 3} y={H - 4} fill={isCall ? "#34d399" : "#f87171"} fontSize={9} opacity={0.7}>BE</text>
      </svg>
      <div className="flex justify-between text-white/30 text-[10px] mt-1">
        <span>${Math.round(min)}</span>
        <span>Underlying Price</span>
        <span>${Math.round(max)}</span>
      </div>
    </div>
  );
}

export default function OptionLegDetailPage() {
  const params = useParams();
  const rawSymbol = Array.isArray(params.symbol) ? params.symbol[0] : (params.symbol ?? "");
  const contractId = Array.isArray(params.contractId) ? params.contractId[0] : (params.contractId ?? "");
  const symbol = rawSymbol.toUpperCase();

  const underlying = getBasePrice(symbol);
  const expiries = getExpiries(symbol);

  const contract: OptionContract | undefined = useMemo(() => {
    // contractId format: SYMBOL-EXPIRYCODE-STRIKE-TYPE
    const parts = contractId.split("-");
    if (parts.length < 4) return undefined;
    // symbol may contain dots, so find expiryCode by pattern
    const typeStr = parts[parts.length - 1] as "CALL" | "PUT";
    const strikeStr = parts[parts.length - 2];
    const expiryCode = parts[parts.length - 3];
    const contracts = getContracts(symbol, expiryCode);
    return contracts.find(c => c.strike === parseFloat(strikeStr) && c.type === typeStr);
  }, [symbol, contractId]);

  if (!contract) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/40 text-lg mb-4">Contract not found</div>
          <Link href={`/options/${symbol}`} className="text-emerald-400 text-sm hover:underline">
            ← Back to chain
          </Link>
        </div>
      </div>
    );
  }

  const isCall = contract.type === "CALL";
  const pos = contract.change >= 0;
  const expiry = expiries.find(e => e.code === contract.expiryCode);
  const breakeven = isCall ? contract.strike + contract.price : contract.strike - contract.price;
  const maxProfit = isCall ? "Unlimited" : `$${(contract.strike - contract.price).toFixed(2)} per share`;
  const maxLoss = `$${contract.price.toFixed(2)} per share (premium paid)`;

  return (
    <div className="min-h-screen bg-[#0f0f11]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 px-6 py-3 flex items-center gap-4"
        style={{ background: "#0f0f11", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href={`/options/${symbol}`}
          className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm">
          <ArrowLeft size={15} />
          Option Chain
        </Link>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">{symbol}</span>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-bold",
            isCall ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          )}>{contract.type}</span>
          <span className="text-white/50 text-sm">{contract.expiry} · ${contract.strike}</span>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {symbol} {contract.expiry} ${contract.strike} {contract.type}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-white/50 text-sm">Underlying: ${underlying.toLocaleString()}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  contract.itm
                    ? isCall ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                    : "bg-white/10 text-white/50"
                )}>
                  {contract.itm ? "In the Money" : "Out of the Money"}
                </span>
                {expiry && (
                  <span className="text-white/40 text-xs">{expiry.daysToExpiry} days to expiry</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-white">${contract.price.toFixed(2)}</div>
              <div className={cn("text-sm mt-1", pos ? "text-emerald-400" : "text-red-400")}>
                {pos ? "+" : ""}{contract.change.toFixed(2)} ({pos ? "+" : ""}{contract.changePct}%) today
              </div>
              <div className="text-white/40 text-xs mt-1">
                Bid ${contract.bid} · Ask ${contract.ask}
              </div>
            </div>
          </div>

          {/* Info notice */}
          <div className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Info size={14} className="text-white/40 mt-0.5 shrink-0" />
            <span className="text-white/50">
              This is a read-only view of option contract data. Trading is available on the Aspora mobile app.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-5">
            {/* Payoff chart */}
            <PayoffChart contract={contract} underlying={underlying} />

            {/* Greeks */}
            <div className="rounded-2xl p-5 space-y-3"
              style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-white font-semibold text-sm mb-4">Greeks</h3>
              <GreekBar label="Delta" value={Math.abs(contract.delta)} min={0} max={1}
                tooltip={isCall ? "Rate of price change vs underlying" : "Rate of price change vs underlying"} />
              <GreekBar label="Gamma" value={contract.gamma} min={0} max={0.05}
                tooltip="Rate of delta change" />
              <GreekBar label="IV" value={contract.iv / 100} min={0} max={1}
                tooltip="Implied volatility" />
              <div className="pt-1 grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="text-white/40 text-[11px] uppercase tracking-wider mb-1">Theta</div>
                  <div className="text-red-400 font-semibold">{contract.theta}</div>
                  <div className="text-white/30 text-[10px] mt-0.5">Daily time decay</div>
                </div>
                <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="text-white/40 text-[11px] uppercase tracking-wider mb-1">Vega</div>
                  <div className="text-white font-semibold">{contract.vega}</div>
                  <div className="text-white/30 text-[10px] mt-0.5">Per 1% IV change</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-5">
            {/* Key metrics grid */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Option Price" value={`$${contract.price.toFixed(2)}`}
                sub={`Bid $${contract.bid} / Ask $${contract.ask}`} />
              <MetricCard label="Implied Volatility" value={`${contract.iv}%`}
                sub="Annualized" />
              <MetricCard label="Open Interest" value={contract.oi}
                sub="Total open contracts" />
              <MetricCard label="Volume (Today)" value={contract.volume}
                sub="Contracts traded" />
              <MetricCard label="Breakeven" value={`$${breakeven.toFixed(2)}`}
                sub="At expiry" highlight={isCall ? "green" : "red"} />
              <MetricCard label="Delta" value={`${contract.delta}`}
                sub="Price sensitivity" />
            </div>

            {/* Risk profile */}
            <div className="rounded-2xl p-5"
              style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-white font-semibold text-sm mb-4">Risk Profile (Long {contract.type})</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-white/50 text-sm">Max Profit</span>
                  <span className="text-emerald-400 font-semibold text-sm">{maxProfit}</span>
                </div>
                <div className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-white/50 text-sm">Max Loss</span>
                  <span className="text-red-400 font-semibold text-sm">{maxLoss}</span>
                </div>
                <div className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-white/50 text-sm">Breakeven at Expiry</span>
                  <span className="text-white font-semibold text-sm">${breakeven.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/50 text-sm">Strike</span>
                  <span className="text-white font-semibold text-sm">${contract.strike.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Contract details */}
            <div className="rounded-2xl p-5"
              style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-white font-semibold text-sm mb-4">Contract Details</h3>
              <div className="space-y-2.5 text-sm">
                {[
                  ["Underlying", symbol],
                  ["Contract Type", contract.type],
                  ["Expiry", contract.expiry],
                  ["Strike Price", `$${contract.strike.toLocaleString()}`],
                  ["Contract Size", "100 shares"],
                  ["Exercise Style", "American"],
                  ["Settlement", "Physical delivery"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-white/50">{k}</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Back to chain */}
        <div className="mt-8 flex justify-center">
          <Link href={`/options/${symbol}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white/60 hover:text-white transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
            <ArrowLeft size={14} />
            Back to {symbol} Option Chain
          </Link>
        </div>
      </div>
    </div>
  );
}
