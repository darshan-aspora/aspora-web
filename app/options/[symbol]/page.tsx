"use client";

import { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
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

  const [expiryOpen, setExpiryOpen] = useState(false);
  const expiryDropdownRef = useRef<HTMLDivElement>(null);
  const closeOnOutside = useCallback((e: MouseEvent) => {
    if (expiryDropdownRef.current && !expiryDropdownRef.current.contains(e.target as Node)) {
      setExpiryOpen(false);
    }
  }, []);
  useEffect(() => {
    if (expiryOpen) document.addEventListener("mousedown", closeOnOutside);
    else document.removeEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [expiryOpen, closeOnOutside]);

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
      <div className="mt-1.5 h-[3px] w-full rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
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
        className={cn("px-3 py-2.5 text-right", itm ? "bg-emerald-500/[0.07]" : "", onNavigate ? "cursor-pointer hover:bg-black/[0.03]" : "")}
      >
        <div className={cn("text-sm font-semibold", itm ? "text-gray-900" : "text-gray-700")}>
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
        className={cn("px-3 py-2.5 text-left", itm ? "bg-emerald-500/[0.07]" : "", onNavigate ? "cursor-pointer hover:bg-black/[0.03]" : "")}
      >
        <div className={cn("text-sm font-semibold", itm ? "text-gray-900" : "text-gray-700")}>
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
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div
        ref={headerRef}
        className="sticky top-0 z-40"
        style={{ background: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.08)" }}
      >
        <div className="max-w-[1436px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/stocks/${symbol}`}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft size={15} />
              Back to {symbol}
            </Link>
            <div className="w-px h-4 bg-black/[0.05]" />
            <div>
              <span className="text-gray-900 font-bold">{symbol}</span>
              <span className="text-gray-400 text-sm ml-2">
                Underlying: <span className="text-gray-900">${underlying.toLocaleString()}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Expiry dropdown */}
            <div ref={expiryDropdownRef} className="relative">
              <button
                onClick={() => setExpiryOpen(o => !o)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors border border-gray-200 hover:border-gray-300 bg-white"
              >
                <span className="text-gray-400 text-xs font-medium">Expiry</span>
                <span className="text-gray-900">{activeExpiry?.label ?? activeCode}</span>
                <span className="text-xs text-gray-400">{activeExpiry?.daysToExpiry}d</span>
                <ChevronDown size={14} className={cn("text-gray-400 transition-transform", expiryOpen && "rotate-180")} />
              </button>

              {expiryOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
                  style={{ border: "1px solid rgba(0,0,0,0.10)" }}
                >
                  <div className="px-4 py-3.5 border-b border-gray-100">
                    <span className="text-gray-900 font-bold text-base">Options Expiry</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-2">
                    {EXPIRY_TYPE_LABELS.map(type => {
                      const group = expiries.filter(e => e.type === type);
                      if (!group.length) return null;
                      return (
                        <div key={type}>
                          <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{type}</div>
                          {group.map(e => (
                            <button
                              key={e.code}
                              onClick={() => { setExpiryType(e.type); setSelectedExpiry(e.code); setExpiryOpen(false); }}
                              className={cn(
                                "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors",
                                activeCode === e.code
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              )}
                            >
                              <span className="font-medium">{e.label}</span>
                              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", activeCode === e.code ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500")}>
                                {e.daysToExpiry}D
                              </span>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "rgba(0,0,0,0.05)" }}>
              {(["split", "calls", "puts"] as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors",
                    viewMode === v ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1436px] mx-auto px-6 py-6">
        {/* Zero-height ref used for table height measurement */}
        <div ref={expiryRowRef} />

        {/* Legend — above the table */}
        <div ref={legendRowRef} className="flex items-center gap-4 mb-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-gray-600">ITM</span> In The Money
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/40 inline-block" />
            <span className="text-gray-600">ATM</span> At The Money
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="text-gray-600">OTM</span> Out of Money
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
            border: "1px solid rgba(0,0,0,0.10)",
            height: tableHeight ? `${tableHeight}px` : "60vh",
          }}
        >
          {/* Scrollable body only */}
          <div ref={tableContainerRef} className="overflow-auto flex-1 min-h-0">
          <table className="text-xs border-collapse" style={{ minWidth: viewMode === "split" ? 1100 : 560, width: "100%" }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid rgba(0,0,0,0.10)" }}>
                {/* Call side label */}
                {(viewMode === "split" || viewMode === "calls") && (
                  <>
                    <th className="px-2 py-3 text-right text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">Gamma</th>
                    <th className="px-2 py-3 text-right text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">Vega</th>
                    <th className="px-2 py-3 text-right text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">Theta</th>
                    <th className="px-2 py-3 text-right text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">Delta</th>
                    <th className="px-2 py-3 text-right text-gray-500 text-[10px] font-semibold uppercase tracking-wider">IV</th>
                    <th className="px-2 py-3 text-right text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">OI</th>
                    <th className="px-3 py-3 text-right text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">Call LTP</th>
                  </>
                )}
                {/* Strike */}
                <th className="px-4 py-3 text-center text-gray-700 text-[10px] font-bold uppercase tracking-wider bg-black/[0.02] whitespace-nowrap">Strike</th>
                {/* Put side */}
                {(viewMode === "split" || viewMode === "puts") && (
                  <>
                    <th className="px-3 py-3 text-left text-red-500 text-[10px] font-semibold uppercase tracking-wider">Put LTP</th>
                    <th className="px-2 py-3 text-left text-red-500 text-[10px] font-semibold uppercase tracking-wider">OI</th>
                    <th className="px-2 py-3 text-left text-gray-500 text-[10px] font-semibold uppercase tracking-wider">IV</th>
                    <th className="px-2 py-3 text-left text-red-500 text-[10px] font-semibold uppercase tracking-wider">Delta</th>
                    <th className="px-2 py-3 text-left text-red-500 text-[10px] font-semibold uppercase tracking-wider">Theta</th>
                    <th className="px-2 py-3 text-left text-red-500 text-[10px] font-semibold uppercase tracking-wider">Vega</th>
                    <th className="px-2 py-3 text-left text-red-500 text-[10px] font-semibold uppercase tracking-wider">Gamma</th>
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
                const dash = <span className="text-gray-400">—</span>;

                return (
                  <tr
                    key={strike}
                    ref={isAtm ? atmRowRef : undefined}
                    className={cn(
                      "border-b transition-colors",
                      isAtm
                        ? "bg-emerald-50/50 border-emerald-500/30"
                        : "border-gray-100 hover:bg-black/[0.02]"
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
                          className={cn("px-2 py-2.5 tabular-nums", extra, callItm ? "bg-emerald-500/[0.07]" : "", callHref ? "cursor-pointer hover:bg-black/[0.03]" : "")}
                        >
                          {content}
                        </td>
                      );
                      return (
                        <>
                          {callTd("text-right text-gray-600", row?.call ? row.call.gamma : dash)}
                          {callTd("text-right text-gray-600", row?.call ? row.call.vega : dash)}
                          {callTd("text-right text-red-500 font-medium", row?.call ? row.call.theta : dash)}
                          {callTd("text-right text-emerald-600 font-medium", row?.call ? row.call.delta : dash)}
                          {callTd("text-right text-gray-700", row?.call ? `${row.call.iv}%` : dash)}
                          {callTd("text-right text-gray-600", row?.call ? row.call.oi : dash)}
                          <CallCell contract={row?.call} onNavigate={callClick} />
                        </>
                      );
                    })()}

                    {/* ── Strike ── */}
                    <td className={cn(
                      "px-4 py-2.5 text-center font-bold text-sm bg-black/[0.02] whitespace-nowrap",
                      isAtm ? "bg-emerald-400/10 text-emerald-400" : "text-gray-900"
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
                          className={cn("px-2 py-2.5 tabular-nums", extra, putItm ? "bg-emerald-500/[0.07]" : "", putHref ? "cursor-pointer hover:bg-black/[0.03]" : "")}
                        >
                          {content}
                        </td>
                      );
                      return (
                        <>
                          <PutCell contract={row?.put} onNavigate={putClick} />
                          {putTd("text-left text-gray-600", row?.put ? row.put.oi : dash)}
                          {putTd("text-left text-gray-700", row?.put ? `${row.put.iv}%` : dash)}
                          {putTd("text-left text-red-500 font-medium", row?.put ? row.put.delta : dash)}
                          {putTd("text-left text-red-500 font-medium", row?.put ? row.put.theta : dash)}
                          {putTd("text-left text-gray-600", row?.put ? row.put.vega : dash)}
                          {putTd("text-left text-gray-600", row?.put ? row.put.gamma : dash)}
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
            className="px-6 py-3 text-center text-gray-400 text-xs shrink-0"
            style={{ borderTop: "1px solid rgba(0,0,0,0.08)", background: "#f8fafc" }}
          >
            Options data is for informational purposes only. Aspora does not facilitate options trading on this platform.
          </div>
        </div>
      </div>
    </div>
  );
}
