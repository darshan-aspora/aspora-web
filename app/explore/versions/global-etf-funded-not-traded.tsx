"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Bookmark, ArrowRight, ArrowUpDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  PopularETFsWidget,
  type ETF,
  type PopularETF,
} from "@/app/explore/versions/etf-funded-not-traded";
import { ScrollableTableWidget } from "@/components/scrollable-table-widget";

/* ------------------------------------------------------------------ */
/*  Region tabs (no "All")                                             */
/* ------------------------------------------------------------------ */

type RegionTabId =
  | "europe"
  | "india"
  | "china"
  | "japan"
  | "emerging"
  | "uk"
  | "latam";

const regionsList: { id: RegionTabId; label: string; short: string; flag: string }[] = [
  { id: "europe", label: "Europe", short: "EU", flag: "🇪🇺" },
  { id: "india", label: "India", short: "IN", flag: "🇮🇳" },
  { id: "china", label: "China", short: "CN", flag: "🇨🇳" },
  { id: "japan", label: "Japan", short: "JP", flag: "🇯🇵" },
  { id: "emerging", label: "Emerging", short: "EM", flag: "🌏" },
  { id: "uk", label: "UK", short: "UK", flag: "🇬🇧" },
  { id: "latam", label: "Latin America", short: "LATAM", flag: "🌎" },
];

