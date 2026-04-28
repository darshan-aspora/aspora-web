"use client";

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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

  const headerRef = useRef<HTMLDivElement>(null);
  const expiryRowRef = useRef<HTMLDivElement>(null);
  const legendRowRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const atmRowRef = useRef<HTMLTableRowElement>(null);
  const [tableHeight, setTableHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    function measure() {
      if (!tableContainerRef.current) return;
      const top = tableContainerRef.current.getBoundingClientRect().top;
      setTableHeight(window.innerHeight - top);
    }
    // slight delay so layout is fully painted
    const id = setTimeout(measure, 50);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(id); window.removeEventListener("resize", measure); };
  }, []);

  useEffect(() => {
    const container = tableContainerRef.current;
    const row = atmRowRef.current;
    if (!container || !row) return;
    const rowTop = row.offsetTop;
    const scrollTarget = rowTop - container.clientHeight / 2 + row.offsetHeight / 2;
    container.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
  }, [activeCode, tableHeight]);

  function CallCell({ contract }: { contract?: OptionContract }) {
    if (!contract) return <td className="px-3 py-3" />;
    const pos = contract.change >= 0;
    const itm = contract.itm;
    return (
      <td className={cn(
        "px-3 py-3 text-right",
        itm ? "bg-emerald-500/[0.08]" : ""
      )}>
        <Link
          href={`/options/${symbol}/${contract.contractId}`}
          className="block hover:bg-white/[0.06] rounded-lg px-2 py-1.5 -mx-2 transition-colors group"
        >
          <div className={cn("text-sm font-semibold group-hover:text-emerald-400 transition-colors", itm ? "text-emerald-300" : "text-white/70")}>
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

  function PutCell({ contract }: { contract?: OptionContract }) {
    if (!contract) return <td className="px-3 py-3" />;
    const pos = contract.change >= 0;
    const itm = contract.itm;
    return (
      <td className={cn(
        "px-3 py-3 text-left",
        itm ? "bg-red-500/[0.08]" : ""
      )}>
        <Link
          href={`/options/${symbol}/${contract.contractId}`}
          className="block hover:bg-white/[0.06] rounded-lg px-2 py-1.5 -mx-2 transition-colors group"
        >
          <div className={cn("text-sm font-semibold group-hover:text-red-400 transition-colors", itm ? "text-red-300" : "text-white/70")}>
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
        ref={headerRef}
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

      <div className="max-w-[1436px] mx-auto px-6 py-6">
        {/* Combined expiry row: category pills | separator | date pills */}
        <div ref={expiryRowRef} className="flex items-center gap-2 flex-wrap mb-4">
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
          <div className="w-px h-5 bg-white/20 mx-1" />
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

        {/* Legend — above the table */}
        <div ref={legendRowRef} className="flex items-center gap-5 mb-4 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/30 inline-block" />
            In the Money (calls)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/30 inline-block" />
            In the Money (puts)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-white/10 border border-emerald-500/30 inline-block" />
            At the Money
          </span>
          <span className="text-white/30">· Click any cell to view contract details</span>
        </div>

        {/* Chain table */}
        <div
          ref={tableContainerRef}
          className="rounded-2xl overflow-auto"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            height: tableHeight ? `${tableHeight}px` : "60vh",
          }}
        >
          <table className="text-xs border-collapse" style={{ minWidth: viewMode === "split" ? 1100 : 560, width: "100%" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {/* Call side label */}
                {(viewMode === "split" || viewMode === "calls") && (
                  <>
                    <th className="px-2 py-3 text-right text-emerald-400/60 text-[10px] font-semibold uppercase tracking-wider">Gamma</th>
                    <th className="px-2 py-3 text-right text-emerald-400/60 text-[10px] font-semibold uppercase tracking-wider">Vega</th>
                    <th className="px-2 py-3 text-right text-emerald-400/60 text-[10px] font-semibold uppercase tracking-wider">Theta</th>
                    <th className="px-2 py-3 text-right text-emerald-400/60 text-[10px] font-semibold uppercase tracking-wider">Delta</th>
                    <th className="px-2 py-3 text-right text-white/40 text-[10px] font-semibold uppercase tracking-wider">IV</th>
                    <th className="px-2 py-3 text-right text-emerald-400/60 text-[10px] font-semibold uppercase tracking-wider">OI</th>
                    <th className="px-3 py-3 text-right text-emerald-400/60 text-[10px] font-semibold uppercase tracking-wider">Call LTP</th>
                  </>
                )}
                {/* Strike */}
                <th className="px-4 py-3 text-center text-white/70 text-[10px] font-bold uppercase tracking-wider bg-white/[0.03] whitespace-nowrap">Strike</th>
                {/* Put side */}
                {(viewMode === "split" || viewMode === "puts") && (
                  <>
                    <th className="px-3 py-3 text-left text-red-400/60 text-[10px] font-semibold uppercase tracking-wider">Put LTP</th>
                    <th className="px-2 py-3 text-left text-red-400/60 text-[10px] font-semibold uppercase tracking-wider">OI</th>
                    <th className="px-2 py-3 text-left text-white/40 text-[10px] font-semibold uppercase tracking-wider">IV</th>
                    <th className="px-2 py-3 text-left text-red-400/60 text-[10px] font-semibold uppercase tracking-wider">Delta</th>
                    <th className="px-2 py-3 text-left text-red-400/60 text-[10px] font-semibold uppercase tracking-wider">Theta</th>
                    <th className="px-2 py-3 text-left text-red-400/60 text-[10px] font-semibold uppercase tracking-wider">Vega</th>
                    <th className="px-2 py-3 text-left text-red-400/60 text-[10px] font-semibold uppercase tracking-wider">Gamma</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {strikes.map((strike) => {
                const row = byStrikeType[strike];
                const isAtm = strike === atmStrike;
                const callItm = row?.call?.itm ?? false;
                const putItm = row?.put?.itm ?? false;
                const dash = <span className="text-white/20">—</span>;

                return (
                  <tr
                    key={strike}
                    ref={isAtm ? atmRowRef : undefined}
                    className={cn(
                      "border-b transition-colors",
                      isAtm
                        ? "bg-white/[0.06] border-emerald-500/30"
                        : "border-white/[0.04] hover:bg-white/[0.02]"
                    )}
                    style={isAtm ? {
                      borderTop: "1px solid rgba(52,211,153,0.25)",
                      borderBottom: "1px solid rgba(52,211,153,0.25)",
                    } : undefined}
                  >
                    {/* ── CALL side ── */}
                    {(viewMode === "split" || viewMode === "calls") && (
                      <>
                        {/* Gamma */}
                        <td className={cn("px-2 py-2.5 text-right tabular-nums text-white/50", callItm ? "bg-emerald-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.call?.contractId ?? ""}`} className={row?.call ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.call ? row.call.gamma : dash}
                          </Link>
                        </td>
                        {/* Vega */}
                        <td className={cn("px-2 py-2.5 text-right tabular-nums text-white/50", callItm ? "bg-emerald-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.call?.contractId ?? ""}`} className={row?.call ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.call ? row.call.vega : dash}
                          </Link>
                        </td>
                        {/* Theta */}
                        <td className={cn("px-2 py-2.5 text-right tabular-nums text-red-400/80", callItm ? "bg-emerald-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.call?.contractId ?? ""}`} className={row?.call ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.call ? row.call.theta : dash}
                          </Link>
                        </td>
                        {/* Delta */}
                        <td className={cn("px-2 py-2.5 text-right tabular-nums text-emerald-400/90 font-medium", callItm ? "bg-emerald-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.call?.contractId ?? ""}`} className={row?.call ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.call ? row.call.delta : dash}
                          </Link>
                        </td>
                        {/* IV */}
                        <td className={cn("px-2 py-2.5 text-right tabular-nums text-white/60", callItm ? "bg-emerald-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.call?.contractId ?? ""}`} className={row?.call ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.call ? `${row.call.iv}%` : dash}
                          </Link>
                        </td>
                        {/* OI */}
                        <td className={cn("px-2 py-2.5 text-right tabular-nums text-white/50", callItm ? "bg-emerald-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.call?.contractId ?? ""}`} className={row?.call ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.call ? row.call.oi : dash}
                          </Link>
                        </td>
                        {/* Call LTP */}
                        <CallCell contract={row?.call} />
                      </>
                    )}

                    {/* ── Strike ── */}
                    <td className={cn(
                      "px-4 py-2.5 text-center font-bold text-sm bg-white/[0.03] whitespace-nowrap",
                      isAtm ? "bg-emerald-400/10 text-emerald-400" : "text-white"
                    )}>
                      {isAtm && <span className="block text-[8px] text-emerald-400/60 uppercase tracking-wider -mb-0.5">ATM</span>}
                      {strike.toLocaleString()}
                    </td>

                    {/* ── PUT side ── */}
                    {(viewMode === "split" || viewMode === "puts") && (
                      <>
                        {/* Put LTP */}
                        <PutCell contract={row?.put} />
                        {/* OI */}
                        <td className={cn("px-2 py-2.5 text-left tabular-nums text-white/50", putItm ? "bg-red-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.put?.contractId ?? ""}`} className={row?.put ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.put ? row.put.oi : dash}
                          </Link>
                        </td>
                        {/* IV */}
                        <td className={cn("px-2 py-2.5 text-left tabular-nums text-white/60", putItm ? "bg-red-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.put?.contractId ?? ""}`} className={row?.put ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.put ? `${row.put.iv}%` : dash}
                          </Link>
                        </td>
                        {/* Delta */}
                        <td className={cn("px-2 py-2.5 text-left tabular-nums text-red-400/80 font-medium", putItm ? "bg-red-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.put?.contractId ?? ""}`} className={row?.put ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.put ? row.put.delta : dash}
                          </Link>
                        </td>
                        {/* Theta */}
                        <td className={cn("px-2 py-2.5 text-left tabular-nums text-red-400/80", putItm ? "bg-red-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.put?.contractId ?? ""}`} className={row?.put ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.put ? row.put.theta : dash}
                          </Link>
                        </td>
                        {/* Vega */}
                        <td className={cn("px-2 py-2.5 text-left tabular-nums text-white/50", putItm ? "bg-red-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.put?.contractId ?? ""}`} className={row?.put ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.put ? row.put.vega : dash}
                          </Link>
                        </td>
                        {/* Gamma */}
                        <td className={cn("px-2 py-2.5 text-left tabular-nums text-white/50", putItm ? "bg-red-500/[0.08]" : "")}>
                          <Link href={`/options/${symbol}/${row?.put?.contractId ?? ""}`} className={row?.put ? "block w-full h-full" : "pointer-events-none"}>
                            {row?.put ? row.put.gamma : dash}
                          </Link>
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
