"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import {
  Play,
  Shield,
  TrendingUp,
  Clock,
  Users,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  Lock,
  Scale,
  FileText,
  AlertTriangle,
  Landmark,
  ArrowRight,
  Gem,
  Target,
  Zap,
  ChevronDown,
  BarChart3,
  ArrowUpDown,
  Check,
  Layers,
  Cpu,
  HeartPulse,
  Leaf,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ------------------------------------------------------------------ */
/*  Marquee pill data                                                  */
/* ------------------------------------------------------------------ */

const marqueePills = [
  { icon: Users, label: "Expert-Managed" },
  { icon: TrendingUp, label: "Proven Strategies" },
  { icon: Clock, label: "Time-Saving" },
  { icon: RefreshCw, label: "Auto-Rebalanced" },
  { icon: Shield, label: "DFSA Regulated" },
  { icon: Lock, label: "Segregated Accounts" },
  { icon: Scale, label: "Fiduciary Duty" },
  { icon: BarChart3, label: "Back-Tested 15+ Years" },
  { icon: Gem, label: "Quarterly Reports" },
  { icon: Target, label: "Goal-Aligned" },
];

/* ------------------------------------------------------------------ */
/*  Baskets data — 15 baskets with asset class + filters               */
/* ------------------------------------------------------------------ */

type RiskLevel = 1 | 2 | 3 | 4 | 5;
type AssetClass = "Stocks" | "ETF" | "Combination";
type MinAmount = "5K" | "10K" | "25K";

const riskLabels: Record<RiskLevel, string> = {
  1: "Capital Preservation",
  2: "Conservative",
  3: "Balanced",
  4: "Growth",
  5: "Aggressive",
};

interface Basket {
  id: string;
  name: string;
  description: string;
  suitableFor: string;
  minInvestment: string;
  minFilter: MinAmount;
  cagr: string;
  cagrYears: number;
  maxDrawdown: string;
  risk: RiskLevel;
  stocks: number;
  icon: LucideIcon;
  color: string;
  rebalance: "Weekly" | "Monthly" | "Quarterly" | "Yearly";
  assetClass: AssetClass;
  tickers: string[];
}

