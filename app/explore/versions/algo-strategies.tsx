"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Shield,
  Clock,
  ArrowUpDown,
  Check,
  ChevronRight,
  Play,
  Lock,
  AlertTriangle,
  Bot,
  Cpu,
  Gauge,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

/* ------------------------------------------------------------------ */
/*  Strategy data                                                      */
/* ------------------------------------------------------------------ */

type RiskLevel = 1 | 2 | 3 | 4 | 5;
type StrategyType = "Momentum" | "Mean Reversion" | "Trend Following" | "Arbitrage" | "Quant Factor" | "Volatility";
type Frequency = "High" | "Medium" | "Low";

const riskLabels: Record<RiskLevel, string> = {
  1: "Conservative",
  2: "Moderate",
  3: "Balanced",
  4: "Aggressive",
  5: "High Risk",
};

interface Strategy {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  icon: LucideIcon;
  color: string;
  cagr: string;
  cagrYears: number;
  sharpe: string;
  maxDrawdown: string;
  winRate: string;
  risk: RiskLevel;
  frequency: Frequency;
  minInvestment: string;
  tradesPerMonth: string;
  instruments: string[];
  backtestYears: number;
  live: boolean;
}

const strategies: Strategy[] = [
  {
    id: "s1", name: "Momentum Alpha", description: "Captures price momentum across large-cap US equities using 20/50-day crossover signals with volume confirmation",
    type: "Momentum", icon: TrendingUp, color: "bg-emerald-500/15 text-emerald-400", cagr: "18.7%", cagrYears: 5, sharpe: "1.84", maxDrawdown: "-12.3%", winRate: "62%", risk: 3, frequency: "Medium", minInvestment: "10,000", tradesPerMonth: "8-12", instruments: ["AAPL", "MSFT", "NVDA", "GOOGL"], backtestYears: 10, live: true,
  },
  {
    id: "s2", name: "Mean Reversion Pro", description: "Exploits short-term price overreactions in S&P 500 stocks using Bollinger Bands and RSI confluence",
    type: "Mean Reversion", icon: Activity, color: "bg-blue-500/15 text-blue-400", cagr: "14.2%", cagrYears: 7, sharpe: "2.12", maxDrawdown: "-8.7%", winRate: "68%", risk: 2, frequency: "High", minInvestment: "5,000", tradesPerMonth: "20-30", instruments: ["SPY", "QQQ", "IWM"], backtestYears: 12, live: true,
  },
  {
    id: "s3", name: "Trend Surfer", description: "Long-only trend following strategy using adaptive moving averages with dynamic position sizing across sectors",
    type: "Trend Following", icon: LineChart, color: "bg-purple-500/15 text-purple-400", cagr: "21.4%", cagrYears: 5, sharpe: "1.56", maxDrawdown: "-18.2%", winRate: "48%", risk: 4, frequency: "Low", minInvestment: "25,000", tradesPerMonth: "3-5", instruments: ["XLK", "XLF", "XLE", "XLV", "XLI"], backtestYears: 15, live: true,
  },
  {
    id: "s4", name: "Pairs Arbitrage", description: "Statistical arbitrage on co-integrated stock pairs, market-neutral exposure with hedged positions",
    type: "Arbitrage", icon: ArrowUpDown, color: "bg-cyan-500/15 text-cyan-400", cagr: "11.8%", cagrYears: 5, sharpe: "2.45", maxDrawdown: "-4.1%", winRate: "71%", risk: 1, frequency: "High", minInvestment: "50,000", tradesPerMonth: "40-60", instruments: ["KO/PEP", "GOOGL/META", "V/MA"], backtestYears: 8, live: true,
  },
  {
    id: "s5", name: "Factor Quant", description: "Multi-factor model combining value, quality, and momentum signals with monthly portfolio optimization",
    type: "Quant Factor", icon: Cpu, color: "bg-amber-500/15 text-amber-400", cagr: "16.9%", cagrYears: 10, sharpe: "1.72", maxDrawdown: "-14.8%", winRate: "58%", risk: 3, frequency: "Low", minInvestment: "15,000", tradesPerMonth: "5-8", instruments: ["Large Cap Universe"], backtestYears: 20, live: true,
  },
  {
    id: "s6", name: "Vol Harvester", description: "Systematically sells options premium on high-IV stocks, delta-hedged for downside protection",
    type: "Volatility", icon: Gauge, color: "bg-rose-500/15 text-rose-400", cagr: "13.5%", cagrYears: 5, sharpe: "1.93", maxDrawdown: "-9.4%", winRate: "74%", risk: 2, frequency: "Medium", minInvestment: "25,000", tradesPerMonth: "10-15", instruments: ["TSLA", "NVDA", "AMZN", "SPY"], backtestYears: 7, live: true,
  },
  {
    id: "s7", name: "Breakout Hunter", description: "Identifies consolidation breakouts using volume profile and ATR-based targets, focused on mid-cap growth names",
    type: "Momentum", icon: Zap, color: "bg-orange-500/15 text-orange-400", cagr: "26.3%", cagrYears: 3, sharpe: "1.41", maxDrawdown: "-24.6%", winRate: "45%", risk: 5, frequency: "Medium", minInvestment: "10,000", tradesPerMonth: "12-18", instruments: ["Mid Cap Growth"], backtestYears: 5, live: false,
  },
  {
    id: "s8", name: "Overnight Edge", description: "Captures the overnight return anomaly by entering at close and exiting at open on select high-beta stocks",
    type: "Mean Reversion", icon: Clock, color: "bg-indigo-500/15 text-indigo-400", cagr: "15.1%", cagrYears: 5, sharpe: "1.68", maxDrawdown: "-11.2%", winRate: "59%", risk: 3, frequency: "High", minInvestment: "10,000", tradesPerMonth: "15-20", instruments: ["High Beta Universe"], backtestYears: 8, live: false,
  },
  {
    id: "s9", name: "Macro Regime", description: "Adapts allocation between equities, bonds, and cash based on macro regime detection using yield curve and VIX signals",
    type: "Trend Following", icon: BarChart3, color: "bg-teal-500/15 text-teal-400", cagr: "12.4%", cagrYears: 10, sharpe: "2.08", maxDrawdown: "-6.3%", winRate: "55%", risk: 1, frequency: "Low", minInvestment: "50,000", tradesPerMonth: "1-3", instruments: ["SPY", "TLT", "GLD", "SHY"], backtestYears: 18, live: true,
  },
  {
    id: "s10", name: "Earnings Drift", description: "Trades post-earnings announcement drift — enters after positive surprises, exits within 5-10 trading days",
    type: "Quant Factor", icon: TrendingUp, color: "bg-lime-500/15 text-lime-400", cagr: "19.8%", cagrYears: 5, sharpe: "1.52", maxDrawdown: "-16.7%", winRate: "57%", risk: 4, frequency: "Medium", minInvestment: "15,000", tradesPerMonth: "6-10", instruments: ["S&P 500 Earnings"], backtestYears: 12, live: false,
  },
];