function RegionFlagTiles({
  active,
  onChange,
}: {
  active: RegionTabId;
  onChange: (id: RegionTabId) => void;
}) {
  return (
    <div className="-mx-5 overflow-x-auto no-scrollbar">
      <div className="flex gap-2.5 px-5 py-1">
        {regionsList.map((r) => (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            className={cn(
              "shrink-0 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all",
              "w-[76px] h-[76px]",
              active === r.id
                ? "bg-foreground text-background shadow-[0_6px_20px_-6px_rgba(0,0,0,0.25)] scale-[1.03]"
                : "bg-muted/50 text-muted-foreground active:bg-muted"
            )}
          >
            <span className="text-[22px] leading-none">{r.flag}</span>
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider",
                active === r.id ? "text-background" : "text-foreground/60"
              )}
            >
              {r.short}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Global Hero Widget                                                 */
/* ------------------------------------------------------------------ */

import { Play } from "lucide-react";

const globalHeroRow1 = [
  "Why go global?",
  "Currency as a feature",
  "Invest beyond borders",
  "Emerging market growth",
  "Diversify geographically",
];

const globalHeroRow2 = [
  "Europe, Asia, Latin America",
  "One tap, any country",
  "Home bias explained",
  "Global allocation 101",
  "40% of stocks are outside the US",
];

const heroNoiseStyle = {
  backgroundImage:
    "url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E')",
};

function MarqueePillRow({ items, direction = "left", speed = 30 }: { items: string[]; direction?: "left" | "right"; speed?: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-2 whitespace-nowrap"
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((title, i) => (
          <button
            key={`${title}-${i}`}
            className="shrink-0 flex items-center gap-2 rounded-full bg-background/10 border border-background/10 px-4 py-2.5 active:scale-[0.97] transition-transform"
          >
            <Play size={12} strokeWidth={2.5} className="text-background/60 shrink-0" fill="hsl(var(--background) / 0.6)" />
            <span className="text-[13px] font-semibold text-background/80">{title}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}

function GlobalHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-foreground hero-invert cursor-pointer"
    >
      <div className="absolute inset-0 opacity-[0.03]" style={heroNoiseStyle} />
      <div className="relative pt-36 pb-5">
        <div className="flex flex-col items-center text-center mb-5 px-6">
          <p className="text-[20px] font-bold text-background leading-[1.3] mb-1">
            The world is your market.
          </p>
          <p className="text-[15px] text-background/50 leading-relaxed">
            Invest globally from one account. Aspora makes it simple.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <MarqueePillRow items={globalHeroRow1} direction="left" speed={45} />
          <MarqueePillRow items={globalHeroRow2} direction="right" speed={40} />
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Popular ETF data per region                                        */
/* ------------------------------------------------------------------ */

const regionPopularETFs: Record<RegionTabId, PopularETF[]> = {
  europe: [
    { name: "Vanguard FTSE Europe", symbol: "VGK", return3y: 7.2, aum: "20B", expenseRatio: 0.09, trackingError: 0.04 },
    { name: "iShares Core MSCI Europe", symbol: "IEUR", return3y: 7.4, aum: "6.2B", expenseRatio: 0.09, trackingError: 0.03 },
    { name: "iShares MSCI EMU", symbol: "EZU", return3y: 6.8, aum: "8B", expenseRatio: 0.51, trackingError: 0.06 },
    { name: "SPDR Euro STOXX 50", symbol: "FEZ", return3y: 6.1, aum: "4B", expenseRatio: 0.29, trackingError: 0.05 },
    { name: "WisdomTree Europe Hedged", symbol: "HEDJ", return3y: 9.2, aum: "1.8B", expenseRatio: 0.58, trackingError: 0.12 },
    { name: "iShares MSCI Germany", symbol: "EWG", return3y: 5.4, aum: "1.6B", expenseRatio: 0.50, trackingError: 0.08 },
  ],
  india: [
    { name: "iShares MSCI India", symbol: "INDA", return3y: 11.8, aum: "9B", expenseRatio: 0.64, trackingError: 0.14 },
    { name: "WisdomTree India Earnings", symbol: "EPI", return3y: 13.2, aum: "3.4B", expenseRatio: 0.85, trackingError: 0.22 },
    { name: "Franklin FTSE India", symbol: "FLIN", return3y: 12.4, aum: "1.8B", expenseRatio: 0.19, trackingError: 0.08 },
    { name: "iShares India 50", symbol: "INDY", return3y: 10.2, aum: "1.2B", expenseRatio: 0.93, trackingError: 0.18 },
    { name: "Columbia India Consumer", symbol: "INCO", return3y: 14.6, aum: "0.3B", expenseRatio: 0.75, trackingError: 0.24 },
    { name: "iShares MSCI India Small-Cap", symbol: "SMIN", return3y: 15.8, aum: "0.9B", expenseRatio: 0.76, trackingError: 0.28 },
  ],
  china: [
    { name: "iShares MSCI China", symbol: "MCHI", return3y: -3.2, aum: "5B", expenseRatio: 0.58, trackingError: 0.18 },
    { name: "iShares China Large-Cap", symbol: "FXI", return3y: -4.4, aum: "6.2B", expenseRatio: 0.74, trackingError: 0.24 },
    { name: "Xtrackers CSI 300", symbol: "ASHR", return3y: -1.8, aum: "2.8B", expenseRatio: 0.65, trackingError: 0.22 },
    { name: "KraneShares CSI Internet", symbol: "KWEB", return3y: -8.6, aum: "4.4B", expenseRatio: 0.69, trackingError: 0.32 },
    { name: "Invesco China Technology", symbol: "CQQQ", return3y: -5.2, aum: "0.6B", expenseRatio: 0.70, trackingError: 0.28 },
    { name: "KraneShares MSCI China A", symbol: "KBA", return3y: -2.4, aum: "0.4B", expenseRatio: 0.60, trackingError: 0.20 },
  ],
  japan: [
    { name: "iShares MSCI Japan", symbol: "EWJ", return3y: 8.4, aum: "14B", expenseRatio: 0.50, trackingError: 0.06 },
    { name: "WisdomTree Japan Hedged", symbol: "DXJ", return3y: 12.6, aum: "5.2B", expenseRatio: 0.48, trackingError: 0.14 },
    { name: "JPMorgan BetaBuilders Japan", symbol: "BBJP", return3y: 8.2, aum: "8.4B", expenseRatio: 0.19, trackingError: 0.04 },
    { name: "Franklin FTSE Japan", symbol: "FLJP", return3y: 8.1, aum: "1.4B", expenseRatio: 0.09, trackingError: 0.03 },
    { name: "iShares Currency Hedged Japan", symbol: "HEWJ", return3y: 11.4, aum: "1.8B", expenseRatio: 0.50, trackingError: 0.10 },
    { name: "iShares MSCI Japan Small-Cap", symbol: "SCJ", return3y: 6.2, aum: "0.3B", expenseRatio: 0.49, trackingError: 0.09 },
  ],
  emerging: [
    { name: "Vanguard FTSE Emerging", symbol: "VWO", return3y: 2.8, aum: "82B", expenseRatio: 0.08, trackingError: 0.04 },
    { name: "iShares MSCI Emerging", symbol: "EEM", return3y: 2.4, aum: "18B", expenseRatio: 0.68, trackingError: 0.12 },
    { name: "iShares Core MSCI EM", symbol: "IEMG", return3y: 3.2, aum: "78B", expenseRatio: 0.09, trackingError: 0.03 },
    { name: "Schwab EM Equity", symbol: "SCHE", return3y: 2.6, aum: "8.4B", expenseRatio: 0.11, trackingError: 0.05 },
    { name: "iShares MSCI EM ex China", symbol: "EMXC", return3y: 6.8, aum: "12B", expenseRatio: 0.25, trackingError: 0.08 },
    { name: "iShares MSCI EM Min Vol", symbol: "EEMV", return3y: 4.4, aum: "4.2B", expenseRatio: 0.25, trackingError: 0.06 },
  ],
  uk: [
    { name: "iShares MSCI United Kingdom", symbol: "EWU", return3y: 6.4, aum: "2.8B", expenseRatio: 0.50, trackingError: 0.08 },
    { name: "Franklin FTSE UK", symbol: "FLGB", return3y: 6.8, aum: "0.5B", expenseRatio: 0.09, trackingError: 0.04 },
    { name: "First Trust UK AlphaDEX", symbol: "FKU", return3y: 5.2, aum: "0.3B", expenseRatio: 0.80, trackingError: 0.14 },
    { name: "iShares Currency Hedged UK", symbol: "HEWU", return3y: 8.1, aum: "0.1B", expenseRatio: 0.50, trackingError: 0.10 },
    { name: "iShares MSCI UK Small-Cap", symbol: "EWUS", return3y: 3.8, aum: "0.3B", expenseRatio: 0.59, trackingError: 0.12 },
    { name: "SPDR Portfolio Developed World", symbol: "SPDW", return3y: 6.8, aum: "18B", expenseRatio: 0.03, trackingError: 0.03 },
  ],
  latam: [
    { name: "iShares Latin America 40", symbol: "ILF", return3y: 4.2, aum: "2.1B", expenseRatio: 0.48, trackingError: 0.14 },
    { name: "iShares MSCI Brazil", symbol: "EWZ", return3y: 3.4, aum: "4.2B", expenseRatio: 0.58, trackingError: 0.22 },
    { name: "iShares MSCI Mexico", symbol: "EWW", return3y: 8.6, aum: "2.4B", expenseRatio: 0.50, trackingError: 0.12 },
    { name: "Global X MSCI Argentina", symbol: "ARGT", return3y: 18.4, aum: "0.6B", expenseRatio: 0.59, trackingError: 0.32 },
    { name: "iShares MSCI Chile", symbol: "ECH", return3y: 2.2, aum: "0.4B", expenseRatio: 0.58, trackingError: 0.16 },
    { name: "Global X MSCI Colombia", symbol: "GXG", return3y: -1.4, aum: "0.1B", expenseRatio: 0.61, trackingError: 0.24 },
  ],
};

/* ------------------------------------------------------------------ */
/*  All ETFs data pool per region                                      */
/* ------------------------------------------------------------------ */

const regionETFPool: Record<RegionTabId, ETF[]> = {
  europe: [
    { symbol: "VGK", name: "Vanguard FTSE Europe", price: 68.45, changePercent: 1.24, volume: "4.2M", aum: "$20B", expenseRatio: 0.09, yield: 3.20, high52w: 72.0, low52w: 58.5, color: "#1A5276" },
    { symbol: "IEUR", name: "iShares Core MSCI Europe", price: 58.12, changePercent: 1.42, volume: "2.1M", aum: "$6.2B", expenseRatio: 0.09, yield: 3.10, high52w: 60.5, low52w: 48.2, color: "#333333" },
    { symbol: "EZU", name: "iShares MSCI EMU", price: 52.34, changePercent: 0.82, volume: "3.8M", aum: "$8B", expenseRatio: 0.51, yield: 2.90, high52w: 55.2, low52w: 42.6, color: "#0033CC" },
    { symbol: "FEZ", name: "SPDR Euro STOXX 50", price: 48.22, changePercent: -0.54, volume: "1.8M", aum: "$4B", expenseRatio: 0.29, yield: 3.40, high52w: 52.0, low52w: 40.4, color: "#333333" },
    { symbol: "EUFN", name: "iShares MSCI Europe Financials", price: 25.34, changePercent: -1.82, volume: "0.9M", aum: "$2B", expenseRatio: 0.48, yield: 4.10, high52w: 27.5, low52w: 20.1, color: "#003087" },
    { symbol: "HEDJ", name: "WisdomTree Europe Hedged", price: 82.45, changePercent: 2.14, volume: "1.2M", aum: "$1.8B", expenseRatio: 0.58, yield: 2.80, high52w: 85.0, low52w: 72.8, color: "#008080" },
    { symbol: "EWG", name: "iShares MSCI Germany", price: 32.18, changePercent: -0.92, volume: "2.4M", aum: "$1.6B", expenseRatio: 0.50, yield: 3.30, high52w: 34.5, low52w: 28.2, color: "#CC0000" },
    { symbol: "EWQ", name: "iShares MSCI France", price: 42.28, changePercent: 1.68, volume: "0.8M", aum: "$0.9B", expenseRatio: 0.50, yield: 2.80, high52w: 44.5, low52w: 36.2, color: "#0055A4" },
  ],
  india: [
    { symbol: "INDA", name: "iShares MSCI India", price: 52.32, changePercent: 2.41, volume: "5.8M", aum: "$9B", expenseRatio: 0.64, yield: 0.80, high52w: 55.2, low52w: 42.8, color: "#FF9933" },
    { symbol: "EPI", name: "WisdomTree India Earnings", price: 42.18, changePercent: 3.12, volume: "3.2M", aum: "$3.4B", expenseRatio: 0.85, yield: 1.20, high52w: 44.5, low52w: 32.8, color: "#138808" },
    { symbol: "FLIN", name: "Franklin FTSE India", price: 44.32, changePercent: 2.18, volume: "1.5M", aum: "$1.8B", expenseRatio: 0.19, yield: 0.90, high52w: 46.2, low52w: 35.8, color: "#000080" },
    { symbol: "INDY", name: "iShares India 50", price: 48.72, changePercent: 1.82, volume: "1.8M", aum: "$1.2B", expenseRatio: 0.93, yield: 1.00, high52w: 51.0, low52w: 38.4, color: "#FF6600" },
    { symbol: "SMIN", name: "iShares MSCI India Small-Cap", price: 68.45, changePercent: -1.42, volume: "0.6M", aum: "$0.9B", expenseRatio: 0.76, yield: 0.50, high52w: 78.2, low52w: 52.4, color: "#8B4513" },
    { symbol: "INCO", name: "Columbia India Consumer", price: 58.22, changePercent: 1.64, volume: "0.3M", aum: "$0.3B", expenseRatio: 0.75, yield: 0.80, high52w: 62.0, low52w: 46.8, color: "#B8860B" },
  ],
  china: [
    { symbol: "MCHI", name: "iShares MSCI China", price: 48.34, changePercent: -2.82, volume: "12.4M", aum: "$5B", expenseRatio: 0.58, yield: 1.80, high52w: 58.2, low52w: 38.4, color: "#DE2910" },
    { symbol: "FXI", name: "iShares China Large-Cap", price: 28.45, changePercent: -3.24, volume: "18.6M", aum: "$6.2B", expenseRatio: 0.74, yield: 2.40, high52w: 34.5, low52w: 22.8, color: "#CC0000" },
    { symbol: "ASHR", name: "Xtrackers CSI 300", price: 32.18, changePercent: 1.22, volume: "4.2M", aum: "$2.8B", expenseRatio: 0.65, yield: 2.20, high52w: 38.4, low52w: 26.5, color: "#FF6600" },
    { symbol: "KWEB", name: "KraneShares CSI Internet", price: 32.45, changePercent: 3.42, volume: "15.6M", aum: "$4.4B", expenseRatio: 0.69, yield: 0.80, high52w: 38.2, low52w: 22.4, color: "#FFB800" },
    { symbol: "CQQQ", name: "Invesco China Technology", price: 38.72, changePercent: 2.84, volume: "1.8M", aum: "$0.6B", expenseRatio: 0.70, yield: 0.60, high52w: 42.0, low52w: 28.4, color: "#9400D3" },
    { symbol: "KBA", name: "KraneShares MSCI China A", price: 24.18, changePercent: 0.84, volume: "0.4M", aum: "$0.4B", expenseRatio: 0.60, yield: 1.60, high52w: 28.0, low52w: 20.2, color: "#8B4513" },
  ],
  japan: [
    { symbol: "EWJ", name: "iShares MSCI Japan", price: 72.34, changePercent: 0.82, volume: "14.2M", aum: "$14B", expenseRatio: 0.50, yield: 1.80, high52w: 76.0, low52w: 62.4, color: "#BC002D" },
    { symbol: "DXJ", name: "WisdomTree Japan Hedged", price: 112.45, changePercent: 2.44, volume: "3.8M", aum: "$5.2B", expenseRatio: 0.48, yield: 2.20, high52w: 118.0, low52w: 88.4, color: "#333333" },
    { symbol: "BBJP", name: "JPMorgan BetaBuilders Japan", price: 62.18, changePercent: 0.64, volume: "1.2M", aum: "$8.4B", expenseRatio: 0.19, yield: 1.60, high52w: 65.0, low52w: 52.4, color: "#0033CC" },
    { symbol: "HEWJ", name: "iShares Currency Hedged Japan", price: 42.45, changePercent: 1.42, volume: "2.4M", aum: "$1.8B", expenseRatio: 0.50, yield: 1.90, high52w: 44.8, low52w: 36.2, color: "#8B1A1A" },
    { symbol: "FLJP", name: "Franklin FTSE Japan", price: 32.34, changePercent: 0.92, volume: "0.8M", aum: "$1.4B", expenseRatio: 0.09, yield: 2.10, high52w: 34.2, low52w: 27.8, color: "#228B22" },
    { symbol: "SCJ", name: "iShares MSCI Japan Small-Cap", price: 48.72, changePercent: -0.62, volume: "0.4M", aum: "$0.3B", expenseRatio: 0.49, yield: 2.40, high52w: 52.0, low52w: 42.4, color: "#8B4513" },
  ],
  emerging: [
    { symbol: "VWO", name: "Vanguard FTSE EM", price: 42.18, changePercent: -1.22, volume: "18.4M", aum: "$82B", expenseRatio: 0.08, yield: 3.10, high52w: 46.5, low52w: 37.8, color: "#8B1A1A" },
    { symbol: "EEM", name: "iShares MSCI EM", price: 40.23, changePercent: -1.44, volume: "42.6M", aum: "$18B", expenseRatio: 0.68, yield: 2.40, high52w: 44.8, low52w: 36.2, color: "#333333" },
    { symbol: "IEMG", name: "iShares Core MSCI EM", price: 52.45, changePercent: -1.12, volume: "12.8M", aum: "$78B", expenseRatio: 0.09, yield: 2.80, high52w: 56.2, low52w: 46.8, color: "#003087" },
    { symbol: "SCHE", name: "Schwab EM Equity", price: 28.34, changePercent: -1.32, volume: "2.4M", aum: "$8.4B", expenseRatio: 0.11, yield: 3.20, high52w: 30.8, low52w: 25.4, color: "#1A5276" },
    { symbol: "EMXC", name: "iShares MSCI EM ex China", price: 58.72, changePercent: 1.82, volume: "1.8M", aum: "$12B", expenseRatio: 0.25, yield: 2.90, high52w: 62.0, low52w: 48.4, color: "#006400" },
    { symbol: "FM", name: "iShares MSCI Frontier 100", price: 32.18, changePercent: 2.12, volume: "0.2M", aum: "$0.6B", expenseRatio: 0.79, yield: 4.80, high52w: 34.0, low52w: 26.8, color: "#B8860B" },
  ],
  uk: [
    { symbol: "EWU", name: "iShares MSCI United Kingdom", price: 34.12, changePercent: 1.24, volume: "4.8M", aum: "$2.8B", expenseRatio: 0.50, yield: 3.80, high52w: 36.2, low52w: 28.4, color: "#012169" },
    { symbol: "FLGB", name: "Franklin FTSE UK", price: 32.45, changePercent: 0.84, volume: "0.4M", aum: "$0.5B", expenseRatio: 0.09, yield: 3.60, high52w: 34.8, low52w: 27.8, color: "#C8102E" },
    { symbol: "FKU", name: "First Trust UK AlphaDEX", price: 48.72, changePercent: 0.42, volume: "0.2M", aum: "$0.3B", expenseRatio: 0.80, yield: 2.90, high52w: 52.0, low52w: 42.8, color: "#800020" },
    { symbol: "HEWU", name: "iShares Currency Hedged UK", price: 28.34, changePercent: 1.82, volume: "0.2M", aum: "$0.1B", expenseRatio: 0.50, yield: 3.50, high52w: 30.2, low52w: 24.6, color: "#003366" },
    { symbol: "EWUS", name: "iShares MSCI UK Small-Cap", price: 42.18, changePercent: -1.44, volume: "0.1M", aum: "$0.3B", expenseRatio: 0.59, yield: 4.20, high52w: 46.8, low52w: 36.4, color: "#8B4513" },
    { symbol: "GWX", name: "SPDR Intl Small Cap", price: 32.45, changePercent: 1.12, volume: "0.2M", aum: "$0.4B", expenseRatio: 0.40, yield: 2.80, high52w: 34.8, low52w: 28.2, color: "#4B0082" },
  ],
  latam: [
    { symbol: "ILF", name: "iShares Latin America 40", price: 24.32, changePercent: -2.42, volume: "4.8M", aum: "$2.1B", expenseRatio: 0.48, yield: 4.20, high52w: 28.2, low52w: 20.4, color: "#009B3A" },
    { symbol: "EWZ", name: "iShares MSCI Brazil", price: 28.45, changePercent: -2.84, volume: "12.6M", aum: "$4.2B", expenseRatio: 0.58, yield: 5.40, high52w: 34.2, low52w: 24.6, color: "#FFDF00" },
    { symbol: "EWW", name: "iShares MSCI Mexico", price: 58.32, changePercent: 1.42, volume: "4.2M", aum: "$2.4B", expenseRatio: 0.50, yield: 2.10, high52w: 62.0, low52w: 48.4, color: "#006847" },
    { symbol: "ECH", name: "iShares MSCI Chile", price: 28.72, changePercent: -1.82, volume: "0.4M", aum: "$0.4B", expenseRatio: 0.58, yield: 3.20, high52w: 32.4, low52w: 24.8, color: "#D52B1E" },
    { symbol: "ARGT", name: "Global X MSCI Argentina", price: 68.34, changePercent: 4.82, volume: "0.6M", aum: "$0.6B", expenseRatio: 0.59, yield: 0.80, high52w: 72.0, low52w: 38.4, color: "#75AADB" },
    { symbol: "EPU", name: "iShares MSCI Peru", price: 32.18, changePercent: 2.12, volume: "0.2M", aum: "$0.1B", expenseRatio: 0.58, yield: 3.10, high52w: 34.0, low52w: 26.4, color: "#D91023" },
  ],
};

/* ------------------------------------------------------------------ */
/*  All ETFs Widget — single list with sort flipper                    */
/* ------------------------------------------------------------------ */

type SortMode = "1y-return" | "3y-return" | "5y-return" | "aum" | "low-expense" | "volume";

const sortModes: { id: SortMode; label: string }[] = [
  { id: "1y-return", label: "1Y Return" },
  { id: "3y-return", label: "3Y Return" },
  { id: "5y-return", label: "5Y Return" },
  { id: "aum", label: "AUM" },
  { id: "low-expense", label: "Low Expense" },
  { id: "volume", label: "Volume" },
];

function parseAum(s: string): number {
  const n = parseFloat(s.replace("$", ""));
  if (s.includes("T")) return n * 1e12;
  if (s.includes("B")) return n * 1e9;
  if (s.includes("M")) return n * 1e6;
  return n;
}

function parseVol(v: string): number {
  const n = parseFloat(v);
  if (v.toUpperCase().includes("M")) return n * 1e6;
  if (v.toUpperCase().includes("K")) return n * 1e3;
  return n;
}

function RangeBarInline({ low, high, current }: { low: number; high: number; current: number }) {
  const range = high - low || 1;
  const pct = Math.max(0, Math.min(100, ((current - low) / range) * 100));
  return (
    <div className="flex items-center gap-1.5 w-full">
      <span className="text-[12px] tabular-nums text-muted-foreground whitespace-nowrap leading-none">{low.toFixed(0)}</span>
      <div className="relative flex-1 h-[3px] rounded-full bg-muted">
        <div className="absolute top-1/2 -translate-y-1/2 h-[12px] w-[2px] bg-foreground" style={{ left: `${pct}%` }} />
      </div>
      <span className="text-[12px] tabular-nums text-muted-foreground whitespace-nowrap leading-none">{high.toFixed(0)}</span>
    </div>
  );
}

function AllETFsWidget({ etfs }: { etfs: ETF[] }) {
  const [sortMode, setSortMode] = useState<SortMode>("1y-return");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const cycleSortMode = () =>
    setSortMode((p) => sortModes[(sortModes.findIndex((s) => s.id === p) + 1) % sortModes.length].id);

  const sorted = useMemo(() => {
    const list = [...etfs];
    switch (sortMode) {
      case "1y-return": return list.sort((a, b) => b.changePercent - a.changePercent);
      case "3y-return": return list.sort((a, b) => (b.return3y ?? 0) - (a.return3y ?? 0));
      case "5y-return": return list.sort((a, b) => (b.return5y ?? 0) - (a.return5y ?? 0));
      case "aum": return list.sort((a, b) => parseAum(b.aum) - parseAum(a.aum));
      case "low-expense": return list.sort((a, b) => a.expenseRatio - b.expenseRatio);
      case "volume": return list.sort((a, b) => parseVol(b.volume) - parseVol(a.volume));
      default: return list;
    }
  }, [etfs, sortMode]);

  const toggleBookmark = (sym: string) =>
    setBookmarks((p) => { const n = new Set(p); if (n.has(sym)) n.delete(sym); else n.add(sym); return n; });

  const columns = [
    { header: "ETF", align: "left" as const },
    { header: "Price", align: "right" as const, minWidth: 72 },
    { header: "AUM", align: "right" as const, minWidth: 72 },
    { header: "Exp%", align: "right" as const, minWidth: 58 },
    { header: "Yield", align: "right" as const, minWidth: 58 },
    { header: "1Y Range", align: "center" as const, minWidth: 110 },
    { header: "Volume", align: "right" as const, minWidth: 72 },
    { header: "Watchlist", align: "center" as const, minWidth: 80 },
  ];

  const rows = sorted.map((etf) => {
    const chgColor = etf.changePercent >= 0 ? "text-emerald-500" : "text-red-500";
    return [
      <div key="name" className="flex items-center gap-2.5">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted-foreground/25" />
        <p className="min-w-0 text-[14px] font-semibold leading-tight text-foreground line-clamp-2">{etf.name}</p>
      </div>,
      <div key="price" className="flex flex-col items-end">
        <span className="whitespace-nowrap tabular-nums text-[14px] text-foreground">{etf.price.toFixed(2)}</span>
        <span className={cn("whitespace-nowrap tabular-nums text-[12px] font-semibold", chgColor)}>{etf.changePercent >= 0 ? "+" : ""}{etf.changePercent.toFixed(2)}%</span>
      </div>,
      <span key="aum" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.aum}</span>,
      <span key="exp" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.expenseRatio.toFixed(2)}%</span>,
      <span key="yield" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.yield != null ? `${etf.yield.toFixed(2)}%` : "—"}</span>,
      <RangeBarInline key="range" low={etf.low52w} high={etf.high52w} current={etf.price} />,
      <span key="vol" className="whitespace-nowrap tabular-nums text-[14px] text-muted-foreground">{etf.volume}</span>,
      <div key="watch" className="flex justify-center">
        <button onClick={() => toggleBookmark(etf.symbol)} className="transition-transform active:scale-90">
          <Bookmark size={20} strokeWidth={1.8} className={cn("transition-colors", bookmarks.has(etf.symbol) ? "fill-foreground text-foreground" : "text-muted-foreground/50")} />
        </button>
      </div>,
    ];
  });

  return (
    <ScrollableTableWidget
      title="All ETFs"
      flipper={{
        label: sortModes.find((s) => s.id === sortMode)!.label,
        icon: <ArrowUpDown size={13} className="flex-shrink-0 text-muted-foreground" />,
        onFlip: cycleSortMode,
      }}
      columns={columns}
      rows={rows}
      visibleDataCols={2}
      rowHeight="h-[80px]"
      scrollableMinWidth={400}
      animationKey={sortMode}
      footer={{ label: "View All", href: "/explore/all-etfs" }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Level Up — Global investing stories                                */
/* ------------------------------------------------------------------ */

interface LearnStory {
  id: string;
  format: "statement" | "comparison" | "number" | "action";
  headline: string;
  body: string;
  leftLabel?: string;
  rightLabel?: string;
  leftPoints?: string[];
  rightPoints?: string[];
  stat?: string;
  statCaption?: string;
}

interface LearnModule {
  id: string;
  title: string;
  stories: LearnStory[];
}

const globalModules: LearnModule[] = [
  {
    id: "why-global",
    title: "Why Go Global?",
    stories: [
      { id: "g1s1", format: "statement", headline: "The US is 60%\nof the world's market.", body: "The other 40% includes Europe, Asia, and emerging economies. Ignoring them is like only reading one chapter of a book." },
      { id: "g1s2", format: "number", headline: "Different markets,\ndifferent cycles.", body: "When US tech dips, Indian IT or European luxury might be thriving. Global exposure smooths the ride.", stat: "40%", statCaption: "of world stocks are outside the US" },
      { id: "g1s3", format: "statement", headline: "Growth is\nshifting east.", body: "India, Vietnam, Indonesia — the fastest-growing economies of the next decade aren't in the west. ETFs let you access them in one click." },
      { id: "g1s4", format: "statement", headline: "Currency exposure\nis a feature.", body: "When you buy a foreign ETF, you're also buying that currency. If the dollar weakens, your international holdings gain extra value." },
      { id: "g1s5", format: "comparison", headline: "Home bias\nvs global view.", body: "", leftLabel: "Global", rightLabel: "Home only", leftPoints: ["Broader diversification", "Access to growth stories", "Currency diversification", "Lower correlation"], rightPoints: ["Concentrated in one economy", "Miss emerging opportunities", "Single currency risk", "Higher correlation"] },
      { id: "g1s6", format: "action", headline: "The world is\nyour portfolio.", body: "Diversifying globally isn't about being exotic. It's about being rational." },
    ],
  },
  {
    id: "how-global-etfs",
    title: "How Global ETFs Work",
    stories: [
      { id: "g2s1", format: "statement", headline: "Country ETF vs\nRegional ETF.", body: "A country ETF (like EWJ for Japan) targets one nation. A regional ETF (like VGK for Europe) bundles several. Pick your precision." },
      { id: "g2s2", format: "comparison", headline: "Hedged vs\nunhedged.", body: "", leftLabel: "Currency hedged", rightLabel: "Unhedged", leftPoints: ["Removes FX volatility", "Returns match local index", "Costs slightly more", "Good for short-term"], rightPoints: ["Full FX exposure", "Can boost or drag returns", "Cheaper expense ratios", "Better for long-term"] },
      { id: "g2s3", format: "statement", headline: "Time zones\ndon't matter much.", body: "Global ETFs trade on US exchanges during US hours. You don't need to wake up at 3am to invest in Tokyo." },
      { id: "g2s4", format: "number", headline: "One ticker,\nan entire country.", body: "EWJ holds 200+ Japanese stocks. INDA holds 100+ Indian companies. One purchase, instant access.", stat: "200+", statCaption: "stocks in a single country ETF" },
      { id: "g2s5", format: "statement", headline: "Liquidity varies\nby market.", body: "A Europe ETF trades millions of shares daily. A frontier market ETF might trade thousands. Check volume before you buy." },
      { id: "g2s6", format: "action", headline: "Same mechanics.\nBigger playground.", body: "Global ETFs work exactly like US ETFs. The only difference is what's inside." },
    ],
  },
  {
    id: "reading-global",
    title: "Reading Global Labels",
    stories: [
      { id: "g3s1", format: "statement", headline: "Country breakdown\nis your first stop.", body: "A 'Europe ETF' might be 25% UK, 20% France, 15% Germany. Know what you're actually buying." },
      { id: "g3s2", format: "number", headline: "Expense ratios\nare slightly higher.", body: "US index ETFs charge 0.03%. International ETFs typically run 0.07-0.50%. Still low — but worth comparing.", stat: "0.07%", statCaption: "to 0.50% for international ETFs" },
      { id: "g3s3", format: "statement", headline: "Withholding taxes\nare real.", body: "Many countries tax dividends before they reach you. A 15-30% withholding tax can eat into yield. Check the tax treaty." },
      { id: "g3s4", format: "statement", headline: "Tracking error\ncan be wider.", body: "International ETFs deal with different time zones, currencies, and settlement rules. Expect slightly higher tracking error than US funds." },
      { id: "g3s5", format: "comparison", headline: "What to check\non a global ETF.", body: "", leftLabel: "Always check", rightLabel: "Don't ignore", leftPoints: ["Country breakdown", "Expense ratio", "AUM and liquidity", "Currency hedged or not"], rightPoints: ["Withholding tax rate", "Tracking error", "Trading volume", "Benchmark index"] },
      { id: "g3s6", format: "action", headline: "Same label.\nA few extra lines.", body: "If you can read a US ETF factsheet, you can read an international one. Just watch for currency and tax." },
    ],
  },
  {
    id: "picking-markets",
    title: "Picking Markets",
    stories: [
      { id: "g4s1", format: "comparison", headline: "Developed vs\nemerging.", body: "", leftLabel: "Developed", rightLabel: "Emerging", leftPoints: ["Stable economies", "Lower volatility", "Mature markets", "Europe, Japan, UK"], rightPoints: ["Higher growth potential", "More volatile", "Less mature infrastructure", "India, Brazil, China"] },
      { id: "g4s2", format: "statement", headline: "Single country\nvs regional.", body: "Bullish on India specifically? Use INDA. Want broad Asian exposure? Use a regional fund. Specificity has trade-offs." },
      { id: "g4s3", format: "statement", headline: "Don't chase\nlast year's winner.", body: "The best-performing country this year is rarely the best next year. Diversify across regions, not just within them." },
      { id: "g4s4", format: "number", headline: "Start with\n10-20% global.", body: "Most advisors suggest allocating 10-20% of your equity portfolio to international. Enough to diversify without overcomplicating.", stat: "10-20%", statCaption: "suggested international allocation" },
      { id: "g4s5", format: "statement", headline: "Rebalance\nonce a year.", body: "Markets drift. Your 15% India allocation might grow to 25% in a good year. Rebalancing keeps your risk in check." },
      { id: "g4s6", format: "action", headline: "Pick the region.\nNot the headline.", body: "Invest in the fundamentals of a market, not the news cycle. Countries recover. Panic doesn't compound." },
    ],
  },
  {
    id: "pitfalls",
    title: "Common Pitfalls",
    stories: [
      { id: "g5s1", format: "statement", headline: "Home bias is\nthe silent risk.", body: "Most investors put 80%+ in their home market. That's not diversification — it's familiarity masquerading as strategy." },
      { id: "g5s2", format: "statement", headline: "Currency drag\nis real but overblown.", body: "Yes, a strong dollar can hurt foreign returns short-term. Over decades, currencies mean-revert. Don't let FX fear stop you." },
      { id: "g5s3", format: "statement", headline: "Thin liquidity\nin small markets.", body: "Frontier and small-country ETFs can have wide bid-ask spreads. Use limit orders, not market orders." },
      { id: "g5s4", format: "statement", headline: "Don't over-diversify\nglobally.", body: "Owning 8 overlapping international ETFs doesn't add diversification. Two or three well-chosen funds cover most of the world." },
      { id: "g5s5", format: "comparison", headline: "Smart moves vs\ncommon traps.", body: "", leftLabel: "Smart", rightLabel: "Trap", leftPoints: ["Broad regional funds", "Check expense ratios", "Understand currency", "Limit orders"], rightPoints: ["Too many country bets", "Ignoring withholding tax", "Panic selling on FX moves", "Market orders on thin ETFs"] },
      { id: "g5s6", format: "action", headline: "Awareness\nis the edge.", body: "You don't need to avoid pitfalls perfectly. You just need to know they exist." },
    ],
  },
];

/* ── Fullscreen Module Viewer ── */

const LEARN_DURATION = 8000;

function GlobalModuleViewer({
  isOpen,
  onClose,
  initialModuleIdx = 0,
  onStorySeen,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialModuleIdx?: number;
  onStorySeen?: (moduleId: string, storyIdx: number) => void;
}) {
  const [modIdx, setModIdx] = useState(initialModuleIdx);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const currentMod = globalModules[modIdx];
  const total = currentMod.stories.length;
  const story = currentMod.stories[idx];

  const clearTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);
  const resetStory = useCallback(() => { setIdx(0); setProgress(0); elapsedRef.current = 0; }, []);

  const goNextModule = useCallback(() => {
    if (modIdx < globalModules.length - 1) { setModIdx(modIdx + 1); resetStory(); }
    else onClose();
  }, [modIdx, onClose, resetStory]);

  const goNext = useCallback(() => {
    if (idx < total - 1) { setIdx(idx + 1); setProgress(0); elapsedRef.current = 0; }
    else goNextModule();
  }, [idx, total, goNextModule]);

  const goPrev = useCallback(() => {
    if (idx > 0) { setIdx(idx - 1); setProgress(0); elapsedRef.current = 0; }
  }, [idx]);

  useEffect(() => { if (!isOpen) return; setModIdx(initialModuleIdx); resetStory(); }, [isOpen, initialModuleIdx, resetStory]);
  useEffect(() => { if (isOpen && currentMod) onStorySeen?.(currentMod.id, idx); }, [isOpen, modIdx, idx, currentMod, onStorySeen]);

  useEffect(() => {
    if (!isOpen || paused) { clearTimer(); return; }
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const el = elapsedRef.current + (Date.now() - startRef.current);
      const p = Math.min(el / LEARN_DURATION, 1);
      setProgress(p);
      if (p >= 1) goNext();
    }, 50);
    return clearTimer;
  }, [isOpen, paused, idx, modIdx, goNext, clearTimer]);

  const handleTap = (e: React.MouseEvent) => { if (e.clientX < window.innerWidth * 0.3) goPrev(); else goNext(); };
  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; setPaused(true); elapsedRef.current += Date.now() - startRef.current; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    setPaused(false);
    if (!touchStartRef.current) return;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x);
    touchStartRef.current = null;
    if (dy < -60 && dx < Math.abs(dy) * 0.7) goNextModule();
  };

  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={modIdx}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0 flex flex-col bg-neutral-950"
          onClick={handleTap}
          onPointerDown={() => { setPaused(true); elapsedRef.current += Date.now() - startRef.current; }}
          onPointerUp={() => setPaused(false)}
        >
          <div className="flex gap-1 px-4 pt-3 pb-2">
            {currentMod.stories.map((_, i) => (
              <div key={i} className="flex-1 h-[2px] rounded-full bg-white/20 overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: i < idx ? "100%" : i === idx ? `${progress * 100}%` : "0%", transition: i === idx ? "none" : "width 0.2s" }} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-5 py-2">
            <span className="text-[12px] font-semibold text-gray-400 tracking-wider uppercase">{currentMod.title} · {modIdx + 1}/{globalModules.length}</span>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-500 text-[14px] font-semibold active:text-gray-900 transition-colors">Close</button>
          </div>
          <div className="flex-1 flex items-center justify-center px-8">
            <AnimatePresence mode="wait">
              <motion.div key={story.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="w-full max-w-[380px]">
                {story.format === "statement" && (
                  <div className="text-center">
                    <p className="text-[28px] font-bold text-gray-900 leading-[1.2] tracking-tight whitespace-pre-line mb-5">{story.headline}</p>
                    <div className="h-px w-10 bg-white/20 mx-auto mb-5" />
                    <p className="text-[16px] text-gray-400 leading-relaxed">{story.body}</p>
                  </div>
                )}
                {story.format === "number" && (
                  <div className="text-center">
                    <p className="text-[56px] font-black text-gray-900 leading-none tracking-tight tabular-nums mb-2">{story.stat}</p>
                    <p className="text-[14px] text-gray-400 mb-8">{story.statCaption}</p>
                    <p className="text-[24px] font-bold text-gray-900 leading-[1.2] tracking-tight whitespace-pre-line mb-4">{story.headline}</p>
                    <p className="text-[15px] text-gray-400 leading-relaxed">{story.body}</p>
                  </div>
                )}
                {story.format === "comparison" && (
                  <div>
                    <p className="text-[24px] font-bold text-gray-900 leading-[1.2] tracking-tight whitespace-pre-line text-center mb-6">{story.headline}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/8 p-4">
                        <p className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">{story.leftLabel}</p>
                        <div className="space-y-2.5">{story.leftPoints?.map((p, i) => (<div key={i} className="flex items-start gap-2"><Check size={14} strokeWidth={3} className="shrink-0 text-gray-500 mt-0.5" /><span className="text-[13px] text-gray-500 leading-tight">{p}</span></div>))}</div>
                      </div>
                      <div className="rounded-2xl bg-white/4 p-4">
                        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">{story.rightLabel}</p>
                        <div className="space-y-2.5">{story.rightPoints?.map((p, i) => (<div key={i} className="flex items-start gap-2"><X size={14} strokeWidth={3} className="shrink-0 text-gray-300 mt-0.5" /><span className="text-[13px] text-gray-400 leading-tight">{p}</span></div>))}</div>
                      </div>
                    </div>
                  </div>
                )}
                {story.format === "action" && (
                  <div className="text-center">
                    <p className="text-[28px] font-bold text-gray-900 leading-[1.2] tracking-tight whitespace-pre-line mb-5">{story.headline}</p>
                    <div className="h-px w-10 bg-white/20 mx-auto mb-5" />
                    <p className="text-[16px] text-gray-400 leading-relaxed">{story.body}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="px-8 pb-8 text-center space-y-2">
            <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-[0.2em]">{idx + 1} of {total}</p>
            {modIdx < globalModules.length - 1 && <p className="text-[10px] text-gray-300">Swipe up for next module</p>}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Level Up Footer — Horizontal scroll of square module cards ── */

const globalModuleDescriptions: Record<string, string> = {
  "why-global": "The other 40% of the market worth owning",
  "how-global-etfs": "Same mechanics, bigger playground",
  "reading-global": "Country, currency, and tax — decoded",
  "picking-markets": "Developed, emerging, or everywhere",
  "pitfalls": "The traps to sidestep before you buy",
};

function GlobalLevelUpFooter() {
  const [activeModuleIdx, setActiveModuleIdx] = useState<number | null>(null);
  const [seenMap, setSeenMap] = useState<Record<string, Set<number>>>({});

  const handleStorySeen = useCallback((moduleId: string, storyIdx: number) => {
    setSeenMap((prev) => {
      const s = new Set(prev[moduleId] ?? []);
      s.add(storyIdx);
      return { ...prev, [moduleId]: s };
    });
  }, []);

  return (
    <>
      <div className="-mx-5 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-5">
          {globalModules.map((mod, i) => {
            const seen = seenMap[mod.id]?.size ?? 0;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModuleIdx(i)}
                className="shrink-0 w-[260px] h-[320px] relative overflow-hidden rounded-3xl bg-muted text-left active:scale-[0.98] transition-transform"
              >
                <div className="relative flex h-full flex-col p-5">
                  {/* Top — title + one-liner */}
                  <div>
                    <p className="text-[20px] font-bold text-foreground leading-[1.15] tracking-tight mb-1">
                      {mod.title}
                    </p>
                    <p className="text-[13px] text-muted-foreground leading-snug">
                      {globalModuleDescriptions[mod.id] ?? ""}
                    </p>
                  </div>

                  {/* Illustration slot — placeholder until art drops in */}
                  <div className="flex-1" aria-hidden />

                  {/* Bottom — stories count + arrow */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-muted-foreground">
                      {seen > 0 ? `${seen} of ${mod.stories.length} stories` : `${mod.stories.length} stories`}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {activeModuleIdx !== null && (
            <GlobalModuleViewer isOpen={activeModuleIdx !== null} onClose={() => setActiveModuleIdx(null)} initialModuleIdx={activeModuleIdx} onStorySeen={handleStorySeen} />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Export                                                         */
/* ------------------------------------------------------------------ */

export function GlobalETFFundedNotTraded() {
  const [region, setRegion] = useState<RegionTabId>("europe");

  const popularEtfs = regionPopularETFs[region];
  const etfPool = regionETFPool[region];

  return (
    <div className="space-y-14 px-5 pt-5 pb-4">
      <GlobalHero />
      <RegionFlagTiles active={region} onChange={setRegion} />
      <PopularETFsWidget
        title="Popular ETFs"
        subtitle="What other Aspora members are putting their money into."
        etfs={popularEtfs}
      />
      <AllETFsWidget etfs={etfPool} />
      <GlobalLevelUpFooter />
    </div>
  );
}