const baskets: Basket[] = [
  { id: "b1", name: "Blue Chip Leaders", description: "Large-cap US equities with proven track records and consistent dividends", suitableFor: "Ideal for long-term investors seeking stable, reliable growth", minInvestment: "5,000", minFilter: "5K", cagr: "14.2%", cagrYears: 10, maxDrawdown: "-8.3%", risk: 2, stocks: 15, icon: Shield, color: "bg-blue-500/15 text-blue-400", rebalance: "Quarterly", assetClass: "Stocks", tickers: ["AAPL", "MSFT", "JNJ", "PG"] },
  { id: "b2", name: "Growth Accelerator", description: "High-growth companies disrupting industries with strong revenue momentum", suitableFor: "For aggressive investors comfortable with higher volatility", minInvestment: "10,000", minFilter: "10K", cagr: "22.8%", cagrYears: 5, maxDrawdown: "-28.4%", risk: 5, stocks: 12, icon: Zap, color: "bg-emerald-500/15 text-emerald-400", rebalance: "Monthly", assetClass: "Stocks", tickers: ["TSLA", "SHOP", "SQ", "PLTR"] },
  { id: "b3", name: "Dividend Compounder", description: "Steady income generators with 10+ years of consecutive dividend growth", suitableFor: "Perfect for income-focused investors nearing or in retirement", minInvestment: "5,000", minFilter: "5K", cagr: "11.6%", cagrYears: 15, maxDrawdown: "-5.1%", risk: 1, stocks: 20, icon: Gem, color: "bg-amber-500/15 text-amber-400", rebalance: "Yearly", assetClass: "Stocks", tickers: ["KO", "PEP", "MMM", "XOM"] },
  { id: "b4", name: "AI & Tech Frontier", description: "Companies leading the AI revolution across semiconductors, cloud, and software", suitableFor: "For tech-savvy investors who believe in the AI megatrend", minInvestment: "10,000", minFilter: "10K", cagr: "28.4%", cagrYears: 3, maxDrawdown: "-31.2%", risk: 5, stocks: 10, icon: Cpu, color: "bg-purple-500/15 text-purple-400", rebalance: "Monthly", assetClass: "Stocks", tickers: ["NVDA", "AMD", "GOOGL", "META"] },
  { id: "b5", name: "All-Weather", description: "Balanced mix of sectors built to perform across market cycles", suitableFor: "Great for moderate investors who want diversified, hands-off exposure", minInvestment: "5,000", minFilter: "5K", cagr: "12.9%", cagrYears: 10, maxDrawdown: "-11.7%", risk: 3, stocks: 25, icon: Scale, color: "bg-cyan-500/15 text-cyan-400", rebalance: "Quarterly", assetClass: "Combination", tickers: ["AAPL", "VTI", "BND", "GLD"] },
  { id: "b6", name: "Global ETF Core", description: "Diversified exposure across US, international, and emerging market ETFs", suitableFor: "For passive investors seeking broad, low-cost global diversification", minInvestment: "5,000", minFilter: "5K", cagr: "10.8%", cagrYears: 10, maxDrawdown: "-7.6%", risk: 2, stocks: 8, icon: Globe, color: "bg-sky-500/15 text-sky-400", rebalance: "Quarterly", assetClass: "ETF", tickers: ["VTI", "VXUS", "VWO", "BND"] },
  { id: "b7", name: "Healthcare Innovation", description: "Biotech, pharma, and medtech companies shaping the future of medicine", suitableFor: "For thematic investors bullish on healthcare breakthroughs", minInvestment: "10,000", minFilter: "10K", cagr: "18.5%", cagrYears: 5, maxDrawdown: "-19.8%", risk: 4, stocks: 12, icon: HeartPulse, color: "bg-rose-500/15 text-rose-400", rebalance: "Monthly", assetClass: "Stocks", tickers: ["UNH", "LLY", "ISRG", "ABBV"] },
  { id: "b8", name: "Clean Energy", description: "Solar, wind, EV, and battery companies driving the energy transition", suitableFor: "For impact-driven investors aligned with the green transition", minInvestment: "10,000", minFilter: "10K", cagr: "16.2%", cagrYears: 5, maxDrawdown: "-22.5%", risk: 4, stocks: 14, icon: Leaf, color: "bg-lime-500/15 text-lime-400", rebalance: "Quarterly", assetClass: "Combination", tickers: ["TSLA", "ENPH", "ICLN", "FSLR"] },
  { id: "b9", name: "Income & Growth ETF", description: "High-yield bond and dividend ETFs blended for steady income with upside", suitableFor: "Suited for conservative investors prioritizing regular income", minInvestment: "5,000", minFilter: "5K", cagr: "9.4%", cagrYears: 10, maxDrawdown: "-4.2%", risk: 1, stocks: 6, icon: Layers, color: "bg-indigo-500/15 text-indigo-400", rebalance: "Yearly", assetClass: "ETF", tickers: ["SCHD", "JEPI", "HYG", "VYM"] },
  { id: "b10", name: "Mega Cap Momentum", description: "Top 10 US companies by market cap, rebalanced for momentum signals", suitableFor: "For experienced investors chasing momentum in blue chips", minInvestment: "25,000", minFilter: "25K", cagr: "19.7%", cagrYears: 5, maxDrawdown: "-14.3%", risk: 3, stocks: 10, icon: TrendingUp, color: "bg-orange-500/15 text-orange-400", rebalance: "Weekly", assetClass: "Stocks", tickers: ["AAPL", "MSFT", "AMZN", "NVDA"] },
  { id: "b11", name: "Small Cap Value", description: "Undervalued small-cap stocks with strong fundamentals and turnaround potential", suitableFor: "For patient investors hunting deep value in smaller companies", minInvestment: "10,000", minFilter: "10K", cagr: "17.1%", cagrYears: 5, maxDrawdown: "-26.8%", risk: 5, stocks: 20, icon: Target, color: "bg-teal-500/15 text-teal-400", rebalance: "Monthly", assetClass: "Stocks", tickers: ["CPRX", "CALM", "SMCI", "CROX"] },
  { id: "b12", name: "ETF Sector Rotation", description: "Dynamic allocation across sector ETFs based on macro and technical signals", suitableFor: "For tactical investors who want active sector timing", minInvestment: "25,000", minFilter: "25K", cagr: "15.3%", cagrYears: 5, maxDrawdown: "-13.1%", risk: 3, stocks: 5, icon: RefreshCw, color: "bg-violet-500/15 text-violet-400", rebalance: "Weekly", assetClass: "ETF", tickers: ["XLK", "XLF", "XLE", "XLV"] },
  { id: "b13", name: "Balanced 60/40", description: "Classic 60% equity / 40% bond allocation using low-cost ETFs", suitableFor: "For risk-averse investors who want a set-and-forget portfolio", minInvestment: "5,000", minFilter: "5K", cagr: "8.7%", cagrYears: 15, maxDrawdown: "-6.9%", risk: 2, stocks: 4, icon: Scale, color: "bg-slate-500/15 text-slate-400", rebalance: "Yearly", assetClass: "ETF", tickers: ["SPY", "AGG", "TLT", "VTI"] },
  { id: "b14", name: "FAANG+", description: "Concentrated bet on mega-cap tech leaders plus next-gen contenders", suitableFor: "For high-conviction investors betting big on tech dominance", minInvestment: "25,000", minFilter: "25K", cagr: "24.1%", cagrYears: 5, maxDrawdown: "-21.6%", risk: 4, stocks: 8, icon: Zap, color: "bg-pink-500/15 text-pink-400", rebalance: "Monthly", assetClass: "Stocks", tickers: ["META", "AAPL", "AMZN", "NFLX"] },
  { id: "b15", name: "Hybrid Growth", description: "Best-of-both: growth stocks paired with thematic ETFs for diversified upside", suitableFor: "For balanced growth seekers who want stock + ETF diversification", minInvestment: "10,000", minFilter: "10K", cagr: "20.3%", cagrYears: 5, maxDrawdown: "-15.7%", risk: 3, stocks: 15, icon: Layers, color: "bg-fuchsia-500/15 text-fuchsia-400", rebalance: "Quarterly", assetClass: "Combination", tickers: ["MSFT", "GOOGL", "QQQ", "ARKK"] },
];