const strategyTypes: StrategyType[] = ["Momentum", "Mean Reversion", "Trend Following", "Arbitrage", "Quant Factor", "Volatility"];

/* ------------------------------------------------------------------ */
/*  Sort options                                                       */
/* ------------------------------------------------------------------ */

type SortOption = "high-return" | "low-return" | "sharpe" | "risk-low" | "risk-high" | "win-rate";

const sortLabels: Record<SortOption, string> = {
  "high-return": "Highest Returns",
  "low-return": "Lowest Returns",
  "sharpe": "Best Sharpe Ratio",
  "risk-low": "Risk (Low to High)",
  "risk-high": "Risk (High to Low)",
  "win-rate": "Highest Win Rate",
};

function sortStrategies(list: Strategy[], sort: SortOption): Strategy[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case "high-return": return parseFloat(b.cagr) - parseFloat(a.cagr);
      case "low-return": return parseFloat(a.cagr) - parseFloat(b.cagr);
      case "sharpe": return parseFloat(b.sharpe) - parseFloat(a.sharpe);
      case "risk-low": return a.risk - b.risk;
      case "risk-high": return b.risk - a.risk;
      case "win-rate": return parseFloat(b.winRate) - parseFloat(a.winRate);
      default: return 0;
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Marquee pills                                                      */
/* ------------------------------------------------------------------ */

const marqueePills = [
  { icon: Bot, label: "Fully Automated" },
  { icon: Shield, label: "Risk-Managed" },
  { icon: BarChart3, label: "Backtested" },
  { icon: Zap, label: "Low Latency" },
  { icon: Lock, label: "Secure Execution" },
  { icon: Clock, label: "24/7 Monitoring" },
  { icon: Activity, label: "Real-Time Signals" },
  { icon: Cpu, label: "ML-Powered" },
];

function MarqueePills() {
  const doubled = [...marqueePills, ...marqueePills];
  return (
    <div className="overflow-hidden py-1">
      <motion.div
        className="flex gap-2.5 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
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

/* ------------------------------------------------------------------ */
/*  Strategy card                                                      */
/* ------------------------------------------------------------------ */

function StrategyCard({ strategy }: { strategy: Strategy }) {
  const Icon = strategy.icon;
  const riskColor = riskTagColor[strategy.risk];

  return (
    <motion.div
      variants={staggerItem}
      className="mx-5 rounded-2xl bg-card border border-border/40 p-4 cursor-pointer active:scale-[0.98] transition-transform"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md", riskColor)}>
              {riskLabels[strategy.risk]}
            </span>
            {strategy.live ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400">
                Backtest Only
              </span>
            )}
          </div>
          <p className="text-[17px] font-bold text-foreground">{strategy.name}</p>
          <p className="text-[13px] text-muted-foreground mt-1 leading-snug">{strategy.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[22px] font-bold text-gain leading-none">{strategy.cagr}</p>
          <p className="text-[11px] text-muted-foreground mt-1">CAGR · {strategy.cagrYears}Y</p>
        </div>
      </div>

      {/* Type + frequency row */}
      <div className="flex items-center gap-2 mt-3">
        <div className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1", strategy.color)}>
          <Icon size={13} />
          <span className="text-[12px] font-semibold">{strategy.type}</span>
        </div>
        <span className="text-[12px] text-muted-foreground">
          {strategy.frequency} freq · {strategy.tradesPerMonth} trades/mo
        </span>
      </div>

      {/* Stats row */}
      <div className="mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Sharpe</p>
            <p className="text-[14px] font-bold text-foreground">{strategy.sharpe}</p>
          </div>
          <div className="w-px h-6 bg-border/40" />
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Win Rate</p>
            <p className="text-[14px] font-bold text-foreground">{strategy.winRate}</p>
          </div>
          <div className="w-px h-6 bg-border/40" />
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Max DD</p>
            <p className="text-[14px] font-bold text-loss">{strategy.maxDrawdown}</p>
          </div>
          <div className="w-px h-6 bg-border/40" />
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">Min.</p>
            <p className="text-[14px] font-bold text-foreground">{strategy.minInvestment}</p>
          </div>
        </div>
      </div>

      {/* Instruments */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        {strategy.instruments.map((inst) => (
          <span key={inst} className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
            {inst}
          </span>
        ))}
        <span className="text-[11px] text-muted-foreground/50">· {strategy.backtestYears}Y backtest</span>
      </div>
    </motion.div>
  );
}

const riskTagColor: Record<RiskLevel, string> = {
  1: "text-emerald-400 bg-emerald-500/15",
  2: "text-sky-400 bg-sky-500/15",
  3: "text-amber-400 bg-amber-500/15",
  4: "text-orange-400 bg-orange-500/15",
  5: "text-rose-400 bg-rose-500/15",
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AlgoStrategies() {
  const [typeFilter, setTypeFilter] = useState<StrategyType | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("high-return");
  const [showSortSheet, setShowSortSheet] = useState(false);

  const filtered = useMemo(() => {
    const list = typeFilter === "All" ? strategies : strategies.filter((s) => s.type === typeFilter);
    return sortStrategies(list, sortBy);
  }, [typeFilter, sortBy]);

  return (
    <div className="pb-8">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        animate="visible"
        className="bg-zinc-100 dark:bg-zinc-900 pt-5 pb-6"
      >
        <motion.div custom={0} variants={fadeUp} className="text-center mb-4 px-5">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
              <Bot size={22} className="text-zinc-700 dark:text-zinc-300" />
            </div>
          </div>
          <p className="text-[22px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            Algorithmic Strategies
          </p>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
            Systematic, backtested, and fully automated.
            <br />
            Let algorithms do the heavy lifting.
          </p>
        </motion.div>

        {/* Video block */}
        <motion.div custom={1} variants={fadeUp} className="px-5">
          <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 aspect-[16/9] cursor-pointer group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-black/15 dark:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform group-active:scale-90">
                <Play className="text-zinc-800 dark:text-gray-900 ml-0.5 w-7 h-7" fill="currentColor" />
              </div>
            </div>
            <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5">
              <span className="text-[12px] font-medium text-gray-900/90 tabular-nums">3:45</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
              <p className="text-[17px] font-semibold text-gray-900">How Algo Strategies Work</p>
              <p className="text-[13px] text-gray-600 mt-0.5">A quick explainer</p>
            </div>
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="w-full h-full" style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }} />
            </div>
          </div>
        </motion.div>

        {/* Marquee */}
        <motion.div custom={2} variants={fadeUp} className="mt-4">
          <MarqueePills />
        </motion.div>

        {/* How it works */}
        <motion.div custom={3} variants={fadeUp} className="mt-4 px-5">
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3.5 cursor-pointer active:scale-[0.98] transition-transform">
            <div className="w-11 h-11 rounded-xl bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center shrink-0">
              <Cpu size={18} className="text-zinc-700 dark:text-zinc-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">How algorithms trade for you</p>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Signal generation, execution & risk management</p>
            </div>
            <ChevronRight size={18} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
          </div>
        </motion.div>
      </motion.section>

      {/* Divider */}
      <div className="h-2 bg-muted/50 my-5" />

      {/* ── Performance highlights ────────────────────────────── */}
      <section className="mb-1">
        <div className="px-5 mb-4">
          <h2 className="text-[20px] font-bold text-foreground">Performance Snapshot</h2>
          <p className="text-[15px] text-muted-foreground mt-1">Across all live strategies</p>
        </div>

        <div className="mx-5 rounded-2xl bg-card border border-border/40 divide-y divide-border/40">
          {[
            { label: "Avg CAGR", value: "15.7%", sub: "across 7 live strategies", icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/15" },
            { label: "Best Sharpe", value: "2.45", sub: "Pairs Arbitrage", icon: Shield, color: "text-blue-400 bg-blue-500/15" },
            { label: "Avg Win Rate", value: "63%", sub: "weighted by AUM", icon: Activity, color: "text-purple-400 bg-purple-500/15" },
            { label: "Avg Max DD", value: "-10.4%", sub: "risk-adjusted", icon: TrendingDown, color: "text-rose-400 bg-rose-500/15" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.color)}>
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">{stat.label}</p>
                    <p className="text-[12px] text-muted-foreground">{stat.sub}</p>
                  </div>
                </div>
                <p className="text-[17px] font-bold text-foreground">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div className="h-2 bg-muted/50 my-5" />

      {/* ── Strategies list ──────────────────────────────────── */}
      <section>
        <div className="px-5 mb-4">
          <h2 className="text-[20px] font-bold text-foreground">Explore Strategies</h2>
          <p className="text-[15px] text-muted-foreground mt-1">Backtested, risk-managed, ready to deploy</p>
        </div>

        {/* Type filter pills + sort */}
        <div className="px-5 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
              <button
                onClick={() => setTypeFilter("All")}
                className={cn(
                  "h-[36px] px-3.5 rounded-full text-[14px] font-medium transition-colors border shrink-0",
                  typeFilter === "All"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border active:bg-muted/50"
                )}
              >
                All
              </button>
              {strategyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(typeFilter === type ? "All" : type)}
                  className={cn(
                    "h-[36px] px-3.5 rounded-full text-[13px] font-medium transition-colors border shrink-0",
                    typeFilter === type
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border active:bg-muted/50"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSortSheet(true)}
              className="h-[36px] px-3 rounded-full border border-border text-muted-foreground active:bg-muted/50 transition-colors shrink-0"
            >
              <ArrowUpDown size={16} />
            </button>
          </div>
        </div>

        {/* Sort sheet */}
        <Sheet open={showSortSheet} onOpenChange={setShowSortSheet}>
          <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-8 pt-2">
            <div className="flex justify-center py-3">
              <div className="w-9 h-[4px] rounded-full bg-muted-foreground/30" />
            </div>
            <SheetTitle className="text-[18px] font-bold mb-4">Sort By</SheetTitle>
            <div className="space-y-1">
              {(Object.keys(sortLabels) as SortOption[]).map((opt) => (
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

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${typeFilter}-${sortBy}`}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-3"
          >
            {filtered.length > 0 ? (
              filtered.map((s) => <StrategyCard key={s.id} strategy={s} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-5">
                <Bot size={32} className="text-muted-foreground/40 mb-3" />
                <p className="text-[15px] text-muted-foreground text-center">
                  No strategies match your filters.
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

      {/* ── Risk & disclaimers ───────────────────────────────── */}
      <section className="px-5 pb-4">
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <div className="flex gap-3 items-start">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-semibold text-amber-400">Algo Trading Risks</p>
              <p className="text-[13px] text-amber-400/80 mt-1.5 leading-relaxed">
                Algorithmic strategies involve risk, including potential loss of capital. Past backtest
                performance does not guarantee future results. Strategies may behave differently in live
                markets due to slippage, liquidity, and changing market conditions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {["Risk Disclosure", "Backtest Methodology", "Terms of Service"].map((doc) => (
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
