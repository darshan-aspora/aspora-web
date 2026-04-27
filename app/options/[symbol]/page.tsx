"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getContracts,
  getExpiries,
  getBasePrice,
  type OptionContract,
  type ExpiryType,
} from "@/app/options/_data/options-data";

const EXPIRY_TYPE_LABELS: ExpiryType[] = ["Daily", "Weekly", "Monthly", "Quarterly"];

type ViewMode = "split" | "calls" | "puts";

export default function OptionsChainPage() {
  const params = useParams();
  const rawSymbol = Array.isArray(params.symbol) ? params.symbol[0] : (params.symbol ?? "");
  const symbol = rawSymbol.toUpperCase();

  const expiries = getExpiries(symbol);
  const underlying = getBasePrice(symbol);

  const [selectedExpiry, setSelectedExpiry] = useState(expiries[0].code);
  const [expiryType, setExpiryType] = useState<ExpiryType>("Daily");
  const [viewMode, setViewMode] = useState<ViewMode>("split");

  const filteredExpiries = expiries.filter(e => e.type === expiryType);
  const activeExpiry = filteredExpiries.find(e => e.code === selectedExpiry) ?? filteredExpiries[0];
  const activeCode = activeExpiry?.code ?? expiries[0].code;

  const contracts = useMemo(() => getContracts(symbol, activeCode), [symbol, activeCode]);

  const strikes = useMemo(() => {
    const s = new Set(contracts.map(c => c.strike));
    return [...s].sort((a, b) => a - b);
  }, [contracts]);

  const byStrikeType = useMemo(() => {
    const m: Record<number, { call?: OptionContract; put?: OptionContract }> = {};
    for (const c of contracts) {
      if (!m[c.strike]) m[c.strike] = {};
      if (c.type === "CALL") m[c.strike].call = c;
      else m[c.strike].put = c;
    }
    return m;
  }, [contracts]);

  const atmStrike = useMemo(
    () => strikes.reduce((prev, cur) => (Math.abs(cur - underlying) < Math.abs(prev - underlying) ? cur : prev), strikes[0]),
    [strikes, underlying]
  );

  function ContractCell({ contract, side }: { contract?: OptionContract; side: "call" | "put" }) {
    if (!contract) return <td className="px-3 py-3" />;
    const pos = contract.change >= 0;
    return (
      <td className={cn(
        "px-3 py-3 text-right",
        side === "call" ? "text-right" : "text-left",
        contract.itm ? "bg-emerald-500/[0.04]" : ""
      )}>
        <Link
          href={`/options/${symbol}/${contract.contractId}`}
          className="block hover:bg-white/[0.06] rounded-lg px-2 py-1.5 -mx-2 transition-colors group"
        >
          <div className="text-white text-sm font-semibold group-hover:text-emerald-400 transition-colors">
            ${contract.price.toFixed(2)}
          </div>
          <div className={cn("text-xs mt-0.5", pos ? "text-emerald-400" : "text-red-400")}>
            {pos ? "+" : ""}{contract.change.toFixed(2)} ({pos ? "+" : ""}{contract.changePct}%)
          </div>
          <div className="text-white/40 text-[11px] mt-1">
            OI: {contract.oi} · Vol: {contract.volume}
          </div>
          <div className="text-white/40 text-[11px]">
            IV: {contract.iv}% · Δ {contract.delta}
          </div>
        </Link>
      </td>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f11]">
      {/* Top bar */}
      <div
        className="sticky top-0 z-40 px-6 py-3 flex items-center justify-between"
        style={{ background: "#0f0f11", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-4">
          <Link
            href={`/stocks/${symbol}`}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={15} />
            Back to {symbol}
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div>
            <span className="text-white font-bold">{symbol}</span>
            <span className="text-white/50 text-sm ml-2">
              Underlying: <span className="text-white">${underlying.toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.06)" }}>
          {(["split", "calls", "puts"] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors",
                viewMode === v ? "bg-white text-neutral-900" : "text-white/60 hover:text-white"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Expiry type filter */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-white/50 text-sm mr-1">Expiry:</span>
          {EXPIRY_TYPE_LABELS.map(type => (
            <button
              key={type}
              onClick={() => {
                setExpiryType(type);
                const first = expiries.find(e => e.type === type);
                if (first) setSelectedExpiry(first.code);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
                expiryType === type
                  ? "bg-white text-neutral-900"
                  : "border border-white/10 text-white/60 hover:text-white"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Expiry date selector */}
        <div className="flex items-center gap-2 mb-6">
          {filteredExpiries.map(e => (
            <button
              key={e.code}
              onClick={() => setSelectedExpiry(e.code)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm transition-colors",
                activeCode === e.code
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "border border-white/10 text-white/50 hover:text-white hover:border-white/20"
              )}
            >
              {e.label}
              <span className="ml-1.5 text-xs opacity-60">{e.daysToExpiry}d</span>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/10 border border-emerald-500/20 inline-block" />
            In the Money
          </span>
          <span>Click any contract to view details</span>
        </div>

        {/* Chain table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {(viewMode === "split" || viewMode === "calls") && (
                  <>
                    <th className="px-3 py-3 text-right text-white/40 text-xs font-medium uppercase tracking-wider">
                      Call Price
                    </th>
                    <th className="px-3 py-3 text-right text-white/40 text-xs font-medium uppercase tracking-wider">
                      OI / Volume
                    </th>
                    <th className="px-3 py-3 text-right text-white/40 text-xs font-medium uppercase tracking-wider">
                      IV / Delta
                    </th>
                  </>
                )}
                <th className="px-5 py-3 text-center text-white/70 text-xs font-bold uppercase tracking-wider bg-white/[0.03]">
                  Strike
                </th>
                {(viewMode === "split" || viewMode === "puts") && (
                  <>
                    <th className="px-3 py-3 text-left text-white/40 text-xs font-medium uppercase tracking-wider">
                      IV / Delta
                    </th>
                    <th className="px-3 py-3 text-left text-white/40 text-xs font-medium uppercase tracking-wider">
                      OI / Volume
                    </th>
                    <th className="px-3 py-3 text-left text-white/40 text-xs font-medium uppercase tracking-wider">
                      Put Price
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {strikes.map((strike, i) => {
                const row = byStrikeType[strike];
                const isAtm = strike === atmStrike;
                const callItm = row?.call?.itm ?? false;
                const putItm = row?.put?.itm ?? false;

                return (
                  <tr
                    key={strike}
                    className={cn(
                      "border-b transition-colors",
                      isAtm
                        ? "border-emerald-500/30"
                        : "border-white/[0.04] hover:bg-white/[0.02]"
                    )}
                    style={isAtm ? { borderTop: "1px solid rgba(52,211,153,0.3)" } : undefined}
                  >
                    {(viewMode === "split" || viewMode === "calls") && (
                      <>
                        <td className={cn("px-3 py-2.5 text-right", callItm && "bg-emerald-500/[0.03]")}>
                          {row?.call ? (
                            <Link href={`/options/${symbol}/${row.call.contractId}`}
                              className="block hover:bg-white/[0.06] rounded-lg px-2 py-1 -mx-2 transition-colors group text-right">
                              <div className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                                ${row.call.price.toFixed(2)}
                              </div>
                              <div className={cn("text-xs", row.call.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                                {row.call.change >= 0 ? "+" : ""}{row.call.change.toFixed(2)} ({row.call.change >= 0 ? "+" : ""}{row.call.changePct}%)
                              </div>
                            </Link>
                          ) : <span className="text-white/20">—</span>}
                        </td>
                        <td className={cn("px-3 py-2.5 text-right text-white/50 text-xs", callItm && "bg-emerald-500/[0.03]")}>
                          {row?.call && <><div>{row.call.oi}</div><div className="text-white/30">{row.call.volume}</div></>}
                        </td>
                        <td className={cn("px-3 py-2.5 text-right text-white/50 text-xs", callItm && "bg-emerald-500/[0.03]")}>
                          {row?.call && <><div>{row.call.iv}%</div><div className="text-white/30">Δ {row.call.delta}</div></>}
                        </td>
                      </>
                    )}

                    {/* Strike */}
                    <td className={cn(
                      "px-5 py-2.5 text-center font-bold text-sm bg-white/[0.03]",
                      isAtm ? "text-emerald-400" : "text-white"
                    )}>
                      {isAtm && <span className="block text-[9px] text-emerald-400/70 uppercase tracking-wider mb-0.5">ATM</span>}
                      {strike.toLocaleString()}
                    </td>

                    {(viewMode === "split" || viewMode === "puts") && (
                      <>
                        <td className={cn("px-3 py-2.5 text-left text-white/50 text-xs", putItm && "bg-red-500/[0.03]")}>
                          {row?.put && <><div>{row.put.iv}%</div><div className="text-white/30">Δ {row.put.delta}</div></>}
                        </td>
                        <td className={cn("px-3 py-2.5 text-left text-white/50 text-xs", putItm && "bg-red-500/[0.03]")}>
                          {row?.put && <><div>{row.put.oi}</div><div className="text-white/30">{row.put.volume}</div></>}
                        </td>
                        <td className={cn("px-3 py-2.5 text-left", putItm && "bg-red-500/[0.03]")}>
                          {row?.put ? (
                            <Link href={`/options/${symbol}/${row.put.contractId}`}
                              className="block hover:bg-white/[0.06] rounded-lg px-2 py-1 -mx-2 transition-colors group">
                              <div className="text-white font-semibold group-hover:text-red-400 transition-colors">
                                ${row.put.price.toFixed(2)}
                              </div>
                              <div className={cn("text-xs", row.put.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                                {row.put.change >= 0 ? "+" : ""}{row.put.change.toFixed(2)} ({row.put.change >= 0 ? "+" : ""}{row.put.changePct}%)
                              </div>
                            </Link>
                          ) : <span className="text-white/20">—</span>}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Options data is for informational purposes only. Aspora does not facilitate options trading on this platform.
        </p>
      </div>
    </div>
  );
}