/* ------------------------------------------------------------------ */
/*  DIFC Compliance data                                               */
/* ------------------------------------------------------------------ */

const compliancePoints = [
  { icon: Landmark, title: "DIFC Regulated", description: "Atom Privé is licensed and regulated by the Dubai Financial Services Authority (DFSA) within the DIFC." },
  { icon: Lock, title: "Segregated Accounts", description: "Your assets are held in segregated custody accounts — never commingled with firm assets." },
  { icon: Shield, title: "Investor Protection", description: "Full compliance with DFSA Client Money & Asset rules, with independent audits." },
  { icon: Scale, title: "Fiduciary Duty", description: "We are legally bound to act in your best interest. Your goals come first, always." },
  { icon: FileText, title: "Transparent Reporting", description: "Quarterly performance reports, fee breakdowns, and rebalancing logs — all accessible in-app." },
];

/* ------------------------------------------------------------------ */
/*  Filter options                                                     */
/* ------------------------------------------------------------------ */

type SortOption = "high-return" | "low-return" | "min-low" | "min-high" | "risk-low" | "risk-high";

const sortLabels: Record<SortOption, string> = {
  "high-return": "Highest Returns",
  "low-return": "Lowest Returns",
  "min-low": "Min. Investment (Low → High)",
  "min-high": "Min. Investment (High → Low)",
  "risk-low": "Risk (Low → High)",
  "risk-high": "Risk (High → Low)",
};

