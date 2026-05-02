"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getPopularOptions,
  getExpiries,
  getCumulativeOIStats,
  getBasePrice,
  type ExpiryType,
} from "@/app/options/_data/options-data";

/**
 * Small accessible info tooltip — opens on hover or focus (desktop) and on tap (touch).
 * Trigger is a small `i` circle that matches the visual the design originally had.
 */
function InfoTooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-[10px] leading-none hover:border-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
      >
        i
      </button>
      <span
        role="tooltip"
        className={cn(
          "absolute z-20 left-0 top-full mt-2 w-64 rounded-xl bg-gray-900 text-white text-xs leading-relaxed font-normal px-3.5 py-3 shadow-lg shadow-black/10 transition-opacity duration-150 pointer-events-none",
          open ? "opacity-100" : "opacity-0"
        )}
      >
        <span className="block text-gray-300 text-[10px] uppercase tracking-wider font-semibold mb-1">
          {label}
        </span>
        {children}
      </span>
    </span>
  );
}

interface InstrumentOptionsTabProps {
  /** Display symbol shown in copy (e.g. "PLTR", "SPX") */
  symbol: string;
  /** Symbol used for option data lookups and links (defaults to `symbol`). Useful for indices that map to a different option chain ticker. */
  optSymbol?: string;
}

/**
 * Shared options tab used on stock, index, and ETF detail pages.
 *
 * Left card: popular options for the underlying, with a Daily/Weekly/Monthly/Quarterly
 * expiry-type pill selector that filters the list.
 *
 * Right card: Key Information — Open Interest breakdown (Total Call OI, Put:Call ratio,
 * Total Put OI) with a calls-vs-puts split bar, a lot-stats trio (Lot Size, Buy Price,
 * Sell Margin), and an "Option Chain" CTA.
 */
export function InstrumentOptionsTab({ symbol, optSymbol }: InstrumentOptionsTabProps) {
  const dataSymbol = optSymbol ?? symbol;
  const expiries = getExpiries(dataSymbol);
  const allTypes: ExpiryType[] = ["Daily", "Weekly", "Monthly", "Quarterly"];
  const availableTypes = allTypes.filter((t) => expiries.some((e) => e.type === t));
  const [selectedType, setSelectedType] = useState<ExpiryType>(availableTypes[0]);
  const selectedExpiry = expiries.find((e) => e.type === selectedType) ?? expiries[0];
  const options = getPopularOptions(dataSymbol, 7, selectedExpiry.code);
  // Key Information shows cumulative OI across the entire chain — independent of
  // the expiry-type pill selection in the popular-options widget on the left.
  const oi = getCumulativeOIStats(dataSymbol);
  const underlying = getBasePrice(dataSymbol);
  const lotSize = 100;
  const sellMarginPerLot = Math.round(underlying * 0.12 * lotSize);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      {/* Left — Popular options with expiry-type selector */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-900 font-semibold">Popular {symbol} Options</h3>
          <span className="text-gray-400 text-xs">
            {selectedExpiry.label} · {selectedExpiry.daysToExpiry}d
          </span>
        </div>
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {availableTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                t === selectedType
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:text-gray-900 hover:border-gray-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="divide-y divide-gray-200/70">
          {options.map((opt) => {
            const pos = opt.change >= 0;
            return (
              <Link
                key={opt.contractId}
                href={`/options/${dataSymbol}/${opt.contractId}`}
                className="flex items-center justify-between py-3.5 hover:bg-black/[0.03] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-1 self-stretch rounded-full mt-0.5"
                    style={{ background: opt.type === "CALL" ? "#34d399" : "#f87171" }}
                  />
                  <div>
                    <div className="text-gray-400 text-[11px] uppercase tracking-wider">
                      Underlying {opt.symbol} {opt.strike}
                    </div>
                    <div className="text-gray-900 font-semibold text-sm mt-0.5">
                      {opt.expiry} {opt.strike} {opt.type}
                    </div>
                    <div className="text-gray-400 text-[11px] mt-0.5">OI: {opt.oi}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-900 font-bold">${opt.price.toFixed(2)}</div>
                  <div className={cn("text-xs mt-0.5", pos ? "text-emerald-500" : "text-red-400")}>
                    {pos ? "+" : ""}${opt.change.toFixed(2)} ({pos ? "+" : ""}
                    {opt.changePct}%)
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <Link
          href={`/options/${dataSymbol}?expiry=${selectedExpiry.code}`}
          className="block mt-4 text-center text-sm text-emerald-500 hover:text-emerald-600 transition-colors"
        >
          View all strikes →
        </Link>
      </div>

      {/* Right — Key Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col gap-5">
        <h3 className="text-gray-900 font-semibold">Key Information</h3>

        {/* Open Interest */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-gray-900 font-semibold text-sm">Open Interest (OI)</span>
            <InfoTooltip label="What is Open Interest?">
              The total number of outstanding option contracts — puts and calls — that
              have been opened but not yet closed, exercised, or expired. Higher OI
              means more active positions and tighter liquidity at that strike.
            </InfoTooltip>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            <div>
              <div className="text-gray-500 text-xs">Total Call OI</div>
              <div className="text-emerald-500 font-bold text-lg tabular-nums">
                {oi.totalCallOI.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500 text-xs">Put:Call ratio</div>
              <div className="text-gray-900 font-bold text-lg tabular-nums">
                {oi.putCallRatio.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-xs">Total Put OI</div>
              <div className="text-red-400 font-bold text-lg tabular-nums">
                {oi.totalPutOI.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden flex bg-gray-200">
            <div className="bg-emerald-500 h-full" style={{ width: `${oi.callPct}%` }} />
            <div className="bg-red-400 h-full" style={{ width: `${oi.putPct}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-emerald-500 text-xs font-medium">Calls {oi.callPct}%</span>
            <span className="text-red-400 text-xs font-medium">Puts {oi.putPct}%</span>
          </div>
        </div>

        {/* Lot stats */}
        <div className="grid grid-cols-3 divide-x divide-gray-200 bg-white rounded-xl border border-gray-200">
          <div className="px-3 py-3">
            <div className="text-gray-500 text-xs mb-1">Lot Size</div>
            <div className="text-gray-900 font-bold text-sm">1 Lot = {lotSize}</div>
          </div>
          <div className="px-3 py-3 text-center">
            <div className="text-gray-500 text-xs mb-1">Buy Price</div>
            <div className="text-gray-900 font-bold text-sm">Premium × {lotSize}</div>
          </div>
          <div className="px-3 py-3 text-right">
            <div className="text-gray-500 text-xs mb-1">Sell Margin</div>
            <div className="text-gray-900 font-bold text-sm">~${sellMarginPerLot.toLocaleString()} / Lot</div>
          </div>
        </div>

        {/* CTA — opens the full chain, no expiry filter applied */}
        <Link
          href={`/options/${dataSymbol}`}
          className="block w-full text-center rounded-xl bg-gray-900 text-white font-bold py-3 text-sm hover:opacity-90 transition-opacity"
        >
          Option Chain →
        </Link>
      </div>
    </div>
  );
}
