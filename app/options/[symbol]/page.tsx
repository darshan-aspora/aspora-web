"use client";

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
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

  const maxOI = useMemo(() => {
    let m = 1;
    for (const c of contracts) {
      const v = parseInt(String(c.oi).replace(/[KMk]/g, (s) => s.toLowerCase() === "k" ? "000" : "000000")) || 0;
      if (v > m) m = v;
    }
    return m;
  }, [contracts]);

  function parseOI(oi: string | number): number {
    const s = String(oi);
    if (s.endsWith("M") || s.endsWith("m")) return parseFloat(s) * 1_000_000;
    if (s.endsWith("K") || s.endsWith("k")) return parseFloat(s) * 1_000;
    return parseFloat(s) || 0;
  }

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

  function OIBar({ oi, side }: { oi: string | number; side: "call" | "put" }) {
    const pct = Math.min(100, Math.round((parseOI(oi) / maxOI) * 100));
    return (
      <div className="mt-1.5 h-[3px] w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className={cn("h-full rounded-full", side === "call" ? "bg-red-400/60 ml-auto" : "bg-emerald-400/60")}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  }

  function CallCell({ contract, onNavigate }: { contract?: OptionContract; onNavigate?: () => void }) {
    if (!contract) return <td className="px-3 py-2.5" />;
    const pos = contract.change >= 0;
    const itm = contract.itm;
    return (
      <td
        onClick={onNavigate}
        className={cn("px-3 py-2.5 text-right", itm ? "bg-emerald-500/[0.07]" : "", onNavigate ? "cursor-pointer hover:bg-white/[0.04]" : "")}
      >
        <div className={cn("text-sm font-semibold", itm ? "text-white" : "text-white/60")}>
          ${contract.price.toFixed(2)}
        </div>
        <div className={cn("text-xs mt-0.5", pos ? "text-emerald-400" : "text-red-400")}>
          {pos ? "+" : ""}{contract.change.toFixed(2)} ({pos ? "+" : ""}{contract.changePct}%)
        </div>
        <OIBar oi={contract.oi} side="call" />
      </td>
    );
  }

  function PutCell({ contract, onNavigate }: { contract?: OptionContract; onNavigate?: () => void }) {
    if (!contract) return <td className="px-3 py-2.5" />;
    const pos = contract.change >= 0;
    const itm = contract.itm;
    return (
      <td
        onClick={onNavigate}
        className={cn("px-3 py-2.5 text-left", itm ? "bg-emerald-500/[0.07]" : "", onNavigate ? "cursor-pointer hover:bg-white/[0.04]" : "")}
      >
        <div className={cn("text-sm font-semibold", itm ? "text-white" : "text-white/60")}>
          ${contract.price.toFixed(2)}
        </div>
        <div className={cn("text-xs mt-0.5", pos ? "text-emerald-400" : "text-red-400")}>
          {pos ? "+" : ""}{contract.change.toFixed(2)} ({pos ? "+" : ""}{contract.changePct}%)
        </div>
        <OIBar oi={contract.oi} side="put" />
      </td>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f11]">
      {/* Top bar */}
      <div
        ref={headerRef}
        className="sticky top-0 z-40"
        style={{ background: "#0f0f11", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-[1436px] mx-auto px-6 py-3 flex items-center justify-between">
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
        <div ref={legendRowRef} className="flex items-center gap-4 mb-4 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-white/70">ITM</span> In The Money
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/40 inline-block" />
            <span className="text-white/70">ATM</span> At The Money
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="text-white/70">OTM</span> Out of Money
          </span>
          <span className="flex items-center gap-3 ml-2">
            <span className="flex items-center gap-1"><span className="w-6 h-[3px] rounded-full bg-red-400/60 inline-block" /> Call OI</span>
            <span className="flex items-center gap-1"><span className="w-6 h-[3px] rounded-full bg-emerald-400/60 inline-block" /> Put OI</span>
          </span>
        </div>

        {/* Chain table */}
        <div
          className="rounded-2xl flex flex-col"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            height: tableHeight ? `${tableHeight}px` : "60vh",
          }}
        >
          {/* Scrollable body only */}
          <div ref={tableContainerRef} className="overflow-auto flex-1 min-h-0">
          <table className="text-xs border-collapse" style={{ minWidth: viewMode === "split" ? 1100 : 560, width: "100%" }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ background: "rgba(20,20,22,1)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
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
                    {(viewMode === "split" || viewMode === "calls") && (() => {
                      const callHref = row?.call ? `/options/${symbol}/${row.call.contractId}` : null;
                      const callClick = callHref ? () => router.push(callHref) : undefined;
                      const callTd = (extra: string, content: React.ReactNode) => (
                        <td
                          onClick={callClick}
                          className={cn("px-2 py-2.5 tabular-nums", extra, callItm ? "bg-emerald-500/[0.07]" : "", callHref ? "cursor-pointer hover:bg-white/[0.04]" : "")}
                        >
                          {content}
                        </td>
                      );
                      return (
                        <>
                          {callTd("text-right text-white/50", row?.call ? row.call.gamma : dash)}
                          {callTd("text-right text-white/50", row?.call ? row.call.vega : dash)}
                          {callTd("text-right text-red-400/80", row?.call ? row.call.theta : dash)}
                          {callTd("text-right text-emerald-400/90 font-medium", row?.call ? row.call.delta : dash)}
                          {callTd("text-right text-white/60", row?.call ? `${row.call.iv}%` : dash)}
                          {callTd("text-right text-white/50", row?.call ? row.call.oi : dash)}
                          <CallCell contract={row?.call} onNavigate={callClick} />
                        </>
                      );
                    })()}

                    {/* ── Strike ── */}
                    <td className={cn(
                      "px-4 py-2.5 text-center font-bold text-sm bg-white/[0.03] whitespace-nowrap",
                      isAtm ? "bg-emerald-400/10 text-emerald-400" : "text-white"
                    )}>
                      {isAtm && <span className="block text-[8px] text-emerald-400/60 uppercase tracking-wider -mb-0.5">ATM</span>}
                      {strike.toLocaleString()}
                    </td>

                    {/* ── PUT side ── */}
                    {(viewMode === "split" || viewMode === "puts") && (() => {
                      const putHref = row?.put ? `/options/${symbol}/${row.put.contractId}` : null;
                      const putClick = putHref ? () => router.push(putHref) : undefined;
                      const putTd = (extra: string, content: React.ReactNode) => (
                        <td
                          onClick={putClick}
                          className={cn("px-2 py-2.5 tabular-nums", extra, putItm ? "bg-emerald-500/[0.07]" : "", putHref ? "cursor-pointer hover:bg-white/[0.04]" : "")}
                        >
                          {content}
                        </td>
                      );
                      return (
                        <>
                          <PutCell contract={row?.put} onNavigate={putClick} />
                          {putTd("text-left text-white/50", row?.put ? row.put.oi : dash)}
                          {putTd("text-left text-white/60", row?.put ? `${row.put.iv}%` : dash)}
                          {putTd("text-left text-red-400/80 font-medium", row?.put ? row.put.delta : dash)}
                          {putTd("text-left text-red-400/80", row?.put ? row.put.theta : dash)}
                          {putTd("text-left text-white/50", row?.put ? row.put.vega : dash)}
                          {putTd("text-left text-white/50", row?.put ? row.put.gamma : dash)}
                        </>
                      );
                    })()}
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          {/* Footer — always visible */}
          <div
            className="px-6 py-3 text-center text-white/30 text-xs shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(20,20,22,1)" }}
          >
            Options data is for informational purposes only. Aspora does not facilitate options trading on this platform.
          </div>
        </div>
      </div>
    </div>
  );
}