function sortBaskets(list: Basket[], sort: SortOption): Basket[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case "high-return": return parseFloat(b.cagr) - parseFloat(a.cagr);
      case "low-return": return parseFloat(a.cagr) - parseFloat(b.cagr);
      case "min-low": return parseInt(a.minInvestment.replace(/,/g, "")) - parseInt(b.minInvestment.replace(/,/g, ""));
      case "min-high": return parseInt(b.minInvestment.replace(/,/g, "")) - parseInt(a.minInvestment.replace(/,/g, ""));
      case "risk-low": return a.risk - b.risk;
      case "risk-high": return b.risk - a.risk;
      default: return 0;
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MarqueePills() {
  // Double the pills for seamless loop
  const doubled = [...marqueePills, ...marqueePills];

  return (
    <div className="overflow-hidden py-1">
      <motion.div
        className="flex gap-2.5 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((pill, i) => {
          const Icon = pill.icon;
          return (
            <div
              key={`${pill.label}-${i}`}
              className="flex items-center gap-1.5 shrink-0 rounded-full bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3.5 py-2"
            >
              <Icon size={14} className="text-zinc-500 dark:text-zinc-400" />
              <span className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">{pill.label}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-5 mb-4">
      <h2 className="text-[20px] font-bold text-foreground">{title}</h2>
      {subtitle && (
        <p className="text-[15px] text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function TickerLogo({ ticker }: { ticker: string }) {
  return (
    <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center">
      <span className="text-[9px] font-bold text-muted-foreground">{ticker.slice(0, 3)}</span>
    </div>
  );
}

const riskTagColor: Record<RiskLevel, string> = {
  1: "text-emerald-400 bg-emerald-500/15",
  2: "text-sky-400 bg-sky-500/15",
  3: "text-amber-400 bg-amber-500/15",
  4: "text-orange-400 bg-orange-500/15",
  5: "text-rose-400 bg-rose-500/15",
};

function BasketCard({ basket }: { basket: Basket }) {
  const router = useRouter();
  return (
    <motion.div
      variants={staggerItem}
      onClick={() => router.push(`/baskets/${basket.id}`)}
      className="mx-5 rounded-2xl bg-card border border-border/40 p-4 cursor-pointer active:scale-[0.98] transition-transform"
    >
      {/* Top row: name + risk badge + CAGR hero */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block mb-1.5", riskTagColor[basket.risk])}>
            {riskLabels[basket.risk]}
          </span>
          <p className="text-[17px] font-bold text-foreground">{basket.name}</p>
          <p className="text-[13px] text-muted-foreground mt-1 leading-snug">{basket.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[22px] font-bold text-gain leading-none">{basket.cagr}</p>
          <p className="text-[11px] text-muted-foreground mt-1">CAGR · {basket.cagrYears}Y</p>
        </div>
      </div>

      {/* Suitable for */}
      <p className="text-[13px] text-foreground/60 mt-2 italic">{basket.suitableFor}</p>

      {/* Bottom section: stats row with ticker logos */}
      <div className="mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-1.5">
              {basket.tickers.map((t) => <TickerLogo key={t} ticker={t} />)}
            </div>
            {basket.stocks > basket.tickers.length && (
              <span className="text-[13px] font-semibold text-muted-foreground ml-2">+{basket.stocks - basket.tickers.length}</span>
            )}
          </div>
          <div className="w-px h-6 bg-border/40" />
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Rebal.</p>
            <p className="text-[13px] font-semibold text-foreground">{basket.rebalance}</p>
          </div>
          <div className="w-px h-6 bg-border/40" />
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Max DD</p>
            <p className="text-[13px] font-semibold text-loss">{basket.maxDrawdown}</p>
          </div>
          <div className="w-px h-6 bg-border/40" />
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">Min.</p>
            <p className="text-[13px] font-semibold text-foreground">{basket.minInvestment}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function AdvisoryBaskets({ onDismiss }: { onDismiss?: () => void }) {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filters & Sort
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("high-return");
  const [showSortSheet, setShowSortSheet] = useState(false);

  const filteredBaskets = useMemo(() => {
    const filtered = baskets.filter((b) => {
      if (riskFilter !== "All" && b.risk !== riskFilter) return false;
      return true;
    });
    return sortBaskets(filtered, sortBy);
  }, [riskFilter, sortBy]);

  const handleDisclaimerScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || hasScrolledToBottom) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  return (
    <div className="pb-8">
      {/* ============================================================ */}
      {/*  DIFC DISCLAIMER BOTTOM SHEET                                  */}
      {/* ============================================================ */}
      <Sheet open={showDisclaimer} onOpenChange={(open) => { if (!open) onDismiss?.(); }}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl px-0 pb-8 pt-2 max-h-[92vh] flex flex-col"
        >
          <div className="flex justify-center py-3">
            <div className="w-9 h-[4px] rounded-full bg-muted-foreground/30" />
          </div>

          <SheetHeader className="px-5 mb-0 text-center">
            <SheetTitle className="text-[20px] font-bold">Advisory Services</SheetTitle>
            <SheetDescription className="text-[15px] text-muted-foreground mt-1">
              Powered by Atom Privé — a DIFC-regulated entity
            </SheetDescription>
          </SheetHeader>

          <div
            ref={scrollRef}
            onScroll={handleDisclaimerScroll}
            className="flex-1 overflow-y-auto no-scrollbar px-5 mt-4 space-y-5 relative"
          >
            {/* Video placeholder */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-muted aspect-video cursor-pointer group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-active:scale-90 transition-transform">
                  <Play className="text-gray-900 ml-0.5 w-6 h-6" fill="white" />
                </div>
              </div>
              <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5">
                <span className="text-[12px] font-medium text-gray-900/90 tabular-nums">0:30</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                <p className="text-[17px] font-semibold text-gray-900">What is Atom Privé Advisory?</p>
                <p className="text-[13px] text-gray-600 mt-0.5">A 30-second overview</p>
              </div>
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="w-full h-full" style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }} />
              </div>
            </div>

            <p className="text-[14px] text-muted-foreground leading-relaxed text-center">
              Advisory basket services are provided by{" "}
              <span className="font-semibold text-foreground">Atom Privé Ltd</span>, regulated
              by the DFSA within the DIFC. These services are not provided by Aspora.
            </p>

            {/* Entity Details */}
            <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
              <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Entity Details</p>
              {[
                { label: "Entity Name", value: "Atom Privé Ltd" },
                { label: "Regulator", value: "Dubai Financial Services Authority (DFSA)" },
                { label: "Jurisdiction", value: "Dubai International Financial Centre (DIFC)" },
                { label: "License Category", value: "Category 3C" },
                { label: "License Number", value: "CL-XXXX" },
                { label: "Registered Address", value: "Gate Village, DIFC, Dubai, UAE" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-start gap-4">
                  <span className="text-[14px] text-muted-foreground shrink-0">{item.label}</span>
                  <span className="text-[14px] text-foreground font-medium text-right">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Regulatory Disclosures */}
            <div className="space-y-3">
              <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Regulatory Disclosures</p>
              {[
                { icon: Lock, title: "Segregated Custody", text: "All client assets are held in segregated custody accounts with qualified custodians, separate from the firm's own assets, in compliance with DFSA Client Money & Asset Rules." },
                { icon: Scale, title: "Fiduciary Standard", text: "Atom Privé is bound by a fiduciary duty under DIFC law to act in the best interest of its clients at all times." },
                { icon: Shield, title: "Investor Protection", text: "The DIFC operates under an independent, internationally recognized legal and regulatory framework modeled on English common law." },
                { icon: FileText, title: "Transparent Fee Structure", text: "All fees, charges, and commissions are disclosed upfront before you invest. There are no hidden costs." },
                { icon: Landmark, title: "Complaints & Dispute Resolution", text: "Complaints may be directed to Atom Privé's compliance department or escalated to the DFSA." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl bg-card border border-border/40 p-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={16} className="text-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[15px] font-semibold text-foreground">{item.title}</p>
                        <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Risk Warning */}
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
              <div className="flex gap-3 items-start">
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] font-semibold text-amber-400">Risk Warning</p>
                  <p className="text-[13px] text-amber-400/80 mt-1.5 leading-relaxed">
                    Investing in securities involves risk, including the potential loss of principal.
                    Past performance is not indicative of future results. Advisory portfolios carry a
                    recommended minimum holding period — early withdrawal may result in additional charges.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[13px] text-muted-foreground leading-relaxed text-center">
              By proceeding, you confirm that you have read and understood the risk disclosures
              and regulatory information above, and that advisory services are provided by
              Atom Privé Ltd under DFSA regulation.
            </p>
          </div>

          {/* Sticky CTA */}
          <div className="px-5 pt-4 mt-auto">
            <AnimatePresence>
              {!hasScrolledToBottom && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1.5 mb-3"
                >
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  >
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </motion.div>
                  <span className="text-[13px] text-muted-foreground">Scroll to read all disclosures</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              disabled={!hasScrolledToBottom}
              onClick={() => {
                setShowDisclaimer(false);
                setHasScrolledToBottom(false);
              }}
              className={cn(
                "w-full h-[52px] rounded-xl font-semibold text-[16px] transition-all duration-300 flex items-center justify-center gap-2",
                hasScrolledToBottom
                  ? "bg-foreground text-background active:opacity-80"
                  : "bg-muted text-muted-foreground/50 cursor-not-allowed"
              )}
            >
              I Acknowledge & Accept
            </button>
            <p className="text-[12px] text-muted-foreground text-center mt-3">
              By proceeding, you consent to Atom Privé&apos;s terms of service and privacy policy.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* ============================================================ */}
      {/*  HERO — Marquee + Q&A (inverted colors)                        */}
      {/* ============================================================ */}
      <motion.section
        initial="hidden"
        animate="visible"
        className="bg-zinc-100 dark:bg-zinc-900 pt-5 pb-6"
      >
        {/* Powered by + Tagline */}
        <motion.div custom={0} variants={fadeUp} className="text-center mb-4 px-5">
          <p className="text-[13px] text-zinc-500 dark:text-zinc-500 tracking-wide">Powered by <span className="font-semibold text-zinc-700 dark:text-zinc-300">Atom Privé</span></p>
          <p className="text-[22px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-2">
            Make your money work
            <br />
            harder than you do.
          </p>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
            Don&apos;t work. We will, on your behalf.
          </p>
        </motion.div>

        {/* Video block — play button only */}
        <motion.div custom={1} variants={fadeUp} className="px-5">
          <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 aspect-[16/9] cursor-pointer group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-black/15 dark:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform group-active:scale-90">
                <Play className="text-zinc-800 dark:text-gray-900 ml-0.5 w-7 h-7" fill="currentColor" />
              </div>
            </div>
            <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5">
              <span className="text-[12px] font-medium text-gray-900/90 tabular-nums">4:32</span>
            </div>
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="w-full h-full" style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }} />
            </div>
          </div>
        </motion.div>

        {/* Marquee pills — inverted */}
        <motion.div custom={2} variants={fadeUp} className="mt-4">
          <MarqueePills />
        </motion.div>

        {/* Q&A card */}
        <motion.div custom={3} variants={fadeUp} className="mt-4 px-5">
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3.5 cursor-pointer active:scale-[0.98] transition-transform">
            <div className="w-11 h-11 rounded-xl bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center shrink-0">
              <Play size={18} className="text-zinc-700 dark:text-zinc-200 ml-0.5" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">Get all your questions answered</p>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">15 questions · 11 min video</p>
            </div>
            <ChevronRight size={18} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
          </div>
        </motion.div>

        {/* CTA — Book consultation */}
        <motion.div custom={4} variants={fadeUp} className="mt-4 px-5">
          <button className="w-full h-[50px] rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-semibold text-[16px] active:opacity-80 transition-opacity flex items-center justify-center gap-2">
            Schedule a Free Consultation
            <ArrowRight size={16} />
          </button>
          <p className="text-[12px] text-zinc-400 dark:text-zinc-500 text-center mt-2">Book a 15-min intro with a portfolio advisor</p>
        </motion.div>
      </motion.section>

      {/* Divider */}
      <div className="h-2 bg-muted/50 my-5" />

      {/* ============================================================ */}
      {/*  FEE STRUCTURE (compact)                                        */}
      {/* ============================================================ */}
      <section className="mb-1">
        <SectionHeader
          title="Transparent Pricing"
          subtitle="No hidden fees"
        />

        <div className="mx-5 rounded-2xl bg-card border border-border/40 divide-y divide-border/40">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <FileText size={15} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Management Fee</p>
                <p className="text-[12px] text-muted-foreground">Charged daily on portfolio value</p>
              </div>
            </div>
            <p className="text-[17px] font-bold text-foreground">0.6%<span className="text-[12px] font-normal text-muted-foreground">/yr</span></p>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <AlertTriangle size={15} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Exit Load</p>
                <p className="text-[12px] text-muted-foreground">Early withdrawal only</p>
              </div>
            </div>
            <p className="text-[17px] font-bold text-foreground">0.5%</p>
          </div>

          <div className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Shield size={15} className="text-emerald-400" />
            </div>
            <p className="text-[15px] font-semibold text-foreground">No Aspera charges</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-2 bg-muted/50 my-5" />

      {/* ============================================================ */}
      {/*  BASKETS — Filters + List                                      */}
      {/* ============================================================ */}
      <section>
        <SectionHeader
          title="Explore Baskets"
          subtitle="Curated by experts, managed for you"
        />

        {/* Risk profile pills + sort */}
        <div className="px-5 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
              {/* All pill */}
              <button
                onClick={() => setRiskFilter("All")}
                className={cn(
                  "h-[36px] px-3.5 rounded-full text-[14px] font-medium transition-colors border shrink-0",
                  riskFilter === "All"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border active:bg-muted/50"
                )}
              >
                All
              </button>
              {/* Risk level pills */}
              {([1, 2, 3, 4, 5] as RiskLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setRiskFilter(riskFilter === level ? "All" : level)}
                  className={cn(
                    "h-[36px] px-3.5 rounded-full text-[13px] font-medium transition-colors border shrink-0",
                    riskFilter === level
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border active:bg-muted/50"
                  )}
                >
                  {riskLabels[level]}
                </button>
              ))}
            </div>

            {/* Sort button */}
            <button
              onClick={() => setShowSortSheet(true)}
              className="h-[36px] px-3 rounded-full border border-border text-muted-foreground active:bg-muted/50 transition-colors shrink-0"
            >
              <ArrowUpDown size={16} />
            </button>
          </div>

        </div>

        {/* Sort Bottom Sheet */}
        <Sheet open={showSortSheet} onOpenChange={setShowSortSheet}>
          <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-8 pt-2">
            <div className="flex justify-center py-3">
              <div className="w-9 h-[4px] rounded-full bg-muted-foreground/30" />
            </div>
            <SheetTitle className="text-[18px] font-bold mb-4">Sort By</SheetTitle>
            <div className="space-y-1">
              {(["high-return", "low-return", "min-low", "min-high", "risk-low", "risk-high"] as SortOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSortBy(opt); setShowSortSheet(false); }}
                  className={cn(
                    "w-full flex items-center justify-between rounded-xl px-5 py-3.5 text-left transition-colors",
                    sortBy === opt ? "bg-muted text-foreground" : "text-muted-foreground active:bg-muted/50"
                  )}
                >
                  <span className="text-[15px] font-medium">{sortLabels[opt]}</span>
                  {sortBy === opt && <Check size={18} className="text-foreground" />}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Basket list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${riskFilter}-${sortBy}`}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-3"
          >
            {filteredBaskets.length > 0 ? (
              filteredBaskets.map((b) => (
                <BasketCard key={b.id} basket={b} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-5">
                <HelpCircle size={32} className="text-muted-foreground/40 mb-3" />
                <p className="text-[15px] text-muted-foreground text-center">
                  No baskets match your filters.
                  <br />
                  Try adjusting your criteria.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Divider */}
      <div className="h-2 bg-muted/50 my-5" />

      {/* ============================================================ */}
      {/*  DIFC COMPLIANCE                                               */}
      {/* ============================================================ */}
      <section>
        <SectionHeader
          title="Regulated & Secure"
          subtitle="Your trust is protected by DIFC law"
        />

        <div className="mx-5 mb-4 rounded-2xl bg-card border border-border/40 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Landmark size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-[17px] font-bold text-foreground">DFSA Regulated</p>
              <p className="text-[14px] text-muted-foreground">License No. CL-XXXX</p>
            </div>
          </div>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Atom Privé operates under a Category 3C license issued by the Dubai Financial
            Services Authority (DFSA), the independent regulator of the Dubai International
            Financial Centre (DIFC).
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="space-y-0"
        >
          {compliancePoints.map((cp) => {
            const Icon = cp.icon;
            return (
              <motion.div
                key={cp.title}
                variants={staggerItem}
                className="flex gap-3.5 items-start px-5 py-3.5"
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={18} className="text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-foreground">{cp.title}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">{cp.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mx-5 mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <div className="flex gap-3 items-start">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-semibold text-amber-400">Important Risk Disclosure</p>
              <p className="text-[13px] text-amber-400/80 mt-1 leading-snug">
                Investments in securities carry risk. Past performance does not guarantee future
                results. The value of investments may go down as well as up. Advisory portfolios
                have a recommended minimum holding period — early exits may incur charges.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-5 mt-4">
          {["Risk Disclosure", "Terms of Service", "Privacy Policy", "Fee Schedule"].map((doc) => (
            <button
              key={doc}
              className="h-[34px] px-3 rounded-lg border border-border/60 text-[13px] text-muted-foreground active:bg-muted/50 transition-colors"
            >
              {doc}
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
